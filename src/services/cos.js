import COS from 'cos-js-sdk-v5';
import axios from '../api/axios';

class COSService {
  constructor() {
    this.cos = null;
    this.host = '';
    this.uploadTasks = new Map(); // 存储上传任务
  }

  async init() {
    try {
      const { data } = await axios.get('/productx/tencent/cos-credential', {
        params: { bucketName: 'px-1258150206' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        withCredentials: true
      });
      
      if (data.success) {
        const { secretId, secretKey, sessionToken, host } = data.data;
        
        this.cos = new COS({
          SecretId: secretId,
          SecretKey: secretKey,
          SecurityToken: sessionToken,
          UseAccelerate: true,
          Protocol: window.location.protocol.slice(0, -1),
          Domain: host.replace(/^https?:\/\//, ''),
          WithCredentials: true
        });
        
        this.host = host;
        return true;
      }
      return false;
    } catch (error) {
      console.error('初始化 COS 失败:', error.response?.data?.message || '获取临时密钥失败');
      return false;
    }
  }

  async uploadFile(file, path = '', onProgress, useChunkUpload = false, resumeData = null) {
    if (!this.cos) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const key = path ? `${path}${file.name}` : file.name;
      let lastProgress = resumeData ? resumeData.progress : 0;
      let isTaskCancelled = false;

      // 创建上传任务
      const taskId = resumeData ? resumeData.taskId : `${key}_${Date.now()}`;
      console.log('创建上传任务，taskId:', taskId, '续传数据:', resumeData, '是否分片上传:', useChunkUpload);

      // 存储任务信息的占位符
      this.uploadTasks.set(taskId, {
        taskId,
        tid: null,
        file,
        path,
        status: 'uploading',
        progress: lastProgress,
        onProgress,
        uploadId: resumeData?.uploadId,
        partNumber: resumeData?.partNumber,
        useChunkUpload
      });

      // 根据是否使用分片上传选择不同的上传方法
      const uploadMethod = useChunkUpload ? this.cos.sliceUploadFile : this.cos.putObject;
      const uploadOptions = {
        Bucket: 'px-1258150206',
        Region: 'ap-nanjing',
        Key: key,
        Body: file,
        onProgress: (progressData) => {
          if (isTaskCancelled) {
            return;
          }

          const percent = progressData.percent * 100;
          const speed = progressData.speed;
          
          if (percent >= lastProgress) {
            lastProgress = percent;
            const taskInfo = this.uploadTasks.get(taskId);
            if (taskInfo) {
              taskInfo.progress = percent;
              taskInfo.speed = speed;
            }
            onProgress(percent, speed, taskId);
          }
        }
      };

      // 如果使用分片上传，添加分片相关配置
      if (useChunkUpload) {
        Object.assign(uploadOptions, {
          ChunkSize: 1024 * 1024 * 50, // 50MB 分片大小
          AsyncLimit: 3, // 并发数
          ChunkParallel: true,
          SliceSize: 1024 * 1024 * 50,
          RetryTimes: 3,
          onTaskReady: (tid) => {
            console.log('分片上传任务创建成功，任务ID:', tid);
            const taskInfo = this.uploadTasks.get(taskId);
            if (taskInfo) {
              taskInfo.tid = tid;
            }
          }
        });

        // 如果有续传数据，添加到上传选项中
        if (resumeData?.uploadId) {
          console.log('使用续传数据:', resumeData);
          uploadOptions.UploadId = resumeData.uploadId;
          uploadOptions.PartNumber = resumeData.partNumber;
        }
      }

      const task = uploadMethod.call(this.cos, uploadOptions, (err, data) => {
        if (isTaskCancelled && useChunkUpload) {
          // 只有分片上传才需要保存进度信息
          const taskInfo = this.uploadTasks.get(taskId);
          if (taskInfo && data) {
            taskInfo.uploadId = data.UploadId;
            taskInfo.partNumber = data.CurrPartNumber;
            console.log('保存上传进度:', {
              uploadId: data.UploadId,
              partNumber: data.CurrPartNumber,
              progress: taskInfo.progress
            });
          }
          return;
        }

        // 完成后删除任务记录
        console.log('上传任务完成或出错，删除任务记录:', taskId);
        this.uploadTasks.delete(taskId);
        
        if (err) {
          reject(err);
        } else {
          onProgress(100, 0, taskId);
          resolve({
            url: `${this.host}${key}`,
            key: key,
            etag: data.ETag,
            location: data.Location,
            taskId,
            ...data
          });
        }
      });

      console.log('获取到的上传任务对象:', task);

      // 更新任务信息
      const taskInfo = this.uploadTasks.get(taskId);
      if (taskInfo) {
        taskInfo.cancel = () => {
          isTaskCancelled = true;
          if (taskInfo.tid && useChunkUpload) {
            this.cos.cancelTask(taskInfo.tid);
          }
        };
        console.log('已更新任务对象');
      }
    });
  }

