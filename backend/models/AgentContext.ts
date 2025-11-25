import { Schema, model } from 'mongoose';

const agentContextSchema = new Schema({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: [true, 'Agent ID is required'],
    index: true,
  },
  sourceType: {
    type: String,
    enum: ['file', 'website', 'manual'],
    required: [true, 'Source type is required'],
  },
  sourceName: {
    type: String,
    required: [true, 'Source name is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map(),
  },
}, {
  timestamps: true,
});

agentContextSchema.index({ agentId: 1, createdAt: -1 });

export const AgentContext = model('AgentContext', agentContextSchema);
