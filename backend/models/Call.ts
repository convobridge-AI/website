import { Schema, model } from 'mongoose';

const callSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: [true, 'Agent ID is required'],
    index: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  callerId: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0, // in seconds
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'answered', 'completed', 'failed', 'missed'],
    default: 'initiated',
  },
  outcome: {
    type: String,
    enum: ['success', 'failure', 'abandoned', 'no_answer'],
    default: 'no_answer',
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral',
  },
  recordingId: {
    type: Schema.Types.ObjectId,
    ref: 'CallRecording',
  },
  transcriptId: {
    type: Schema.Types.ObjectId,
    ref: 'CallTranscript',
  },
  notes: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

callSchema.index({ userId: 1, createdAt: -1 });
callSchema.index({ agentId: 1 });
callSchema.index({ status: 1 });
callSchema.index({ phoneNumber: 1 });

export const Call = model('Call', callSchema);
