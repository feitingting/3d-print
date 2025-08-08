// 视窗基准宽度（需与配置保持一致）
const VIEWPORT_WIDTH = 1920;

export const px2vw = (px: number): string => {
  return `${(px / VIEWPORT_WIDTH) * 100}vw`;
};
