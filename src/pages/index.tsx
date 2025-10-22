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
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image, ConfigProvider, message, Dropdown, Avatar } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { PrinterOutlined, ToolOutlined, BulbOutlined, FileTextOutlined, LogoutOutlined, GlobalOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';
import '../global.css';
import { useTranslation, localeNames, type Locale } from '@/utils/i18n';

const { Header, Sider, Content, Footer } = Layout;

const HomePage: React.FC = (props: any) => {
  const { t, locale, setLocale } = useTranslation();
  const location = useLocation();

  // 检查是否为认证相关页面（登录、注册、验证码）
  const isAuthPage = ['/login', '/register', '/verification'].includes(location.pathname);

  // 跳转到登录页面
  const goToLogin = () => {
    history.push('/login');
  };

  // 跳转到注册页面
  const goToRegister = () => {
    history.push('/register');
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


  // 如果是认证页面，直接渲染子组件，不显示头部和底部
  if (isAuthPage) {
    return (
      <ConfigProvider locale={zhCN}>
        {props.children}
      </ConfigProvider>
    );
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
                    onClick={goToLogin}
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