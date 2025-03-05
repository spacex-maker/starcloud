/**
 * 格式化时间
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds === Infinity) return '计算中...';
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
  return `${Math.floor(seconds / 3600)}小时${Math.ceil((seconds % 3600) / 60)}分钟`;
};

/**
 * 格式化速度
 * @param {number} bytesPerSecond - 每秒字节数
 * @returns {string} 格式化后的速度字符串
 */
export const formatSpeed = (bytesPerSecond) => {
  if (!bytesPerSecond) return '0 KB/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = bytesPerSecond;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {Object} options - 配置选项
 * @param {number} options.precision - 小数点位数，默认为2
 * @param {boolean} options.keepZero - 是否保留末尾的0，默认为false
 * @param {string[]} options.units - 自定义单位数组，默认为 ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
 * @returns {string} 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes, options = {}) => {
  const {
    precision = 2,
    keepZero = false,
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  } = options;

  // 处理特殊情况
  if (bytes === undefined || bytes === null) return '0 B';
  if (bytes === 0) return '0 B';
  if (isNaN(bytes) || !isFinite(bytes)) return '未知大小';

  // 计算合适的单位
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 确保不超过单位数组范围
  const unitIndex = Math.min(i, units.length - 1);
  
  // 计算最终的值
  const value = bytes / Math.pow(k, unitIndex);
  
  // 格式化数字
  let formattedValue = value.toFixed(precision);
  
  // 如果不保留末尾的0，则去除
  if (!keepZero) {
    formattedValue = parseFloat(formattedValue).toString();
  }
  
  return `${formattedValue} ${units[unitIndex]}`;
};

/**
 * 文件名省略处理
 * @param {string} fileName - 文件名
 * @returns {string} 处理后的文件名
 */
export const getEllipsisFileName = (fileName) => {
  if (!fileName) return '';
  
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  const name = parts.join('.');
  
  if (name.length <= 20) return fileName;
  
  const start = name.slice(0, 8);
  const end = name.slice(-8);
  return ext ? `${start}...${end}.${ext}` : `${start}...${end}`;
};

/**
 * 判断文件是否为图片
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为图片文件
 */
export const isImageFile = (filename) => {
  if (!filename) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const ext = filename.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(ext);
}; 