import { httpService } from '../http-service/index';

/**
 * 用户登录API
 * @param params 登录参数
 * @returns Promise<any>
 */
export const userLogin = async (params: { email: string; password: string }): Promise<any> => {
  try {
    const response = await httpService.post('/auth/login', params);
    if (response?.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userInfo', JSON.stringify(response.userInfo));
    }
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 用户注册API
 * @param params 注册参数
 * @returns Promise<any>
 */
export const userRegister = async (params: {
  email: string; 
  password: string;
  captcha: string;
}): Promise<any> => {
  try {
    const { result } = await httpService.post('/auth/register', params);
    return result;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 发送验证码API
 * @param email 邮箱地址
 * @returns Promise<any>
 */
export const sendVerificationCode = async (email: string): Promise<any> => {
  try {
    return await httpService.post('/api/auth/send-code', { email });
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw error;
}
};

/**
 * 退出登录
 * @returns Promise<any>
 */
export const userLogout = async (): Promise<any> => {
  try {
    const response = await httpService.post('/api/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    return response;
  } catch (error) {
    console.error('退出登录失败:', error);
    throw error;
  }
};

/**
 * 获取用户信息
 * @returns Promise<any>
 */
export const getUserInfo = async (): Promise<any> => {                                                                  
  try {
    const response = await httpService.get('/api/auth/user-info');
    return response;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否已登录
 * @returns boolean
 */
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

