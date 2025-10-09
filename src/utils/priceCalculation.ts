// 3D打印价格计算工具

// 材料价格表 (每立方厘米的价格，单位：元)
// 基于2024年市场价格和材料特性
export const MATERIAL_PRICES: Record<string, number> = {
  // 基础塑料材料
  'pla': 0.6,           // PLA - 最常用的3D打印材料
  'abs': 0.9,           // ABS - 强度较高，适合功能性零件
  'petg': 0.8,          // PETG - 透明性好，食品级
  'asa': 1.1,           // ASA - 耐候性好
  'hips': 0.7,          // HIPS - 可溶于柠檬烯
  
  // 工程塑料
  'nylon': 2.2,         // 尼龙 - 强度高，耐磨
  'pc': 2.8,            // 聚碳酸酯 - 透明度高，强度大
  'tpu': 1.8,           // TPU - 弹性材料
  'tpe': 2.0,           // TPE - 热塑性弹性体
  'pmma': 2.2,          // 有机玻璃
  
  // 高性能材料
  'peek': 18.0,         // PEEK - 高温高性能
  'pekk': 20.0,         // PEKK - 航空航天级
  'ultem': 12.0,        // ULTEM - 高强度耐高温
  'pva': 1.3,           // PVA - 水溶性支撑材料
  
  // 金属材料 (SLS/SLM工艺)
  'metal_aluminum': 22.0,    // 铝合金
  'metal_titanium': 48.0,    // 钛合金
  'metal_stainless': 28.0,   // 不锈钢
  'metal_inconel': 65.0,     // 因科镍合金
  'metal_steel': 25.0,       // 钢材
  
  // 陶瓷材料
  'ceramic': 6.5,       // 陶瓷材料
  'zirconia': 15.0,     // 氧化锆
  
  // 树脂材料 (SLA/DLP工艺)
  'resin_standard': 2.5,     // 标准树脂
  'resin_flexible': 3.2,     // 柔性树脂
  'resin_high_temp': 4.5,    // 高温树脂
  'resin_clear': 3.0,        // 透明树脂
  'resin_biocompatible': 8.0, // 生物相容性树脂
  'resin_castable': 5.5,     // 铸造用树脂
  
  // 特殊材料
  'wood_pla': 0.8,      // 木纹PLA
  'carbon_fiber': 8.0,  // 碳纤维增强
  'glass_fiber': 3.5,   // 玻璃纤维增强
  'metal_filled': 12.0, // 金属填充材料
};

// 工艺系数 (不同工艺的加工难度系数，包含设备成本和加工复杂度)
export const PROCESS_COEFFICIENTS: Record<string, number> = {
  // 熔融沉积建模 (FDM)
  'fdm': 1.0,           // 最基础的3D打印工艺
  
  // 光固化工艺
  'sla': 1.8,           // 立体光刻，精度高但需要后处理
  'dlp': 1.6,           // 数字光处理，比SLA稍快
  
  // 粉末床工艺
  'sls': 2.5,           // 选择性激光烧结，适合复杂结构
  'slm': 3.2,           // 选择性激光熔化，金属打印
  'ebm': 3.8,           // 电子束熔化，高端金属打印
  
  // 喷射工艺
  'polyjet': 2.8,       // 聚合物喷射，多材料打印
  'binder_jetting': 2.2, // 粘合剂喷射
  
  // 特殊工艺
  'dmls': 3.5,          // 直接金属激光烧结
  'clad': 4.0,          // 激光熔覆
};

// 填充系数 - 基于实际打印密度
export const INFILL_COEFFICIENTS: Record<string, number> = {
  'solid': 1.0,           // 实心 - 100%填充
  'hollow': 0.05,         // 空心 - 仅外壳，约5%材料使用
  'ultra_light': 0.1,     // 超轻 - 10%填充
  'light': 0.2,           // 轻量 - 20%填充
  'medium': 0.4,          // 中等 - 40%填充
  'strong': 0.6,          // 强韧 - 60%填充
  'very_strong': 0.8,     // 超强 - 80%填充
};

// 支撑材料系数 (某些工艺需要额外支撑)
export const SUPPORT_COEFFICIENTS: Record<string, number> = {
  'none': 0.0,            // 无需支撑
  'minimal': 0.05,        // 最小支撑
  'moderate': 0.15,       // 中等支撑
  'extensive': 0.3,       // 大量支撑
};

