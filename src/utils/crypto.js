import CryptoJS from 'crypto-js';

/**
 * 解密单个数据块
 * @param {ArrayBuffer} chunk - 数据块
 * @param {string} password - 解密密码
 * @returns {Uint8Array} 解密后的数据
 */
export const decryptChunk = async (chunk, password) => {
  try {
    // 1. 将 ArrayBuffer 转换为字符串
    const decoder = new TextDecoder();
    const content = decoder.decode(chunk);
    console.log('解密 - 原始内容前32个字符:', content.substring(0, 32));
    
    // 2. 提取头部（前12个字符，因为"MSTCRYPT"的Base64编码长度为12）
    const headerBase64 = content.slice(0, 12);
    console.log('解密 - 提取的头部Base64:', headerBase64);
    const header = CryptoJS.enc.Base64.parse(headerBase64);
    const headerText = CryptoJS.enc.Utf8.stringify(header);
    console.log('解密 - 解码后的头部文本:', headerText);
    
    // 3. 检查文件头
    if (headerText !== "MSTCRYPT") {
      console.error('解密 - 头部不匹配:', headerText);
      throw new Error('不是有效的加密文件');
    }
    
    // 4. 提取加密内容
    const encryptedData = content.slice(12);
    console.log('解密 - 加密内容前20个字符:', encryptedData.substring(0, 20));
    
    // 5. 解密内容
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      password,
      {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    // 6. 转换为 Uint8Array
    const words = decrypted.words;
    const sigBytes = decrypted.sigBytes;
    const result = new Uint8Array(sigBytes);
    
    for (let i = 0; i < sigBytes; i++) {
      result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    
    return result;
  } catch (error) {
    console.error('解密错误详情:', error);
    throw new Error('密码错误，请确认后重试');
  }
};

/**
 * 解密大文件
 * @param {ArrayBuffer} content - 文件内容
 * @param {string} password - 解密密码
 * @param {string} fileUid - 文件唯一标识
 * @param {number} chunkSize - 分块大小（默认10MB）
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Blob>} 解密后的文件内容
 */
export const decryptLargeFile = async (content, password, fileUid, chunkSize = 10 * 1024 * 1024, onProgress) => {
  const chunks = Math.ceil(content.byteLength / chunkSize);
  const decryptedChunks = [];
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, content.byteLength);
    const chunk = content.slice(start, end);
    
    // 解密当前块
    const decryptedChunk = await decryptChunk(chunk, password);
    decryptedChunks.push(decryptedChunk);
    
    // 更新进度
    const progress = Math.round((i + 1) / chunks * 100);
    if (onProgress) {
      onProgress(fileUid, progress);
    }
  }
  
  return new Blob(decryptedChunks);
};

/**
 * 解密文件内容
 * @param {ArrayBuffer} content - 文件内容
 * @param {string} password - 解密密码
 * @param {string} fileUid - 文件唯一标识
 * @param {boolean} isVipUser - 是否是VIP用户
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Uint8Array|Blob>} 解密后的文件内容
 */
export const decryptContent = async (content, password, fileUid, isVipUser, onProgress) => {
  try {
    if (isVipUser && content.byteLength > 2 * 1024 * 1024 * 1024) {
      return await decryptLargeFile(content, password, fileUid, 10 * 1024 * 1024, onProgress);
    } else {
      return await decryptChunk(content, password);
    }
  } catch (error) {
    console.error('解密错误:', error);
    throw new Error('密码错误，请确认后重试');
  }
}; 