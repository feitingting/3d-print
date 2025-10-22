import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { userLogin } from '@/api/auth';
import styles from './index.module.scss';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理登录
  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const { email, password } = values;
      const result = await userLogin({ email, password });
      
      if (result) {
        message.success('登录成功！');
        // 保存登录状态
        localStorage.setItem('token', result.token || '');
        localStorage.setItem('userInfo', JSON.stringify(result.user || {}));
        // 跳转到首页
        history.push('/');
      }
    } catch (error: any) {
      message.error(error.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到注册页面
  const goToRegister = () => {
    history.push('/register');
  };

  // 返回首页
  const goHome = () => {
    history.push('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
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
        
        <div className={styles.logo}>
          <img src="/assets/home/logo.jpg" alt="MAPHIUM Logo" />
          <Title level={2}>Sign in to MAPHIUM</Title>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
          className={styles.loginForm}
        >
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入邮箱地址"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>
          <Text type="secondary">或</Text>
        </Divider>

        <div className={styles.footer}>
          <Text type="secondary">
            还没有账户？{' '}
            <Button type="link" onClick={goToRegister} className={styles.linkButton}>
              创建账户
            </Button>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