// 基础加工费 (元) - 基于模型复杂度
export const BASE_PROCESSING_FEE = 50;

// 复杂度系数
export const COMPLEXITY_COEFFICIENTS = {
  'simple': 1.0,         // 简单几何体
  'moderate': 1.3,       // 中等复杂度
  'complex': 1.8,        // 复杂结构
  'very_complex': 2.5,   // 非常复杂
};

// 尺寸系数 (大尺寸需要更多材料和时间)
export const SIZE_COEFFICIENTS = {
  'small': 1.0,          // < 100cm³
  'medium': 1.2,         // 100-1000cm³
  'large': 1.5,          // 1000-5000cm³
  'xlarge': 2.0,         // > 5000cm³
};

// 最小订单金额 (元)
export const MIN_ORDER_AMOUNT = 100;

// 3D模型信息接口
export interface ModelInfo {
  volume: number; // 体积 (立方厘米)
  surfaceArea: number; // 表面积 (平方厘米)
  boundingBox: {
    width: number;
    height: number;
    depth: number;
  };
  calculationInfo?: {
    volumeMethod: string; // 体积计算方法
    surfaceAreaMethod: string; // 表面积计算方法
    isValid: boolean; // 计算结果是否有效
  };
}

// 报价参数接口
export interface QuotationParams {
  modelInfo: ModelInfo;
  material: string;
  process: string;
  infill: string;
  infillPercentage?: number; // 填充率百分比
  quantity: number; // 数量
}

// 价格计算结果接口
export interface PriceCalculation {
  materialCost: number; // 材料成本
  processingFee: number; // 加工费
  totalCost: number; // 总成本
  finalPrice: number; // 最终价格
  breakdown: {
    materialCost: number;
    processingFee: number;
    processCoefficient: number;
    infillCoefficient: number;
    quantity: number;
    complexityCoefficient: number;
    sizeCoefficient: number;
    supportCoefficient: number;
    complexity: string;
    sizeLevel: string;
  };
}

/**
 * 计算模型复杂度
 * @param modelInfo 模型信息
 * @returns 复杂度等级
 */
function calculateComplexity(modelInfo: ModelInfo): string {
  const { volume, surfaceArea, boundingBox } = modelInfo;
  
  // 计算表面积体积比 (复杂度的指标)
  const surfaceToVolumeRatio = surfaceArea / volume;
  
  // 计算长宽高比 (几何复杂度)
  const maxDim = Math.max(boundingBox.width, boundingBox.height, boundingBox.depth);
  const minDim = Math.min(boundingBox.width, boundingBox.height, boundingBox.depth);
  const aspectRatio = maxDim / minDim;
  
  // 根据表面积体积比和长宽比判断复杂度
  if (surfaceToVolumeRatio > 20 || aspectRatio > 10) {
    return 'very_complex';
  } else if (surfaceToVolumeRatio > 10 || aspectRatio > 5) {
    return 'complex';
  } else if (surfaceToVolumeRatio > 5 || aspectRatio > 2) {
    return 'moderate';
  } else {
    return 'simple';
  }
}

/**
 * 获取尺寸等级
 * @param volume 体积
 * @returns 尺寸等级
 */
function getSizeLevel(volume: number): string {
  if (volume < 100) return 'small';
  if (volume < 1000) return 'medium';
  if (volume < 5000) return 'large';
  return 'xlarge';
}

/**
 * 估算支撑需求
 * @param modelInfo 模型信息
 * @param process 工艺
 * @returns 支撑系数
 */
