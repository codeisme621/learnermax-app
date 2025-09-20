# LearnerMax API

A modern Express.js API running on AWS Lambda using the AWS Lambda Web Adapter, providing a seamless development experience with full Express.js functionality in a serverless environment.

## Architecture Overview

This API consolidates the previous 3 separate Lambda functions into a single Express.js application using:

- **Express.js** - Web framework for routing and middleware
- **AWS Lambda Web Adapter** - Enables running Express.js on Lambda
- **TypeScript** - Type-safe development
- **DynamoDB** - NoSQL database for data persistence
- **API Gateway** - HTTP API endpoint management
- **CloudWatch** - Logging and monitoring

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Main Express application
│   ├── routes/
│   │   └── items.ts          # Item management routes
│   ├── services/
│   │   └── dynamodb.ts       # DynamoDB service layer
│   └── middleware/
│       ├── cors.ts           # CORS middleware
│       └── errorHandler.ts   # Error handling middleware
├── openapi.yaml              # OpenAPI 3.0 specification
├── template.yaml             # SAM template for AWS deployment
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
└── run.sh                    # Lambda handler script
```

## API Endpoints

### Health & Info
- `GET /health` - Health check endpoint
- `GET /` - API information

### Items Management
- `GET /api/items` - Get all learning items
- `GET /api/items/{id}` - Get item by ID
- `POST /api/items` - Create or update an item

## Development Setup

### Prerequisites
- Node.js 20+ and pnpm
- AWS CLI configured
- SAM CLI installed

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build TypeScript:**
   ```bash
   pnpm run build
   ```

3. **Run locally:**
   ```bash
   pnpm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:8080/health
   ```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

## Deployment

### Using SAM CLI

The AWS SAM CLI is an extension of the AWS CLI that adds functionality for building and testing Lambda applications.

1. **Build the application:**
   ```bash
   sam build
   ```

2. **Deploy to development:**
   ```bash
   sam deploy --parameter-overrides Environment=dev
   ```

3. **Deploy to production:**
   ```bash
   sam deploy --parameter-overrides Environment=prod
   ```

### Environment Configuration

The application supports two environments:
- **dev** - Development environment with relaxed CORS
- **prod** - Production environment with strict CORS

Environment variables:
- `ENVIRONMENT` - Current environment (dev/prod)
- `SAMPLE_TABLE` - DynamoDB table name
- `PORT` - Express server port (default: 8080)

## API Documentation

The OpenAPI specification is available at:
- **File**: `openapi.yaml`
- **Live**: `https://your-api-gateway-url/openapi.yaml`

### Example Requests

**Get all items:**
```bash
curl -X GET https://your-api-gateway-url/api/items
```

**Create an item:**
```bash
curl -X POST https://your-api-gateway-url/api/items \
  -H "Content-Type: application/json" \
  -d '{"id": "item-1", "name": "JavaScript Basics"}'
```

**Get item by ID:**
```bash
curl -X GET https://your-api-gateway-url/api/items/item-1
```

## Migration from Previous Lambda Functions

This new structure replaces the previous three Lambda functions:

| Old Function | New Route | Notes |
|-------------|-----------|-------|
| `getAllItemsHandler` | `GET /api/items` | Enhanced with better error handling |
| `getByIdHandler` | `GET /api/items/{id}` | Added 404 responses |
| `putItemHandler` | `POST /api/items` | Added validation and timestamps |

### Key Improvements

1. **Unified Deployment** - Single Lambda function instead of three
2. **Better Error Handling** - Centralized error middleware
3. **Type Safety** - Full TypeScript support
4. **Enhanced CORS** - Environment-aware CORS configuration
5. **Comprehensive Logging** - Structured logging with request context
6. **API Documentation** - Complete OpenAPI 3.0 specification
7. **Monitoring** - CloudWatch alarms and Application Insights

## Troubleshooting

### Common Issues

**TypeScript build errors:**
```bash
pnpm run build
```

**Lambda deployment timeout:**
- Check CloudWatch logs
- Verify environment variables
- Ensure DynamoDB table exists

**CORS issues:**
- Check `ENVIRONMENT` variable
- Verify origin in `cors.ts` middleware

### Debugging

1. **Local development:**
   ```bash
   pnpm run dev
   # API available at http://localhost:8080
   ```

2. **Lambda logs:**
   ```bash
   sam logs -n LearnerMaxApiFunction --tail
   ```

3. **API Gateway logs:**
   Check CloudWatch log group: `/aws/apigateway/learnermax-api-{environment}`

## License

MIT License - see LICENSE file for details.
