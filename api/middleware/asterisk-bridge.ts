import { WebSocketServer, WebSocket } from 'ws';
import { connectDB } from '../../backend/config/db.js';
import { Call } from '../../backend/models/Call.js';
import { CallRecording } from '../../backend/models/CallRecording.js';
import { CallTranscript } from '../../backend/models/CallTranscript.js';
import { Agent } from '../../backend/models/Agent.js';
import { Lead } from '../../backend/models/Lead.js';

const ASTERISK_WS_PORT = parseInt(process.env.ASTERISK_WS_PORT || '8080');
const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || '';

interface CallSession {
  asteriskWs: WebSocket;
  geminiWs: WebSocket | null;
  callId: string;
  agentId: string;
  userId: string;
  callerNumber: string;
  asteriskChannel: string;
  transcript: Array<{ speaker: 'user' | 'agent'; text: string; timestamp: number }>;
  recordingBuffer: Buffer[];
  startTime: Date;
  vadActive: boolean;
  audioBuffer: Buffer;
}

const activeSessions = new Map<string, CallSession>();

// Audio resampling utility
function resampleAudio(inputBuffer: Buffer, fromRate: number, toRate: number): Buffer {
  if (fromRate === toRate) return inputBuffer;
  
  const ratio = toRate / fromRate;
  const inputSamples = inputBuffer.length / 2;
  const outputSamples = Math.floor(inputSamples * ratio);
  const outputBuffer = Buffer.alloc(outputSamples * 2);
  
  for (let i = 0; i < outputSamples; i++) {
    const srcIndex = i / ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(Math.ceil(srcIndex), inputSamples - 1);
    const weight = srcIndex - srcIndexFloor;
    
    const sample1 = inputBuffer.readInt16LE(srcIndexFloor * 2);
    const sample2 = inputBuffer.readInt16LE(srcIndexCeil * 2);
    const interpolated = Math.round(sample1 * (1 - weight) + sample2 * weight);
    
    outputBuffer.writeInt16LE(interpolated, i * 2);
  }
  
  return outputBuffer;
}

// Simple VAD (Voice Activity Detection)
function isVoiceActive(audioBuffer: Buffer, threshold: number = 500): boolean {
  let sum = 0;
  for (let i = 0; i < audioBuffer.length; i += 2) {
    const sample = Math.abs(audioBuffer.readInt16LE(i));
    sum += sample;
  }
  const average = sum / (audioBuffer.length / 2);
  return average > threshold;
}

