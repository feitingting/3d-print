// 在文件顶部添加工具函数
export const formatDuration = (startTime: any): string => {
  if (startTime) {
    const now = new Date();
    const diffInMs = now.getTime() - startTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 0) return '0分钟';

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
  } else {
    return '-';
  }
};
