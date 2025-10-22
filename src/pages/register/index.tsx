import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { sendVerificationCode } from '@/api/auth';
import { generateCaptcha, isValidEmail } from '@/utils/emailService';
import styles from './index.module.scss';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaCountdown, setCaptchaCountdown] = useState(0);

  // 发送验证码
  const sendCaptcha = async () => {
    try {
      const email = await form.getFieldValue('email');
      const username = await form.getFieldValue('username');
      const password = await form.getFieldValue('password');
      const confirmPassword = await form.getFieldValue('confirmPassword');

      if (!email) {
        message.error('请先输入邮箱地址');
        return;
      }

      if (!username) {
        message.error('请先输入用户名');
        return;
      }

      if (!password) {
        message.error('请先输入密码');
        return;
      }

      if (!confirmPassword) {
        message.error('请先确认密码');
        return;
      }

      if (password !== confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      if (!isValidEmail(email)) {
        message.error('请输入有效的邮箱地址');
        return;
      }

      setCaptchaLoading(true);

      try {
        // 调用API发送验证码
        await sendVerificationCode(email);
        message.success('验证码已发送到您的邮箱');
        setCaptchaCountdown(60);

        // 倒计时
        const timer = setInterval(() => {
          setCaptchaCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // 跳转到验证码页面，传递注册信息
        const registerData = {
          email,
          username,
          password,
          confirmPassword
        };
        
        // 将注册信息存储到sessionStorage，验证码页面会使用
        sessionStorage.setItem('registerData', JSON.stringify(registerData));
        history.push('/verification');
        
      } catch (error: any) {
        message.error(error.message || '发送验证码失败，请稍后重试');
      }

      setCaptchaLoading(false);
    } catch (error) {
      message.error('发送验证码失败，请稍后重试');
      setCaptchaLoading(false);
    }
  };

  // 跳转到登录页面
  const goToLogin = () => {
    history.push('/login');
  };

  // 返回首页
  const goHome = () => {
    history.push('/');
  };

  return (
    <div className={styles.registerContainer}>
      {/* <div className={styles.header}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={goHome}
          className={styles.backButton}
        >
          返回首页
        </Button>
      </div> */}
      
      <div className={styles.registerCard}>
        <div className={styles.leftSection}>
          {/* <img src="/assets/home/logo.jpg" alt="MAPHIUM" /> */}
        </div>
        
        <div className={styles.rightSection}>
          <div className={styles.logo}>
            <img src="/assets/home/logo.jpg" alt="MAPHIUM Logo" />
            <Title level={2}>Sign up for MAPHIUM</Title>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            size="large"
            className={styles.registerForm}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 2, message: '用户名至少2个字符' },
                { max: 20, message: '用户名最多20个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱地址"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱地址"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                onClick={sendCaptcha}
                loading={captchaLoading}
                disabled={captchaCountdown > 0}
                block
                className={styles.sendCodeButton}
              >
                {captchaCountdown > 0 ? `重新发送 (${captchaCountdown}s)` : '发送验证码'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className={styles.divider}>
            <Text type="secondary">或</Text>
          </Divider>

          <div className={styles.footer}>
            <Text type="secondary">
              已有账户？{' '}
              <Button type="link" onClick={goToLogin} className={styles.linkButton}>
                立即登录
              </Button>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
