import { Request, Response, NextFunction } from 'express';
import { Call } from '../models/Call.js';
import { CallRecording } from '../models/CallRecording.js';
import { CallTranscript } from '../models/CallTranscript.js';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';

export const getCalls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const { agentId, status, limit = 50, skip = 0 } = req.query;
    const query: any = { userId: req.userId };

    if (agentId) {
      query.agentId = agentId;
    }

    if (status) {
      query.status = status;
    }

    const calls = await Call.find(query)
      .populate('agentId', 'name type')
      .populate('recordingId', 'duration storageUrl')
      .populate('transcriptId', 'fullText')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Call.countDocuments(query);

    res.json({
      success: true,
      calls,
      total,
      hasMore: total > Number(skip) + Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const call = await Call.findOne({
      _id: req.params.id,
      userId: req.userId,
    })
      .populate('agentId')
      .populate('recordingId')
      .populate('transcriptId');

    if (!call) {
      throw new AppError(404, 'Call not found');
    }

    res.json({
      success: true,
      call,
    });
  } catch (error) {
    next(error);
  }
};

export const createCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const { agentId, phoneNumber, callerId, notes } = req.body;

    if (!agentId || !phoneNumber) {
      throw new AppError(400, 'Agent ID and phone number are required');
    }

    const call = new Call({
      userId: req.userId,
      agentId,
      phoneNumber,
      callerId,
      notes,
      startedAt: new Date(),
    });

    await call.save();

    res.status(201).json({
      success: true,
      call,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const { status, outcome, duration, sentiment, notes, tags, recordingId, transcriptId, endedAt } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (outcome) updateData.outcome = outcome;
    if (duration !== undefined) updateData.duration = duration;
    if (sentiment) updateData.sentiment = sentiment;
    if (notes) updateData.notes = notes;
    if (tags) updateData.tags = tags;
    if (recordingId) updateData.recordingId = recordingId;
    if (transcriptId) updateData.transcriptId = transcriptId;
    if (endedAt) updateData.endedAt = endedAt;

    const call = await Call.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!call) {
      throw new AppError(404, 'Call not found');
    }

    res.json({
      success: true,
      call,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const call = await Call.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!call) {
      throw new AppError(404, 'Call not found');
    }

    res.json({
      success: true,
      message: 'Call deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getCallStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await connectDB();
    if (!db) {
      throw new AppError(503, 'Database is not configured');
    }

    const stats = await Call.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
        },
      },
    ]);

    const total = await Call.countDocuments({ userId: req.userId });
    const successful = await Call.countDocuments({ userId: req.userId, outcome: 'success' });
    const avgDuration = await Call.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$duration' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        total,
        successful,
        successRate: total > 0 ? (successful / total) * 100 : 0,
        avgDuration: avgDuration[0]?.avg || 0,
        byStatus: stats,
      },
    });
  } catch (error) {
    next(error);
  }
};
