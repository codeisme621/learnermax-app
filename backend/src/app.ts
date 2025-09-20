import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { itemsRouter } from './routes/items';
import { errorHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';

const app = express();
const port = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'dev'
  });
});

// API routes
app.use('/api/items', itemsRouter);

// Root endpoint for backward compatibility
app.get('/', (req, res) => {
  res.json({
    message: 'LearnerMax API',
    version: '1.0.0',
    documentation: '/openapi.yaml'
  });
});

// Serve OpenAPI specification
app.get('/openapi.yaml', (req, res) => {
  res.type('text/yaml');
  res.sendFile(path.join(__dirname, '../openapi.yaml'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`LearnerMax API server listening on port ${port}`);
  console.log(`Environment: ${process.env.ENVIRONMENT || 'dev'}`);
});

export default app;