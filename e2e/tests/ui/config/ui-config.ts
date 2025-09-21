import * as fs from 'fs';
import * as path from 'path';

interface UiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  bypassSecret?: string;
  apiUrl: string;
}

interface UiEnvironmentConfig {
  preview: UiConfig;
  production: UiConfig;
  local: UiConfig;
}

// Load environment variables from local.env
function loadLocalEnv(): Record<string, string> {
  try {
    // Use relative path from e2e directory
    const envPath = path.join(process.cwd(), 'local.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env: Record<string, string> = {};

    envContent.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=');
        }
      }
    });

    return env;
  } catch (error) {
    console.warn('Could not load local.env file:', error);
    return {};
  }
}

const localEnv = loadLocalEnv();

export const uiConfig: UiEnvironmentConfig = {
  preview: {
    baseURL: 'https://learnermax-nrdc54mv6-learner-max.vercel.app',
    timeout: 30000,
    retries: 2,
    bypassSecret: localEnv.VERCEL_AUTOMATION_BYPASS_SECRET,
    apiUrl: 'https://anfg4lcnxe.execute-api.us-east-1.amazonaws.com/Prod/'
  },
  production: {
    baseURL: 'https://learnermax.vercel.app',
    timeout: 30000,
    retries: 3,
    apiUrl: 'https://api.learnermax.com'
  },
  local: {
    baseURL: 'http://localhost:3000',
    timeout: 10000,
    retries: 1,
    apiUrl: 'http://localhost:8080'
  }
};

export function getUiConfig(): UiConfig {
  const environment = (process.env.UI_TEST_ENV || 'preview') as keyof UiEnvironmentConfig;

  if (!uiConfig[environment]) {
    throw new Error(`Unknown UI test environment: ${environment}`);
  }

  const config = uiConfig[environment];

  // Override with environment variables if provided
  return {
    ...config,
    baseURL: process.env.UI_BASE_URL || config.baseURL,
    bypassSecret: process.env.VERCEL_AUTOMATION_BYPASS_SECRET || config.bypassSecret
  };
}

export default uiConfig;