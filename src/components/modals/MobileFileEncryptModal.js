import React, { useState } from 'react';
import { Modal, Input, Space, Typography, Button, message, Progress, Alert } from 'antd';
import { 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  SafetyCertificateOutlined,
  FileOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import CryptoJS from 'crypto-js';
import { getEllipsisFileName } from '../../utils';

const { Text, Paragraph } = Typography;

const StyledModal = styled(Modal)`
  &&& {
    position: fixed;
    margin: 0;
    padding: 0;
    max-width: 100vw;
    width: 100vw !important;
    top: 0;
    pointer-events: auto;
    z-index: 2200;
  }

  .ant-modal-content {
    min-height: 100vh;
    margin: 0;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    background: ${props => props.theme.mode === 'dark' 
      ? 'var(--ant-color-bg-container)' 
      : '#ffffff'};
    backdrop-filter: blur(12px);
  }

  .ant-modal-wrap {
    position: fixed;
    inset: 0;
    overflow: hidden;
    outline: 0;
    -webkit-overflow-scrolling: touch;
  }

  .ant-modal-mask {
    position: fixed;
    inset: 0;
    z-index: 2150;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.45);
    pointer-events: auto;
  }

  .ant-modal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    background: transparent;
  }

  .ant-modal-header {
    margin: 0;
    padding: 12px 16px;
    background: transparent;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.06)'};
  }

  .ant-modal-footer {
    margin: 0;
    padding: 12px 16px;
    background: transparent;
    position: sticky;
    bottom: 0;
    z-index: 10;
    border-top: 1px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.06)'};
    
    .footer-right {
      display: flex;
      gap: 8px;
      
      .ant-btn {
        flex: 1;
        height: 44px;
        font-size: 16px;
        border-radius: 10px;
        font-weight: 600;
      }
    }
  }
`;

const SecurityTips = styled.div`
  margin-bottom: 24px;
  
  .ant-alert {
    margin-bottom: 16px;
  }
  
  .security-features {
    background: var(--ant-color-primary-bg);
    border-radius: 8px;
    padding: 16px;
    
    .ant-typography {
      color: var(--ant-color-text-secondary);
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

const PasswordInput = styled.div`
  margin-bottom: 24px;
  
  .ant-input-affix-wrapper {
    height: 44px;
    border-radius: 10px;
    padding: 0 12px;
    
    &:not(:last-child) {
      margin-bottom: 12px;
    }
    
    .ant-input {
      font-size: 16px;
    }
    
    .anticon {
      font-size: 18px;
      color: var(--ant-color-text-secondary);
    }
  }
  
  .ant-space {
    width: 100%;
  }
  
  .ant-typography {
    font-size: 13px;
    line-height: 1.5;
    margin-top: 8px;
    color: var(--ant-color-text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
    
    .anticon {
      font-size: 14px;
      color: var(--ant-color-warning);
    }
  }
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const FileItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.02)'};
`;

const FileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    font-size: 24px;
  }

  .info {
    flex: 1;
    min-width: 0;

    .name {
      font-size: 14px;
      margin-bottom: 4px;
      display: block;
    }

    .size {
      font-size: 12px;
      color: var(--ant-color-text-secondary);
    }
  }
`;

const FileProgress = styled.div`
  .ant-progress {
    margin: 8px 0;
  }

  .progress-text {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--ant-color-text-secondary);
  }
`;

const MobileFileEncryptModal = ({
  visible,
  files,
  onCancel,
  onEncryptComplete,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [progress, setProgress] = useState(new Map());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 加密单个文件
  const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
      // 获取实际的文件对象
      const actualFile = file instanceof File ? file : file.originFileObj;
      
      // 确保文件是有效的 Blob 对象
      if (!(actualFile instanceof Blob)) {
        console.error('Invalid file object:', file);
        reject(new Error('无效的文件对象'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // 更新加密进度
          setProgress(prev => new Map(prev).set(actualFile.name, {
            status: 'encrypting',
            percent: 30
          }));

          // 将文件内容转换为 WordArray
          const contentArray = CryptoJS.lib.WordArray.create(e.target.result);
          
          // 使用 CryptoJS 加密文件内容
          const encrypted = CryptoJS.AES.encrypt(contentArray, password, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });
          
          // 创建加密文件头标记
          const headerText = "MSTCRYPT";
          const headerBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(headerText));
          
          // 合并头部和加密内容
          const encryptedContent = encrypted.toString();
          const finalContent = headerBase64 + encryptedContent;

          // 创建新的加密文件
          const encryptedBlob = new Blob([finalContent], { type: 'application/encrypted' });
          const encryptedFile = new File([encryptedBlob], actualFile.name + '.encrypted', {
            type: 'application/encrypted',
            lastModified: new Date().getTime()
          });

          // 更新进度为完成
          setProgress(prev => new Map(prev).set(actualFile.name, {
            status: 'completed',
            percent: 100
          }));

          resolve(encryptedFile);
        } catch (error) {
          console.error('加密过程出错:', error);
          setProgress(prev => new Map(prev).set(actualFile.name, {
            status: 'error',
            percent: 0
          }));
          reject(error);
        }
      };

      reader.onerror = () => {
        setProgress(prev => new Map(prev).set(actualFile.name, {
          status: 'error',
          percent: 0
        }));
        reject(new Error('文件读取失败'));
      };

      // 开始读取文件
      setProgress(prev => new Map(prev).set(actualFile.name, {
        status: 'reading',
        percent: 10
      }));
      reader.readAsArrayBuffer(actualFile);
    });
  };

  // 处理加密所有文件
  const handleEncrypt = async () => {
    if (!password) {
      message.error('请输入加密密码');
      return;
    }

    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      message.error('密码长度至少为6位');
      return;
    }

    try {
      setEncrypting(true);
      
      // 保存原始文件列表的副本
      const originalFilesList = Array.from(files);
      
      // 初始化进度
      const initialProgress = new Map();
      originalFilesList.forEach(file => {
        initialProgress.set(file.name, {
          status: 'pending',
          percent: 0
        });
      });
      setProgress(initialProgress);

      // 并行加密所有文件
      const encryptPromises = originalFilesList.map(file => encryptFile(file));
      const encryptedFiles = await Promise.all(encryptPromises);

      // 调用完成回调，同时传递加密后的文件和原始文件
      if (typeof onEncryptComplete === 'function') {
        onEncryptComplete(encryptedFiles, originalFilesList);
        message.success('文件加密完成');
        
        // 清理状态
        setPassword('');
        setConfirmPassword('');
        onCancel();
      } else {
        throw new Error('加密完成回调未定义');
      }
    } catch (error) {
      console.error('加密失败:', error);
      message.error('加密失败: ' + (error.message || '未知错误'));
    } finally {
      setEncrypting(false);
    }
  };

  const formatFileSize = (size) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <StyledModal
      title={
        <Space>
          <LockOutlined />
          <span>加密文件</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <div key="right" className="footer-right">
          <Button
            type="primary"
            onClick={handleEncrypt}
            loading={encrypting}
            icon={<LockOutlined />}
            block
          >
            开始加密
          </Button>
        </div>
      ]}
      width="100vw"
      styles={{
        body: {
          minHeight: '100vh',
          margin: 0,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent'
        }
      }}
      style={{ 
        top: 0,
        padding: 0,
        margin: 0,
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
      maskClosable={false}
      closable={!encrypting}
      keyboard={false}
      getContainer={() => document.body}
    >
      <SecurityTips>
        <Alert
          message="MyStorage 安全加密"
          description={
            <div>
              <Paragraph>
                <SafetyCertificateOutlined /> 使用业界标准的 AES 加密算法，为您的文件提供强大的加密保护
              </Paragraph>
              <Paragraph>
                <SafetyCertificateOutlined /> 加密过程完全在浏览器端进行，原始文件不会上传，确保数据安全
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </SecurityTips>

      <PasswordInput>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="input-wrapper">
            <Input
              placeholder="请输入加密密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suffix={
                <Button
                  type="text"
                  icon={showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  onClick={() => setShowPassword(!showPassword)}
                />
              }
              size="large"
              maxLength={32}
              style={{ 
                WebkitTextSecurity: showPassword ? 'none' : 'disc'
              }}
              type={showPassword ? 'text' : 'tel'}
            />
          </div>
          <div className="input-wrapper">
            <Input
              placeholder="请确认加密密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              suffix={
                <Button
                  type="text"
                  icon={showConfirmPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              size="large"
              maxLength={32}
              style={{ 
                WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc'
              }}
              type={showConfirmPassword ? 'text' : 'tel'}
            />
          </div>
          <Text type="secondary">
            <SafetyCertificateOutlined />
            请记住您的加密密码，文件解密时需要使用相同的密码
          </Text>
        </Space>
      </PasswordInput>

      <FileList>
        {Array.from(files).map(file => {
          const fileProgress = progress.get(file.name);
          return (
            <FileItem key={file.name}>
              <FileHeader>
                <FileOutlined className="icon" />
                <div className="info">
                  <Text className="name" ellipsis>{getEllipsisFileName(file.name)}</Text>
                  <span className="size">{formatFileSize(file.size)}</span>
                </div>
              </FileHeader>
              
              {fileProgress && (
                <FileProgress>
                  <Progress
                    percent={fileProgress.percent}
                    size="small"
                    status={
                      fileProgress.status === 'error' ? 'exception' :
                      fileProgress.status === 'completed' ? 'success' :
                      'active'
                    }
                  />
                </FileProgress>
              )}
            </FileItem>
          );
        })}
      </FileList>
    </StyledModal>
  );
};

export default MobileFileEncryptModal; 