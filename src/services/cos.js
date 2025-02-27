import COS from 'cos-js-sdk-v5';
import axios from '../api/axios';

class COSService {
  constructor() {
    this.cos = null;
    this.host = '';
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

  async uploadFile(file, path = '', onProgress) {
    if (!this.cos) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const key = path ? `${path}${file.name}` : file.name;
      let lastProgress = 0; // 记录上一次的进度

      this.cos.uploadFile({
        Bucket: 'px-1258150206',
        Region: 'ap-nanjing',
        Key: key,
        Body: file,
        onProgress: (progressData) => {
          const percent = progressData.percent * 100;
          const speed = progressData.speed;
          
          // 确保进度只能增加，不能减少
          if (percent >= lastProgress) {
            lastProgress = percent;
            onProgress(percent, speed);
          }
        }
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // 确保最后进度为 100%
          onProgress(100, 0);
          resolve({
            url: `${this.host}${key}`,
            key: key,
            etag: data.ETag,
            location: data.Location,
            ...data
          });
        }
      });
    });
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