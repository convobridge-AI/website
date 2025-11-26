import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  defaultVoice: string;
  defaultLanguage: string;
  callRecordingEnabled: boolean;
  transcriptionEnabled: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  apiKey?: string;
  integrations: {
    salesforce: { connected: boolean; accessToken?: string };
    hubspot: { connected: boolean; accessToken?: string };
    stripe: { connected: boolean; customerId?: string };
    zapier: { connected: boolean; webhookUrl?: string };
  };
  asteriskConfig?: {
    host?: string;
    port?: number;
    username?: string;
    secret?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    defaultVoice: { type: String, default: 'aria' },
    defaultLanguage: { type: String, default: 'English' },
    callRecordingEnabled: { type: Boolean, default: true },
    transcriptionEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    apiKey: { type: String },
    integrations: {
      salesforce: {
        connected: { type: Boolean, default: false },
        accessToken: { type: String },
      },
      hubspot: {
        connected: { type: Boolean, default: false },
        accessToken: { type: String },
      },
      stripe: {
        connected: { type: Boolean, default: false },
        customerId: { type: String },
      },
      zapier: {
        connected: { type: Boolean, default: false },
        webhookUrl: { type: String },
      },
    },
    asteriskConfig: {
      host: { type: String },
      port: { type: Number },
      username: { type: String },
      secret: { type: String },
    },
  },
  { timestamps: true }
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);
