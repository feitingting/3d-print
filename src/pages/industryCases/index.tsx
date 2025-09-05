import React, { useState, useEffect } from 'react';
import { Button, Tabs, Input, Select, Card, Row, Col, Carousel, Modal, Divider } from 'antd';
import { SearchOutlined, CalendarOutlined, WarningOutlined, PhoneOutlined, MessageOutlined }
  from '@ant-design/icons';
import { Link } from 'umi';
import styles from './index.module.scss';
import TabPane from 'antd/lib/tabs/TabPane';

// 模拟数据
const industries = [
  { id: 'all', name: '全部行业' },
  { id: 'medical', name: '医疗健康' },
  { id: 'aerospace', name: '航空航天' },
  { id: 'automotive', name: '汽车制造' },
  { id: 'education', name: '教育科研' },
  { id: 'consumer', name: '消费品' },
  { id: 'construction', name: '建筑' },
];

const featuredCases = [
  {
    id: 1,
    industry: 'medical',
    title: '定制化病灶模型，',
    description: '利用3D打印技术制作病灶模型，通过手术模拟确定最优治疗方案',
    beforeImage: require('@/assets/cases/10.png'),
    afterImage: require('@/assets/cases/10.png'),
    highlight: '个性化定制，适配度提升90%',
    // 相关图片
    relatedImgs: [
      require('@/assets/cases/10.png'),
      require('@/assets/cases/10-1.jpg'),
      // require('@/assets/cases/10-2.jpg'),
    ]
  },
  {
    id: 2,
    industry: 'aerospace',
    title: '氧化铝陶瓷齿轮',
    description: '通过3D打印技术制造的航空部件，减重30%同时保持高强度。',
    beforeImage: require('@/assets/cases/1.png'), 
    afterImage: require('@/assets/cases/1.png'),
    highlight: '减重30%，制造成本降低25%',
    // 相关图片
    relatedImgs: [
      require('@/assets/cases/1-1.jpg'),
      require('@/assets/cases/1-2.jpg'),
      require('@/assets/cases/1-3.jpg'),
      // require('@/assets/cases/3.jpg'),
    ]
  },
  {
    id: 3,
    industry: 'aerospace',
    title: '氧化铝陶瓷齿轮',
    description: '汽车设计流程中，3D打印加速原型迭代，缩短开发周期。',
    beforeImage: require('@/assets/cases/2.png'),
    afterImage: require('@/assets/cases/2.png'),
    highlight: '开发周期缩短40%',
    relatedImgs: [
      require('@/assets/cases/2-1.jpg'),
      require('@/assets/cases/2-2.jpg'),
      // require('@/assets/cases/1-3.jpg'),
      // require('@/assets/cases/3.jpg'),
    ]
  },
  {
    id: 4,
    industry: 'education',
    title: '圆柱',
    // description: '为学校提供丰富的3D打印教学模型，提升课堂互动性。',
    beforeImage: require('@/assets/cases/3.png'),
    afterImage: require('@/assets/cases/3.png'),
    relatedImgs: [
      require('@/assets/cases/3-1.jpg'),
      require('@/assets/cases/3-2.png'),
      require('@/assets/cases/3-3.png'),
    ],
    highlight: '覆盖80%理工科课程',
  },
];

