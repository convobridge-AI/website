/**
 * Converts a base64 string to a Uint8Array.
 * Used for decoding audio data from the server.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts a Uint8Array to a base64 string.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Resamples audio data from one sample rate to another using cubic Hermite interpolation.
 * Provides higher quality audio with reduced artifacts and better performance.
 */
export function audioResample(
  buffer: Float32Array,
  sampleRate: number,
  targetRate: number
): Float32Array {
  if (sampleRate === targetRate) return buffer;
  const ratio = sampleRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const index = i * ratio;
    const low = Math.floor(index);
    const weight = index - low;
    
    // Use cubic Hermite interpolation for smoother results
    if (low + 3 < buffer.length) {
      const p0 = buffer[low === 0 ? 0 : low - 1];
      const p1 = buffer[low];
      const p2 = buffer[low + 1];
      const p3 = buffer[low + 2];
      
      const w2 = weight * weight;
      const w3 = w2 * weight;
      
      const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
      const b = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
      const c = -0.5 * p0 + 0.5 * p2;
      const d = p1;
      
      result[i] = Math.max(-1, Math.min(1, a * w3 + b * w2 + c * weight + d));
    } else {
      // Fallback to linear interpolation at buffer edges
      const high = Math.ceil(index);
      if (high < buffer.length) {
        result[i] = buffer[low] * (1 - weight) + buffer[high] * weight;
      } else {
        result[i] = buffer[low];
      }
    }
  }
  return result;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Creates a formatted Blob object expected by the Gemini Live API.
 * Converts Float32Array (from Web Audio API) to Int16 PCM.
 */
export function createPcmBlob(
  data: Float32Array
): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] before scaling
    const sample = Math.max(-1, Math.min(1, data[i]));
    int16[i] = sample * 32767;
  }

  return {
    data: uint8ArrayToBase64(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
