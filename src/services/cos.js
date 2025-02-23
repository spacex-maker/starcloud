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

  async uploadFile(file, path = '') {
    if (!this.cos) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const key = path ? `${path}/${file.name}` : file.name;

      this.cos.putObject({
        Bucket: 'px-1258150206',
        Region: 'ap-nanjing',
        Key: key,
        Body: file,
        onProgress: (progressData) => {
          console.log('上传进度:', JSON.stringify(progressData));
        }
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            url: `${this.host}${key}`,
            key: key,
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