const industrySolutions = {
  medical: {
    title: '医疗健康领域的3D打印创新',
    description: '通过3D打印技术为医疗行业提供定制化解决方案，从手术规划到康复辅助。',
    cases: [
      {
        id: 101,
        title: '定制化假肢案例',
        description: '根据患者肢体数据定制的3D打印假肢，提供更好的舒适度和功能性。',
        image: require('@/assets/cases/solution-1.png'),
      },
      {
        id: 102,
        title: '手术导板打印案例',
        description: '术前规划用3D打印导板，提高手术精准度和成功率。',
        image: require('@/assets/cases/solution-2.png'),
      },
      {
        id: 103,
        title: '牙科应用案例',
        description: '定制化假牙、正畸托槽等牙科产品的3D打印解决方案。',
        image: require('@/assets/cases/solution-3.png'),
      },
    ],
    stats: '帮助30+医疗机构缩短手术准备时间40%',
  },  
  aerospace: {
    title: '轻量化航空部件的快速原型与生产',
    description: '为航空航天行业提供高性能、轻量化的3D打印零部件解决方案。',
    cases: [
      {
        id: 201,
        title: '飞机内饰件案例',
        description: '3D打印的轻量化飞机内饰件，满足严格的航空安全标准。',
        image: require('@/assets/cases/solution-4.png'),
      },
      {
        id: 202,
        title: '无人机部件案例',
        description: '为无人机制造商提供定制化3D打印结构件，提高飞行性能。',
        image: require('@/assets/cases/solution-5.png'),
      },
      {
        id: 203,
        title: '航天器原型件案例',
        description: '太空探索用零部件的3D打印原型与小批量生产。',
        image: require('@/assets/cases/solution-6.png'),
      },
    ],
    techHighlights: '钛合金材料应用，减重40%，强度提升25%',
  },
  automotive: {
    title: '加速汽车研发与定制化生产',
    description: '3D打印技术助力汽车行业从设计到生产的全流程创新。',
    cases: [
      {
        id: 301,
        title: '概念车原型制作',
        description: '快速迭代汽车设计概念，缩短从创意到原型的时间。',
        image: require('@/assets/cases/solution-7.png'),
      },
      {
        id: 302,
        title: '定制化汽车配件',
        description: '为高端汽车提供定制化3D打印内饰和功能部件。',
        image: require('@/assets/cases/solution-8.png'),
      },
      {
        id: 303,
        title: '工装夹具案例',
        description: '生产线上的3D打印工装夹具，提高生产效率和灵活性。',
        image: require('@/assets/cases/solution-9.png'),
      },
    ],
    stats: '帮助20+车企缩短研发周期30%',
  },
  education: {
    title: '将创新带入课堂与实验室',
    description: '为教育机构提供3D打印解决方案，培养学生的创新能力和实践技能。',
    cases: [
      {
        id: 401,
        title: '教学模型打印',
        description: '复杂科学概念的3D可视化模型，提升教学效果。',
        image: require('@/assets/cases/solution-10.png'),
      },
      {
        id: 402,
        title: '科研设备部件',
        description: '高校实验室用定制化3D打印科研设备配件。',
        image: require('@/assets/cases/solution-11.png'),
      },
      {
        id: 403,
        title: '学生项目支持',
        description: '为学生创新项目提供3D打印技术支持和材料。',
        image: require('@/assets/cases/solution-12.png'),
      },
    ],
    stats: '已为50+所院校提供3D打印教学解决方案',
  },
} as any;

const customerReviews = [
  {
    id: 1,
    company: '某知名医疗设备公司',
    logo: require('@/assets/cases/avatar1.png'),
    review: '3D打印技术极大地提升了我们的产品研发效率，特别是在定制化医疗设备领域。',
    contactPerson: '张经理',
    position: '研发总监',
  },
  {
    id: 2,
    company: '某航空公司',
    logo: require('@/assets/cases/avatar2.png'),
    review: '通过与贵公司合作，我们成功实现了多个航空部件的轻量化设计与生产，节省了大量成本。',
    contactPerson: '李工程师',
    position: '结构设计主管',
  },
  {
    id: 3,
    company: '某汽车制造商',
    logo: require('@/assets/cases/avatar3.png'),
    review: '3D打印原型使我们的设计迭代速度提升了40%，帮助我们更快地将新产品推向市场。',
    contactPerson: '王总监',
    position: '产品设计总监',
  },
];

const customerLogos = [
  'https://via.placeholder.com/120x60?text=客户LOGO1',
  'https://via.placeholder.com/120x60?text=客户LOGO2',
  'https://via.placeholder.com/120x60?text=客户LOGO3',
  'https://via.placeholder.com/120x60?text=客户LOGO4',
  'https://via.placeholder.com/120x60?text=客户LOGO5',
  'https://via.placeholder.com/120x60?text=客户LOGO6',
];

