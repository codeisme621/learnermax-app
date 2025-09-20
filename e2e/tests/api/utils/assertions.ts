import { expect } from '@playwright/test';
import { ApiResponse } from './api-client';

export class ApiAssertions {
  /**
   * Assert that response has expected status code
   */
  static expectStatus(response: ApiResponse, expectedStatus: number): void {
    expect(response.status).toBe(expectedStatus);
  }

  /**
   * Assert that response time is within acceptable limits
   */
  static expectResponseTime(response: ApiResponse, maxMs: number): void {
    expect(response.duration).toBeLessThan(maxMs);
  }

  /**
   * Assert that response has required headers
   */
  static expectHeaders(response: ApiResponse, requiredHeaders: string[]): void {
    requiredHeaders.forEach(header => {
      expect(response.headers).toHaveProperty(header.toLowerCase());
    });
  }

  /**
   * Assert security headers are present
   */
  static expectSecurityHeaders(response: ApiResponse): void {
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'content-security-policy'
    ];

    this.expectHeaders(response, securityHeaders);
  }

  /**
   * Assert CORS headers are present
   */
  static expectCorsHeaders(response: ApiResponse): void {
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];

    this.expectHeaders(response, corsHeaders);
  }

  /**
   * Assert that response body has expected structure
   */
  static expectBodyStructure(response: ApiResponse, expectedProperties: string[]): void {
    expect(response.data).toBeDefined();
    expectedProperties.forEach(prop => {
      expect(response.data).toHaveProperty(prop);
    });
  }

  /**
   * Assert that item has valid structure
   */
  static expectValidItem(item: any): void {
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(typeof item.id).toBe('string');
    expect(typeof item.name).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
    expect(item.name.length).toBeGreaterThan(0);
  }

  /**
   * Assert that item has timestamps
   */
  static expectItemTimestamps(item: any): void {
    expect(item).toHaveProperty('createdAt');
    expect(item).toHaveProperty('updatedAt');

    // Validate timestamp format (ISO 8601)
    const createdAt = new Date(item.createdAt);
    const updatedAt = new Date(item.updatedAt);

    expect(createdAt).toBeInstanceOf(Date);
    expect(updatedAt).toBeInstanceOf(Date);
    expect(isNaN(createdAt.getTime())).toBe(false);
    expect(isNaN(updatedAt.getTime())).toBe(false);
  }

  /**
   * Assert that error response has expected structure
   */
  static expectErrorStructure(errorData: any, expectedStatus: number): void {
    expect(errorData).toHaveProperty('error');
    expect(errorData.error).toHaveProperty('message');
    expect(errorData.error).toHaveProperty('statusCode', expectedStatus);
    expect(errorData.error).toHaveProperty('timestamp');
    expect(errorData.error).toHaveProperty('path');

    // Validate timestamp
    const timestamp = new Date(errorData.error.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  }

  /**
   * Assert that health response is valid
   */
  static expectHealthyResponse(response: ApiResponse): void {
    this.expectStatus(response, 200);
    this.expectResponseTime(response, 5000);
    this.expectBodyStructure(response, ['status', 'timestamp', 'environment']);

    expect(response.data.status).toBe('ok');

    // Validate timestamp
    const timestamp = new Date(response.data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  }

  /**
   * Assert that API info response is valid
   */
  static expectApiInfoResponse(response: ApiResponse): void {
    this.expectStatus(response, 200);
    this.expectResponseTime(response, 5000);
    this.expectBodyStructure(response, ['message', 'version', 'documentation']);

    expect(response.data.message).toBe('LearnerMax API');
    expect(response.data.version).toBe('1.0.0');
    expect(typeof response.data.documentation).toBe('string');
  }

  /**
   * Assert that items list response is valid
   */
  static expectItemsListResponse(response: ApiResponse): void {
    this.expectStatus(response, 200);
    this.expectResponseTime(response, 10000);
    expect(Array.isArray(response.data)).toBe(true);

    // If items exist, validate their structure
    if (response.data.length > 0) {
      response.data.forEach((item: any) => {
        this.expectValidItem(item);
      });
    }
  }

  /**
   * Assert that item creation/update response is valid
   */
  static expectItemResponse(response: ApiResponse, expectedItem: any): void {
    this.expectStatus(response, 200);
    this.expectResponseTime(response, 10000);
    this.expectValidItem(response.data);
    this.expectItemTimestamps(response.data);

    expect(response.data.id).toBe(expectedItem.id);
    expect(response.data.name).toBe(expectedItem.name);
  }

  /**
   * Assert that OpenAPI spec response is valid
   */
  static expectOpenApiResponse(response: ApiResponse): void {
    this.expectStatus(response, 200);
    this.expectResponseTime(response, 5000);

    // Check content type
    expect(response.headers['content-type']).toMatch(/text\/yaml|application\/yaml/);

    // Check content contains expected OpenAPI markers
    expect(response.data).toContain('openapi: 3.0.3');
    expect(response.data).toContain('title: LearnerMax API');
    expect(response.data).toContain('paths:');
    expect(response.data).toContain('components:');
  }

  /**
   * Assert that two items are equal (ignoring timestamps)
   */
  static expectItemsEqual(item1: any, item2: any, ignoreTimestamps = true): void {
    expect(item1.id).toBe(item2.id);
    expect(item1.name).toBe(item2.name);

    if (!ignoreTimestamps) {
      expect(item1.createdAt).toBe(item2.createdAt);
      expect(item1.updatedAt).toBe(item2.updatedAt);
    }
  }

  /**
   * Assert that response indicates successful creation/update
   */
  static expectSuccessfulMutation(response: ApiResponse): void {
    expect([200, 201]).toContain(response.status);
    this.expectResponseTime(response, 10000);
    expect(response.data).toBeDefined();
  }

  /**
   * Assert that multiple responses are identical (for idempotency testing)
   */
  static expectIdenticalResponses(responses: ApiResponse[]): void {
    expect(responses.length).toBeGreaterThan(1);

    const firstResponse = responses[0];
    responses.slice(1).forEach((response, index) => {
      expect(response.status).toBe(firstResponse.status);
      expect(response.data).toEqual(firstResponse.data);
    });
  }

  /**
   * Assert that response contains performance metrics within limits
   */
  static expectPerformanceMetrics(response: ApiResponse, limits: {
    maxResponseTime: number;
    minThroughput?: number;
  }): void {
    expect(response.duration).toBeLessThan(limits.maxResponseTime);

    if (limits.minThroughput) {
      const throughput = 1000 / response.duration; // requests per second
      expect(throughput).toBeGreaterThan(limits.minThroughput);
    }
  }
}