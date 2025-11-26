import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Agent } from '../models/Agent.js';
import { Call } from '../models/Call.js';
import { Lead } from '../models/Lead.js';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalAgents = await Agent.countDocuments();
    const totalCalls = await Call.countDocuments();
    const totalLeads = await Lead.countDocuments();

    const activeAgents = await Agent.countDocuments({ isActive: true });
    const deployedAgents = await Agent.countDocuments({ isDeployed: true });

    const recentCalls = await Call.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const avgCallDuration = await Call.aggregate([
      { $group: { _id: null, avg: { $avg: '$duration' } } },
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers },
        agents: { total: totalAgents, active: activeAgents, deployed: deployedAgents },
        calls: { total: totalCalls, last24h: recentCalls, avgDuration: avgCallDuration[0]?.avg || 0 },
        leads: { total: totalLeads },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { limit = 50, skip = 0, search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      total,
      hasMore: total > Number(skip) + Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { role, isActive } = req.body;

    const updateData: any = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { limit = 50, skip = 0 } = req.query;

    const agents = await Agent.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Agent.countDocuments();

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

export const getAllCalls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { limit = 50, skip = 0, status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const calls = await Call.find(query)
      .populate('userId', 'name email')
      .populate('agentId', 'name')
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
