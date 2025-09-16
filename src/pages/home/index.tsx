import { useState } from 'react';
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image } from 'antd';
import { history } from 'umi';
import { HistoryOutlined, PrinterOutlined, ToolOutlined, BulbOutlined, TeamOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';

const { Header, Content, Footer } = Layout;

// 轮播图数据
const carouselItems = [
  {
    key: 1,
    image: 'http://maphium.com/assets/home/banner-1.png',
    title: '工业级精密打印',
    desc: '50μm超高精度 · 支持复杂结构成型'
  },
  {
    key: 2,
    image: 'http://maphium.com/assets/home/banner-2.png',
    title: '极速在线报价',
    desc: 'AI智能估价 · 30秒获取详细报价单'
  },
  {
    key: 3,
    image: 'http://maphium.com/assets/home/banner-3.png',
    title: '百种打印材料',
    desc: '工程塑料/金属粉末/柔性材料 一应俱全'
  },
  {
    key: 4,
    image: 'http://maphium.com/assets/home/banner-4.png',
    title: '批量生产支持',
    desc: '工业级打印集群 · 日产能5000+标准件'
  },
  {
    key: 5,
    image: 'http://maphium.com/assets/home/banner-5.png',
    title: '专业后处理',
    desc: '打磨/喷砂/上色 全流程工艺支持'
  },
  {
    key: 6,
    image: 'http://maphium.com/assets/home/banner-6.png',
    title: '7×24技术咨询',
    desc: '资深工程师团队 · 全程技术护航'
  },
];


// 行业案例数据
const cases = [  
  {
    title1: '航空航天部件',
    desc1: '钛合金轻量化部件打印',
    title2: '航空航天原型',
    desc2: '卫星支架结构件快速成型，耐温范围-70℃~300℃，交付周期缩短50%',
    image: 'http://maphium.com/assets/home/case1.png'
  },
  {
    title1: '医疗假体',
    desc1: '个性化骨科植入物定制',
    title2: '医疗器械制造',
    desc2: '为某三甲医院定制骨科手术导板，精度达0.1mm，缩短手术时间30%',
    image: 'http://maphium.com/assets/home/case2.png'
  },
  {
    title1: '无人机配件',
    desc1: '高强度碳纤维无人机部件',
    title2: '无人机轻量化设计',
    desc2: '为专业无人机厂商定制的高强度轻量化部件，重量减轻40%，强度提升25%',
    image: 'http://maphium.com/assets/home/case3.png'
  },
  {
    title1: '动漫手办',
    desc1: '高精度角色模型定制',
    title2: '收藏品级手办制作',
    
    desc2: '1:8比例动漫角色手办，细节还原度99%，表面光滑度Ra0.8μm，支持批量定制',
    image: 'http://maphium.com/assets/home/case4.png'
  },
  {
    title1: '珠宝首饰',
    desc1: '个性化定制珠宝设计',
    title2: '精密贵金属打印',
    desc2: '18K金定制吊坠，精度达0.05mm，支持复杂镂空设计，7个工作日快速交付',
    image: 'http://maphium.com/assets/home/case5.png'
  },
  {
    title1: '艺术雕塑',
    desc1: '现代艺术创作与复刻',
    title2: '复杂艺术形态实现',
    desc2: '为艺术家定制的复杂形态雕塑，采用树脂材料打印，表面光滑度Ra0.6μm，支持多种颜色和材质选择',
    image: 'http://maphium.com/assets/home/case6.png'
  }
];

export default () => {
  // 在组件函数内部初始化状态
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <Layout className={styles.homeLayout}>
      {/* 主内容区 */}
      <Content>
        {/* 轮播图 */}
        <Carousel autoplay effect="fade" >
          {carouselItems.map(item => (
            <div key={item.key} className={styles.carouselItem}>
              <Image src={item.image}
                preview={false}
                style={{
                  objectFit: 'fill',
                }}
                alt={item.title} />
              {/* <div className={styles.carouselText}>
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
              </div> */}
              {/* 添加渐变遮罩 */}
              {/* <div className={styles.overlay}></div> */}
            </div>
          ))}
        </Carousel>

        {/* 行业案例 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>行业应用案例</h2>
          <Row gutter={[24, 24]} className={styles.caseGrid}>
            {/* {cases.map((caseItem, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  style={{ padding: '20px', display: 'flex' }}
                  cover={<img alt={caseItem.title1} src={caseItem.image} />}
                  hoverable
                >
                  <Card.Meta title={caseItem.title1} description={caseItem.desc1}
                    className={styles.meta} />
                  <Card.Meta title={caseItem.title2} description={caseItem.desc2}
                    className={styles.meta} />
                </Card>
              </Col>
            ))} */}
            {cases.map((caseItem, index) => (
              <Col key={index} xs={24} sm={12} md={12}>
                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Card
                    className={styles.caseCard}
                    cover={<img alt={caseItem.title1} src={caseItem.image} />}
                    hoverable
                  >
                    <Card.Meta title={caseItem.title1} description={caseItem.desc1} className={styles.meta} />
                    <Card.Meta title={caseItem.title2} description={caseItem.desc2} className={styles.meta} />
                  </Card>

                  {/* 查看更多文字 - 位于卡片右下方 */}
                  {hoveredIndex === index && (
                    <div        
                      className={`${styles.caseCardOverlay} ${hoveredIndex === index ? styles.visible  : styles.fadeOut}`}>

                      <Button
                      
                       // type="primary"
                        size="large"
                        onClick={() => history.push('/industryCases')}
                      >
                        查看更多
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* 设备展示 */}
        <div className={styles.sectionDark}>
          <h2 className={styles.sectionTitle}>工业级打印设备</h2>
          <Row gutter={[24, 24]} className={styles.equipmentGrid}>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>SLS 激光烧结设备</h3>
                <img src={'http://maphium.com/assets/home/device1.png'} />
                <p>成型尺寸：400×400×450mm</p>
                <p>层厚精度：0.08-0.15mm</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>DLP 光固化设备</h3>
                <img src={'http://maphium.com/assets/home/device2.png'} />
                <p>成型尺寸：192×120×400mm</p>
                <p>分辨率：2560×1600</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>FDM 熔融沉积设备</h3>
                <img src={'http://maphium.com/assets/home/device3.png'} />
                <p>成型尺寸：300×300×400mm</p>
                <p>层厚精度：0.05-0.4mm</p>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}