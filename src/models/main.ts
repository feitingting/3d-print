export interface MainState {
  count: number;
  /**
   * 新增弹窗状态
   */
  isModalVisible: boolean;
  temperature: string;
  rotationSpeed: string;
  currentPortInfo: PortInfoType;
  ifLogin: boolean;
  powered: boolean;
  enabled: boolean;
}

interface PortInfoType {
  [key: string]: any;
}

export default {
  namespace: 'main',
  state: {
    count: 0,
    // 新增弹窗状态
    isModalVisible: false,
    temperature: '',
    rotationSpeed: '',
    currentPortInfo: {},
    // 是否登录，登录和上电一体
    ifLogin: false,
    powered: false,
    enabled: false,
  },
  reducers: {
    // 显示弹窗
    showModal(state: MainState) {
      return { ...state, isModalVisible: true };
    },
    // 隐藏弹窗
    hideModal(state: MainState) {
      return { ...state, isModalVisible: false };
    },
    // 更新温度值
    updateTemperature(state: MainState, { payload }: any) {
      return { ...state, temperature: payload };
    },
    // 更新转速值
    updateRotationSpeed(state: MainState, { payload }: any) {
      return { ...state, rotationSpeed: payload };
    },
    // 当前串口参数信息
    setCurrentPortInfo(state: MainState, { payload }: any) {
      return { ...state, currentPortInfo: payload };
    },
    setIfLogin(state: MainState, { payload }: any) {
      return { ...state, ifLogin: payload };
    },
    setPowered(state: MainState, { payload }: any) {
      return { ...state, powered: payload };
    },
    setEnabled(state: MainState, { payload }: any) {
      return { ...state, enabled: payload };
    },
  },
  effects: {},
};