function estimateSupportNeed(modelInfo: ModelInfo, process: string): number {
  const { boundingBox } = modelInfo;
  const height = boundingBox.height;
  const width = boundingBox.width;
  const depth = boundingBox.depth;
  
  // 基于工艺和几何特征估算支撑需求
  const isTall = height > Math.max(width, depth) * 1.5;
  const hasOverhang = boundingBox.width > boundingBox.depth * 2 || boundingBox.depth > boundingBox.width * 2;
  
  if (['sla', 'dlp'].includes(process)) {
    // 光固化工艺通常需要更多支撑
    if (isTall && hasOverhang) return SUPPORT_COEFFICIENTS.extensive;
    if (isTall || hasOverhang) return SUPPORT_COEFFICIENTS.moderate;
    return SUPPORT_COEFFICIENTS.minimal;
  } else if (['sls', 'slm'].includes(process)) {
    // 粉末床工艺通常不需要支撑
    return SUPPORT_COEFFICIENTS.none;
  } else {
    // FDM工艺
    if (isTall && hasOverhang) return SUPPORT_COEFFICIENTS.moderate;
    if (isTall || hasOverhang) return SUPPORT_COEFFICIENTS.minimal;
    return SUPPORT_COEFFICIENTS.none;
  }
}

/**
 * 计算3D打印价格 (增强版)
 * @param params 报价参数
 * @returns 价格计算结果
 */
export function calculatePrintingPrice(params: QuotationParams): PriceCalculation {
  const { modelInfo, material, process, infill, infillPercentage, quantity } = params;
  
  // 获取材料单价
  const materialPrice = MATERIAL_PRICES[material] || 1.0;
  
  // 获取工艺系数
  const processCoefficient = PROCESS_COEFFICIENTS[process] || 1.0;
  
  // 计算复杂度系数
  const complexity = calculateComplexity(modelInfo);
  const complexityCoefficient = COMPLEXITY_COEFFICIENTS[complexity] || 1.0;
  
  // 计算尺寸系数
  const sizeLevel = getSizeLevel(modelInfo.volume);
  const sizeCoefficient = SIZE_COEFFICIENTS[sizeLevel] || 1.0;
  
  // 计算填充系数
  let infillCoefficient: number;
  if (infill === 'hollow') {
    infillCoefficient = INFILL_COEFFICIENTS.hollow;
  } else if (infillPercentage !== undefined) {
    // 根据填充率百分比计算系数 (5% 到 100%)
    infillCoefficient = Math.max(0.05, infillPercentage / 100);
  } else {
    infillCoefficient = INFILL_COEFFICIENTS[infill] || 1.0;
  }
  
  // 估算支撑需求
  const supportCoefficient = estimateSupportNeed(modelInfo, process);
  
  // 计算材料成本 = 体积 × 材料单价 × 填充系数 × (1 + 支撑系数) × 数量
  const materialCost = modelInfo.volume * materialPrice * infillCoefficient * (1 + supportCoefficient) * quantity;
  
  // 计算加工费 = 基础加工费 × 工艺系数 × 复杂度系数 × 尺寸系数 × 数量
  const processingFee = BASE_PROCESSING_FEE * processCoefficient * complexityCoefficient * sizeCoefficient * quantity;
  
  // 计算总成本
  const totalCost = materialCost + processingFee;
  
  // 应用最小订单金额
  const finalPrice = Math.max(totalCost, MIN_ORDER_AMOUNT);
  
  return {
    materialCost,
    processingFee,
    totalCost,
    finalPrice,
    breakdown: {
      materialCost,
      processingFee,
      processCoefficient,
      infillCoefficient,
      quantity,
      complexityCoefficient,
      sizeCoefficient,
      supportCoefficient,
      complexity,
      sizeLevel,
    },
  };
}

/**
 * 计算三角形面积
 * @param p1 点1
 * @param p2 点2
 * @param p3 点3
 * @returns 面积
 */
function triangleArea(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): number {
  const v1 = p2.clone().sub(p1);
  const v2 = p3.clone().sub(p1);
  return v1.cross(v2).length() / 2;
}

/**
 * 计算四面体体积
 * @param p1 点1
 * @param p2 点2
 * @param p3 点3
 * @param p4 点4
 * @returns 体积
 */
function tetrahedronVolume(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3): number {
  const v1 = p2.clone().sub(p1);
  const v2 = p3.clone().sub(p1);
  const v3 = p4.clone().sub(p1);
  return Math.abs(v1.dot(v2.cross(v3))) / 6;
}

/**
 * 计算网格的体积 (使用散度定理 - 修正版)
 * @param geometry Three.js几何体
 * @returns 体积
 */
