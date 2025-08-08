// 实验管理model
export default {
  namespace: 'experiment',
  state: {
    // 添加实验弹窗状态
    createModalVisible: false,
    // 原料信息
    materials: [],
    // 实验信息
    experiments: [],
    currentExperiment: {},
  },
  reducers: {
    // 更新温度值
    toggleCreateModalVisible(state: any, { payload }: any) {
      return { ...state, createModalVisible: !state.createModalVisible };
    },
    // 设置材料信息
    setMaterials(state: any, { payload }: any) {
      return { ...state, materials: payload };
    },
    // 设置实验数据
    setExperiments(state: any, { payload }: any) {
      return { ...state, experiments: payload };
    },
    setCurrentExperiment(state: any, { payload }: any) {
      return { ...state, currentExperiment: payload };
    },
  },
  effects: {},
};
