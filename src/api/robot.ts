import { httpService } from '../http-service/index';
export function login(params = {}) {
  return httpService.post('/webapp/api/user/login', params);
}

// 心跳包
export function heartBeat(params = {}) {
  return httpService.post('/webapp/api/grpcRequest/heartbeat', params);
}

// 退出登录
export function logout(params = {}) {
  return httpService.post('/webapp/api/user/logout', params);
}

// 黄臂机器人相关API
export function commonHandle(params = {}) {
  return httpService.post('/webapp/api/grpcRequest', params);
}
