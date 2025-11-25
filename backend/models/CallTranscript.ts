import { Schema, model } from 'mongoose';

const transcriptSegmentSchema = new Schema({
  speaker: {
    type: String,
    enum: ['user', 'agent'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  confidence: {
    type: Number,
    default: 1.0,
  },
}, { _id: false });

const callTranscriptSchema = new Schema({
  callId: {
    type: Schema.Types.ObjectId,
    ref: 'Call',
    required: [true, 'Call ID is required'],
    index: true,
  },
  segments: {
    type: [transcriptSegmentSchema],
    default: [],
  },
  fullText: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'en-US',
  },
}, {
  timestamps: true,
});

callTranscriptSchema.index({ callId: 1 });
callTranscriptSchema.index({ fullText: 'text' });

export const CallTranscript = model('CallTranscript', callTranscriptSchema);
