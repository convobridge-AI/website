import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { status, search, limit = 50, skip = 0 } = req.query;
    const query: any = { userId: req.userId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query)
      .populate('callId', 'duration outcome sentiment')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      leads,
      total,
      hasMore: total > Number(skip) + Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('callId');

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { name, email, phone, company, callId, notes } = req.body;

    if (!phone) {
      throw new AppError(400, 'Phone number is required');
    }

    const lead = new Lead({
      userId: req.userId,
      name,
      email,
      phone,
      company,
      callId,
      notes,
    });

    await lead.save();

    res.status(201).json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { status, score, name, email, company, notes, customFields } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (score !== undefined) updateData.score = score;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (company) updateData.company = company;
    if (notes) updateData.notes = notes;
    if (customFields) updateData.customFields = customFields;

    if (status === 'contacted') {
      updateData.lastContactedAt = new Date();
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const stats = await Lead.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
    ]);

    const total = await Lead.countDocuments({ userId: req.userId });
    const converted = await Lead.countDocuments({ userId: req.userId, status: 'converted' });

    res.json({
      success: true,
      stats: {
        total,
        converted,
        conversionRate: total > 0 ? (converted / total) * 100 : 0,
        byStatus: stats,
      },
    });
  } catch (error) {
    next(error);
  }
};
