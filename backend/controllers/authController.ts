import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await connectDB();

		const { email, password, name, company } = req.body;

		if (!email || !password || !name) {
			throw new AppError(400, 'Email, password, and name are required');
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new AppError(400, 'User already exists');
		}

		const user = new User({
			email,
			password,
			name,
			company,
		});

		await user.save();

		const token = generateToken(user._id.toString());

		res.status(201).json({
			success: true,
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				company: user.company,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await connectDB();

		const { email, password } = req.body;

		if (!email || !password) {
			throw new AppError(400, 'Email and password are required');
		}

		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			throw new AppError(401, 'Invalid email or password');
		}

		const isPasswordCorrect = await user.comparePassword(password);
		if (!isPasswordCorrect) {
			throw new AppError(401, 'Invalid email or password');
		}

		const token = generateToken(user._id.toString());

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				company: user.company,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await connectDB();

		const user = await User.findById(req.userId);
		if (!user) {
			throw new AppError(404, 'User not found');
		}

		res.json({
			success: true,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				company: user.company,
			},
		});
	} catch (error) {
		next(error);
	}
};
