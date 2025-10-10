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
import { history, useLocation } from 'umi';
// 在根组件添加语言配置
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image, ConfigProvider, Modal, Form, Input, Tabs, message, Dropdown, Avatar } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { PrinterOutlined, ToolOutlined, BulbOutlined, UserOutlined, LockOutlined, MailOutlined, FileTextOutlined, LogoutOutlined, GlobalOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';
import '../global.css';
// 在文件顶部导入新增的API
import { userLogin, userRegister, sendVerificationCode } from '@/api/auth';
import { generateCaptcha, isValidEmail, sendVerificationEmail } from '@/utils/emailService';
import axios from 'axios';
import { useTranslation, localeNames, type Locale } from '@/utils/i18n';

const { Header, Sider, Content, Footer } = Layout;
const { TabPane } = Tabs;

const HomePage: React.FC = (props: any) => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const { t, locale, setLocale } = useTranslation();
  const location = useLocation();

  // 邮箱验证规则
  const emailRules = [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ] as any;

  // 密码验证规则
  const passwordRules = [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度至少为6位' }
  ];

  // 显示登录弹窗
  const showLoginModal = () => {
    setLoginModalVisible(true);
    // setFormType('login'); // 默认显示登录表单
  };


  // 处理登录
  const handleLogin = async (values: any) => {
    try {
      const result = await userLogin(values);
      if (result?.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userInfo', JSON.stringify(result.userInfo));
        message.success('登录成功！');
      }
      setLoginModalVisible(false);
      // 可以在这里添加登录成功后的跳转逻辑
    } catch (error) {
      // message.error('登录失败，请检查邮箱和密码是否正确');
    }
  };

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      // 只在页面切换时触发，不包括浏览器前进后退
      if (action == "PUSH") {
        window.scrollTo({
          top: 0,
          // behavior:'smooth'
        })
      }
    });
    return unlisten;
  }, [])

  const LoginModal = (props: any) => {
    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();
    const [captchaCountdown, setCaptchaCountdown] = useState(0);

    // const [loginModalVisible, setLoginModalVisible] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    // 控制显示登录还是注册表单
    const [formType, setFormType] = useState<'login' | 'register'>('login');
    useEffect(() => {
      if (formType == 'login') {
        loginForm.resetFields();
      } else {
        registerForm.resetFields();
      }
    }, [formType])

    // 关闭登录弹窗
    const handleCloseLoginModal = () => {
      setLoginModalVisible(false);
      loginForm.resetFields();
      //  registerForm.resetFields();
      setFormType('login'); // 重置为登录表单
    };

    // 处理注册
    const handleRegister = async (values: any) => {
      try {
        const { result } = await userRegister(values);
        if (result) {
          message.success('注册成功！请登录');
          setFormType('login'); // 注册成功后切换到登录表单
          loginForm.setFieldsValue({ email: values.email }); // 预填充邮箱
        }
      } catch (error) {
        message.error('注册失败，请重试');
      }
    };

    // 发送验证码
    const sendCaptcha = async () => {
      debugger;
      try {
        const email = await registerForm.getFieldValue('email');
        if (!email) {
          message.error('请先输入邮箱地址');
          return;
        }

        if (!isValidEmail(email)) {
          message.error('请输入有效的邮箱地址');
          return;
        }

        setCaptchaLoading(true);

        // 调用API发送验证码
        const captchaCode = generateCaptcha();

        // 发送邮件
        const success = await sendVerificationEmail(email, captchaCode);

        if (success) {
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
        } else {
          message.error('发送验证码失败，请稍后重试');
        }

        setCaptchaLoading(false);
      } catch (error) {
        message.error('发送验证码失败，请稍后重试');
        setCaptchaLoading(false);
      }
    };

    return (
      <Modal
        title="登录/注册"
        open={props.visible}
        // destroyOnClose={false}
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
              key={formType}
              className={styles.loginForm}
            >
              <Form.Item
                name="email"
                rules={emailRules}
                initialValue={''}
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
                  className={styles.loginBtn}
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
              key={formType}
              onFinish={handleRegister}
              className={styles.loginForm}
            >
              <Form.Item
                name="email"
                rules={emailRules}
                initialValue={''}
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
    )
  }

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
                <img src={'/assets/home/logo.jpg'} style={{ height: '80px' }} />
                {/* <span style={{ fontSize: '12px', lineHeight: '12px', color: '#000', marginTop: '2px', fontWeight: 600 }}>Dream it, Print it.</span> */}
              </div>
            )}
            title="3DPrintPro"
            style={{ height: '80px' }} 
            layout="top"  // 修改布局模式为顶部导航
            fixedHeader={true} // 固定导航栏
            location={location}
            menuDataRender={() => [
              { path: '/home', name: t('nav.home') },
              { path: '/online-quotation', name: t('nav.quote') },
              { path: '/materials', name: t('nav.materials') },
              { path: '/industryCases', name: t('nav.cases') },
              { path: '/model-library', name: t('nav.library') },
              { path: '/about', name: t('nav.about') }
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
                onClick={() => history.push(item.path as string)}
              >
                {dom}
              </div>
            )}
            rightContentRender={() => {
              const token = localStorage.getItem('token');

              if (token) {
                return (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item 
                          key="orders" 
                          icon={<FileTextOutlined />}
                          onClick={() => history.push('/order-list')}
                        >
                          我的订单
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item 
                          key="logout" 
                          icon={<LogoutOutlined />}
                          onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userEmail');
                            window.location.reload();
                          }}
                        >
                          退出登录
                        </Menu.Item>
                      </Menu>
                    }
                    placement="bottomRight"
                  >
                    <Avatar
                      style={{ cursor: 'pointer' }}
                      src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
                    />
                  </Dropdown>
                );
              }

              return (
                <div className={styles.loginButtonGroup}>
                  {/* 语言切换 */}
                  <Dropdown
                    overlay={
                      <Menu selectedKeys={[locale]}>
                        {(Object.keys(localeNames) as Locale[]).map(key => (
                          <Menu.Item 
                            key={key}
                            onClick={() => setLocale(key)}
                          >
                            {localeNames[key]}
                          </Menu.Item>
                        ))}
                      </Menu>
                    }
                    placement="bottomRight"
                  >
                    <Button icon={<GlobalOutlined />} size="large" style={{ marginRight: '12px' }}>
                      {localeNames[locale]}
                    </Button>
                  </Dropdown>

                  <Button
                    className={styles.loginButton}
                    size="large"
                    onClick={showLoginModal}
                  >
                    {t('nav.login')}
                  </Button>
                  <Button size="large"
                    onClick={() => history.push('/more')}
                    type="primary">{t('nav.order')}</Button>
                </div>
              );
            }}
            navTheme="light"  // 设置导航主题
            headerHeight={80} // 设置导航栏高度
            siderWidth={0}   // 隐藏侧边栏
          />
        </header>
        <Content>
          {props.children}
          {
            loginModalVisible &&
            <LoginModal
              visible={loginModalVisible} />
          }

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