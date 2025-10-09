import { useState } from 'react';
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image, Tag } from 'antd';
import { history } from 'umi';
import { HistoryOutlined, PrinterOutlined, ToolOutlined, BulbOutlined, TeamOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';

const { Header, Content, Footer } = Layout;

// 轮播图数据
const carouselItems = [
  {
    key: 1,
    image: 'http://maphium.com/assets/home/banner-1.jpg',
    title: '工业级精密打印',
    desc: '50μm超高精度 · 支持复杂结构成型'
  },
  {
    key: 2,
    image: 'http://maphium.com/assets/home/banner-2.jpg',
    title: '极速在线报价',
    desc: 'AI智能估价 · 30秒获取详细报价单'
  },
  {
    key: 3,
    image: 'http://maphium.com/assets/home/banner-3.jpg',
    title: '百种打印材料',
    desc: '工程塑料/金属粉末/柔性材料 一应俱全'
  },
  {
    key: 4,
    image: 'http://maphium.com/assets/home/banner-4.jpg',
    title: '批量生产支持',
    desc: '工业级打印集群 · 日产能5000+标准件'
  },
  {
    key: 5,
    image: 'http://maphium.com/assets/home/banner-5.jpg',
    title: '专业后处理',
    desc: '打磨/喷砂/上色 全流程工艺支持'
  },
  {
    key: 6,
    image: 'http://maphium.com/assets/home/banner-6.jpg',
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
    image: 'http://maphium.com/assets/home/case1.jpg'
  },
  {
    title1: '医疗假体',
    desc1: '个性化骨科植入物定制',
    title2: '医疗器械制造',
    desc2: '为某三甲医院定制骨科手术导板，精度达0.1mm，缩短手术时间30%',
    image: 'http://maphium.com/assets/home/case2.jpg'
  },
  {
    title1: '无人机配件',
    desc1: '高强度碳纤维无人机部件',
    title2: '无人机轻量化设计',
    desc2: '为专业无人机厂商定制的高强度轻量化部件，重量减轻40%，强度提升25%',
    image: 'http://maphium.com/assets/home/case3.jpg'
  },
  {
    title1: '动漫手办',
    desc1: '高精度角色模型定制',
    title2: '收藏品级手办制作',
    
    desc2: '1:8比例动漫角色手办，细节还原度99%，表面光滑度Ra0.8μm，支持批量定制',
    image: 'http://maphium.com/assets/home/case4.jpg'
  },
  {
    title1: '珠宝首饰',
    desc1: '个性化定制珠宝设计',
    title2: '精密贵金属打印',
    desc2: '18K金定制吊坠，精度达0.05mm，支持复杂镂空设计，7个工作日快速交付',
    image: 'http://maphium.com/assets/home/case5.jpg'
  },
  {
    title1: '艺术雕塑',
    desc1: '现代艺术创作与复刻',
    title2: '复杂艺术形态实现',
    desc2: '为艺术家定制的复杂形态雕塑，采用树脂材料打印，表面光滑度Ra0.6μm，支持多种颜色和材质选择',
    image: 'http://maphium.com/assets/home/case6.jpg'
  }
];

export default () => {
  // 在组件函数内部初始化状态
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // 统计数据
  const stats = [
    { value: '8M+', label: '已打印零件' },
    { value: '140K+', label: '服务企业' },
    { value: '188', label: '材料种类' },
    { value: '31', label: '打印技术' },
  ];
  return (
    <Layout className={styles.homeLayout}>
      {/* 主内容区 */}
      <Content>
        {/* Hero Section - 主要报价入口 */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              您的专业<span className={styles.highlight}>3D打印</span>服务平台
            </h1>
            <p className={styles.heroSubtitle}>
              从原型到生产 · 即时报价 · 最快24小时交付
            </p>
            <p className={styles.heroDescription}>
              上传您的3D模型文件，选择材料和工艺，立即获取精准报价<br/>
              <a 
                onClick={() => history.push('/materials')} 
                style={{ color: '#0ea5e9', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              >
                查看所有可用材料 →
              </a>
            </p>
            
            {/* CTA按钮组 */}
            <div className={styles.ctaButtons}>
              <Button 
                type="primary" 
                size="large"
                icon={<PrinterOutlined />}
                onClick={() => history.push('/online-quotation')}
                className={styles.primaryCta}
              >
                立即获取报价
              </Button>
              <Button 
                size="large"
                onClick={() => history.push('/model-library')}
                className={styles.secondaryCta}
              >
                浏览模型库
              </Button>
            </div>

            {/* 统计数据 */}
            <Row gutter={[32, 16]} className={styles.stats}>
              {stats.map((stat, index) => (
                <Col key={index} xs={12} sm={6}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* 工作流程说明 */} 
        <div className={styles.section} >
          <h2 className={styles.sectionTitle}>三步完成订单</h2>
          <p className={styles.sectionSubtitle}>简单、快速、专业</p>
          <Row gutter={[48, 24]} className={styles.processSteps}>
            <Col xs={24} md={8}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3>上传3D模型</h3>
                <p>支持STL、OBJ、STEP等35+文件格式<br/>上传安全且保密</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3>选择材料和工艺</h3>
                <p>20+打印技术，100+材料选择<br/>多种表面处理和颜色可选</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3>下单并收货</h3>
                <p>选择最优报价，在线支付<br/>快速交付，全程可追踪</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* 快速材料访问卡片 */}
        <div className={styles.section} style={{ paddingTop: '60px', paddingBottom: '40px' }}>
          <Card className={styles.materialQuickAccess} onClick={() => history.push('/materials')}>
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
                  探索我们的材料库
                </h3>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                  包括塑料、树脂、金属在内的<strong>100+种材料</strong>，满足您的各种应用需求
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Tag color="blue">PLA</Tag>
                  <Tag color="blue">ABS</Tag>
                  <Tag color="purple">树脂</Tag>
                  <Tag color="gold">不锈钢</Tag>
                  <Tag color="gold">钛合金</Tag>
                  <Tag color="cyan">尼龙</Tag>
                </div>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ToolOutlined />}
                  style={{ height: '48px', fontSize: '16px', borderRadius: '24px' }}
                >
                  查看完整材料指南
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        {/* 网站优势说明 - 左右交替布局 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>为什么选择我们</h2>
          <p className={styles.sectionSubtitle}>专业、透明、高效的3D打印服务</p>
          
          <div className={styles.advantagesContainer}>
            {/* 优势1 - 左图右文 */}
            <Row gutter={[48, 32]} align="middle" className={styles.advantageRow}>
              <Col xs={24} md={10}>
                <div className={styles.advantageImageWrapper}>
                  <div className={styles.advantageIconLarge}>
                    <PrinterOutlined />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <Card className={styles.advantageContentCard} bordered={false}>
                  <div className={styles.advantageNumber}>01</div>
                  <h3>透明定价，无最低订单要求</h3>
                  <h4>所见即所得的价格体验</h4>
                  <p>
                    与其他3D打印服务不同，我们从不收取任何隐藏的服务费或要求最低订单量。
                    只需上传您的3D模型，系统会立即为您计算精准报价，包含材料成本、加工费用、
                    工艺系数等所有细节。无论您需要打印1件还是1000件，我们都提供同样透明、
                    公平的价格。每一分钱的去向都清清楚楚，让您放心下单。
                  </p>
                  <div className={styles.highlights}>
                    <span>✓ 零服务费</span>
                    <span>✓ 无最低订单</span>
                    <span>✓ 价格透明</span>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 优势2 - 左文右图 */}
            <Row gutter={[48, 32]} align="middle" className={styles.advantageRow}>
              <Col xs={24} md={14}>
                <Card className={styles.advantageContentCard} bordered={false}>
                  <div className={styles.advantageNumber}>02</div>
                  <h3>市场上最多的技术选择</h3>
                  <h4>满足您的所有制造需求</h4>
                  <p>
                    我们不断扩展技术网络和材料库，致力于为客户提供业界最全面的制造解决方案。
                    从传统的FDM、SLA到先进的SLS、DMLS金属打印，从基础的PLA塑料到航空级钛合金，
                    涵盖20+种打印技术和100+种材料选择。无论您的项目是原型验证、小批量生产
                    还是功能测试，我们都能提供最适合的技术方案和材料组合。
                  </p>
                  <div className={styles.highlights}>
                    <span>✓ 20+打印技术</span>
                    <span>✓ 100+材料选择</span>
                    <span>✓ 多种表面处理</span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={10}>
                <div className={styles.advantageImageWrapper}>
                  <div className={styles.advantageIconLarge}>
                    <ToolOutlined />
                  </div>
                </div>
              </Col>
            </Row>

            {/* 优势3 - 左图右文 */}
            <Row gutter={[48, 32]} align="middle" className={styles.advantageRow}>
              <Col xs={24} md={10}>
                <div className={styles.advantageImageWrapper}>
                  <div className={styles.advantageIconLarge}>
                    <TeamOutlined />
                  </div>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <Card className={styles.advantageContentCard} bordered={false}>
                  <div className={styles.advantageNumber}>03</div>
                  <h3>专业支持与成功团队</h3>
                  <h4>全程陪伴，确保满意</h4>
                  <p>
                    我们的承诺不仅仅是完成生产，更是确保您的成功。从项目咨询、文件检查到生产跟踪、
                    质量把控，我们的专业团队会在每一个环节为您提供支持。7×24小时技术咨询热线，
                    资深工程师随时为您解答技术难题。遇到复杂项目？我们提供免费的工艺优化建议，
                    帮助您降低成本、提升质量。您的满意是我们唯一的追求。
                  </p>
                  <div className={styles.highlights}>
                    <span>✓ 7×24技术支持</span>
                    <span>✓ 工艺优化建议</span>
                    <span>✓ 质量保证</span>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 优势4 - 左文右图 */}
            <Row gutter={[48, 32]} align="middle" className={styles.advantageRow}>
              <Col xs={24} md={14}>
                <Card className={styles.advantageContentCard} bordered={false}>
                  <div className={styles.advantageNumber}>04</div>
                  <h3>即时价格对比系统</h3>
                  <h4>确保您获得最优价格</h4>
                  <p>
                    我们创新的智能报价系统会实时对比您所在地区和全球范围内的优质制造商价格，
                    为您筛选出性价比最高的方案。通过大数据分析历史订单、材料价格趋势、
                    以及制造商产能情况，确保您以最具竞争力的价格获得工业级品质零件。
                    不仅如此，我们还会根据您的订单量、交付时间等因素，为您推荐最优的生产方案，
                    帮助您在质量、价格和时间之间找到完美平衡。
                  </p>
                  <div className={styles.highlights}>
                    <span>✓ 实时价格对比</span>
                    <span>✓ 智能方案推荐</span>
                    <span>✓ 最优性价比</span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={10}>
                <div className={styles.advantageImageWrapper}>
                  <div className={styles.advantageIconLarge}>
                    <BulbOutlined />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

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
                <img src={'http://maphium.com/assets/home/device1.jpg'} />
                <p>成型尺寸：400×400×450mm</p>
                <p>层厚精度：0.08-0.15mm</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>DLP 光固化设备</h3>
                <img src={'http://maphium.com/assets/home/device2.jpg'} />
                <p>成型尺寸：192×120×400mm</p>
                <p>分辨率：2560×1600</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>FDM 熔融沉积设备</h3>
                <img src={'http://maphium.com/assets/home/device3.jpg'} />
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