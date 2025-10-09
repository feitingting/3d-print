import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Tag, Button, Input } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import styles from './index.module.scss';
import { MATERIALS, getMaterialsByCategory } from '@/data/materials';

const { TabPane } = Tabs;

// 材料数据 - 使用共享数据源
const materialsData = {
  plastics: getMaterialsByCategory('plastic'),
  resins: getMaterialsByCategory('resin'),
  metals: getMaterialsByCategory('metal')
};

// 保留原来的注释数据结构作为参考
const _oldMaterialsData = {
  plastics: [
    {
      name: 'PLA (聚乳酸)',
      nameEn: 'PLA',
      description: '生物降解材料，易于打印，适合原型制作和日常用品',
      properties: ['环保材料', '低成本', '易于打印', '表面光滑'],
      applications: ['原型制作', '教育模型', '装饰品', '日用品'],
      colors: ['白色', '黑色', '红色', '蓝色', '绿色', '黄色', '透明'],
      price: '¥2-5/克',
      image: 'http://maphium.com/assets/materials/pla.jpg',
      specs: {
        density: '1.24 g/cm³',
        tensile: '50 MPa',
        temperature: '180-220°C',
        flexibility: '低'
      }
    },
    {
      name: 'ABS (丙烯腈丁二烯苯乙烯)',
      nameEn: 'ABS',
      description: '高强度工程塑料，耐冲击，适合功能件和耐用部件',
      properties: ['高强度', '耐冲击', '耐热性好', '可后处理'],
      applications: ['功能原型', '工具', '汽车零件', '外壳'],
      colors: ['白色', '黑色', '灰色', '红色', '蓝色'],
      price: '¥3-6/克',
      image: 'http://maphium.com/assets/materials/abs.jpg',
      specs: {
        density: '1.04 g/cm³',
        tensile: '40 MPa',
        temperature: '210-250°C',
        flexibility: '中等'
      }
    },
    {
      name: 'PETG',
      nameEn: 'PETG',
      description: '结合PLA和ABS优点，高强度、耐化学腐蚀',
      properties: ['高强度', '耐化学性', '透明度高', '易于打印'],
      applications: ['食品容器', '医疗器械', '防护用品', '功能件'],
      colors: ['透明', '白色', '黑色', '蓝色', '绿色'],
      price: '¥4-7/克',
      image: 'http://maphium.com/assets/materials/petg.jpg',
      specs: {
        density: '1.27 g/cm³',
        tensile: '53 MPa',
        temperature: '220-250°C',
        flexibility: '中高'
      }
    },
    {
      name: 'Nylon PA12 (尼龙)',
      nameEn: 'Nylon PA12',
      description: 'SLS打印首选材料，高强度、耐磨、耐化学腐蚀',
      properties: ['超高强度', '耐磨损', '柔韧性好', '耐化学性'],
      applications: ['功能件', '齿轮', '轴承', '管道接头'],
      colors: ['自然白', '黑色', '灰色'],
      price: '¥15-25/克',
      image: 'http://maphium.com/assets/materials/nylon.jpg',
      specs: {
        density: '1.01 g/cm³',
        tensile: '48 MPa',
        temperature: '175-185°C',
        flexibility: '高'
      }
    },
    {
      name: 'TPU (热塑性聚氨酯)',
      nameEn: 'TPU',
      description: '柔性材料，高弹性和耐磨性，类似橡胶',
      properties: ['高弹性', '耐磨损', '抗撕裂', '柔软'],
      applications: ['鞋垫', '手机壳', '密封件', '缓冲垫'],
      colors: ['透明', '黑色', '红色', '蓝色'],
      price: '¥8-12/克',
      image: 'http://maphium.com/assets/materials/tpu.jpg',
      specs: {
        density: '1.20 g/cm³',
        tensile: '26 MPa',
        temperature: '210-230°C',
        flexibility: '极高'
      }
    }
  ],
  resins: [
    {
      name: 'Standard Resin (标准树脂)',
      nameEn: 'Standard Resin',
      description: 'SLA/DLP打印标准材料，高精度、表面光滑',
      properties: ['超高精度', '表面光滑', '细节丰富', '快速固化'],
      applications: ['精密模型', '珠宝原型', '牙科模型', '手办'],
      colors: ['白色', '灰色', '黑色', '透明'],
      price: '¥10-15/克',
      image: 'http://maphium.com/assets/materials/resin.jpg',
      specs: {
        density: '1.15 g/cm³',
        tensile: '60 MPa',
        temperature: '60-80°C',
        flexibility: '低'
      }
    },
    {
      name: 'Tough Resin (韧性树脂)',
      nameEn: 'Tough Resin',
      description: '高韧性树脂，类似ABS，适合功能测试',
      properties: ['高韧性', '抗冲击', '耐用', '精度高'],
      applications: ['功能原型', '卡扣件', '夹具', '工具'],
      colors: ['黑色', '灰色'],
      price: '¥15-20/克',
      image: 'http://maphium.com/assets/materials/tough-resin.jpg',
      specs: {
        density: '1.17 g/cm³',
        tensile: '55 MPa',
        temperature: '60-80°C',
        flexibility: '中等'
      }
    },
    {
      name: 'Flexible Resin (柔性树脂)',
      nameEn: 'Flexible Resin',
      description: '柔软可弯曲的树脂材料，类似橡胶',
      properties: ['高柔韧性', '抗撕裂', '弹性好', '耐磨'],
      applications: ['密封圈', '软管', '防震垫', '可穿戴设备'],
      colors: ['透明', '黑色'],
      price: '¥18-25/克',
      image: 'http://maphium.com/assets/materials/flexible-resin.jpg',
      specs: {
        density: '1.10 g/cm³',
        tensile: '8 MPa',
        temperature: '60-80°C',
        flexibility: '极高'
      }
    }
  ],
  metals: [
    {
      name: '316L 不锈钢',
      nameEn: '316L Stainless Steel',
      description: '耐腐蚀性极强的医用级不锈钢，适合功能件',
      properties: ['超高强度', '耐腐蚀', '生物相容性', '可抛光'],
      applications: ['医疗器械', '航空航天', '工具', '珠宝'],
      colors: ['金属银色'],
      price: '¥80-150/克',
      image: 'http://maphium.com/assets/materials/316l.jpg',
      specs: {
        density: '7.99 g/cm³',
        tensile: '485 MPa',
        temperature: '1400-1450°C',
        flexibility: '低'
      }
    },
    {
      name: 'AlSi10Mg 铝合金',
      nameEn: 'AlSi10Mg',
      description: '轻质高强度铝合金，良好的热性能和机械性能',
      properties: ['轻量化', '高强度', '导热性好', '可加工'],
      applications: ['航空航天', '汽车零件', '散热器', '结构件'],
      colors: ['银灰色'],
      price: '¥60-100/克',
      image: 'http://maphium.com/assets/materials/aluminum.jpg',
      specs: {
        density: '2.67 g/cm³',
        tensile: '345 MPa',
        temperature: '550-570°C',
        flexibility: '低'
      }
    },
    {
      name: 'Ti6Al4V 钛合金',
      nameEn: 'Titanium Ti6Al4V',
      description: '航空航天级钛合金，高强度、轻质、耐腐蚀',
      properties: ['极高强度', '超轻质', '生物相容', '耐高温'],
      applications: ['航空航天', '医疗植入物', '高端部件', '赛车'],
      colors: ['银白色'],
      price: '¥200-400/克',
      image: 'http://maphium.com/assets/materials/titanium.jpg',
      specs: {
        density: '4.43 g/cm³',
        tensile: '895 MPa',
        temperature: '1650-1670°C',
        flexibility: '低'
      }
    },
    {
      name: 'Inconel 718',
      nameEn: 'Inconel 718',
      description: '镍基高温合金，极强的耐热和耐腐蚀性能',
      properties: ['耐高温', '抗氧化', '高强度', '耐腐蚀'],
      applications: ['涡轮叶片', '航空发动机', '热交换器', '化工设备'],
      colors: ['银灰色'],
      price: '¥300-500/克',
      image: 'http://maphium.com/assets/materials/inconel.jpg',
      specs: {
        density: '8.19 g/cm³',
        tensile: '1035 MPa',
        temperature: '1260-1336°C',
        flexibility: '低'
      }
    }
  ]
};

