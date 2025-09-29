// 3D打印价格计算工具

// 材料价格表 (每立方厘米的价格，单位：元)
export const MATERIAL_PRICES: Record<string, number> = {
  'pla': 0.8,
  'abs': 1.2,
  'petg': 1.0,
  'nylon': 2.5,
  'pc': 3.0,
  'peek': 15.0,
  'pekk': 18.0,
  'pva': 1.5,
  'hips': 1.0,
  'tpu': 2.0,
  'tpe': 2.2,
  'asa': 1.8,
  'pmma': 2.5,
  'metal_aluminum': 25.0,
  'metal_titanium': 45.0,
  'metal_stainless': 30.0,
  'ceramic': 8.0,
  'resin_standard': 3.0,
  'resin_flexible': 4.0,
  'resin_high_temp': 5.0,
};

// 工艺系数 (不同工艺的加工难度系数)
export const PROCESS_COEFFICIENTS: Record<string, number> = {
  'fdm': 1.0,
  'sla': 1.5,
  'sls': 2.0,
  'dlp': 1.3,
  'polyjet': 2.5,
  'slm': 3.0,
  'ebm': 3.5,
};

// 填充系数
export const INFILL_COEFFICIENTS: Record<string, number> = {
  'solid': 1.0,
  'hollow': 0.3,
};

// 基础加工费 (元)
export const BASE_PROCESSING_FEE = 50;

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
  };
}

/**
 * 计算3D打印价格
 * @param params 报价参数
 * @returns 价格计算结果
 */
export function calculatePrintingPrice(params: QuotationParams): PriceCalculation {
  const { modelInfo, material, process, infill, infillPercentage, quantity } = params;
  
  // 获取材料单价
  const materialPrice = MATERIAL_PRICES[material] || 1.0;
  
  // 获取工艺系数
  const processCoefficient = PROCESS_COEFFICIENTS[process] || 1.0;
  
  // 计算填充系数
  let infillCoefficient: number;
  if (infill === 'hollow') {
    infillCoefficient = 0.1; // 空心模式，最小填充
  } else if (infillPercentage !== undefined) {
    // 根据填充率百分比计算系数
    infillCoefficient = 0.1 + (infillPercentage / 100) * 0.9; // 0.1 到 1.0
  } else {
    // 使用默认填充系数
    infillCoefficient = INFILL_COEFFICIENTS[infill] || 1.0;
  }
  
  // 计算材料成本 = 体积 × 材料单价 × 填充系数 × 数量
  const materialCost = modelInfo.volume * materialPrice * infillCoefficient * quantity;
  
  // 计算加工费 = 基础加工费 × 工艺系数 × 数量
  const processingFee = BASE_PROCESSING_FEE * processCoefficient * quantity;
  
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
    },
  };
}

/**
 * 从Three.js几何体计算模型信息
 * @param geometry Three.js几何体
 * @returns 模型信息
 */
export function calculateModelInfo(geometry: THREE.BufferGeometry): ModelInfo {
  // 计算边界框
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  
  // 计算体积 (简化计算，使用边界框体积)
  const volume = width * height * depth;
  
  // 计算表面积 (简化计算)
  const surfaceArea = 2 * (width * height + width * depth + height * depth);
  
  return {
    volume: Math.abs(volume),
    surfaceArea: Math.abs(surfaceArea),
    boundingBox: {
      width: Math.abs(width),
      height: Math.abs(height),
      depth: Math.abs(depth),
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
 * @returns 估算时间
 */
export function estimatePrintTime(modelInfo: ModelInfo, process: string): number {
  // 基础打印速度 (立方厘米/小时)
  const baseSpeed: Record<string, number> = {
    'fdm': 10,
    'sla': 5,
    'sls': 3,
    'dlp': 6,
    'polyjet': 2,
    'slm': 1,
    'ebm': 1,
  };
  
  const speed = baseSpeed[process] || 5;
  return Math.ceil(modelInfo.volume / speed);
}