  // 暂停上传
  pauseUpload(taskId) {
    console.log('尝试暂停上传，taskId:', taskId);
    const taskInfo = this.uploadTasks.get(taskId);
    console.log('找到的任务信息:', taskInfo);
    
    if (taskInfo && taskInfo.cancel) {
      try {
        taskInfo.cancel();
        taskInfo.status = 'paused';
        console.log('暂停成功，保存上传进度:', {
          taskId: taskInfo.taskId,
          progress: taskInfo.progress,
          uploadId: taskInfo.uploadId,
          partNumber: taskInfo.partNumber
        });
        return true;
      } catch (error) {
        console.error('暂停失败:', error);
        return false;
      }
    }
    console.log('未找到有效的任务信息');
    return false;
  }

  // 恢复上传
  resumeUpload(taskId) {
    console.log('尝试恢复上传，taskId:', taskId);
    const taskInfo = this.uploadTasks.get(taskId);
    console.log('找到的任务信息:', taskInfo);
    
    if (taskInfo) {
      try {
        const resumeData = {
          taskId: taskInfo.taskId,
          progress: taskInfo.progress,
          uploadId: taskInfo.uploadId,
          partNumber: taskInfo.partNumber
        };

        // 删除旧任务
        this.uploadTasks.delete(taskId);
        
        // 开始新的上传，传入续传数据
        this.uploadFile(taskInfo.file, taskInfo.path, taskInfo.onProgress, taskInfo.useChunkUpload, resumeData)
          .then(() => {
            console.log('恢复上传成功');
          })
          .catch((error) => {
            console.error('恢复上传失败:', error);
          });
        
        return true;
      } catch (error) {
        console.error('恢复失败:', error);
        return false;
      }
    }
    console.log('未找到有效的任务信息');
    return false;
  }

  // 获取任务状态
  getTaskStatus(taskId) {
    const taskInfo = this.uploadTasks.get(taskId);
    return taskInfo ? taskInfo.status : null;
  }

  async createFolder(path) {
    if (!this.cos) {
      await this.init();
    }

    // 确保路径以 / 结尾，这是对象存储中表示文件夹的方式
    const folderPath = path.endsWith('/') ? path : `${path}/`;

    return new Promise((resolve, reject) => {
      this.cos.putObject({
        Bucket: 'px-1258150206',
        Region: 'ap-nanjing',
        Key: folderPath,
        Body: '',  // 空内容，只创建路径
        ContentLength: 0
      }, (err, data) => {
        if (err) {
          console.error('创建文件夹失败:', err);
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

  async listFiles(prefix = '') {
    if (!this.cos) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.cos.getBucket({
        Bucket: 'px-1258150206',
        Region: 'ap-nanjing',
        Prefix: prefix,
        Delimiter: '/',
        MaxKeys: 1000
      }, (err, data) => {
        if (err) {
          console.error('获取文件列表失败:', err);
          reject(err);
        } else {
          const result = {
            CommonPrefixes: data.CommonPrefixes || [],
            Contents: data.Contents || []
          };
          resolve(result);
        }
      });
    });
  }

  async deleteFile(key) {
    if (!this.cos) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.cos.deleteObject({
        Bucket: 'px-1258150206',
        Region: 'ap-nanjing',
        Key: key
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}

export const cosService = new COSService(); 