import { Schema, model } from 'mongoose';

const leadSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  callId: {
    type: Schema.Types.ObjectId,
    ref: 'Call',
    index: true,
  },
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    index: true,
  },
  company: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new',
    index: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  source: {
    type: String,
    default: 'call',
  },
  notes: {
    type: String,
    default: '',
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map(),
  },
  lastContactedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

leadSchema.index({ userId: 1, status: 1, createdAt: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });

export const Lead = model('Lead', leadSchema);
