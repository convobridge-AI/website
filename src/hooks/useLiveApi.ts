import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import {
  base64ToUint8Array,
  decodeAudioData,
  createPcmBlob,
  audioResample,
} from '@/utils/audio';

// Configuration constants - optimized for low-latency audio streaming
const MODEL_NAME = 'models/gemini-2.5-flash-native-audio-preview-09-2025';
const OUTPUT_SAMPLE_RATE = 24000; // The sample rate coming from Gemini
const TARGET_INPUT_SAMPLE_RATE = 16000; // The sample rate Gemini expects
const BUFFER_SIZE = 8192; // Increased from 4096 for more stable audio chunks
const AUDIO_QUEUE_MAX_SIZE = 3; // Pre-buffer up to 3 chunks for smoother playback
const MIN_PLAYBACK_BUFFER = 0.05; // Minimum 50ms of audio before starting playback

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

// Map Agent Builder voices to Gemini voice names
const VOICE_MAP: Record<string, string> = {
  'aria': 'Aoede',      // Female, warm
  'guy': 'Puck',        // Male, energetic
  'jenny': 'Kore',      // Female, professional
  'chris': 'Charon',    // Male, deep
};

interface UseLiveApiOptions {
  systemPrompt?: string;
  testScenario?: string;
  voice?: string;        // Agent voice ID (aria, guy, jenny, chris)
  context?: string;      // Agent context/knowledge base
  agentName?: string;    // Agent name for personalized greeting
}

interface UseLiveApiReturn {
  connectionState: ConnectionState;
  connect: (options?: UseLiveApiOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
  setVolume: (vol: number) => void;
  error: string | null;
}

export function useLiveApi(): UseLiveApiReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8); // 0.0 to 1.0

  // Refs to hold state that shouldn't trigger re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]); // Queue for buffering multiple audio chunks
  const isPlayingRef = useRef<boolean>(false); // Track if audio is currently playing

  // Function to play queued audio with optimized timing
  const playQueuedAudio = useCallback(
    (ctx: AudioContext) => {
      if (isPlayingRef.current || audioQueueRef.current.length === 0) {
        return;
      }

      isPlayingRef.current = true;
      const buffers = audioQueueRef.current.splice(0); // Get all queued buffers

      buffers.forEach((audioBuffer, index) => {
        // Calculate optimal start time with minimal latency
        const startTime =
          index === 0
            ? Math.max(
                nextStartTimeRef.current,
                ctx.currentTime + 0.01 // Minimal 10ms lookahead
              )
            : nextStartTimeRef.current;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNodeRef.current!);
        source.start(startTime);

        nextStartTimeRef.current = startTime + audioBuffer.duration;
        activeSourcesRef.current.add(source);

        source.onended = () => {
          activeSourcesRef.current.delete(source);
          // Resume playing if more audio arrived while playing
          if (audioQueueRef.current.length > 0) {
            setTimeout(() => {
              isPlayingRef.current = false;
              playQueuedAudio(ctx);
            }, 0);
          } else {
            isPlayingRef.current = false;
          }
        };
      });
    },
    []
  );

  const disconnect = useCallback(async () => {
    // 1. Stop Microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // 2. Stop Processing Input
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

            // 3. Stop Output Audio
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        /* ignore */
      }
    });
    activeSourcesRef.current.clear();
    audioQueueRef.current = []; // Clear buffered audio
    isPlayingRef.current = false;

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }    // 4. Close Session
    if (sessionRef.current) {
      sessionRef.current = null;
    }

    setConnectionState('idle');
    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async (options?: UseLiveApiOptions) => {
    try {
      setConnectionState('connecting');
      setError(null);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          'VITE_GEMINI_API_KEY is missing. Please set it in your .env.local file.'
        );
      }

      // Initialize Output Audio Context
      const outputCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = outputCtx;

      const gainNode = outputCtx.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(outputCtx.destination);
      gainNodeRef.current = gainNode;

      // Initialize Input Audio Context
      const inputCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      inputAudioContextRef.current = inputCtx;
      const inputSampleRate = inputCtx.sampleRate;

      // Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey });

      // Build comprehensive system instruction with agent config
      const agentNameStr = options?.agentName || 'ConvoBridge';
      let systemInstruction = `You are ${agentNameStr}, an AI calling agent for ConvoBridge.\n\n${options?.systemPrompt || 'Be concise, friendly, and professional in your responses. Help users with their inquiries.'}`;
      
      // Add context/knowledge base if provided
      if (options?.context && options.context.trim()) {
        systemInstruction += `\n\nContext and Knowledge Base:\n${options.context}`;
      }
      
      // Add test scenario if provided
      if (options?.testScenario) {
        systemInstruction += `\n\nTest Scenario: The user is calling with the following scenario: ${options.testScenario}. Respond appropriately to this caller type.`;
      }

      // Map voice to Gemini voice name
      const geminiVoice = options?.voice ? (VOICE_MAP[options.voice] || 'Kore') : 'Kore';

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: geminiVoice,
              },
            },
          },
          systemInstruction,
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            setConnectionState('connected');

            // Setup Audio Processing only after connection is open
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(
              BUFFER_SIZE,
              1,
              1
            );

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Resample input to 16000Hz before sending to API
              const resampledData = audioResample(
                inputData,
                inputSampleRate,
                TARGET_INPUT_SAMPLE_RATE
              );
              const pcmBlob = createPcmBlob(resampledData);

              sessionPromise.then((session) => {
                sessionRef.current = session;
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const serverContent = msg.serverContent;

            // Handle Interruption
            if (serverContent?.interrupted) {
              activeSourcesRef.current.forEach((source) => {
                try {
                  source.stop();
                } catch (e) {
                  /* ignore */
                }
              });
              activeSourcesRef.current.clear();
              audioQueueRef.current = []; // Clear audio queue on interruption
              nextStartTimeRef.current = 0;
              isPlayingRef.current = false;
              return;
            }

            // Handle Audio Data with optimized buffering
            const modelTurn = serverContent?.modelTurn;
            if (modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Data = modelTurn.parts[0].inlineData.data;

              if (audioContextRef.current && gainNodeRef.current) {
                const ctx = audioContextRef.current;
                
                try {
                  const audioBuffer = await decodeAudioData(
                    base64ToUint8Array(base64Data),
                    ctx,
                    OUTPUT_SAMPLE_RATE,
                    1
                  );

                  // Add to queue for buffering
                  audioQueueRef.current.push(audioBuffer);
                  
                  // Process queue if we have enough buffered audio or queue is getting full
                  const totalDuration = audioQueueRef.current.reduce(
                    (sum, buf) => sum + buf.duration,
                    0
                  );
                  
                  if (
                    totalDuration >= MIN_PLAYBACK_BUFFER ||
                    audioQueueRef.current.length >= AUDIO_QUEUE_MAX_SIZE
                  ) {
                    playQueuedAudio(ctx);
                  }
                } catch (e) {
                  console.error('Error decoding audio:', e);
                }
              }
            }
          },
          onclose: (e) => {
            console.log('Session Closed', e);
            disconnect();
          },
          onerror: (e) => {
            console.error('Session Error', e);
            setError('Connection failed. Please try again.');
            disconnect();
          },
        },
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start conversation.');
      setConnectionState('error');
      disconnect();
    }
  }, [disconnect, volume]);

  // Update volume in real-time
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    volume,
    setVolume,
    error,
  };
}
