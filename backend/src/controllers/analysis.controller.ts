import { Request, Response, NextFunction } from 'express';
import { analysisRequestSchema } from '../schemas/analysis.schema.js';
import { AnalysisService, AnalysisServiceError } from '../services/analysis.service.js';
import { createAiProvider } from '../providers/factory.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AnalysisResponse } from '../types/analysis.types.js';

const analysisService = new AnalysisService(createAiProvider());

const formatValidationErrors = (errors: readonly { path: (string | number)[]; message: string }[]): string => {
  return errors
    .map((error) => {
      const path = error.path.join('.') || 'prompt';
      return `${path}: ${error.message}`;
    })
    .join('; ');
};

export const analyzePrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parseResult = analysisRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    const message = formatValidationErrors(parseResult.error.issues);
    return next(new AppError(message, 400, true, 'VALIDATION_ERROR'));
  }

  const startTime = process.hrtime();
  try {
    const result = await analysisService.analyze(
      parseResult.data.prompt,
      parseResult.data.platform,
      parseResult.data.clarificationAnswers ?? []
    );
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const processingTime = `${Math.round(seconds * 1000 + nanoseconds / 1_000_000)}ms`;

    const response: AnalysisResponse = {
      success: true,
      analysis: result.analysis,
      meta: {
        provider: result.provider,
        model: result.model,
        processingTime,
        version: 'v1',
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AnalysisServiceError) {
      return next(new AppError(error.message, error.statusCode, true, error.code));
    }

    return next(
      new AppError(
        'Unable to analyze the prompt right now. Please try again.',
        500,
        true,
        'ANALYSIS_FAILED'
      )
    );
  }
};
