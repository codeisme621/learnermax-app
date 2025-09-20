import { test, expect } from '@playwright/test';
import { OpenApiParser, ParsedSchema } from './utils/openapi-parser';
import { ApiClient } from './utils/api-client';
import { apiConfig } from './config/api-config';

let parser: OpenApiParser;
let client: ApiClient;
let schema: ParsedSchema;

test.describe('LearnerMax API - OpenAPI Endpoint Tests', () => {
  test.beforeAll(async () => {
    // Initialize parser and client
    parser = new OpenApiParser();
    client = new ApiClient();

    // Load and parse OpenAPI specification
    await parser.loadSpec();
    schema = await parser.parseEndpoints();

    console.log(`🚀 Testing ${schema.title} v${schema.version}`);
    console.log(`📊 Found ${schema.endpoints.length} endpoints to test`);

    // Wait for API to be ready
    const isReady = await client.waitForApi();
    expect(isReady).toBe(true);
  });

  test.describe('Health and Info Endpoints', () => {
    test('GET /health - should return healthy status', async () => {
      const response = await client.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'ok');
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('environment');
      expect(response.duration).toBeLessThan(5000);

      // Validate timestamp format
      const timestamp = new Date(response.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    test('GET / - should return API information', async () => {
      const response = await client.get('/');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'LearnerMax API');
      expect(response.data).toHaveProperty('version', '1.0.0');
      expect(response.data).toHaveProperty('documentation');
      expect(response.duration).toBeLessThan(5000);
    });

    test('GET /openapi.yaml - should return OpenAPI specification', async () => {
      const response = await client.get('/openapi.yaml');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/yaml|application\/yaml/);
      expect(response.data).toContain('openapi: 3.0.3');
      expect(response.data).toContain('title: LearnerMax API');
      expect(response.duration).toBeLessThan(5000);
    });
  });

  test.describe('Items API Endpoints', () => {
    let testItemId: string;
    let createdItem: any;

    test.beforeAll(() => {
      testItemId = `test-item-${Date.now()}`;
    });

    test('GET /api/items - should return list of items', async () => {
      const response = await client.get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.duration).toBeLessThan(10000);

      // If items exist, validate structure
      if (response.data.length > 0) {
        const item = response.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
      }
    });

    test('POST /api/items - should create a new item', async () => {
      const newItem = {
        id: testItemId,
        name: 'Test Learning Item - E2E Testing'
      };

      const response = await client.post('/api/items', newItem);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', newItem.id);
      expect(response.data).toHaveProperty('name', newItem.name);
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data).toHaveProperty('updatedAt');
      expect(response.duration).toBeLessThan(10000);

      // Validate timestamp formats
      const createdAt = new Date(response.data.createdAt);
      const updatedAt = new Date(response.data.updatedAt);
      expect(createdAt).toBeInstanceOf(Date);
      expect(updatedAt).toBeInstanceOf(Date);
      expect(isNaN(createdAt.getTime())).toBe(false);
      expect(isNaN(updatedAt.getTime())).toBe(false);

      // Store for later tests
      createdItem = response.data;
    });

    test('GET /api/items/{id} - should return specific item', async () => {
      const response = await client.get(`/api/items/${testItemId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testItemId);
      expect(response.data).toHaveProperty('name', 'Test Learning Item - E2E Testing');
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data).toHaveProperty('updatedAt');
      expect(response.duration).toBeLessThan(10000);

      // Should match previously created item
      expect(response.data.createdAt).toBe(createdItem.createdAt);
    });

    test('GET /api/items/{id} - should return 404 for non-existent item', async () => {
      const nonExistentId = 'non-existent-item-12345';

      try {
        await client.get(`/api/items/${nonExistentId}`);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.status).toBe(404);
        expect(error.data).toHaveProperty('error');
        expect(error.data.error).toHaveProperty('message');
        expect(error.data.error).toHaveProperty('statusCode', 404);
        expect(error.data.error.message).toContain(nonExistentId);
        expect(error.duration).toBeLessThan(10000);
      }
    });

    test('POST /api/items - should update existing item (idempotent)', async () => {
      const updatedItem = {
        id: testItemId,
        name: 'Updated Test Learning Item - E2E Testing'
      };

      const response = await client.post('/api/items', updatedItem);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testItemId);
      expect(response.data).toHaveProperty('name', updatedItem.name);
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data).toHaveProperty('updatedAt');
      expect(response.duration).toBeLessThan(10000);

      // Updated timestamp should be different
      expect(response.data.updatedAt).not.toBe(createdItem.createdAt);
    });
  });

  test.describe('API Error Handling', () => {
    test('POST /api/items - should return 400 for missing required fields', async () => {
      const invalidItem = {
        name: 'Missing ID field'
        // id field is missing
      };

      try {
        await client.post('/api/items', invalidItem);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.data).toHaveProperty('error');
        expect(error.data.error).toHaveProperty('statusCode', 400);
        expect(error.data.error.message).toContain('required');
        expect(error.duration).toBeLessThan(10000);
      }
    });

    test('POST /api/items - should return 400 for empty id field', async () => {
      const invalidItem = {
        id: '',
        name: 'Empty ID field'
      };

      try {
        await client.post('/api/items', invalidItem);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.data).toHaveProperty('error');
        expect(error.data.error).toHaveProperty('statusCode', 400);
        expect(error.duration).toBeLessThan(10000);
      }
    });

    test('GET /api/invalid-endpoint - should return 404', async () => {
      try {
        await client.get('/api/invalid-endpoint');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(404);
        expect(error.duration).toBeLessThan(10000);
      }
    });
  });

  test.describe('CORS Headers', () => {
    test('OPTIONS /api/items - should return proper CORS headers', async () => {
      const response = await client.options('/api/items');

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.duration).toBeLessThan(5000);
    });
  });

  test.describe('Security Headers', () => {
    test('All endpoints should include security headers', async () => {
      const response = await client.get('/health');

      expect(response.status).toBe(200);

      // Helmet.js security headers
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
      expect(response.headers).toHaveProperty('content-security-policy');
    });
  });

  test.afterAll(async () => {
    console.log(`📈 Total API requests made: ${client.getRequestCount()}`);
    console.log(`✅ All endpoint tests completed`);
  });
});