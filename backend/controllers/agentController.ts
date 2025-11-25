import { Request, Response, NextFunction } from 'express';
import { Agent } from '../models/Agent.js';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';

export const getAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const { limit = 50, skip = 0 } = req.query;

    const agents = await Agent.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Agent.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      agents,
      total,
      hasMore: total > Number(skip) + Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    next(error);
  }
};

export const createAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const { name, type, systemPrompt, voice, languages, personality } = req.body;

    if (!name || !systemPrompt) {
      throw new AppError(400, 'Name and system prompt are required');
    }

    const agent = new Agent({
      userId: req.userId,
      name,
      type: type || 'custom',
      systemPrompt,
      voice: voice || 'alloy',
      languages: languages || ['en-US'],
      personality: personality || 50,
    });

    await agent.save();

    res.status(201).json({
      success: true,
      agent,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const { name, type, systemPrompt, generatedContext, voice, languages, personality, isActive, isDeployed, integrations } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (systemPrompt) updateData.systemPrompt = systemPrompt;
    if (generatedContext) updateData.generatedContext = generatedContext;
    if (voice) updateData.voice = voice;
    if (languages) updateData.languages = languages;
    if (personality !== undefined) updateData.personality = personality;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDeployed !== undefined) updateData.isDeployed = isDeployed;
    if (integrations) updateData.integrations = integrations;

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
