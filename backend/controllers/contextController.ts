import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import * as pdfParse from 'pdf-parse';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';
import { Agent } from '../models/Agent.js';

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || '' });

export const processFileForContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    // Check if file exists
    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const { agentId } = req.body;
    if (!agentId) {
      throw new AppError(400, 'Agent ID is required');
    }

    // Verify agentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new AppError(400, 'Invalid Agent ID format');
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    let mimeType = '';
    let fileData: string;

    if (req.file.mimetype === 'application/pdf') {
      // For PDF: convert buffer to base64 for inline data
      mimeType = 'application/pdf';
      fileData = Buffer.from(req.file.buffer).toString('base64');
    } else if (req.file.mimetype === 'text/plain') {
      // For TXT: use text directly
      fileData = req.file.buffer.toString('utf-8');
    } else {
      throw new AppError(400, 'Unsupported file type. Please upload a PDF or TXT file.');
    }

    if (!fileData || fileData.trim().length === 0) {
      throw new AppError(400, 'No text content found in the uploaded file');
    }

    // Use Gemini 2.5 Flash to analyze file content
    const contents: any[] = [
      { text: 'You are an AI assistant helping to prepare a knowledge base for an AI agent. Please read the following document and extract the most important and useful information. Summarize key points, facts, and insights that an AI agent should know when helping users. Keep the summary concise but comprehensive. Provide a clear, structured summary.' }
    ];

    if (mimeType === 'application/pdf') {
      // For PDF: use native inline data support
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: fileData
        }
      });
    } else {
      // For TXT: use text directly
      contents.push({ text: `Document content:\n${fileData}` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any
    });

    const generatedContext = response.text;

    res.json({
      success: true,
      generatedContext,
      fileName: req.file.originalname,
      message: 'Context extracted and summarized. Please review and edit before saving.',
    });
  } catch (error) {
    next(error);
  }
};

export const saveContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { agentId, context } = req.body;

    if (!agentId) {
      throw new AppError(400, 'Agent ID is required');
    }

    if (!context || typeof context !== 'string') {
      throw new AppError(400, 'Context is required and must be a string');
    }

    // Verify agentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new AppError(400, 'Invalid Agent ID format');
    }

    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { generatedContext: context },
      { new: true }
    );

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    res.json({
      success: true,
      message: 'Context saved successfully',
      agent,
    });
  } catch (error) {
    next(error);
  }
};

export const getContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { agentId } = req.params;

    if (!agentId) {
      throw new AppError(400, 'Agent ID is required');
    }

    // Verify agentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new AppError(400, 'Invalid Agent ID format');
    }

    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    res.json({
      success: true,
      generatedContext: agent.generatedContext || '',
    });
  } catch (error) {
    next(error);
  }
};

export const crawlWebsiteForContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { url, agentId } = req.body;

    if (!url) {
      throw new AppError(400, 'URL is required');
    }

    if (!agentId) {
      throw new AppError(400, 'Agent ID is required');
    }

    // Verify agentId is a valid MongoDB ObjectId
    if (!agentId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError(400, 'Invalid Agent ID format');
    }

    // Verify agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new AppError(400, 'Invalid URL format');
    }

    // Use Gemini 2.5 Flash with native URL context support
    // This is much more efficient than manual scraping!
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: `Please analyze the following website URL and extract the most important and useful information. 
Summarize key points, facts, products, services, and insights that an AI agent should know when helping users. 
Keep the summary concise but comprehensive. 
Provide a clear, structured summary that can be used as context for an AI agent.

Website URL: ${url}`
        }
      ],
      config: {
        tools: [{urlContext: {} as any}]
      }
    } as any);

    const generatedContext = response.text;

    res.json({
      success: true,
      generatedContext,
      url,
      message: 'Website analyzed and summarized. Please review and edit before saving.',
    });
  } catch (error) {
    next(error);
  }
};
