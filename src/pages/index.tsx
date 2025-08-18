import React, { useEffect, useState } from 'react';
import {
  HomeOutlined,
  AlertOutlined,
  TeamOutlined,
  ExperimentOutlined,
  ControlOutlined,
  ProfileOutlined,
  HistoryOutlined,
  HeatMapOutlined,
} from '@ant-design/icons';
import { history } from 'umi';
// 在根组件添加语言配置
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image,ConfigProvider, Modal, Form, Input, Tabs, message } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import {  PrinterOutlined, ToolOutlined, BulbOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';

const { Header, Sider, Content,Footer } = Layout;
const { TabPane } = Tabs;

const HomePage: React.FC = (props: any) => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaCountdown, setCaptchaCountdown] = useState(0);
  // 控制显示登录还是注册表单
  const [formType, setFormType] = useState<'login' | 'register'>('login'); 
   

  // 邮箱验证规则
  const emailRules = [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ];

  // 密码验证规则
  const passwordRules = [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度至少为6位' }
  ];

  // 显示登录弹窗
  const showLoginModal = () => {
    setLoginModalVisible(true);
    setFormType('login'); // 默认显示登录表单
  };

  // 关闭登录弹窗
  const handleCloseLoginModal = () => {
    setLoginModalVisible(false);
    loginForm.resetFields();
    registerForm.resetFields();
     setFormType('login'); // 重置为登录表单
  };

  // 处理登录
  const handleLogin = async (values: any) => {
    try {
      // 这里可以添加实际的登录API调用
      console.log('登录信息:', values);
      message.success('登录成功！');
      setLoginModalVisible(false);
    } catch (error) {
      message.error('登录失败，请重试');
    }
  };

  // 处理注册
  const handleRegister = async (values: any) => {
    try {
      // 这里可以添加实际的注册API调用
      console.log('注册信息:', values);
      message.success('注册成功！');
      setLoginModalVisible(false);
    } catch (error) {
      message.error('注册失败，请重试');
    }
  };

  // 发送验证码
  const sendCaptcha = async () => {
    try {
      const email = registerForm.getFieldValue('email');
      if (!email) {
        message.error('请先输入邮箱地址');
        return;
      }

      setCaptchaLoading(true);
      // 模拟发送验证码
      setTimeout(() => {
        message.success('验证码已发送到您的邮箱');
        setCaptchaLoading(false);
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
      }, 1000);
    } catch (error) {
      message.error('发送验证码失败');
      setCaptchaLoading(false);
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className={styles.homeLayout}>
        <header>
          {/* 头部导航 */}
          <ProLayout
            logo={(
              <div 
                // onClick={()=>history.push('/home')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '2px'
                }}>
                <img src={require('@/assets/home/logo.png')} alt="Logo" style={{ height: '80px' }} />
                {/* <span style={{ fontSize: '12px', lineHeight: '12px', color: '#000', marginTop: '2px', fontWeight: 600 }}>Dream it, Print it.</span> */}
              </div>
            )}
            title="3DPrintPro"
            style={{ height: '80px' }}
            layout="top"  // 修改布局模式为顶部导航
            fixedHeader={true} // 固定导航栏
            location={{ pathname: '/' }}
            menuDataRender={() => [
              { path: '/home', name: '首页' },
              { path: '/online-quotation', name: '在线报价' },
              { path: '/industryCases', name: '行业案例' },
              { path: '/software', name: '3D软件' },
              { path: '/model-library', name: '模型库' },
              { path: '/about', name: '关于我们' }
            ]}
            menuItemRender={(item, dom) => (
              <div 
                style={{ 
                  padding: '0 20px', 
                  fontSize: 16, 
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => history.push(item.path)}
              >
                {dom}
              </div>
            )}
            rightContentRender={() => (
              <div className={styles.loginButtonGroup}>
                <Button 
                  className={styles.loginButton} 
                  size="large"
                  onClick={showLoginModal}
                >
                  登录/注册
                </Button>
                <Button size="large" 
                        onClick={()=>history.push('/more')}
                        type="primary">在线下单</Button>
              </div>
            )}
            navTheme="light"  // 设置导航主题
            headerHeight={80} // 设置导航栏高度
            siderWidth={0}   // 隐藏侧边栏
          />
        </header>

        {/* 登录弹窗 */}
        <Modal
          title="登录/注册"
          open={loginModalVisible}
          onCancel={handleCloseLoginModal}
          footer={null}
          width={600}
          className={styles.loginModal}
        >
          {formType === 'login' ? (
            <>
              <Form
                form={loginForm}
                onFinish={handleLogin}
                className={styles.loginForm}
              >
                <Form.Item
                  name="email"
                  rules={emailRules}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="请输入邮箱"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={passwordRules}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button 
                     className={ styles.loginBtn} 
                     type="primary" 
                     htmlType="submit" size="large" block
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
              <div className={styles.registerLink}>
                <span>
                  还没有账号？ <a onClick={() => setFormType('register')}>前去注册</a>
                </span>
              </div>
            </>
          ) : (
            <>
              <Form
                form={registerForm}
                onFinish={handleRegister}
                className={styles.loginForm}
              >
                <Form.Item
                  name="email"
                  rules={emailRules}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="请输入邮箱"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="captcha"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Input
                    addonAfter={
                      <Button
                        type="link"
                        size="small"
                        onClick={sendCaptcha}
                        loading={captchaLoading}
                        disabled={captchaCountdown > 0}
                        className={styles.captchaButton}
                      >
                        {captchaCountdown > 0 ? `${captchaCountdown}s` : '获取验证码'}
                      </Button>
                    }
                    placeholder="请输入验证码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={passwordRules}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
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
                    placeholder="请确认密码"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    注册
                  </Button>
                </Form.Item>
              </Form>
              <div className={styles.registerLink}>
                <span>
                  已有账号？ <a onClick={() => setFormType('login')}>去登录</a>
                </span>
              </div>
            </>
          )}
        </Modal>

        <Content>
           {props.children}
        </Content>
        {/* 底部导航 */}
        <Footer className={styles.footer}>
          <Row gutter={[24, 24]}>
            <Col md={6} xs={24}>
              <h3>联系我们</h3>
              <p>电话：400-123-4567</p>
              <p>邮箱：service@3dprintpro.com</p>
            </Col>
            <Col md={6} xs={24}>
              <h3>服务条款</h3>
              <p>隐私政策</p>
              <p>用户协议</p>
            </Col>
            <Col md={12} xs={24}>
              <h3>合作伙伴</h3>
              <div className={styles.partners}>
                <img src="/partners/autodesk.png" alt="Autodesk" />
                <img src="/partners/ultimaker.png" alt="Ultimaker" />
              </div>
            </Col>
          </Row>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;