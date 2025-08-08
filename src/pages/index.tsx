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
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image,ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import {  PrinterOutlined, ToolOutlined, BulbOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';

const { Header, Sider, Content,Footer } = Layout;

const HomePage: React.FC = (props: any) => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout className={styles.homeLayout}>
        <header>
          {/* 头部导航 */}
          <ProLayout
            logo={(
              <div 
                onClick={()=>history.push('/home')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'space-between', paddingTop: '5px', paddingBottom: '2px'
                }}>
                <img src={require('@/assets/home/logo.png')} alt="Logo" style={{ height: '32px' }} />
                <span style={{ fontSize: '12px', lineHeight: '12px', color: '#000', marginTop: '2px', fontWeight: 600 }}>Dream it, Print it.</span>
              </div>
            )}
            title="3DPrintPro"
            style={{ height: '64px' }}
            layout="top"  // 修改布局模式为顶部导航
            fixedHeader={true} // 固定导航栏
            location={{ pathname: '/' }}
            menuDataRender={() => [
              { path: '/online-quotation', name: '在线报价' },
              { path: '/industryCases', name: '行业案例' },
              { path: '/software', name: '3D软件' },
              { path: '/model-library', name: '模型库' },
              { path: '/about', name: '关于我们' }
            ]}
            menuItemRender={(item, dom) => (
              <span style={{ padding: '0 20px', fontSize: 16 }}
                onClick={() => history.push(item.path)}>{dom}</span>
            )}
            rightContentRender={() => (
              <div style={{ paddingRight: 24 }}>
                <Button size="large">立即咨询</Button>
                <Button size="large" type="primary" style={{ marginLeft: 16 }}>在线下单</Button>
              </div>
            )}
            navTheme="light"  // 设置导航主题
            headerHeight={64} // 设置导航栏高度
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
