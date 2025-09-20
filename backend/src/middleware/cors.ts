import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const environment = process.env.ENVIRONMENT || 'dev';
  const origin = req.headers.origin;

  let allowedOrigins: string[];
  if (environment === 'prod') {
    allowedOrigins = ['https://www.learnermax.com'];
  } else {
    allowedOrigins = [
      'http://localhost:3000',
      'https://www.learnermax.com'
    ];
  }

  // Check if request origin is allowed, also allow vercel.app domains for dev
  let corsOrigin = '';
  if (origin) {
    if (allowedOrigins.includes(origin) ||
        (environment === 'dev' && origin.includes('.vercel.app'))) {
      corsOrigin = origin;
    }
  }

  // Set CORS headers
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token');
  res.header('Access-Control-Allow-Methods', 'OPTIONS,POST,GET,PUT,DELETE');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};