import { useState } from 'react';
import { Carousel, Card, Row, Col, Layout, Menu, Button, Image, Tag } from 'antd';
import { history } from 'umi';
import { HistoryOutlined, PrinterOutlined, ToolOutlined, BulbOutlined, TeamOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import styles from './index.module.scss';
import { useTranslation } from '@/utils/i18n';

const { Header, Content, Footer } = Layout;

// 轮播图数据
const carouselItems = [
  {
    key: 1,
    image: '/assets/home/banner-1.jpg',
    title: '工业级精密打印',
    desc: '50μm超高精度 · 支持复杂结构成型'
  },
  {
    key: 2,
    image: '/assets/home/banner-2.jpg',
    title: '极速在线报价',
    desc: 'AI智能估价 · 30秒获取详细报价单'
  },
  {
    key: 3,
    image: '/assets/home/banner-3.jpg',
    title: '百种打印材料',
    desc: '工程塑料/金属粉末/柔性材料 一应俱全'
  },
  {
    key: 4,
    image: '/assets/home/banner-4.jpg',
    title: '批量生产支持',
    desc: '工业级打印集群 · 日产能5000+标准件'
  },
  {
    key: 5,
    image: '/assets/home/banner-5.jpg',
    title: '专业后处理',
    desc: '打磨/喷砂/上色 全流程工艺支持'
  },
  {
    key: 6,
    image: '/assets/home/banner-6.jpg',
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
    image: '/assets/home/case1.jpg'
  },
  {
    title1: '医疗假体',
    desc1: '个性化骨科植入物定制',
    title2: '医疗器械制造',
    desc2: '为某三甲医院定制骨科手术导板，精度达0.1mm，缩短手术时间30%',
    image: '/assets/home/case2.jpg'
  },
  {
    title1: '无人机配件',
    desc1: '高强度碳纤维无人机部件',
    title2: '无人机轻量化设计',
    desc2: '为专业无人机厂商定制的高强度轻量化部件，重量减轻40%，强度提升25%',
    image: '/assets/home/case3.jpg'
  },
  {
    title1: '动漫手办',
    desc1: '高精度角色模型定制',
    title2: '收藏品级手办制作',
    
    desc2: '1:8比例动漫角色手办，细节还原度99%，表面光滑度Ra0.8μm，支持批量定制',
    image: '/assets/home/case4.jpg'
  },
  {
    title1: '珠宝首饰',
    desc1: '个性化定制珠宝设计',
    title2: '精密贵金属打印',
    desc2: '18K金定制吊坠，精度达0.05mm，支持复杂镂空设计，7个工作日快速交付',
    image: '/assets/home/case5.jpg'
  },
  {
    title1: '艺术雕塑',
    desc1: '现代艺术创作与复刻',
    title2: '复杂艺术形态实现',
    desc2: '为艺术家定制的复杂形态雕塑，采用树脂材料打印，表面光滑度Ra0.6μm，支持多种颜色和材质选择',
    image: '/assets/home/case6.jpg'
  }
];

export default () => {
  // 在组件函数内部初始化状态
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  
  // 统计数据
  const stats = [
    { value: '8M+', label: t('hero.stats.parts') },
    { value: '140K+', label: t('hero.stats.companies') },
    { value: '188', label: t('hero.stats.materials') },
    { value: '31', label: t('hero.stats.technologies') },
  ];
  return (
    <Layout className={styles.homeLayout}>
      {/* 主内容区 */}
      <Content>
        {/* Hero Section - 主要报价入口 */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t('hero.title')}<span className={styles.highlight}>{t('hero.title.highlight')}</span>{t('hero.title.suffix')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('hero.subtitle')}
            </p>
            <p className={styles.heroDescription}>
              {t('hero.description')}<br/>
              <a 
                onClick={() => history.push('/materials')} 
                style={{ color: '#0ea5e9', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              >
                {t('hero.viewMaterials')}
              </a>
            </p>
            
            {/* CTA按钮组 */}
            <div className={styles.ctaButtons}>
              <Button 
                type="primary" 
                size="large"
                style={{border:'none'}}
                icon={<PrinterOutlined />}
                onClick={() => history.push('/online-quotation')}
                className={styles.primaryCta}
              >
                {t('hero.getQuote')}
              </Button>
              <Button 
                size="large"
                style={{border:'none'}}
                onClick={() => history.push('/model-library')}
                className={styles.secondaryCta}
              >
                {t('hero.browseLibrary')}
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
          <h2 className={styles.sectionTitle}>{t('process.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('process.subtitle')}</p>
          <Row gutter={[48, 24]} className={styles.processSteps}>
            <Col xs={24} md={8}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3>{t('process.step1.title')}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{t('process.step1.desc')}</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3>{t('process.step2.title')}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{t('process.step2.desc')}</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3>{t('process.step3.title')}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{t('process.step3.desc')}</p>
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
                  {t('materials.quickAccess.title')}
                </h3>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                  {t('materials.quickAccess.desc')}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Tag color="blue">PLA</Tag>
                  <Tag color="blue">ABS</Tag>
                  <Tag color="purple">Resin</Tag>
                  <Tag color="gold">Steel</Tag>
                  <Tag color="gold">Titanium</Tag>
                  <Tag color="cyan">Nylon</Tag>
                </div>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ToolOutlined />}
                  style={{ height: '48px', fontSize: '16px', borderRadius: '24px',border:'none' }}
                >
                  {t('materials.quickAccess.button')}
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        {/* 网站优势说明 - 左右交替布局 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('advantages.title')}</h2>
          <p className={styles.sectionSubtitle}>{t('advantages.subtitle')}</p>
          
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
                  <h3>{t('advantage1.title')}</h3>
                  <h4>{t('advantage1.subtitle')}</h4>
                  <p>{t('advantage1.content')}</p>
                  <div className={styles.highlights}>
                    <span>✓ {t('advantage1.highlight1')}</span>
                    <span>✓ {t('advantage1.highlight2')}</span>
                    <span>✓ {t('advantage1.highlight3')}</span>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 优势2 - 左文右图 */}
            <Row gutter={[48, 32]} align="middle" className={styles.advantageRow}>
              <Col xs={24} md={14}>
                <Card className={styles.advantageContentCard} bordered={false}>
                  <div className={styles.advantageNumber}>02</div>
                  <h3>{t('advantage2.title')}</h3>
                  <h4>{t('advantage2.subtitle')}</h4>
                  <p>{t('advantage2.content')}</p>
                  <div className={styles.highlights}>
                    <span>✓ {t('advantage2.highlight1')}</span>
                    <span>✓ {t('advantage2.highlight2')}</span>
                    <span>✓ {t('advantage2.highlight3')}</span>
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
                  <h3>{t('advantage3.title')}</h3>
                  <h4>{t('advantage3.subtitle')}</h4>
                  <p>{t('advantage3.content')}</p>
                  <div className={styles.highlights}>
                    <span>✓ {t('advantage3.highlight1')}</span>
                    <span>✓ {t('advantage3.highlight2')}</span>
                    <span>✓ {t('advantage3.highlight3')}</span>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 优势4 - 左文右图 */}
            <Row gutter={[48, 32]} align="middle" className={styles.advantageRow}>
              <Col xs={24} md={14}>
                <Card className={styles.advantageContentCard} bordered={false}>
                  <div className={styles.advantageNumber}>04</div>
                  <h3>{t('advantage4.title')}</h3>
                  <h4>{t('advantage4.subtitle')}</h4>
                  <p>{t('advantage4.content')}</p>
                  <div className={styles.highlights}>
                    <span>✓ {t('advantage4.highlight1')}</span>
                    <span>✓ {t('advantage4.highlight2')}</span>
                    <span>✓ {t('advantage4.highlight3')}</span>
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
          <h2 className={styles.sectionTitle}>{t('cases.title')}</h2>
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
                        {t('cases.viewMore')}
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
          <h2 className={styles.sectionTitle}>{t('equipment.title')}</h2>
          <Row gutter={[24, 24]} className={styles.equipmentGrid}>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>{t('equipment.sls')}</h3>
                <img src={'/assets/home/device1.jpg'} />
                <p>Build Size: 400×400×450mm</p>
                <p>Layer Thickness: 0.08-0.15mm</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>{t('equipment.dlp')}</h3>
                <img src={'/assets/home/device2.jpg'} />
                <p>Build Size: 192×120×400mm</p>
                <p>Resolution: 2560×1600</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.equipmentCard}>
                <h3>{t('equipment.fdm')}</h3>
                <img src={'/assets/home/device3.jpg'} />
                <p>Build Size: 300×300×400mm</p>
                <p>Layer Thickness: 0.05-0.4mm</p>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}