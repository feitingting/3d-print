import { httpService } from '../src/http-service';

// 测试数据
const EXPERIMENT_DATA = {
  name: '自动化测试实验',
  temperature: 80,
  reactionTime: 24,
  rawMaterials: ['6544a3d9a43d5d0012e8d459', '6544a3d9a43d5d0012e8d45a'],
};

const AGV_TRANSPORT_PARAMS = {
  targetLocation: '反应区A',
  tubeIds: ['65f8a7b6c3a9c7001a8b4567'],
};

async function createExperiment() {
  try {
    const result = await httpService.post('/experiments', EXPERIMENT_DATA);
    console.log('创建实验成功，ID:', result?._id);
    return result?._id;
  } catch (error) {
    console.error('创建实验失败:', error);
    throw error;
  }
}

async function startExperiment(experimentId: string) {
  try {
    await httpService.put(`/experiments/${experimentId}/status`, { status: 1 });
    console.log('实验启动成功');
  } catch (error) {
    console.error('启动实验失败:', error);
    throw error;
  }
}

async function triggerAGVTransport(experimentId: string) {
  try {
    const response = await httpService.post('/agv-transport', {
      experimentId,
      ...AGV_TRANSPORT_PARAMS,
    });
    console.log('AGV指令发送成功:', response);
  } catch (error) {
    console.error('AGV传输失败:', error);
    throw error;
  }
}

async function fullTestFlow() {
  const experimentId = await createExperiment();
  if (!experimentId) return;

  await startExperiment(experimentId);
  await triggerAGVTransport(experimentId);
}

// 执行测试流程
fullTestFlow()
  .then(() => console.log('测试流程全部完成'))
  .catch((err) => console.error('测试流程中断:', err));
