// 材料数据 - 统一数据源
export interface MaterialSpec {
  density: string;
  tensile: string;
  temperature: string;
  flexibility: string;
}

export interface Material {
  value: string;
  name: string;
  nameEn: string;
  label: string;
  description: string;
  properties: string[];
  applications: string[];
  colors: string[];
  price: string;
  priceRange: { min: number; max: number }; // 用于计算的价格区间（元/克）
  image: string;
  specs: MaterialSpec;
  category: 'plastic' | 'resin' | 'metal';
  color?: number; // Three.js 颜色值（用于3D预览）
  materialProps?: any; // Three.js 材质属性
}

export const MATERIALS: Material[] = [
  // ==================== 塑料材料 ====================
  {
    value: 'pla',
    name: 'PLA (聚乳酸)',
    nameEn: 'PLA',
    label: 'PLA (聚乳酸)',
    description: '生物降解材料，易于打印，适合原型制作和日常用品',
    properties: ['环保材料', '低成本', '易于打印', '表面光滑'],
    applications: ['原型制作', '教育模型', '装饰品', '日用品'],
    colors: ['白色', '黑色', '红色', '蓝色', '绿色', '黄色', '透明'],
    price: '¥2-5/克',
    priceRange: { min: 2, max: 5 },
    image: 'http://maphium.com/assets/materials/pla.jpg',
    specs: {
      density: '1.24 g/cm³',
      tensile: '50 MPa',
      temperature: '180-220°C',
      flexibility: '低'
    },
    category: 'plastic',
    color: 0x87CEEB,
    materialProps: {
      roughness: 0.9,
      metalness: 0.0,
      transmission: 0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.1
    }
  },
  {
    value: 'abs',
    name: 'ABS (丙烯腈丁二烯苯乙烯)',
    nameEn: 'ABS',
    label: 'ABS (丙烯腈丁二烯苯乙烯)',
    description: '高强度工程塑料，耐冲击，适合功能件和耐用部件',
    properties: ['高强度', '耐冲击', '耐热性好', '可后处理'],
    applications: ['功能原型', '工具', '汽车零件', '外壳'],
    colors: ['白色', '黑色', '灰色', '红色', '蓝色'],
    price: '¥3-6/克',
    priceRange: { min: 3, max: 6 },
    image: 'http://maphium.com/assets/materials/abs.jpg',
    specs: {
      density: '1.04 g/cm³',
      tensile: '40 MPa',
      temperature: '210-250°C',
      flexibility: '中等'
    },
    category: 'plastic',
    color: 0x2E8B57,
    materialProps: {
      roughness: 0.7,
      metalness: 0.0,
      transmission: 0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2
    }
  },
  {
    value: 'petg',
    name: 'PETG',
    nameEn: 'PETG',
    label: 'PETG',
    description: '结合PLA和ABS优点，高强度、耐化学腐蚀',
    properties: ['高强度', '耐化学性', '透明度高', '易于打印'],
    applications: ['食品容器', '医疗器械', '防护用品', '功能件'],
    colors: ['透明', '白色', '黑色', '蓝色', '绿色'],
    price: '¥4-7/克',
    priceRange: { min: 4, max: 7 },
    image: 'http://maphium.com/assets/materials/petg.jpg',
    specs: {
      density: '1.27 g/cm³',
      tensile: '53 MPa',
      temperature: '220-250°C',
      flexibility: '中高'
    },
    category: 'plastic',
    color: 0x48D1CC,
    materialProps: {
      roughness: 0.4,
      metalness: 0.0,
      transmission: 0.3,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    }
  },
  {
    value: 'nylon',
    name: 'Nylon PA12 (尼龙)',
    nameEn: 'Nylon PA12',
    label: 'Nylon PA12 (尼龙)',
    description: 'SLS打印首选材料，高强度、耐磨、耐化学腐蚀',
    properties: ['超高强度', '耐磨损', '柔韧性好', '耐化学性'],
    applications: ['功能件', '齿轮', '轴承', '管道接头'],
    colors: ['自然白', '黑色', '灰色'],
    price: '¥15-25/克',
    priceRange: { min: 15, max: 25 },
    image: 'http://maphium.com/assets/materials/nylon.jpg',
    specs: {
      density: '1.01 g/cm³',
      tensile: '48 MPa',
      temperature: '175-185°C',
      flexibility: '高'
    },
    category: 'plastic',
    color: 0xF5F5DC,
    materialProps: {
      roughness: 0.8,
      metalness: 0.0,
      transmission: 0,
      clearcoat: 0.0,
      clearcoatRoughness: 1.0
    }
  },
  {
    value: 'tpu',
    name: 'TPU (热塑性聚氨酯)',
    nameEn: 'TPU',
    label: 'TPU (热塑性聚氨酯)',
    description: '柔性材料，高弹性和耐磨性，类似橡胶',
    properties: ['高弹性', '耐磨损', '抗撕裂', '柔软'],
    applications: ['鞋垫', '手机壳', '密封件', '缓冲垫'],
    colors: ['透明', '黑色', '红色', '蓝色'],
    price: '¥8-12/克',
    priceRange: { min: 8, max: 12 },
    image: 'http://maphium.com/assets/materials/tpu.jpg',
    specs: {
      density: '1.20 g/cm³',
      tensile: '26 MPa',
      temperature: '210-230°C',
      flexibility: '极高'
    },
    category: 'plastic',
    color: 0xFF6347,
    materialProps: {
      roughness: 0.9,
      metalness: 0.0,
      transmission: 0,
      clearcoat: 0.0,
      clearcoatRoughness: 1.0
    }
  },

  // ==================== 树脂材料 ====================
  {
    value: 'resin',
    name: 'Standard Resin (标准树脂)',
    nameEn: 'Standard Resin',
    label: 'Standard Resin (标准树脂)',
    description: 'SLA/DLP打印标准材料，高精度、表面光滑',
    properties: ['超高精度', '表面光滑', '细节丰富', '快速固化'],
    applications: ['精密模型', '珠宝原型', '牙科模型', '手办'],
    colors: ['白色', '灰色', '黑色', '透明'],
    price: '¥10-15/克',
    priceRange: { min: 10, max: 15 },
    image: 'http://maphium.com/assets/materials/resin.jpg',
    specs: {
      density: '1.15 g/cm³',
      tensile: '60 MPa',
      temperature: '60-80°C',
      flexibility: '低'
    },
    category: 'resin',
    color: 0xFFFFFF,
    materialProps: {
      roughness: 0.3,
      metalness: 0.0,
      transmission: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    }
  },
  {
    value: 'tough_resin',
    name: 'Tough Resin (韧性树脂)',
    nameEn: 'Tough Resin',
    label: 'Tough Resin (韧性树脂)',
    description: '高韧性树脂，类似ABS，适合功能测试',
    properties: ['高韧性', '抗冲击', '耐用', '精度高'],
    applications: ['功能原型', '卡扣件', '夹具', '工具'],
    colors: ['黑色', '灰色'],
    price: '¥15-20/克',
    priceRange: { min: 15, max: 20 },
    image: 'http://maphium.com/assets/materials/tough-resin.jpg',
    specs: {
      density: '1.17 g/cm³',
      tensile: '55 MPa',
      temperature: '60-80°C',
      flexibility: '中等'
    },
    category: 'resin',
    color: 0x2F4F4F,
    materialProps: {
      roughness: 0.4,
      metalness: 0.0,
      transmission: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2
    }
  },
  {
    value: 'flexible_resin',
    name: 'Flexible Resin (柔性树脂)',
    nameEn: 'Flexible Resin',
    label: 'Flexible Resin (柔性树脂)',
    description: '柔软可弯曲的树脂材料，类似橡胶',
    properties: ['高柔韧性', '抗撕裂', '弹性好', '耐磨'],
    applications: ['密封圈', '软管', '防震垫', '可穿戴设备'],
    colors: ['透明', '黑色'],
    price: '¥18-25/克',
    priceRange: { min: 18, max: 25 },
    image: 'http://maphium.com/assets/materials/flexible-resin.jpg',
    specs: {
      density: '1.10 g/cm³',
      tensile: '8 MPa',
      temperature: '60-80°C',
      flexibility: '极高'
    },
    category: 'resin',
    color: 0x708090,
    materialProps: {
      roughness: 0.9,
      metalness: 0.0,
      transmission: 0.2,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5
    }
  },

  // ==================== 金属材料 ====================
  {
    value: 'stainless_steel',
    name: '316L 不锈钢',
    nameEn: '316L Stainless Steel',
    label: '316L 不锈钢',
    description: '耐腐蚀性极强的医用级不锈钢，适合功能件',
    properties: ['超高强度', '耐腐蚀', '生物相容性', '可抛光'],
    applications: ['医疗器械', '航空航天', '工具', '珠宝'],
    colors: ['金属银色'],
    price: '¥80-150/克',
    priceRange: { min: 80, max: 150 },
    image: 'http://maphium.com/assets/materials/316l.jpg',
    specs: {
      density: '7.99 g/cm³',
      tensile: '485 MPa',
      temperature: '1400-1450°C',
      flexibility: '低'
    },
    category: 'metal',
    color: 0xC0C0C0,
    materialProps: {
      roughness: 0.2,
      metalness: 1.0,
      transmission: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    }
  },
  {
    value: 'aluminum',
    name: 'AlSi10Mg 铝合金',
    nameEn: 'AlSi10Mg',
    label: 'AlSi10Mg 铝合金',
    description: '轻质高强度铝合金，良好的热性能和机械性能',
    properties: ['轻量化', '高强度', '导热性好', '可加工'],
    applications: ['航空航天', '汽车零件', '散热器', '结构件'],
    colors: ['银灰色'],
    price: '¥60-100/克',
    priceRange: { min: 60, max: 100 },
    image: 'http://maphium.com/assets/materials/aluminum.jpg',
    specs: {
      density: '2.67 g/cm³',
      tensile: '345 MPa',
      temperature: '550-570°C',
      flexibility: '低'
    },
    category: 'metal',
    color: 0xA8A8A8,
    materialProps: {
      roughness: 0.3,
      metalness: 1.0,
      transmission: 0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2
    }
  },
  {
    value: 'titanium',
    name: 'Ti6Al4V 钛合金',
    nameEn: 'Titanium Ti6Al4V',
    label: 'Ti6Al4V 钛合金',
    description: '航空航天级钛合金，高强度、轻质、耐腐蚀',
    properties: ['极高强度', '超轻质', '生物相容', '耐高温'],
    applications: ['航空航天', '医疗植入物', '高端部件', '赛车'],
    colors: ['银白色'],
    price: '¥200-400/克',
    priceRange: { min: 200, max: 400 },
    image: 'http://maphium.com/assets/materials/titanium.jpg',
    specs: {
      density: '4.43 g/cm³',
      tensile: '895 MPa',
      temperature: '1650-1670°C',
      flexibility: '低'
    },
    category: 'metal',
    color: 0xE6E6E6,
    materialProps: {
      roughness: 0.15,
      metalness: 1.0,
      transmission: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1
    }
  },
  {
    value: 'inconel',
    name: 'Inconel 718',
    nameEn: 'Inconel 718',
    label: 'Inconel 718',
    description: '镍基高温合金，极强的耐热和耐腐蚀性能',
    properties: ['耐高温', '抗氧化', '高强度', '耐腐蚀'],
    applications: ['涡轮叶片', '航空发动机', '热交换器', '化工设备'],
    colors: ['银灰色'],
    price: '¥300-500/克',
    priceRange: { min: 300, max: 500 },
    image: 'http://maphium.com/assets/materials/inconel.jpg',
    specs: {
      density: '8.19 g/cm³',
      tensile: '1035 MPa',
      temperature: '1260-1336°C',
      flexibility: '低'
    },
    category: 'metal',
    color: 0x8B8B8B,
    materialProps: {
      roughness: 0.25,
      metalness: 1.0,
      transmission: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2
    }
  }
];

// 按分类获取材料
export const getMaterialsByCategory = (category: 'plastic' | 'resin' | 'metal') => {
  return MATERIALS.filter(m => m.category === category);
};

// 根据value获取材料
export const getMaterialByValue = (value: string) => {
  return MATERIALS.find(m => m.value === value);
};

// 获取所有材料的value和label（用于下拉框）
export const getMaterialOptions = () => {
  return MATERIALS.map(m => ({
    value: m.value,
    label: m.label
  }));
};