const CaseDetailModal = ({ caseId, visible, onClose }) => {
  // 这里简化处理，实际应用中可能需要从API获取详细信息
  const caseDetails = {
    background: '客户面临传统制造方式无法满足个性化需求的挑战，交货周期长，成本高。',
    solution: '我们提供了完整的3D打印解决方案，从扫描建模到打印后处理的一站式服务。',
    techParams: {
      printer: '工业级SLA 3D打印机',
      material: '高强度树脂/钛合金',
      precision: '±0.1mm',
      leadTime: '3-7个工作日',
    },
    beforeAfterImages: [
      'https://via.placeholder.com/800x500?text=案例详情对比图1',
      'https://via.placeholder.com/800x500?text=案例详情对比图2',
    ],
    customerReview: '这项技术革命性地改变了我们的生产方式，不仅降低了成本，还极大地提高了我们的创新能力。',
    benefits: '成本降低35%，交货周期缩短60%，设计自由度提升100%',
  };

  return (
    <Modal
      title="案例详情"
      visible={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <div className={styles.caseDetail}>
        <h2>{featuredCases.find(c => c.id === caseId)?.title || '案例详情'}</h2>
        <div className={styles.caseSection}>
          <h3>项目背景与挑战</h3>
          <p>{caseDetails.background}</p>
        </div>
        <div className={styles.caseSection}>
          <h3>解决方案概述</h3>
          <p>{caseDetails.solution}</p>
        </div>
        <div className={styles.caseSection}>
          <h3>技术参数</h3>
          <ul className={styles.techParams}>
            {Object.entries(caseDetails.techParams).map(([key, value]) => (
              <li key={key}><span>{key}:</span> {value}</li>
            ))}
          </ul>
        </div>
        <div className={styles.caseSection}>
          <h3>前后对比</h3>
          <div className={styles.imageComparison}>
            {caseDetails.beforeAfterImages.map((img, index) => (
              <img key={index} src={img} alt={`案例对比图${index + 1}`} />
            ))}
          </div>
        </div>
        <div className={styles.caseSection}>
          <h3>客户评价</h3>
          <blockquote>{caseDetails.customerReview}</blockquote>
        </div>
        <div className={styles.caseSection}>
          <h3>取得的效益</h3>
          <p className={styles.benefits}>{caseDetails.benefits}</p>
        </div>
        <div className={styles.ctaContainer}>
          <Button type="primary" size="large">获取类似解决方案</Button>
        </div>
      </div>
    </Modal>
  );
};

const IndustryCasesPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetailVisible, setCaseDetailVisible] = useState(false);
  const [currentSolutionTab, setCurrentSolutionTab] = useState('medical');

  // 处理案例详情查看
  const handleViewCase = (caseId) => {
    setSelectedCaseId(caseId);
    setCaseDetailVisible(true);
  };

  // 关闭案例详情
  const handleCloseCaseDetail = () => {
    setCaseDetailVisible(false);
  };

  // 筛选案例
  const filteredCases = () => {
    // 简化筛选逻辑，实际应用中可能需要更复杂的处理
    return featuredCases.filter(caseItem => {
      if (selectedIndustry !== 'all' && caseItem.industry !== selectedIndustry) {
        return false;
      }
      if (searchKeyword && !caseItem.title.includes(searchKeyword) && !caseItem.description.includes(searchKeyword)) {
        return false;
      }
      return true;
    });
  };

  return (
    <div className={styles.industryCasesPage}>
      {/* 页面标题 */}


      {/* 行业筛选区 */}
      {/* <Tabs
          defaultActiveKey={'aerospace'}
          onChange={setCurrentSolutionTab}
        >
          <Tabs.TabPane key="medical" tab="医疗健康">
            
          </Tabs.TabPane>
          <Tabs.TabPane key="aerospace" tab="航空航天"> 
            航空航天
          </Tabs.TabPane>
          <Tabs.TabPane key="automotive" tab="汽车制造">
            汽车制造
          </Tabs.TabPane>
          <Tabs.TabPane key="education" tab="教育科研">
            教育科研
          </Tabs.TabPane>
        </Tabs> */}

      {/* 精选案例展示区 */}
      <div className={styles.featuredCasesSection}>
        <h2>精选案例</h2>
        <div className={styles.casesList}>
          {featuredCases.map((caseItem, index) => (
            <div key={caseItem.id} className={styles.caseListItem}>
              <div className={styles.viewMoreContainer}>
                <span
                  className={styles.viewMoreButton}
                  onClick={() => window.location.href = '/more'}
                >
                  查看更多
                </span>
              </div>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12} className={styles.mainImageContainer}>
                  <img
                    className={`${styles.mainImage} ${index === 1 ? styles.mainImageContain : ''}`}
                    src={caseItem.afterImage}
                    alt={`${caseItem.title} - 3D打印方案`}
                  />
                </Col>
                <Col xs={24} md={12} className={styles.caseContent}>
                  <div className={styles.caseInfo}>
                    <div className={`${styles.industryTag} ${styles[caseItem.industry]}`}>
                      {industries.find(ind => ind.id === caseItem.industry)?.name}
                    </div>
                    <h3>{caseItem.title}</h3>
                    <p>{caseItem.description}</p>
                    <div className={styles.highlight}>{caseItem.highlight}</div>
                    {/* <Button
                      type="primary"
                      onClick={() => handleViewCase(caseItem.id)}
                    >
                      查看详情
                    </Button> */}
                  </div>
                  <div className={styles.relatedImages}>
                    <h4>相关案例</h4>
                    <div className={styles.relatedImagesGrid}>
                      {caseItem.relatedImgs?.map((src, index) => (
                        <img
                          key={index}
                          src={src}
                          alt={`${caseItem.title} - 相关案例`}
                          className={styles.relatedImage}
                        />
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </div>
      {/* 行业解决方案区 */}
      <div className={styles.industrySolutionsSection}>
        <h2>行业解决方案</h2>

        <div className={styles.solutionContent}>
          {
            Object.keys(industrySolutions).map(key => {
              const currentSolutionTab = key;
              return (
                <div key={currentSolutionTab}>
                  <h3>{industrySolutions[currentSolutionTab].title}</h3>
                  <p className={styles.solutionDescription}>{industrySolutions[currentSolutionTab].description}</p>

                  <Row gutter={[24, 24]} className={styles.solutionCases}>
                    {industrySolutions[currentSolutionTab].cases.map((caseItem: any) => (
                      <Col key={caseItem.id} xs={24} sm={12} md={8}>
                        <Card
                          hoverable
                          cover={<img alt={caseItem.title} src={caseItem.image} />}
                        >
                          <Card.Meta title={caseItem.title} description={caseItem.description} />
                          {/* <Button
                            type="link"
                            onClick={() => handleViewCase(caseItem.id)}
                            className={styles.viewDetailButton}
                          >
                            查看详情
                          </Button> */}
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <div className={styles.solutionHighlight}>
                    {industrySolutions[currentSolutionTab].stats && <p>{industrySolutions[currentSolutionTab].stats}</p>}
                    {industrySolutions[currentSolutionTab].techHighlights && <p>{industrySolutions[currentSolutionTab].techHighlights}</p>}
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* 客户评价区 */}
      <div className={styles.customerReviewsSection}>
        <h2>客户评价</h2>
        <Row gutter={[24, 24]}>
          {customerReviews.map(review => (
            <Col key={review.id} xs={24} md={8}>
              <Card className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <img src={review.logo} alt={review.company} className={styles.companyLogo} />
                  <div className={styles.contactInfo}>
                    <p className={styles.companyName}>{review.company}</p>
                    <p className={styles.contactPerson}>{review.contactPerson} - {review.position}</p>
                  </div>
                </div>
                <Divider />
                <p className={styles.reviewContent}>{review.review}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 客户LOGO墙 */}
      <div className={styles.customerLogosSection}>
        <h2>合作客户</h2>
        <div className={styles.logosGrid}>
          {customerLogos.map((logo, index) => (
            <div key={index} className={styles.logoItem}>
              <img src={logo} alt={`客户LOGO${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA区域 */}
      <div className={styles.ctaSection}>
        <h2>准备好开始您的3D打印之旅了吗？</h2>
        <p>我们的专家团队随时为您提供定制化解决方案</p>
        <div className={styles.ctaButtons}>
          <Button type="primary" size="large" className={styles.primaryCta}>
            为您的行业定制解决方案
          </Button>
          <Button type="default" size="large" className={styles.secondaryCta}>
            咨询我们的3D打印专家
          </Button>
        </div>
        <div className={styles.contactOptions}>
          <div className={styles.contactItem}>
            <PhoneOutlined />
            <span>400-123-4567</span>
          </div>
          <div className={styles.contactItem}>
            <MessageOutlined />
            <span>在线咨询</span>
          </div>
        </div>
      </div>

      {/* 案例详情模态框 */}
      <CaseDetailModal
        caseId={selectedCaseId}
        visible={caseDetailVisible}
        onClose={handleCloseCaseDetail}
      />
    </div>
  );
};

export default IndustryCasesPage;