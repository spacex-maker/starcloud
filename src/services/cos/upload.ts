import { COS_CONFIG } from './config';
import { formatPath } from './utils';
import type { UploadOptions, BatchUploadCallbacks, COSProgressInfo, FileFinishInfo, CosError, UploadTask } from './types';
import type COS from 'cos-js-sdk-v5';

/**
 * 创建上传任务对象
 */
const createUploadTask = (file: File, key: string, useChunkUpload: boolean = false): UploadTask => ({
  file,
  status: 'uploading',
  progress: 0,
  key,
  taskId: `${file.name}_${Date.now()}`,
  useChunkUpload
});

/**
 * 普通文件上传
 */
export const uploadNormalFile = async (
  cos: COS,
  file: File,
  path: string,
  options: UploadOptions
) => {
  const key = formatPath(path);
  const uploadTask = createUploadTask(file, key, options.useChunkUpload || false);

  if (options.taskId) {
    uploadTask.taskId = options.taskId;
  }

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cos.putObject({
        Bucket: options.bucket || COS_CONFIG.bucket,
        Region: options.region || COS_CONFIG.region,
        Key: key,
        Body: file,
        onProgress: (info: COSProgressInfo) => {
          if (!info) return;
          uploadTask.progress = Math.round(info.percent * 100);
          options.onProgress?.(uploadTask);
        }
      }, function(err: CosError | null, data: any) {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });

    uploadTask.status = 'success';
    options.onSuccess?.(uploadTask);
    return result;
  } catch (error) {
    uploadTask.status = 'error';
    uploadTask.error = error as CosError;
    options.onError?.(uploadTask);
    throw error;
  }
};

/**
 * 大文件分片上传
 */
export const uploadLargeFile = async (
  cos: COS,
  file: File,
  path: string,
  options: UploadOptions
) => {
  const key = formatPath(path);
  const uploadTask = createUploadTask(file, key, options.useChunkUpload || false);

  if (options.taskId) {
    uploadTask.taskId = options.taskId;
  }

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cos.sliceUploadFile({
        Bucket: options.bucket || COS_CONFIG.bucket,
        Region: options.region || COS_CONFIG.region,
        Key: key,
        Body: file,
        ChunkSize: COS_CONFIG.CHUNK_SIZE,
        onProgress: (info: COSProgressInfo) => {
          if (!info) return;
          uploadTask.progress = Math.round(info.percent * 100);
          options.onProgress?.(uploadTask);
        }
      }, function(err: CosError | null, data: any) {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });

    uploadTask.status = 'success';
    options.onSuccess?.(uploadTask);
    return result;
  } catch (error) {
    uploadTask.status = 'error';
    uploadTask.error = error as CosError;
    options.onError?.(uploadTask);
    throw error;
  }
};

/**
 * 批量上传文件
 */
export const batchUploadFiles = async (
  cos: COS,
  files: File[],
  path: string,
  options: BatchUploadCallbacks
) => {
  const results: string[] = [];
  const failedFiles: File[] = [];
  let completedCount = 0;

  const updateProgress = () => {
    const progress = (completedCount / files.length) * 100;
    options.onBatchProgress?.(progress);
  };

  // 根据用户选择决定上传方式
  const uploadTasks = files.map(file => {
    const uploadFn = options.useChunkUpload ? uploadLargeFile : uploadNormalFile;
    const taskId = `${file.name}_${Date.now()}`;
    
    return uploadFn(cos, file, `${path}/${file.name}`, {
      bucket: options.bucket || COS_CONFIG.bucket,
      region: options.region || COS_CONFIG.region,
      path: `${path}/${file.name}`,
      taskId,
      useChunkUpload: options.useChunkUpload,
      onProgress: options.onProgress,
      onSuccess: (task) => {
        completedCount++;
        updateProgress();
        options.onSuccess?.(task);
      },
      onError: (task) => {
        completedCount++;
        updateProgress();
        failedFiles.push(file);
        options.onError?.(task);
      }
    });
  });

  try {
    await Promise.all(uploadTasks);
    options.onBatchComplete?.(files.length - failedFiles.length, failedFiles.length);
    return results;
  } catch (error) {
    console.error('[BatchUpload] 批量上传过程中出现错误:', error);
    throw error;
  }
}; 