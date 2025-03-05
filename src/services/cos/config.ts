export const COS_CONFIG = {
  bucket: 'px-1258150206',
  region: 'ap-nanjing',
  CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
  LARGE_FILE_THRESHOLD: 20 * 1024 * 1024, // 20MB
  MAX_RETRY_TIMES: 3,
  RETRY_DELAY: 1000, // 1秒
};

export const STORAGE_KEYS = {
  UPLOAD_TASKS: 'cosUploadTasks',
}; 