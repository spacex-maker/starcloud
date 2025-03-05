import COS from 'cos-js-sdk-v5';
import instance from 'api/axios';
import { COS_CONFIG } from './config';

/**
 * COS 初始化结果接口
 * @interface InitCOSResult
 * @property {COS} cos - COS 实例
 * @property {string} host - COS 服务的域名
 */
interface InitCOSResult {
  cos: COS;
  host: string;
}

/**
 * 初始化腾讯云 COS（对象存储）实例
 * 
 * @description
 * 该函数负责初始化 COS SDK 实例，包括以下步骤：
 * 1. 通过接口获取临时密钥
 * 2. 使用临时密钥创建 COS 实例
 * 3. 配置 COS 实例的各项参数
 * 
 * @throws {Error} 当初始化失败时抛出错误
 * @returns {Promise<InitCOSResult>} 返回初始化结果
 * 
 * @example
 * ```typescript
 * try {
 *   const { cos, host } = await initCOS();
 *   // COS 实例初始化成功，可以使用 cos 进行操作
 * } catch (error) {
 *   // 初始化失败，对象存储服务不可用
 *   console.error('对象存储服务不可用:', error);
 * }
 * ```
 */
export const initCOS = async (): Promise<InitCOSResult> => {
  try {
    // 先请求一次验证服务是否可用
    const response = await instance.get('/productx/tencent/cos-credential', {
      params: { bucketName: COS_CONFIG.bucket }
    });
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || '对象存储服务暂时不可用：获取临时密钥失败');
    }

    const credentials = response.data.data;
    
    if (!credentials?.secretId || !credentials?.secretKey) {
      throw new Error('对象存储服务暂时不可用：临时密钥数据不完整');
    }

    // 创建 COS 实例，使用回调方式获取临时密钥
    const cos = new COS({
      getAuthorization: async (_options, callback) => {
        try {
          const response = await instance.get('/productx/tencent/cos-credential', {
            params: { bucketName: COS_CONFIG.bucket }
          });
          
          if (!response.data?.success) {
            throw new Error(response.data?.message || '获取临时密钥失败');
          }

          const credentials = response.data.data;
          if (!credentials?.secretId || !credentials?.secretKey) {
            throw new Error('临时密钥数据不完整');
          }

          callback({
            TmpSecretId: credentials.secretId,
            TmpSecretKey: credentials.secretKey,
            SecurityToken: credentials.sessionToken,
            ExpiredTime: credentials.expiredTime,
            StartTime: credentials.startTime
          });
        } catch (error) {
          console.error('[COS] 获取临时密钥失败:', error);
          callback({
            TmpSecretId: credentials.secretId,    // 使用初始密钥作为后备
            TmpSecretKey: credentials.secretKey,
            SecurityToken: credentials.sessionToken,
            ExpiredTime: credentials.expiredTime,
            StartTime: credentials.startTime
          });
        }
      },
      Protocol: window.location.protocol.slice(0, -1),
      Domain: credentials.host?.replace(/^https?:\/\//, '') || '',
      FileParallelLimit: 3,
      ChunkParallelLimit: 3,
      ChunkSize: COS_CONFIG.CHUNK_SIZE,
      ProgressInterval: 1000
    });

    console.log('[COS] 初始化成功');
    
    return { cos, host: credentials.host || '' };
  } catch (error) {
    console.error('[COS] 初始化失败:', error);
    throw new Error(
      error instanceof Error 
        ? `对象存储服务暂时不可用：${error.message}`
        : '对象存储服务暂时不可用'
    );
  }
}; 