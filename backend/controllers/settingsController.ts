import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UserSettings } from '../models/UserSettings.js';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    
    let settings = await UserSettings.findOne({ userId: req.userId });
    
    // Create default settings if none exist
    if (!settings) {
      settings = new UserSettings({ userId: req.userId });
      await settings.save();
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const allowedFields = [
      'defaultVoice',
      'defaultLanguage',
      'callRecordingEnabled',
      'transcriptionEnabled',
      'notificationsEnabled',
      'emailNotifications',
      'asteriskConfig',
    ];

    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const regenerateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const newApiKey = `cb_${crypto.randomBytes(32).toString('hex')}`;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      { apiKey: newApiKey },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      apiKey: newApiKey,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const connectIntegration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { name } = req.params;
    const { accessToken, customerId, webhookUrl } = req.body;

    const validIntegrations = ['salesforce', 'hubspot', 'stripe', 'zapier'];
    if (!validIntegrations.includes(name)) {
      throw new AppError(400, 'Invalid integration name');
    }

    const updateData: any = {};
    updateData[`integrations.${name}.connected`] = true;
    
    if (accessToken) updateData[`integrations.${name}.accessToken`] = accessToken;
    if (customerId) updateData[`integrations.${name}.customerId`] = customerId;
    if (webhookUrl) updateData[`integrations.${name}.webhookUrl`] = webhookUrl;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const disconnectIntegration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { name } = req.params;

    const validIntegrations = ['salesforce', 'hubspot', 'stripe', 'zapier'];
    if (!validIntegrations.includes(name)) {
      throw new AppError(400, 'Invalid integration name');
    }

    const updateData: any = {};
    updateData[`integrations.${name}`] = {
      connected: false,
      accessToken: undefined,
      customerId: undefined,
      webhookUrl: undefined,
    };

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};
