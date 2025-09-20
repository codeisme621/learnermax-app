# LearnerMax API E2E Testing

Comprehensive end-to-end API testing suite using Playwright and OpenAPI specification for the LearnerMax API.

## Overview

This testing suite provides:
- **Automated endpoint testing** based on OpenAPI specification
- **API best practices validation** (idempotency, performance, security)
- **Contract testing** with schema validation
- **Error handling verification**
- **Performance benchmarking**
- **Security headers validation**

## Test Structure

```
tests/api/
├── config/
│   └── api-config.ts          # Environment configuration
├── utils/
│   ├── openapi-parser.ts      # OpenAPI spec parsing
│   ├── api-client.ts          # HTTP client with logging
│   ├── test-data.ts           # Test data generation
│   └── assertions.ts          # Custom assertions
├── endpoints.spec.ts          # Main endpoint tests
├── best-practices.spec.ts     # API best practices tests
└── README.md                  # This file
```

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- LearnerMax API deployed and accessible
- OpenAPI specification available at `/openapi.yaml`

### Environment Configuration

Set environment variables:

```bash
# Test environment (dev/prod/local)
export TEST_ENV=dev

# API base URL (optional - uses config defaults)
export API_BASE_URL=https://your-api-gateway-url.com/Prod
```

### Running Tests

```bash
# Install dependencies
pnpm install

# Run all API tests
pnpm run test:api

# Run in interactive mode
pnpm run test:api:watch

# Run specific test file
npx playwright test tests/api/endpoints.spec.ts

# Run with specific configuration
TEST_ENV=dev npx playwright test tests/api/
```

## Test Categories

### 1. Endpoint Tests (`endpoints.spec.ts`)

Tests all API endpoints defined in the OpenAPI specification:

- **Health & Info Endpoints**
  - `GET /health` - API health check
  - `GET /` - API information
  - `GET /openapi.yaml` - OpenAPI specification

- **Items API Endpoints**
  - `GET /api/items` - List all items
  - `GET /api/items/{id}` - Get item by ID
  - `POST /api/items` - Create/update item

- **Error Handling**
  - 404 responses for non-existent resources
  - 400 responses for invalid requests
  - Consistent error response structure

- **Security & CORS**
  - Security headers validation
  - CORS headers verification
  - OPTIONS request handling

### 2. Best Practices Tests (`best-practices.spec.ts`)

Validates API follows industry best practices:

#### Idempotency Testing
- GET requests return identical results
- POST requests with same data are idempotent
- Multiple identical requests don't cause side effects

#### Performance Testing
- Response time thresholds (health: <1s, items: <3s)
- Concurrent request handling
- Large payload processing

#### Input Validation
- Required field validation
- Data type enforcement
- Empty string handling
- Payload size limits

#### Error Handling Consistency
- Standardized error response format
- Proper HTTP status codes
- Valid timestamp formats

#### HTTP Method Compliance
- GET requests don't modify data
- POST requests create/update resources
- HEAD requests return headers without body

## Configuration

### Environment Configs (`config/api-config.ts`)

```typescript
{
  dev: {
    baseURL: 'https://api-dev.learnermax.com',
    timeout: 10000,
    retries: 2
  },
  prod: {
    baseURL: 'https://api.learnermax.com',
    timeout: 10000,
    retries: 3
  },
  local: {
    baseURL: 'http://localhost:8080',
    timeout: 5000,
    retries: 1
  }
}
```

### Test Data Generation

The `TestDataGenerator` provides:
- Valid test items with unique IDs
- Invalid data for error testing
- Large payloads for performance testing
- Special characters and emoji handling
- Concurrent test data generation

## API Client Features

The `ApiClient` class provides:
- **Request/Response Logging** - Detailed HTTP transaction logs
- **Automatic Retry Logic** - Configurable retry attempts
- **Response Time Tracking** - Performance monitoring
- **Error Handling** - Structured error responses
- **Health Checking** - API availability verification

## Assertions Library

Custom assertions for:
- Response status codes and timing
- Security and CORS headers
- Item structure validation
- Error response format
- Performance metrics
- Idempotency verification

## OpenAPI Integration

The test suite automatically:
1. **Fetches OpenAPI spec** from the API endpoint
2. **Parses endpoints** and generates test cases
3. **Validates schemas** using specification definitions
4. **Generates test data** based on schema types
5. **Verifies contracts** between spec and implementation

## Performance Thresholds

Default performance expectations:
- Health endpoint: < 1 second
- API info endpoint: < 1 second
- Items list: < 3 seconds (DynamoDB scan)
- Item creation: < 2 seconds
- Item retrieval: < 1 second (DynamoDB GetItem)
- Concurrent requests: < 5 seconds

## Error Testing

Validates proper error handling for:
- Missing required fields (400)
- Empty string values (400)
- Non-existent resources (404)
- Invalid endpoints (404)
- Large payloads (413/400)
- Malformed requests (400)

## Security Testing

Verifies security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security`
- `Content-Security-Policy`

## Reports

Tests generate:
- **HTML Reports** - Visual test results with screenshots
- **Performance Metrics** - Response time analysis
- **Request Logs** - Detailed HTTP transaction logs
- **Coverage Reports** - Endpoint coverage tracking

## Troubleshooting

### Common Issues

**Connection Errors:**
```bash
# Check API availability
curl -i https://your-api-url/health

# Verify environment configuration
echo $TEST_ENV
echo $API_BASE_URL
```

**OpenAPI Spec Loading:**
```bash
# Verify spec is accessible
curl https://your-api-url/openapi.yaml
```

**Test Failures:**
```bash
# Run with verbose logging
DEBUG=* npx playwright test tests/api/

# Check specific endpoint
npx playwright test tests/api/endpoints.spec.ts --grep="health"
```

### Debug Mode

Enable detailed logging:
```bash
# Enable all debug logs
DEBUG=* pnpm run test:api

# Enable specific debug categories
DEBUG=api:* pnpm run test:api
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run API E2E Tests
  run: |
    cd e2e
    pnpm install
    TEST_ENV=prod pnpm run test:api
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
```

### Jenkins Example

```groovy
stage('API E2E Tests') {
  steps {
    sh '''
      cd e2e
      pnpm install
      TEST_ENV=staging pnpm run test:api
    '''
  }
}
```

## Best Practices for Test Maintenance

1. **Keep tests independent** - Each test should be self-contained
2. **Use descriptive names** - Test names should explain what is being tested
3. **Validate API contracts** - Ensure responses match OpenAPI spec
4. **Test error conditions** - Don't just test happy paths
5. **Monitor performance** - Set and enforce response time limits
6. **Clean up test data** - Remove test items after test completion
7. **Update with API changes** - Keep tests in sync with API evolution

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use the provided utilities and assertions
3. Add performance expectations
4. Include error condition testing
5. Update documentation for new test categories