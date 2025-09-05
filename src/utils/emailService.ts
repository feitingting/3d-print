import { httpService } from '@/http-service';
import axios from 'axios';

/**
 * Ionos.de 邮件服务配置
 */
const emailConfig = {
  smtpServer: 'smtp.ionos.de',
  smtpPort: 587,
  username: 'feitt@maphium.com', // 替换为实际的ionos.de邮箱
  password: 'feitt0001', // 替换为实际的邮箱密码
  fromAddress: 'feitt@maphium.com', // 发送方邮箱
};

/**
 * 发送验证码邮件
 * @param email 接收方邮箱
 * @param captcha 验证码
 * @returns Promise<boolean>
 */
export const sendVerificationEmail = async (email: string, captcha: string): Promise<any> => {
  try {
    // 这里调用后端API来发送邮件
    const response = await httpService.post('/send-email', {
      to: email,
      // 全部放到服务端
      // subject: 'MAPHIUM 验证码',
      // content: `您的验证码是：${captcha}，有效期1小时。请勿泄露给他人。`,
      // config: emailConfig,
      // verificationCode:captcha
    });
    if(response?.messageId) {
      return true;
    }
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
};

/**
 * 生成随机验证码
 * @param length 验证码长度
 * @returns 验证码字符串
 */
export const generateCaptcha = (length: number = 6): string => {
  const chars = '0123456789';
    let captcha = '';
    for (let i = 0; i < length; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  return captcha;
};

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  return emailRegex.test(email);
};