// Connect to Gemini Live API
async function connectGemini(session: CallSession, agent: any): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${GEMINI_WS_URL}?key=${GEMINI_API_KEY}`);
    
    ws.on('open', () => {
      console.log('✅ Connected to Gemini Live API');
      
      // Send session configuration
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.5-flash',
          generation_config: {
            response_modalities: ['AUDIO'],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: agent.voice || 'Puck',
                }
              }
            }
          },
          system_instruction: {
            parts: [{
              text: agent.systemPrompt + '\n\n' + (agent.generatedContext || ''),
            }]
          }
        }
      };
      
      ws.send(JSON.stringify(setupMessage));
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      console.error('❌ Gemini WebSocket error:', error);
      reject(error);
    });
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle server content (audio response)
        if (message.serverContent) {
          const parts = message.serverContent.modelTurn?.parts || [];
          
          for (const part of parts) {
            // Handle audio response
            if (part.inlineData?.mimeType?.includes('audio')) {
              const audioBase64 = part.inlineData.data;
              const audioBuffer = Buffer.from(audioBase64, 'base64');
              
              // Resample from 24kHz to 8kHz for Asterisk
              const resampled = resampleAudio(audioBuffer, 24000, 8000);
              
              // Send to Asterisk
              if (session.asteriskWs.readyState === WebSocket.OPEN) {
                session.asteriskWs.send(resampled);
              }
              
              // Store in recording buffer
              session.recordingBuffer.push(resampled);
            }
            
            // Handle text transcript
            if (part.text) {
              session.transcript.push({
                speaker: 'agent',
                text: part.text,
                timestamp: Date.now() - session.startTime.getTime(),
              });
              
              console.log(`🤖 Agent: ${part.text}`);
            }
          }
        }
        
        // Handle tool calls or function calling
        if (message.toolCall) {
          console.log('🔧 Tool call:', message.toolCall);
        }
        
      } catch (error) {
        console.error('❌ Error processing Gemini message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('🔴 Gemini WebSocket closed');
    });
  });
}

// Save call recording to database
async function saveRecording(session: CallSession) {
  try {
    await connectDB();
    
    // Combine all audio buffers
    const fullRecording = Buffer.concat(session.recordingBuffer);
    
    // In production, upload to GridFS or S3
    const storageUrl = `recordings/${session.callId}.wav`;
    
    const recording = new CallRecording({
      callId: session.callId,
      storageUrl,
      storageType: 'local',
      mimeType: 'audio/wav',
      fileSize: fullRecording.length,
      duration: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
    });
    
    await recording.save();
    console.log('💾 Recording saved:', recording._id);
  } catch (error) {
    console.error('❌ Error saving recording:', error);
  }
}

// Save transcript to database
async function saveTranscript(session: CallSession) {
  try {
    await connectDB();
    
    const fullText = session.transcript
      .map(seg => `${seg.speaker}: ${seg.text}`)
      .join('\n');
    
    const transcript = new CallTranscript({
      callId: session.callId,
      segments: session.transcript,
      fullText,
    });
    
    await transcript.save();
    console.log('📝 Transcript saved:', transcript._id);
  } catch (error) {
    console.error('❌ Error saving transcript:', error);
  }
}

// Analyze call and create lead if appropriate
async function analyzeAndCreateLead(session: CallSession) {
  try {
    await connectDB();
    
    // Simple lead qualification logic
    const transcript = session.transcript.map(s => s.text).join(' ').toLowerCase();
    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(transcript);
    const hasInterest = transcript.includes('interest') || transcript.includes('buy') || transcript.includes('learn more');
    
    if (hasEmail || hasInterest) {
      const lead = new Lead({
        userId: session.userId,
        callId: session.callId,
        phone: session.callerNumber,
        status: 'new',
        score: hasEmail && hasInterest ? 80 : 50,
        source: 'call',
      });
      
      await lead.save();
      console.log('🎯 Lead created:', lead._id);
    }
  } catch (error) {
    console.error('❌ Error creating lead:', error);
  }
}

// End call and cleanup
async function endCall(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;
  
  console.log('📞 Ending call:', sessionId);
  
  // Close connections
  if (session.geminiWs) {
    session.geminiWs.close();
  }
  
  // Update call status
  try {
    await connectDB();
    await Call.findByIdAndUpdate(session.callId, {
      status: 'completed',
      endedAt: new Date(),
      duration: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
    });
  } catch (error) {
    console.error('❌ Error updating call:', error);
  }
  
  // Save recording and transcript
  await saveRecording(session);
  await saveTranscript(session);
  await analyzeAndCreateLead(session);
  
  // Remove from active sessions
  activeSessions.delete(sessionId);
  console.log('✅ Call ended and saved');
}

// Start WebSocket server for Asterisk
export function startAsteriskBridge() {
  const wss = new WebSocketServer({ port: ASTERISK_WS_PORT });
  
  console.log(`🚀 Asterisk Bridge listening on port ${ASTERISK_WS_PORT}`);
  
  wss.on('connection', async (ws: WebSocket, req) => {
    console.log('📞 New Asterisk connection');
    
    // Parse connection metadata from headers or initial message
    const asteriskChannel = req.headers['x-asterisk-channel'] as string || 'unknown';
    const callerNumber = req.headers['x-caller-number'] as string || 'unknown';
    const agentExtension = req.headers['x-agent-extension'] as string || '';
    
    try {
      await connectDB();
      
      // Find agent by extension
      const agent = await Agent.findOne({ asteriskExtension: agentExtension });
      if (!agent) {
        console.error('❌ Agent not found for extension:', agentExtension);
        ws.close();
        return;
      }
      
      // Create call record
      const call = new Call({
        userId: agent.userId,
        agentId: agent._id,
        callerNumber,
        asteriskChannel,
        status: 'in-progress',
        startedAt: new Date(),
      });
      await call.save();
      
      // Create session
      const session: CallSession = {
        asteriskWs: ws,
        geminiWs: null,
        callId: call._id.toString(),
        agentId: agent._id.toString(),
        userId: agent.userId.toString(),
        callerNumber,
        asteriskChannel,
        transcript: [],
        recordingBuffer: [],
        startTime: new Date(),
        vadActive: false,
        audioBuffer: Buffer.alloc(0),
      };
      
      activeSessions.set(asteriskChannel, session);
      
      // Connect to Gemini
      session.geminiWs = await connectGemini(session, agent);
      
      // Handle audio from Asterisk
      ws.on('message', (data: Buffer) => {
        // Accumulate audio buffer
        session.audioBuffer = Buffer.concat([session.audioBuffer, data]);
        
        // Process in chunks (e.g., 20ms = 160 samples at 8kHz)
        const chunkSize = 320; // 160 samples * 2 bytes
        
        while (session.audioBuffer.length >= chunkSize) {
          const chunk = session.audioBuffer.slice(0, chunkSize);
          session.audioBuffer = session.audioBuffer.slice(chunkSize);
          
          // VAD check
          if (isVoiceActive(chunk)) {
            session.vadActive = true;
            
            // Store in recording
            session.recordingBuffer.push(chunk);
            
            // Resample from 8kHz to 16kHz for Gemini
            const resampled = resampleAudio(chunk, 8000, 16000);
            const base64Audio = resampled.toString('base64');
            
            // Send to Gemini
            if (session.geminiWs && session.geminiWs.readyState === WebSocket.OPEN) {
              const message = {
                client_content: {
                  turns: [{
                    role: 'user',
                    parts: [{
                      inline_data: {
                        mime_type: 'audio/pcm;rate=16000',
                        data: base64Audio,
                      }
                    }]
                  }],
                  turn_complete: false,
                }
              };
              
              session.geminiWs.send(JSON.stringify(message));
            }
          } else {
            // Silence detected
            if (session.vadActive) {
              session.vadActive = false;
              
              // Signal turn complete
              if (session.geminiWs && session.geminiWs.readyState === WebSocket.OPEN) {
                session.geminiWs.send(JSON.stringify({
                  client_content: {
                    turn_complete: true,
                  }
                }));
              }
            }
          }
        }
      });
      
      ws.on('close', () => {
        console.log('🔴 Asterisk connection closed');
        endCall(asteriskChannel);
      });
      
      ws.on('error', (error) => {
        console.error('❌ Asterisk WebSocket error:', error);
        endCall(asteriskChannel);
      });
      
    } catch (error) {
      console.error('❌ Error handling Asterisk connection:', error);
      ws.close();
    }
  });
  
  return wss;
}