const Materials: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('plastics');

  const filterMaterials = (materials: any[]) => {
    if (!searchTerm) return materials;
    return materials.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className={styles.materialsPage}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1>材料指南</h1>
          <p>Maphium提供广泛的材料选择，包括塑料、金属以及每种材料的各种表面处理和颜色</p>
          <Input
            placeholder="搜索材料名称或应用场景..."
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
        </div>
      </div>

      {/* 材料分类标签页 */}
      <div className={styles.contentWrapper}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          className={styles.materialTabs}
        >
          <TabPane tab={`塑料材料 (${materialsData.plastics.length})`} key="plastics">
            <Row gutter={[24, 24]}>
              {filterMaterials(materialsData.plastics).map((material, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    className={styles.materialCard}
                    cover={
                      <div className={styles.cardCover}>
                        <img alt={material.name} src={material.image} />
                        <div className={styles.priceTag}>{material.price}</div>
                      </div>
                    }
                  >
                    <h3>{material.name}</h3>
                    <p className={styles.nameEn}>{material.nameEn}</p>
                    <p className={styles.description}>{material.description}</p>
                    
                    <div className={styles.properties}>
                      <h4>特性</h4>
                      <div className={styles.tags}>
                        {material.properties.map((prop: string, i: number) => (
                          <Tag key={i} icon={<CheckCircleOutlined />} color="blue">{prop}</Tag>
                        ))}
                      </div>
                    </div>

                    <div className={styles.specs}>
                      <h4>技术参数</h4>
                      <ul>
                        <li><strong>密度:</strong> {material.specs.density}</li>
                        <li><strong>拉伸强度:</strong> {material.specs.tensile}</li>
                        <li><strong>打印温度:</strong> {material.specs.temperature}</li>
                        <li><strong>柔韧性:</strong> {material.specs.flexibility}</li>
                      </ul>
                    </div>

                    <div className={styles.applications}>
                      <h4>应用场景</h4>
                      <p>{material.applications.join(' · ')}</p>
                    </div>

                    <div className={styles.colors}>
                      <h4>可选颜色</h4>
                      <div className={styles.colorTags}>
                        {material.colors.map((color: string, i: number) => (
                          <Tag key={i}>{color}</Tag>
                        ))}
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      onClick={() => history.push({
                        pathname: '/online-quotation',
                        state: { selectedMaterial: material.value }
                      })}
                      className={styles.quoteButton}
                    >
                      使用此材料报价
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab={`树脂材料 (${materialsData.resins.length})`} key="resins">
            <Row gutter={[24, 24]}>
              {filterMaterials(materialsData.resins).map((material, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    className={styles.materialCard}
                    cover={
                      <div className={styles.cardCover}>
                        <img alt={material.name} src={material.image} />
                        <div className={styles.priceTag}>{material.price}</div>
                      </div>
                    }
                  >
                    <h3>{material.name}</h3>
                    <p className={styles.nameEn}>{material.nameEn}</p>
                    <p className={styles.description}>{material.description}</p>
                    
                    <div className={styles.properties}>
                      <h4>特性</h4>
                      <div className={styles.tags}>
                        {material.properties.map((prop: string, i: number) => (
                          <Tag key={i} icon={<CheckCircleOutlined />} color="purple">{prop}</Tag>
                        ))}
                      </div>
                    </div>

                    <div className={styles.specs}>
                      <h4>技术参数</h4>
                      <ul>
                        <li><strong>密度:</strong> {material.specs.density}</li>
                        <li><strong>拉伸强度:</strong> {material.specs.tensile}</li>
                        <li><strong>固化温度:</strong> {material.specs.temperature}</li>
                        <li><strong>柔韧性:</strong> {material.specs.flexibility}</li>
                      </ul>
                    </div>

                    <div className={styles.applications}>
                      <h4>应用场景</h4>
                      <p>{material.applications.join(' · ')}</p>
                    </div>

                    <div className={styles.colors}>
                      <h4>可选颜色</h4>
                      <div className={styles.colorTags}>
                        {material.colors.map((color: string, i: number) => (
                          <Tag key={i}>{color}</Tag>
                        ))}
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      onClick={() => history.push({
                        pathname: '/online-quotation',
                        state: { selectedMaterial: material.value }
                      })}
                      className={styles.quoteButton}
                    >
                      使用此材料报价
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab={`金属材料 (${materialsData.metals.length})`} key="metals">
            <Row gutter={[24, 24]}>
              {filterMaterials(materialsData.metals).map((material, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    className={styles.materialCard}
                    cover={
                      <div className={styles.cardCover}>
                        <img alt={material.name} src={material.image} />
                        <div className={styles.priceTag}>{material.price}</div>
                      </div>
                    }
                  >
                    <h3>{material.name}</h3>
                    <p className={styles.nameEn}>{material.nameEn}</p>
                    <p className={styles.description}>{material.description}</p>
                    
                    <div className={styles.properties}>
                      <h4>特性</h4>
                      <div className={styles.tags}>
                        {material.properties.map((prop: string, i: number) => (
                          <Tag key={i} icon={<CheckCircleOutlined />} color="gold">{prop}</Tag>
                        ))}
                      </div>
                    </div>

                    <div className={styles.specs}>
                      <h4>技术参数</h4>
                      <ul>
                        <li><strong>密度:</strong> {material.specs.density}</li>
                        <li><strong>拉伸强度:</strong> {material.specs.tensile}</li>
                        <li><strong>熔点:</strong> {material.specs.temperature}</li>
                        <li><strong>柔韧性:</strong> {material.specs.flexibility}</li>
                      </ul>
                    </div>

                    <div className={styles.applications}>
                      <h4>应用场景</h4>
                      <p>{material.applications.join(' · ')}</p>
                    </div>

                    <div className={styles.colors}>
                      <h4>可选颜色</h4>
                      <div className={styles.colorTags}>
                        {material.colors.map((color: string, i: number) => (
                          <Tag key={i}>{color}</Tag>
                        ))}
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      onClick={() => history.push({
                        pathname: '/online-quotation',
                        state: { selectedMaterial: material.value }
                      })}
                      className={styles.quoteButton}
                    >
                      使用此材料报价
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </div>

      {/* 底部CTA */}
      <div className={styles.bottomCta}>
        <h2>找到合适的材料了吗？</h2>
        <p>立即上传您的3D模型，获取精准报价</p>
        <Button 
          type="primary" 
          size="large"
          onClick={() => history.push('/online-quotation')}
        >
          开始报价
        </Button>
      </div>
    </div>
  );
};

export default Materials;

