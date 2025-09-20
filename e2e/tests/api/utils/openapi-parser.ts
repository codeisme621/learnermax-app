import SwaggerParser from 'swagger-parser';
import { OpenAPIV3 } from 'swagger-parser';
import axios from 'axios';
import * as yaml from 'js-yaml';
import { apiConfig } from '../config/api-config';

export interface ParsedEndpoint {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: Record<string, OpenAPIV3.ResponseObject>;
  tags?: string[];
  security?: OpenAPIV3.SecurityRequirementObject[];
}

export interface ParsedSchema {
  title: string;
  version: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
  components?: OpenAPIV3.ComponentsObject;
}

export class OpenApiParser {
  private spec: OpenAPIV3.Document | null = null;

  async loadSpec(specPath?: string): Promise<OpenAPIV3.Document> {
    try {
      const url = specPath || `${apiConfig.baseURL}${apiConfig.openApiSpecPath}`;

      console.log(`Loading OpenAPI spec from: ${url}`);

      // Try to fetch the spec from the API
      const response = await axios.get(url, {
        timeout: apiConfig.timeout,
        headers: {
          'Accept': 'application/yaml, application/json'
        }
      });

      let specData: any;

      // Parse YAML or JSON
      if (typeof response.data === 'string') {
        try {
          specData = yaml.load(response.data);
        } catch (yamlError) {
          // If YAML parsing fails, try JSON
          specData = JSON.parse(response.data);
        }
      } else {
        specData = response.data;
      }

      // Validate and dereference the spec
      this.spec = await SwaggerParser.dereference(specData) as OpenAPIV3.Document;

      console.log(`✅ Successfully loaded OpenAPI spec: ${this.spec.info.title} v${this.spec.info.version}`);

      return this.spec;
    } catch (error) {
      console.error('❌ Failed to load OpenAPI spec:', error);
      throw new Error(`Failed to load OpenAPI specification: ${error}`);
    }
  }

  async parseEndpoints(): Promise<ParsedSchema> {
    if (!this.spec) {
      throw new Error('OpenAPI spec not loaded. Call loadSpec() first.');
    }

    const endpoints: ParsedEndpoint[] = [];
    const baseUrl = this.getBaseUrl();

    // Parse all paths and methods
    for (const [path, pathItem] of Object.entries(this.spec.paths || {})) {
      if (!pathItem) continue;

      const methods: (keyof OpenAPIV3.PathItemObject)[] = [
        'get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'
      ];

      for (const method of methods) {
        const operation = pathItem[method] as OpenAPIV3.OperationObject;
        if (!operation) continue;

        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          parameters: operation.parameters as OpenAPIV3.ParameterObject[],
          requestBody: operation.requestBody as OpenAPIV3.RequestBodyObject,
          responses: operation.responses as Record<string, OpenAPIV3.ResponseObject>,
          tags: operation.tags,
          security: operation.security
        });
      }
    }

    return {
      title: this.spec.info.title,
      version: this.spec.info.version,
      baseUrl,
      endpoints,
      components: this.spec.components
    };
  }

  private getBaseUrl(): string {
    if (!this.spec) return apiConfig.baseURL;

    // Use server URL from spec if available
    if (this.spec.servers && this.spec.servers.length > 0) {
      const server = this.spec.servers.find(s =>
        s.description?.toLowerCase().includes(apiConfig.environment)
      ) || this.spec.servers[0];

      return server.url;
    }

    return apiConfig.baseURL;
  }

  getSchema(schemaName: string): OpenAPIV3.SchemaObject | undefined {
    if (!this.spec?.components?.schemas) return undefined;

    const schema = this.spec.components.schemas[schemaName];
    return schema as OpenAPIV3.SchemaObject;
  }

  generateTestData(schema: OpenAPIV3.SchemaObject): any {
    if (schema.example) return schema.example;

    switch (schema.type) {
      case 'string':
        if (schema.format === 'date-time') return new Date().toISOString();
        if (schema.format === 'email') return 'test@example.com';
        if (schema.pattern) return this.generateFromPattern(schema.pattern);
        return schema.enum?.[0] || 'test-value';

      case 'number':
      case 'integer':
        return schema.minimum || schema.enum?.[0] || 42;

      case 'boolean':
        return true;

      case 'array':
        if (schema.items) {
          const itemData = this.generateTestData(schema.items as OpenAPIV3.SchemaObject);
          return [itemData];
        }
        return [];

      case 'object':
        const obj: any = {};
        if (schema.properties) {
          for (const [propName, propSchema] of Object.entries(schema.properties)) {
            obj[propName] = this.generateTestData(propSchema as OpenAPIV3.SchemaObject);
          }
        }
        return obj;

      default:
        return null;
    }
  }

  private generateFromPattern(pattern: string): string {
    // Simple pattern-based generation for common cases
    if (pattern.includes('[a-zA-Z0-9\\-_]')) {
      return 'test-id-123';
    }
    return 'test-value';
  }
}