export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  environment: string;
  openApiSpecPath: string;
}

export const getApiConfig = (): ApiConfig => {
  const environment = process.env.TEST_ENV || 'dev';

  const configs: Record<string, ApiConfig> = {
    dev: {
      baseURL: process.env.API_BASE_URL || 'https://anfg4lcnxe.execute-api.us-east-1.amazonaws.com/Prod',
      timeout: 10000,
      retries: 2,
      environment: 'dev',
      openApiSpecPath: '/openapi.yaml'
    },
    prod: {
      baseURL: process.env.API_BASE_URL || 'https://api.learnermax.com',
      timeout: 10000,
      retries: 3,
      environment: 'prod',
      openApiSpecPath: '/openapi.yaml'
    },
    local: {
      baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
      timeout: 5000,
      retries: 1,
      environment: 'local',
      openApiSpecPath: '/openapi.yaml'
    }
  };

  return configs[environment] || configs.dev;
};

export const apiConfig = getApiConfig();