import dotenv from 'dotenv';
import { startAsteriskBridge } from './middleware/asterisk-bridge.js';

dotenv.config();

console.log('🚀 Starting Asterisk-Gemini Bridge Server...');

// Start the WebSocket server for Asterisk
const wss = startAsteriskBridge();

console.log('✅ Bridge server running');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down bridge server...');
  wss.close(() => {
    console.log('✅ Bridge server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down bridge server...');
  wss.close(() => {
    console.log('✅ Bridge server closed');
    process.exit(0);
  });
});
