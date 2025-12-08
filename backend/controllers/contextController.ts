import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { connectDB } from '../config/db.js';
import { Agent } from '../models/Agent.js';

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || '' });

// Helper to build master prompt from all context sources
const buildMasterPrompt = (
  systemPrompt: string,
  fileContexts: Array<{ fileName: string; content: string }>,
  websiteContexts: Array<{ url: string; content: string }>
): string => {
  let masterPrompt = systemPrompt || '';
  
  // Add file contexts
  if (fileContexts.length > 0) {
    masterPrompt += '\n\n=== KNOWLEDGE BASE (FROM FILES) ===\n';
    fileContexts.forEach((fc, i) => {
      masterPrompt += `\n--- Source: ${fc.fileName} ---\n${fc.content}\n`;
    });
  }
  
  // Add website contexts
  if (websiteContexts.length > 0) {
    masterPrompt += '\n\n=== KNOWLEDGE BASE (FROM WEBSITES) ===\n';
    websiteContexts.forEach((wc, i) => {
      masterPrompt += `\n--- Source: ${wc.url} ---\n${wc.content}\n`;
    });
  }
  
  return masterPrompt.trim();
};

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

    // Verify agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    let extractedContent = '';
    const fileName = req.file.originalname;

    if (req.file.mimetype === 'application/pdf') {
      // For PDF: Use Gemini's native PDF understanding with inline data
      const base64Data = Buffer.from(req.file.buffer).toString('base64');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { 
            text: `You are extracting knowledge from a document to create an AI agent's knowledge base.

TASK: Read the following PDF document and extract ALL important information that would be useful for an AI calling agent to know.

EXTRACT:
- Company/product/service information
- Key features and benefits
- Pricing details if available
- Contact information
- FAQs and common questions
- Policies and procedures
- Technical specifications
- Any other relevant facts

FORMAT: Provide a well-organized summary with clear sections. Use bullet points for easy reading.
Be comprehensive but concise. This will be used as context for AI phone calls.`
          },
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          }
        ]
      });

      extractedContent = response.text || '';
      
    } else if (req.file.mimetype === 'text/plain') {
      // For TXT: Extract text directly and summarize with Gemini
      const textContent = req.file.buffer.toString('utf-8');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            text: `You are extracting knowledge from a document to create an AI agent's knowledge base.

DOCUMENT CONTENT:
${textContent}

TASK: Extract ALL important information that would be useful for an AI calling agent to know.

EXTRACT:
- Company/product/service information
- Key features and benefits
- Pricing details if available
- Contact information
- FAQs and common questions
- Policies and procedures
- Technical specifications
- Any other relevant facts

FORMAT: Provide a well-organized summary with clear sections. Use bullet points for easy reading.
Be comprehensive but concise. This will be used as context for AI phone calls.`
          }
        ]
      });

      extractedContent = response.text || '';
    } else {
      throw new AppError(400, 'Unsupported file type. Please upload a PDF or TXT file.');
    }

    if (!extractedContent || extractedContent.trim().length === 0) {
      throw new AppError(400, 'Could not extract content from the file');
    }

    // Store file context in agent's contextSources
    const existingContextSources = (agent as any).contextSources || { files: [], websites: [] };
    existingContextSources.files = existingContextSources.files || [];
    existingContextSources.files.push({
      fileName,
      content: extractedContent,
      addedAt: new Date()
    });

    // Build and save master prompt
    const masterPrompt = buildMasterPrompt(
      agent.systemPrompt || '',
      existingContextSources.files,
      existingContextSources.websites || []
    );

    await Agent.findByIdAndUpdate(agentId, {
      contextSources: existingContextSources,
      generatedContext: masterPrompt
    });

    res.json({
      success: true,
      generatedContext: extractedContent,
      fileName,
      masterPrompt,
      message: 'File processed and added to agent knowledge base.',
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
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new AppError(400, 'Invalid Agent ID format');
    }

    // Verify agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new AppError(400, 'Invalid URL format. Please include https://');
    }

    // Use Gemini 2.5 Flash with URL Context tool
    // This is the native way to fetch and analyze web content
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: `You are extracting knowledge from a website to create an AI agent's knowledge base.

WEBSITE URL: ${url}

TASK: Analyze this website and extract ALL important information that would be useful for an AI calling agent to know.

EXTRACT:
- Company/organization overview
- Products and services offered
- Key features and benefits
- Pricing information if available
- Contact details (phone, email, address)
- Business hours
- FAQs and common questions
- Policies (returns, shipping, etc.)
- Unique selling points
- Any other relevant facts

FORMAT: Provide a well-organized summary with clear sections. Use bullet points for easy reading.
Be comprehensive but concise. This will be used as context for AI phone calls.`
        }
      ],
      config: {
        tools: [{ urlContext: {} }]
      }
    } as any);

    const extractedContent = response.text || '';

    if (!extractedContent || extractedContent.trim().length === 0) {
      throw new AppError(400, 'Could not extract content from the website. The site may be blocked or inaccessible.');
    }

    // Store website context in agent's contextSources
    const existingContextSources = (agent as any).contextSources || { files: [], websites: [] };
    existingContextSources.websites = existingContextSources.websites || [];
    existingContextSources.websites.push({
      url,
      content: extractedContent,
      addedAt: new Date()
    });

    // Build and save master prompt
    const masterPrompt = buildMasterPrompt(
      agent.systemPrompt || '',
      existingContextSources.files || [],
      existingContextSources.websites
    );

    await Agent.findByIdAndUpdate(agentId, {
      contextSources: existingContextSources,
      generatedContext: masterPrompt
    });

    res.json({
      success: true,
      generatedContext: extractedContent,
      url,
      masterPrompt,
      message: 'Website crawled and added to agent knowledge base.',
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
      contextSources: (agent as any).contextSources || { files: [], websites: [] },
    });
  } catch (error) {
    next(error);
  }
};

export const clearContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const { agentId } = req.params;
    const { type, index } = req.body; // type: 'file' | 'website' | 'all'

    if (!agentId) {
      throw new AppError(400, 'Agent ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new AppError(400, 'Invalid Agent ID format');
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    const contextSources = (agent as any).contextSources || { files: [], websites: [] };

    if (type === 'all') {
      contextSources.files = [];
      contextSources.websites = [];
    } else if (type === 'file' && typeof index === 'number') {
      contextSources.files.splice(index, 1);
    } else if (type === 'website' && typeof index === 'number') {
      contextSources.websites.splice(index, 1);
    }

    // Rebuild master prompt
    const masterPrompt = buildMasterPrompt(
      agent.systemPrompt || '',
      contextSources.files,
      contextSources.websites
    );

    await Agent.findByIdAndUpdate(agentId, {
      contextSources,
      generatedContext: masterPrompt
    });

    res.json({
      success: true,
      message: 'Context cleared successfully',
      contextSources,
      generatedContext: masterPrompt,
    });
  } catch (error) {
    next(error);
  }
};
