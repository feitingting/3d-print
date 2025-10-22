import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, message, Card } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { userRegister } from '@/api/auth';
import styles from './index.module.scss';

const { Title, Text } = Typography;

const VerificationPage: React.FC = () => {
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState<any>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // 从sessionStorage获取注册信息
    const storedData = sessionStorage.getItem('registerData');
    if (storedData) {
      setRegisterData(JSON.parse(storedData));
    } else {
      message.error('注册信息已过期，请重新注册');
      history.push('/register');
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1); // 只取最后一个字符
    }

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // 自动跳转到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 检查是否所有输入框都已填写
    if (newCodes.every(code => code !== '') && index === 5) {
      handleVerification(newCodes.join(''));
    }
  };

  // 处理退格键
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 处理粘贴
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCodes = [...codes];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCodes[i] = pastedData[i];
    }
    
    setCodes(newCodes);
    
    // 聚焦到最后一个填写的输入框
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
    
    // 如果粘贴了完整的6位验证码，自动验证
    if (pastedData.length === 6) {
      handleVerification(pastedData);
    }
  };

  // 处理验证码验证和注册
  const handleVerification = async (verificationCode: string) => {
    if (!registerData) {
      message.error('注册信息已过期，请重新注册');
      history.push('/register');
      return;
    }

    setLoading(true);
    try {
      const result = await userRegister({
        email: registerData.email,
        password: registerData.password,
        captcha: verificationCode,
        username: registerData.username
      });

      if (result) {
        message.success('注册成功！正在跳转到登录页面...');
        // 清除sessionStorage中的注册信息
        sessionStorage.removeItem('registerData');
        // 跳转到登录页面
        setTimeout(() => {
          history.push('/login');
        }, 1500);
      }
    } catch (error: any) {
      message.error(error.message || '验证码错误，请重新输入');
      // 清空验证码输入框
      setCodes(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // 手动提交验证码
  const handleSubmit = () => {
    const verificationCode = codes.join('');
    if (verificationCode.length !== 6) {
      message.error('请输入完整的6位验证码');
      return;
    }
    handleVerification(verificationCode);
  };

  // 重新发送验证码
  const resendCode = () => {
    message.info('请返回注册页面重新发送验证码');
    history.push('/register');
  };

  // 返回注册页面
  const goBack = () => {
    history.push('/register');
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        <div className={styles.header}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            className={styles.backButton}
          >
            返回注册
          </Button>
        </div>
        
        <div className={styles.logo}>
          <img src="/assets/home/logo.jpg" alt="MAPHIUM Logo" />
          <Title level={2}>MAPHIUM</Title>
        </div>

        <div className={styles.instruction}>
          <Text>
            我们已向 <strong>{registerData?.email}</strong> 发送了验证码
          </Text>
          <Text type="secondary" className={styles.subInstruction}>
            请输入6位验证码完成注册
          </Text>
        </div>

        <div className={styles.codeInputContainer}>
          {codes.map((code, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              value={code}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={styles.codeInput}
              maxLength={1}
              autoComplete="off"
              disabled={loading}
            />
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            block
            className={styles.verifyButton}
            disabled={codes.some(code => code === '')}
          >
            验证并注册
          </Button>
        </div>

        <div className={styles.footer}>
          <Text type="secondary">
            没有收到验证码？{' '}
            <Button 
              type="link" 
              onClick={resendCode} 
              icon={<ReloadOutlined />}
              className={styles.linkButton}
            >
              重新发送
            </Button>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