function calculateMeshVolume(geometry: THREE.BufferGeometry): number {
  const positionAttribute = geometry.getAttribute('position');
  const positions = positionAttribute.array;
  const index = geometry.index;
  
  let volume = 0;
  
  if (index) {
    // 有索引的几何体
    const indices = index.array;
    
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;
      
      const p1 = new THREE.Vector3(positions[i1], positions[i1 + 1], positions[i1 + 2]);
      const p2 = new THREE.Vector3(positions[i2], positions[i2 + 1], positions[i2 + 2]);
      const p3 = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      // 使用散度定理计算体积 (修正版)
      // 体积 = (1/6) * Σ(det(p1, p2, p3))
      // 这里使用三向量的混合积
      const cross = p2.clone().cross(p3);
      volume += p1.dot(cross) / 6;
    }
  } else {
    // 无索引的几何体
    const vertexCount = positions.length / 3;
    
    for (let i = 0; i < vertexCount; i += 3) {
      const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      const p2 = new THREE.Vector3(positions[(i + 1) * 3], positions[(i + 1) * 3 + 1], positions[(i + 1) * 3 + 2]);
      const p3 = new THREE.Vector3(positions[(i + 2) * 3], positions[(i + 2) * 3 + 1], positions[(i + 2) * 3 + 2]);
      
      const cross = p2.clone().cross(p3);
      volume += p1.dot(cross) / 6;
    }
  }
  
  return Math.abs(volume);
}

/**
 * 使用蒙特卡洛方法估算体积 (备用方法)
 * @param geometry Three.js几何体
 * @param sampleCount 采样点数量
 * @returns 估算体积
 */
function estimateVolumeMonteCarlo(geometry: THREE.BufferGeometry, sampleCount: number = 10000): number {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  const boundingBoxVolume = width * height * depth;
  
  // 创建射线投射器用于点在内部检测
  const raycaster = new THREE.Raycaster();
  const mesh = new THREE.Mesh(geometry);
  
  let insideCount = 0;
  
  for (let i = 0; i < sampleCount; i++) {
    // 生成随机点
    const randomPoint = new THREE.Vector3(
      box.min.x + Math.random() * width,
      box.min.y + Math.random() * height,
      box.min.z + Math.random() * depth
    );
    
    // 创建射线从随机点向外发射
    raycaster.set(randomPoint, new THREE.Vector3(1, 0, 0));
    
    // 检查射线与网格的交点数量
    const intersections = raycaster.intersectObject(mesh);
    
    // 如果交点数量为奇数，点在内部
    if (intersections.length % 2 === 1) {
      insideCount++;
    }
  }
  
  // 体积 = 边界框体积 * (内部点数 / 总点数)
  return boundingBoxVolume * (insideCount / sampleCount);
}

/**
 * 计算网格的表面积
 * @param geometry Three.js几何体
 * @returns 表面积
 */
function calculateMeshSurfaceArea(geometry: THREE.BufferGeometry): number {
  const positionAttribute = geometry.getAttribute('position');
  const positions = positionAttribute.array;
  const index = geometry.index;
  
  let surfaceArea = 0;
  
  if (index) {
    // 有索引的几何体
    const indices = index.array;
    
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i] * 3;
      const i2 = indices[i + 1] * 3;
      const i3 = indices[i + 2] * 3;
      
      const p1 = new THREE.Vector3(positions[i1], positions[i1 + 1], positions[i1 + 2]);
      const p2 = new THREE.Vector3(positions[i2], positions[i2 + 1], positions[i2 + 2]);
      const p3 = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      surfaceArea += triangleArea(p1, p2, p3);
    }
  } else {
    // 无索引的几何体
    const vertexCount = positions.length / 3;
    
    for (let i = 0; i < vertexCount; i += 3) {
      const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      const p2 = new THREE.Vector3(positions[(i + 1) * 3], positions[(i + 1) * 3 + 1], positions[(i + 1) * 3 + 2]);
      const p3 = new THREE.Vector3(positions[(i + 2) * 3], positions[(i + 2) * 3 + 1], positions[(i + 2) * 3 + 2]);
      
      surfaceArea += triangleArea(p1, p2, p3);
    }
  }
  
  return surfaceArea;
}

/**
 * 估算封闭网格的体积 (当散度定理不适用时)
 * @param geometry Three.js几何体
 * @returns 估算体积
 */
