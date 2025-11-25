import { Schema, model, Types } from 'mongoose';

const callRecordingSchema = new Schema({
  callId: {
    type: Schema.Types.ObjectId,
    ref: 'Call',
    required: [true, 'Call ID is required'],
    index: true,
  },
  storageUrl: {
    type: String,
    required: [true, 'Storage URL is required'],
  },
  storageType: {
    type: String,
    enum: ['gridfs', 's3', 'local'],
    default: 'gridfs',
  },
  mimeType: {
    type: String,
    default: 'audio/wav',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 0,
  },
  waveformData: {
    type: [Number],
    default: [],
  },
}, {
  timestamps: true,
});

callRecordingSchema.index({ callId: 1, createdAt: -1 });

export const CallRecording = model('CallRecording', callRecordingSchema);
