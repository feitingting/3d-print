import { message } from 'antd';

interface RequestConfig {
  method: string;
  headers: HeadersInit;
  body?: BodyInit;
}

class HttpService {
  private baseURLs: Record<string, string>;
  constructor(baseURLs: string | Record<string, string> = '/api') {
    this.baseURLs =
      typeof baseURLs === 'string' ? { default: baseURLs } : baseURLs;
  }

  private resolveBaseURL(endpoint: string): string {
    // 匹配最长路径前缀
    const matchedPrefix = Object.keys(this.baseURLs)
      .filter((key) => endpoint.startsWith(`/${key}`))
      .sort((a, b) => b.length - a.length)[0];

    return matchedPrefix ? this.baseURLs[matchedPrefix] : this.baseURLs.default;
  }

  async request<T = any>(
    method: string,
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<T | null> {
    const baseURL = this.resolveBaseURL(endpoint);
    const url = `${baseURL}${endpoint}`;
    console.log('url====>', url);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      ...(endpoint.includes('webapp') && { robotip: '192.168.1.111' }),
    };

    try {
      const controller = new AbortController();

      const config: RequestInit = {
        method: method.toUpperCase(),
        headers,
        signal: controller.signal,
        ...(params && { body: JSON.stringify(params) }),
      };

      const response = await fetch(url, config);
      if (endpoint.includes('webapp')) {
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        clearTimeout(timeoutId); // 清除已触发的定时器
      }

      if (!response.ok) {
        const res = await response.json();
        // 原代码错误是因为 Error 构造函数需要的是字符串参数，而传入的是对象，这里直接传入 res.message 字符串
        throw new Error(res.message || '请求失败');
      }

      // 兼容处理
      if (!endpoint.includes('webapp')) {
        const data: { status: number; result?: T; message?: string } =
          await response.json();

        if (data.status === 200) {
           return data.result as T;
        } else {
          message.error(data.message || '请求失败');
          return null;
        }
      } else {
        const responseData: { errcode: number; data: any; errormsg: string } =
          await response.json();
        if (responseData.errormsg) {
          message.error(responseData.errormsg);
        }
        if (responseData.errcode == 0) {
          return responseData.data;
        } else {
          return null;
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out:', url);
        message.error('请求超时，请检查网络连接');
        throw new Error('请求超时');
      }
      console.error('Request failed:', error);
      throw error;
    }
  }

  // async request<T = any>(
  //   method: string,
  //   endpoint: string,
  //   params?: Record<string, unknown>,
  // ): Promise<T | null> {
  //   const baseURL = this.resolveBaseURL(endpoint);
  //   const url = `${baseURL}${endpoint}`;
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  //     ...endpoint.includes('webapp') && { robotip:'10.5.5.100' }
  //     // robotip:'10.5.5.100'
  //   };

  //   try {
  //     const config: RequestInit = {
  //       method: method.toUpperCase(),
  //       headers,
  //       ...(params && { body: JSON.stringify(params) }),
  //     };

  //     const response = await fetch(url, config);

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //   } catch (error) {
  //     console.error('Request failed:', error);
  //     throw error;
  //   }
  // }

  get<T = any>(endpoint: string): Promise<T | null> {
  return this.request<T>('GET', endpoint);
  }

  post<T = any>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<T | null> {
    return this.request<T>('POST', endpoint, data);
  }

  put<T = any>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<T | null> {
    return this.request<T>('PUT', endpoint, data);
  }

  delete<T = any>(endpoint: string): Promise<T | null> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const httpService = new HttpService({
  default: '/api',
  webapp: '/webapp',
});