function estimateMeshVolume(geometry: THREE.BufferGeometry): number {
  // 使用边界框体积的简化估算
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  
  // 对于复杂几何体，使用边界框体积的70%作为估算
  return width * height * depth * 0.7;
}

/**
 * 从Three.js几何体计算模型信息 (修正版)
 * @param geometry Three.js几何体
 * @returns 模型信息
 */
export function calculateModelInfo(geometry: THREE.BufferGeometry): ModelInfo {
  // 验证几何体
  if (!geometry || !geometry.getAttribute('position')) {
    throw new Error('Invalid geometry: missing position attribute');
  }
  
  const positionAttribute = geometry.getAttribute('position');
  if (positionAttribute.count < 3) {
    throw new Error('Invalid geometry: insufficient vertices');
  }
  
  // 确保几何体有边界框
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  
  const box = geometry.boundingBox!;
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  
  // 计算表面积
  let surfaceArea = 0;
  let surfaceAreaCalculationMethod = 'unknown';
  
  try {
    surfaceArea = calculateMeshSurfaceArea(geometry);
    surfaceAreaCalculationMethod = 'triangle_sum';
  } catch (error) {
    console.warn('Surface area calculation failed, using bounding box estimate:', error);
    // 使用边界框表面积作为备用
    surfaceArea = 2 * (width * height + width * depth + height * depth);
    surfaceAreaCalculationMethod = 'bounding_box_estimation';
  }
  
  // 计算体积
  let volume = 0;
  let volumeCalculationMethod = 'unknown';
  
  try {
    volume = calculateMeshVolume(geometry);
    volumeCalculationMethod = 'divergence_theorem';
    
    // 验证体积计算的合理性
    const boundingBoxVolume = width * height * depth;
    
    // 如果体积异常（太大或太小），尝试其他方法
    if (volume > boundingBoxVolume * 1.5 || volume < boundingBoxVolume * 0.005) {
      console.warn('Volume calculation seems incorrect, trying estimation');
      volume = estimateMeshVolume(geometry);
      volumeCalculationMethod = 'bounding_box_estimation';
      
      // 如果估算仍然异常，使用蒙特卡洛方法
      if (volume > boundingBoxVolume * 1.2 || volume < boundingBoxVolume * 0.01) {
        console.warn('Estimation also seems incorrect, using Monte Carlo');
        volume = estimateVolumeMonteCarlo(geometry, 5000);
        volumeCalculationMethod = 'monte_carlo';
      }
    }
  } catch (error) {
    console.warn('Volume calculation failed, using estimation:', error);
    volume = estimateMeshVolume(geometry);
    volumeCalculationMethod = 'fallback_estimation';
  }
  
  // 确保值为正数
  volume = Math.abs(volume);
  surfaceArea = Math.abs(surfaceArea);
  
  // 验证计算结果的合理性
  const boundingBoxVolume = width * height * depth;
  const isValid = volume > 0 && surfaceArea > 0 && 
                  volume <= boundingBoxVolume && 
                  surfaceArea >= Math.min(width * height, width * depth, height * depth);
  
  // 输出调试信息
  console.log('Model calculation results:', {
    volume: volume.toFixed(2),
    surfaceArea: surfaceArea.toFixed(2),
    boundingBoxVolume: boundingBoxVolume.toFixed(2),
    volumeMethod: volumeCalculationMethod,
    surfaceAreaMethod: surfaceAreaCalculationMethod,
    isValid,
    dimensions: { width: width.toFixed(2), height: height.toFixed(2), depth: depth.toFixed(2) }
  });
  
  return {
    volume,
    surfaceArea,
    boundingBox: {
      width: Math.abs(width),
      height: Math.abs(height),
      depth: Math.abs(depth),
    },
    calculationInfo: {
      volumeMethod: volumeCalculationMethod,
      surfaceAreaMethod: surfaceAreaCalculationMethod,
      isValid,
    },
  };
}

/**
 * 格式化价格显示
 * @param price 价格
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

/**
 * 估算打印时间 (小时)
 * @param modelInfo 模型信息
 * @param process 工艺
 * @param infillCoefficient 填充系数
 * @returns 估算时间
 */
