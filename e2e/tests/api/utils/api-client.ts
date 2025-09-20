import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from '../config/api-config';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  duration: number;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: any;
  duration: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private requestCount = 0;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for timing
    this.client.interceptors.request.use((config) => {
      config.metadata = { startTime: Date.now() };
      this.requestCount++;
      console.log(`🔗 [${this.requestCount}] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for timing and logging
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`✅ [${this.requestCount}] ${response.status} ${response.statusText} (${duration}ms)`);
        response.duration = duration;
        return response;
      },
      (error) => {
        const duration = error.config?.metadata
          ? Date.now() - error.config.metadata.startTime
          : 0;
        console.log(`❌ [${this.requestCount}] ${error.response?.status || 'ERROR'} ${error.message} (${duration}ms)`);
        error.duration = duration;
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async head(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.head(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async options(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.options(url, config);
      return this.formatResponse(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  private formatResponse<T>(response: AxiosResponse<T> & { duration?: number }): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      duration: response.duration || 0
    };
  }

  private formatError(error: any): ApiError {
    const apiError: ApiError = {
      message: error.message || 'Unknown API error',
      duration: error.duration || 0
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.statusText = error.response.statusText;
      apiError.data = error.response.data;
    }

    return apiError;
  }

  // Utility methods for testing
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.status === 200 && response.data.status === 'ok';
    } catch {
      return false;
    }
  }

  async waitForApi(maxAttempts = 10, delayMs = 1000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 Checking API health (attempt ${attempt}/${maxAttempts})`);

      if (await this.isHealthy()) {
        console.log('✅ API is healthy');
        return true;
      }

      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log('❌ API health check failed');
    return false;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  resetRequestCount(): void {
    this.requestCount = 0;
  }
}

// Default export for convenience
export const apiClient = new ApiClient();