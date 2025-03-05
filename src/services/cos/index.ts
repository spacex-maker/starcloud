import COS from 'cos-js-sdk-v5';
import { COS_CONFIG } from './config';
import { uploadNormalFile, uploadLargeFile, batchUploadFiles } from './upload';
import { saveTasksToStorage, restoreTasksFromStorage } from './storage';
import { formatPath } from './utils';
import { initCOS } from './initCOS';
import type { UploadTask, UploadOptions, BatchUploadCallbacks, CosError, COSProgressInfo } from './types';
import { message } from 'antd';

export class COSService {
  private cos: COS | null;
  private host: string;
  private uploadTasks: Map<string, UploadTask>;

  constructor() {
    this.cos = null;
    this.host = '';
    this.uploadTasks = new Map();

    // 绑定方法
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.cancelUpload = this.cancelUpload.bind(this);
    this.pauseUpload = this.pauseUpload.bind(this);
    this.resumeUpload = this.resumeUpload.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.getTaskStatus = this.getTaskStatus.bind(this);
    this.createFolder = this.createFolder.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File, options: UploadOptions): Promise<string> {
    // 如果 COS 实例未初始化，先尝试初始化
    if (!this.cos) {
      try {
        const { cos, host } = await initCOS();
        this.cos = cos;
        this.host = host;
      } catch (error) {
        throw new Error('对象存储服务暂时不可用');
      }
    }

    if (!options.path) {
      throw new Error('上传路径不能为空');
    }

    const key = formatPath(options.path);
    console.log('[Upload] 格式化后的上传路径:', key);
    
    const taskId = options.taskId || `${file.name}_${Date.now()}`;
    let uploadTask = this.uploadTasks.get(taskId);

    if (!uploadTask) {
      uploadTask = {
        file,
        status: 'uploading',
        progress: 0,
        key,
        taskId,
        startTime: Date.now(),
        useChunkUpload: options.useChunkUpload || false,
        onProgress: options.onProgress
      };
      this.uploadTasks.set(taskId, uploadTask);
    } else {
      // 更新现有任务的状态
      uploadTask.status = 'uploading';
      uploadTask.startTime = Date.now();
      uploadTask.onProgress = options.onProgress;
      uploadTask.useChunkUpload = options.useChunkUpload || false;
    }

    try {
      const uploadParams = {
        Bucket: options.bucket || COS_CONFIG.bucket,
        Region: options.region || COS_CONFIG.region,
        Key: key,
        Body: file,
        TaskId: taskId,
        onProgress: (info: COSProgressInfo) => {
          if (!info) return;
          uploadTask!.progress = Math.floor(info.percent * 100);
          uploadTask!.uploadedBytes = info.loaded;
          uploadTask!.totalBytes = info.total;
          uploadTask!.speed = info.speed;
          uploadTask!.lastProgress = uploadTask!.progress;
          uploadTask!.lastTime = Date.now();
          uploadTask!.lastUploadedBytes = info.loaded;
          uploadTask!.totalUploadTime = (Date.now() - uploadTask!.startTime!) / 1000;
          
          // 调用任务自身的进度回调
          uploadTask!.onProgress?.(uploadTask!);
          // 调用选项中的进度回调
          options.onProgress?.(uploadTask!);
        },
        onTaskReady: (id: string) => {
          console.log('[Upload] 任务准备就绪，id:', id);
          if (uploadTask!.useChunkUpload) {
            uploadTask!.uploadId = id;
          } else {
            uploadTask!.requestId = id;
          }
        },
      };

      console.log('[Upload] 开始上传文件:', {
        fileName: file.name,
        fileSize: file.size,
        useChunkUpload: uploadTask.useChunkUpload,
        taskId: taskId
      });

      // 根据 useChunkUpload 选择上传方式
      const result = await (uploadTask.useChunkUpload 
        ? this.cos!.sliceUploadFile(uploadParams)
        : this.cos!.putObject(uploadParams));

      uploadTask.status = 'success';
      uploadTask.progress = 100;
      uploadTask.onProgress?.(uploadTask);
      options.onSuccess?.(uploadTask);
      
      console.log('[Upload] 文件上传成功:', {
        fileName: file.name,
        location: result.Location
      });

      return result.Location;
    } catch (error) {
      console.error('[Upload] 文件上传失败:', error);
      uploadTask.status = 'error';
      uploadTask.error = error as CosError;
      uploadTask.onProgress?.(uploadTask);
      options.onError?.(uploadTask);
      throw error;
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: File[], options: BatchUploadCallbacks): Promise<string[]> {
    // 如果 COS 实例未初始化，先尝试初始化
    if (!this.cos) {
      try {
        const { cos, host } = await initCOS();
        this.cos = cos;
        this.host = host;
      } catch (error) {
        throw new Error('对象存储服务暂时不可用');
      }
    }

    if (!options.path) {
      throw new Error('上传路径不能为空');
    }

    console.log('[BatchUpload] 开始批量上传，基础路径:', options.path);
    const results: string[] = [];
    const failedFiles: File[] = [];

    for (const file of files) {
      try {
        console.log(`[BatchUpload] 开始上传文件: ${file.name}`);
        const url = await this.uploadFile(file, {
          bucket: options.bucket || COS_CONFIG.bucket,
          region: options.region || COS_CONFIG.region,
          path: `${options.path}/${file.name}`,
          onProgress: options.onProgress,
          onSuccess: options.onSuccess,
          onError: options.onError,
        });
        console.log(`[BatchUpload] 文件上传成功: ${file.name}, URL: ${url}`);
        results.push(url);
      } catch (error) {
        console.error(`[BatchUpload] 文件 ${file.name} 上传失败:`, error);
        failedFiles.push(file);
      }
    }

    if (failedFiles.length > 0) {
      message.error(`${failedFiles.length} 个文件上传失败`);
    }

    return results;
  }

  /**
   * 取消上传
   */
  cancelUpload(key: string) {
    const task = this.uploadTasks.get(key);
    if (task && this.cos) {
      // 使用任务的 key 作为取消标识
      this.cos.cancelTask(key);
      task.status = 'cancelled';
      this.uploadTasks.delete(key);
    }
  }

  /**
   * 暂停上传
   */
  pauseUpload(taskId: string) {
    console.log('[COS] 尝试暂停上传任务:', taskId);
    const task = this.uploadTasks.get(taskId);
    if (!task) {
      console.warn('[COS] 未找到上传任务:', taskId);
      return;
    }
    if (!this.cos) {
      console.warn('[COS] COS 实例未初始化');
      return;
    }

    try {
      // 先更新任务状态
      task.status = 'paused';
      
      if (task.useChunkUpload) {
        if (task.requestId) {
          console.log('[COS] 暂停分片上传任务, requestId:', task.requestId);
          this.cos.pauseTask(task.requestId);
        } else if (task.uploadId) {
          console.log('[COS] 暂停分片上传任务, uploadId:', task.uploadId);
          this.cos.pauseTask(task.uploadId);
        } else {
          console.warn('[COS] 分片上传任务的标识符未找到，尝试使用 taskId');
          this.cos.pauseTask(taskId);
        }
      } else {
        console.log('[COS] 暂停普通上传任务');
        this.cos.pauseTask(taskId);
      }

      // 保存当前的上传进度信息
      task.lastProgress = task.progress;
      task.lastTime = Date.now();
      task.lastUploadedBytes = task.uploadedBytes;
      task.totalUploadTime = (Date.now() - task.startTime!) / 1000;

      // 保存任务状态到本地存储
      saveTasksToStorage(this.uploadTasks);
      console.log('[COS] 上传任务已暂停:', taskId, '当前进度:', task.progress);

      // 强制触发一次任务状态更新
      if (task.onProgress) {
        task.onProgress(task);
      }

      return true;
    } catch (error) {
      console.error('[COS] 暂停上传任务失败:', error);
      // 如果暂停失败，恢复任务状态
      task.status = 'uploading';
      return false;
    }
  }

  /**
   * 恢复上传
   */
  resumeUpload(taskId: string) {
    console.log('[COS] 尝试恢复上传任务:', taskId);
    const task = this.uploadTasks.get(taskId);
    if (!task) {
      console.warn('[COS] 未找到上传任务:', taskId);
      return false;
    }
    if (!this.cos) {
      console.warn('[COS] COS 实例未初始化');
      return false;
    }

    try {
      // 先更新任务状态
      task.status = 'uploading';
      task.startTime = Date.now(); // 重置开始时间

      if (task.useChunkUpload) {
        if (task.requestId) {
          console.log('[COS] 恢复分片上传任务, requestId:', task.requestId);
          this.cos.restartTask(task.requestId);
        } else if (task.uploadId) {
          console.log('[COS] 恢复分片上传任务, uploadId:', task.uploadId);
          this.cos.restartTask(task.uploadId);
        } else {
          console.log('[COS] 重新开始上传任务');
          return this.uploadFile(task.file, {
            bucket: COS_CONFIG.bucket,
            region: COS_CONFIG.region,
            path: task.key,
            taskId: task.taskId,
            onProgress: task.onProgress
          }).then(() => true).catch(() => false);
        }
      } else {
        console.log('[COS] 重新开始普通上传任务');
        return this.uploadFile(task.file, {
          bucket: COS_CONFIG.bucket,
          region: COS_CONFIG.region,
          path: task.key,
          taskId: task.taskId,
          onProgress: task.onProgress
        }).then(() => true).catch(() => false);
      }

      // 强制触发一次任务状态更新
      if (task.onProgress) {
        task.onProgress(task);
      }

      // 更新本地存储
      saveTasksToStorage(this.uploadTasks);
      console.log('[COS] 上传任务已恢复:', taskId, '当前进度:', task.progress);

      return true;
    } catch (error) {
      console.error('[COS] 恢复上传任务失败:', error);
      task.status = 'error';
      if (task.onProgress) {
        task.onProgress(task);
      }
      return false;
    }
  }

  /**
   * 重试上传
   */
  retryUpload(key: string) {
    const task = this.uploadTasks.get(key);
    if (task && task.status === 'error' && this.cos) {
      task.status = 'uploading';
      task.progress = 0;
      // 重新调用上传方法
      this.uploadFile(task.file, {
        bucket: COS_CONFIG.bucket,
        region: COS_CONFIG.region,
        path: task.key
      }).catch(console.error);
    }
  }

  /**
   * 获取上传任务状态
   */
  getTaskStatus(taskId: string) {
    const task = this.uploadTasks.get(taskId);
    return task ? task.status : null;
  }

  /**
   * 创建文件夹
   */
  async createFolder(path: string) {
    if (!this.cos) {
      try {
        const { cos, host } = await initCOS();
        this.cos = cos;
        this.host = host;
      } catch (error) {
        throw new Error('对象存储服务暂时不可用');
      }
    }

    const folderPath = path.replace(/^\/+/, '').replace(/\/?$/, '/');

    console.log('[CreateFolder] 创建文件夹:', folderPath);

    return new Promise<any>((resolve, reject) => {
      this.cos!.putObject({
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: folderPath,
        Body: '',
        ContentLength: 0
      }, (err: CosError | null, data: any) => {
        if (err) {
          console.error('[CreateFolder] 创建文件夹失败:', err);
          reject(err);
        } else {
          resolve({
            key: folderPath,
            ...data
          });
        }
      });
    });
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string) {
    if (!this.cos) {
      try {
        const { cos, host } = await initCOS();
        this.cos = cos;
        this.host = host;
      } catch (error) {
        throw new Error('对象存储服务暂时不可用');
      }
    }

    if (!key) {
      throw new Error('文件路径不能为空');
    }

    try {
      await new Promise((resolve, reject) => {
        this.cos!.deleteObject({
          Bucket: COS_CONFIG.bucket,
          Region: COS_CONFIG.region,
          Key: formatPath(key)
        }, function(err, data) {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });

      console.log('[Delete] 删除文件成功:', key);
    } catch (error) {
      console.error('[Delete] 删除文件失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const cosService = new COSService();

// 导出
export { cosService };
export type { UploadTask, UploadOptions, BatchUploadCallbacks };
export * from './utils'; 