export function estimatePrintTime(modelInfo: ModelInfo, process: string, infillCoefficient: number = 1.0): number {
  // 基础打印速度 (立方厘米/小时)
  const baseSpeed: Record<string, number> = {
    'fdm': 8,
    'sla': 4,
    'sls': 2.5,
    'dlp': 5,
    'polyjet': 1.5,
    'slm': 0.8,
    'ebm': 0.8,
    'dmls': 0.8,
    'clad': 0.5,
  };
  
  const speed = baseSpeed[process] || 3;
  
  // 根据填充系数调整打印时间
  const adjustedSpeed = speed * (0.5 + infillCoefficient * 0.5);
  
  // 考虑复杂度的额外时间
  const complexity = calculateComplexity(modelInfo);
  const complexityMultiplier = {
    'simple': 1.0,
    'moderate': 1.2,
    'complex': 1.5,
    'very_complex': 2.0,
  }[complexity] || 1.0;
  
  const estimatedTime = (modelInfo.volume / adjustedSpeed) * complexityMultiplier;
  
  // 最少1小时，最多1000小时
  return Math.max(1, Math.min(1000, Math.ceil(estimatedTime)));
}

/**
 * 获取材料中文名称
 * @param materialKey 材料键值
 * @returns 中文名称
 */
export function getMaterialDisplayName(materialKey: string): string {
  const materialNames: Record<string, string> = {
    'pla': 'PLA塑料',
    'abs': 'ABS塑料',
    'petg': 'PETG塑料',
    'asa': 'ASA塑料',
    'hips': 'HIPS塑料',
    'nylon': '尼龙',
    'pc': '聚碳酸酯',
    'tpu': 'TPU弹性体',
    'tpe': 'TPE弹性体',
    'pmma': '有机玻璃',
    'peek': 'PEEK高性能塑料',
    'pekk': 'PEKK高性能塑料',
    'ultem': 'ULTEM高性能塑料',
    'pva': 'PVA水溶性支撑',
    'metal_aluminum': '铝合金',
    'metal_titanium': '钛合金',
    'metal_stainless': '不锈钢',
    'metal_inconel': '因科镍合金',
    'metal_steel': '钢材',
    'ceramic': '陶瓷',
    'zirconia': '氧化锆',
    'resin_standard': '标准树脂',
    'resin_flexible': '柔性树脂',
    'resin_high_temp': '高温树脂',
    'resin_clear': '透明树脂',
    'resin_biocompatible': '生物相容性树脂',
    'resin_castable': '铸造用树脂',
    'wood_pla': '木纹PLA',
    'carbon_fiber': '碳纤维增强',
    'glass_fiber': '玻璃纤维增强',
    'metal_filled': '金属填充材料',
  };
  
  return materialNames[materialKey] || materialKey.toUpperCase();
}

/**
 * 获取工艺中文名称
 * @param processKey 工艺键值
 * @returns 中文名称
 */
export function getProcessDisplayName(processKey: string): string {
  const processNames: Record<string, string> = {
    'fdm': 'FDM熔融沉积',
    'sla': 'SLA立体光刻',
    'dlp': 'DLP数字光处理',
    'sls': 'SLS选择性激光烧结',
    'slm': 'SLM选择性激光熔化',
    'ebm': 'EBM电子束熔化',
    'polyjet': 'PolyJet聚合物喷射',
    'binder_jetting': '粘合剂喷射',
    'dmls': 'DMLS直接金属激光烧结',
    'clad': '激光熔覆',
  };
  
  return processNames[processKey] || processKey.toUpperCase();
}

/**
 * 获取复杂度中文描述
 * @param complexity 复杂度等级
 * @returns 中文描述
 */
export function getComplexityDisplayName(complexity: string): string {
  const complexityNames: Record<string, string> = {
    'simple': '简单',
    'moderate': '中等',
    'complex': '复杂',
    'very_complex': '非常复杂',
  };
  
  return complexityNames[complexity] || complexity;
}

/**
 * 获取尺寸等级中文描述
 * @param sizeLevel 尺寸等级
 * @returns 中文描述
 */
export function getSizeLevelDisplayName(sizeLevel: string): string {
  const sizeNames: Record<string, string> = {
    'small': '小型',
    'medium': '中型',
    'large': '大型',
    'xlarge': '超大型',
  };
  
  return sizeNames[sizeLevel] || sizeLevel;
}
