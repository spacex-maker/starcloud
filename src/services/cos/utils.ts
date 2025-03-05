/**
 * 格式化对象存储路径
 * @param path 原始路径
 * @returns 格式化后的完整路径
 */
export const formatPath = (path: string): string => {
  // 移除开头的斜杠
  return path.replace(/^\/+/, '');
};

/**
 * 计算上传速度
 * @param uploadedBytes 已上传字节数
 * @param startTime 开始时间
 * @returns 上传速度（字节/秒）
 */
export const calculateSpeed = (uploadedBytes: number, startTime: number): number => {
  const duration = (Date.now() - startTime) / 1000; // 转换为秒
  return duration > 0 ? Math.round(uploadedBytes / duration) : 0;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}; 