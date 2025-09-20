import { test, expect } from '@playwright/test';
import { ApiClient } from './utils/api-client';

let client: ApiClient;

test.describe('LearnerMax API - Best Practices Tests', () => {
  test.beforeAll(async () => {
    client = new ApiClient();

    // Wait for API to be ready
    const isReady = await client.waitForApi();
    expect(isReady).toBe(true);
  });

  test.describe('Idempotency Tests', () => {
    let testItemId: string;

    test.beforeAll(() => {
      testItemId = `idempotency-test-${Date.now()}`;
    });

    test('GET requests should be idempotent', async () => {
      // Make multiple GET requests to the same endpoint
      const responses = await Promise.all([
        client.get('/health'),
        client.get('/health'),
        client.get('/health')
      ]);

      // All responses should be identical
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(200);

      expect(responses[0].data.status).toBe('ok');
      expect(responses[1].data.status).toBe('ok');
      expect(responses[2].data.status).toBe('ok');

      // Environment should be consistent
      expect(responses[0].data.environment).toBe(responses[1].data.environment);
      expect(responses[1].data.environment).toBe(responses[2].data.environment);
    });

    test('POST requests should be idempotent for same data', async () => {
      const itemData = {
        id: testItemId,
        name: 'Idempotency Test Item'
      };

      // Create item first time
      const response1 = await client.post('/api/items', itemData);
      expect(response1.status).toBe(200);

      // Create same item again - should update, not create duplicate
      const response2 = await client.post('/api/items', itemData);
      expect(response2.status).toBe(200);

      // Both responses should have same ID
      expect(response1.data.id).toBe(response2.data.id);
      expect(response1.data.name).toBe(response2.data.name);

      // Verify only one item exists with this ID
      const getResponse = await client.get(`/api/items/${testItemId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.id).toBe(testItemId);
    });

    test('PUT-like behavior should be idempotent', async () => {
      const itemData = {
        id: testItemId,
        name: 'Updated Idempotency Test Item'
      };

      // Update item multiple times with same data
      const responses = await Promise.all([
        client.post('/api/items', itemData),
        client.post('/api/items', itemData),
        client.post('/api/items', itemData)
      ]);

      // All updates should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.id).toBe(testItemId);
        expect(response.data.name).toBe(itemData.name);
      });
    });
  });

  test.describe('Performance Tests', () => {
    test('Health endpoint should respond quickly', async () => {
      const response = await client.get('/health');

      expect(response.status).toBe(200);
      expect(response.duration).toBeLessThan(1000); // Should respond within 1 second
    });

    test('API info endpoint should respond quickly', async () => {
      const response = await client.get('/');

      expect(response.status).toBe(200);
      expect(response.duration).toBeLessThan(1000);
    });

    test('Items list endpoint should respond within acceptable time', async () => {
      const response = await client.get('/api/items');

      expect(response.status).toBe(200);
      expect(response.duration).toBeLessThan(3000); // DynamoDB scan might take longer
    });

    test('Item creation should be performant', async () => {
      const testItem = {
        id: `perf-test-${Date.now()}`,
        name: 'Performance Test Item'
      };

      const response = await client.post('/api/items', testItem);

      expect(response.status).toBe(200);
      expect(response.duration).toBeLessThan(2000); // DynamoDB write should be fast
    });

    test('Item retrieval by ID should be fast', async () => {
      const testItem = {
        id: `fast-retrieval-${Date.now()}`,
        name: 'Fast Retrieval Test Item'
      };

      // Create item first
      await client.post('/api/items', testItem);

      // Then test retrieval performance
      const response = await client.get(`/api/items/${testItem.id}`);

      expect(response.status).toBe(200);
      expect(response.duration).toBeLessThan(1000); // DynamoDB GetItem is very fast
    });

    test('Concurrent requests should be handled properly', async () => {
      const concurrentRequests = 5;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        client.get('/health')
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.data.status).toBe('ok');
        expect(response.duration).toBeLessThan(5000); // Allow more time for concurrent requests
      });
    });
  });

  test.describe('Input Validation Tests', () => {
    test('Should validate required fields', async () => {
      const invalidData = {
        name: 'Missing ID field'
        // id is missing
      };

      try {
        await client.post('/api/items', invalidData);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.data.error.message).toContain('required');
      }
    });

    test('Should validate empty strings', async () => {
      const invalidData = {
        id: '',
        name: 'Empty ID'
      };

      try {
        await client.post('/api/items', invalidData);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
      }
    });

    test('Should validate data types', async () => {
      const invalidData = {
        id: 123, // Should be string
        name: 'Numeric ID'
      };

      try {
        const response = await client.post('/api/items', invalidData);
        // If accepted, ensure it's converted to string
        expect(typeof response.data.id).toBe('string');
      } catch (error: any) {
        // Or properly rejected
        expect(error.status).toBe(400);
      }
    });

    test('Should handle large payloads gracefully', async () => {
      const largeData = {
        id: `large-payload-${Date.now()}`,
        name: 'A'.repeat(1000) // 1KB string
      };

      const response = await client.post('/api/items', largeData);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(largeData.name);
    });

    test('Should reject extremely large payloads', async () => {
      const extremelyLargeData = {
        id: `extreme-payload-${Date.now()}`,
        name: 'A'.repeat(1024 * 1024 * 15) // 15MB string (exceeds 10MB limit)
      };

      try {
        await client.post('/api/items', extremelyLargeData);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Should be rejected due to size limit
        expect([400, 413, 500]).toContain(error.status);
      }
    });
  });

  test.describe('Error Handling Consistency', () => {
    test('404 errors should have consistent structure', async () => {
      try {
        await client.get('/api/items/non-existent-item');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(404);
        expect(error.data).toHaveProperty('error');
        expect(error.data.error).toHaveProperty('message');
        expect(error.data.error).toHaveProperty('statusCode', 404);
        expect(error.data.error).toHaveProperty('timestamp');
        expect(error.data.error).toHaveProperty('path');
      }
    });

    test('400 errors should have consistent structure', async () => {
      try {
        await client.post('/api/items', { invalid: 'data' });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.data).toHaveProperty('error');
        expect(error.data.error).toHaveProperty('message');
        expect(error.data.error).toHaveProperty('statusCode', 400);
        expect(error.data.error).toHaveProperty('timestamp');
        expect(error.data.error).toHaveProperty('path');
      }
    });

    test('Error timestamps should be valid ISO 8601 dates', async () => {
      try {
        await client.get('/api/items/non-existent-item');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        const timestamp = new Date(error.data.error.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(isNaN(timestamp.getTime())).toBe(false);
      }
    });
  });

  test.describe('HTTP Method Compliance', () => {
    test('GET requests should not modify data', async () => {
      // Get initial list
      const initialResponse = await client.get('/api/items');
      const initialCount = initialResponse.data.length;

      // Multiple GETs should not change anything
      await client.get('/api/items');
      await client.get('/api/items');
      await client.get('/api/items');

      // Count should remain the same
      const finalResponse = await client.get('/api/items');
      expect(finalResponse.data.length).toBe(initialCount);
    });

    test('POST requests should create or update resources', async () => {
      const testItem = {
        id: `http-method-test-${Date.now()}`,
        name: 'HTTP Method Test Item'
      };

      const response = await client.post('/api/items', testItem);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testItem.id);
      expect(response.data).toHaveProperty('name', testItem.name);
    });

    test('HEAD requests should return same headers as GET without body', async () => {
      const headResponse = await client.head('/health');
      const getResponse = await client.get('/health');

      expect(headResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);

      // HEAD should not have a body
      expect(headResponse.data).toBeUndefined();
      expect(getResponse.data).toBeDefined();

      // Headers should be similar (some may differ like content-length)
      expect(headResponse.headers['content-type']).toBeDefined();
      expect(getResponse.headers['content-type']).toBeDefined();
    });
  });

  test.afterAll(async () => {
    console.log(`📊 Best practices tests completed`);
    console.log(`📈 Total requests in this suite: ${client.getRequestCount()}`);
  });
});