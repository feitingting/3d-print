// 修改1：添加类型声明
import { httpService } from '../http-service/index';

interface MixAreaParams {
  id?: string;
  path?: string;
  [key: string]: any;
}

// 修改2：添加返回类型声明
export const querySerailPorts = async (): Promise<any> => {
  return httpService.get('/getSerailPorts');
};

// 查询搅拌区孔位
export const queryStirAreaHoles = async (): Promise<any> => {
  return httpService.get('/queryStirAreaHoles');
};

// 修改3：统一函数语法
export const queryIngredientHoles = async (): Promise<any> => {
  return httpService.get('/queryIngredientHoles');
};

export const queryFeedingHoles = async (): Promise<any> => {
  return httpService.get('/queryFeedingHoles');
};

export const queryBlankingHoles = async (): Promise<any> => {
  return httpService.get('/queryBlankingHoles');
};

export const queryWeightHoles = async (): Promise<any> => {
  return httpService.get('/queryWeightHoles');
};

// 修改4：添加参数类型
export const queryMixAreaByPort = async (
  params: MixAreaParams = {},
): Promise<any> => {
  return httpService.post('/queryMixAreaByPort', params);
};

// 修改5：使用箭头函数并添加类型
export const executor = async (params: any): Promise<any> => {
  return httpService.post('/executor', params);
};

export const batchExecutor = async (params: any): Promise<any> => {
  return httpService.post('/batchExecutor', params);
};

// 查询拌料区设置
export const queryStirAreaSetting = async (): Promise<any> => {
  return httpService.get('/queryStirAreaSetting');
};

// 更新拌料区设置
export const updateStirAreaSetting = async (params: any): Promise<any> => {
  return httpService.post('/updateStirAreaSetting', params);
};

// 新增或更新原料信息
export const saveOrUpdateMaterial = async (params: any): Promise<any> => {
  return httpService.post('/saveOrUpdateMaterial', params);
};

// 查询原料信息
export const queryMaterials = async (): Promise<any> => {
  return httpService.get('/queryMaterials');
};

// 新增或更新实验信息
export const saveOrUpdateExperiment = async (params: any): Promise<any> => {
  return httpService.post('/updateExperimentById', params);
};

// 查询实验信息
export const queryExperiments = async (params: any): Promise<any> => {
  return httpService.post('/queryExperiments', params);
};

// 重置串口信息
export const resetSerailPorts = async (): Promise<any> => {
  return httpService.post('/resetSerailPorts');
};

// 开始实验
export const startExperiment = async (params: any): Promise<any> => {
  return httpService.post('/startExperiment', params);
};

// 批量开始实验
export const batchStartExperiments = async (params: any): Promise<any> => {
  return httpService.post('/batchStartExperiments', params);
};

// 人工取管
export const manualBlanking = async (params: any): Promise<any> => {
  return httpService.post('/manualBlanking', params);
};

// 人工下料
export const manualCutting = async (params: any): Promise<any> => {
  return httpService.post('/manualCutting', params);
};

// 查询AGV区域信息
export const queryAgvAreas = async (): Promise<any> => {
  return httpService.get('/queryAgvAreas');
};

// 人工上料
export const manualFeeding = async (params: any): Promise<any> => {
  return httpService.post('/manualFeeding', params);
};

// 批量删除实验
export const batchDeleteExperiments = async (params: any): Promise<any> => {
  return httpService.post('/batchDeleteExperiments', params);
};

// 分页查询日志记录
export const queryLogs = async (params: any): Promise<any> => {
  return httpService.post('/queryLogs', params);
};

// 分页查询生产记录
export const queryProductions = async (params: any): Promise<any> => {
  return httpService.post('/queryProductions', params);
};

// 设备产能统计
export const capacityStatistics = async (): Promise<any> => {
  return httpService.post('/capacityStatistics');
};

// 开启AGV运输
export const startAgvTransport = async (params: any): Promise<any> => {
  return httpService.post('/agv/start', params);
};

// 批量AGV运输
export const batchAgvTransport = async (params: any): Promise<any> => {
  return httpService.post('/agv/batch/start', params);
};

// 开启agv传送（下料）
export const startAgvBlanking = async (params: any): Promise<any> => {
  return httpService.post('/agv/blanking', params);
};
