import { Schema, model } from 'mongoose';

const agentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  type: {
    type: String,
    enum: ['sales', 'support', 'scheduling', 'custom'],
    default: 'custom',
  },
  systemPrompt: {
    type: String,
    required: [true, 'System prompt is required'],
  },
  generatedContext: {
    type: String,
    default: '',
  },
  voice: {
    type: String,
    default: 'alloy',
  },
  languages: {
    type: [String],
    default: ['en-US'],
  },
  personality: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  avatar: {
    type: String,
    default: '',
  },
  integrations: {
    salesforce: { type: Boolean, default: false },
    hubspot: { type: Boolean, default: false },
    stripe: { type: Boolean, default: false },
    zapier: { type: Boolean, default: false },
  },
  stats: {
    totalCalls: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    avgDuration: { type: Number, default: 0 },
  },
  asteriskExtension: {
    type: String,
    unique: true,
    sparse: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeployed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

agentSchema.index({ userId: 1, isActive: 1 });
agentSchema.index({ asteriskExtension: 1 });

export const Agent = model('Agent', agentSchema);
