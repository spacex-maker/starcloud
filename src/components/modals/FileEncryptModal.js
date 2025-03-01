import React, { useState } from 'react';
import { Modal, Input, Table, Space, Typography, Button, message, Progress, Alert } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, SafetyCertificateOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import CryptoJS from 'crypto-js';

const { Text, Paragraph } = Typography;

const StyledModal = styled(Modal)`
  &&& {
    position: relative;
    z-index: 2100;
  }

  .ant-modal-content {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .ant-modal-wrap {
    z-index: 2100;
  }
  
  .ant-modal-mask {
    z-index: 2050;
  }
`;

const PasswordInput = styled.div`
  margin-bottom: 16px;
`;

const ProgressWrapper = styled.div`
  margin: 8px 0;
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

const FileEncryptModal = ({
  visible,
  files,
  onCancel,
  onEncryptComplete,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [progress, setProgress] = useState(new Map());

  // 加密单个文件
  const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // 更新加密进度
          setProgress(prev => new Map(prev).set(file.name, {
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
          console.log('加密 - 头部Base64:', headerBase64);
          
          // 合并头部和加密内容
          const encryptedContent = encrypted.toString();
          console.log('加密 - 加密内容前20个字符:', encryptedContent.substring(0, 20));
          const finalContent = headerBase64 + encryptedContent;
          console.log('加密 - 最终内容前32个字符:', finalContent.substring(0, 32));

          // 创建新的加密文件
          const encryptedBlob = new Blob([finalContent], { type: 'application/encrypted' });
          const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted`, {
            type: 'application/encrypted',
            lastModified: new Date()
          });

          // 更新进度为完成
          setProgress(prev => new Map(prev).set(file.name, {
            status: 'completed',
            percent: 100
          }));

          resolve(encryptedFile);
        } catch (error) {
          console.error('加密过程出错:', error);
          setProgress(prev => new Map(prev).set(file.name, {
            status: 'error',
            percent: 0
          }));
          reject(error);
        }
      };

      reader.onerror = () => {
        setProgress(prev => new Map(prev).set(file.name, {
          status: 'error',
          percent: 0
        }));
        reject(new Error('文件读取失败'));
      };

      // 开始读取文件
      setProgress(prev => new Map(prev).set(file.name, {
        status: 'reading',
        percent: 10
      }));
      reader.readAsArrayBuffer(file);
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
      
      // 初始化进度
      const initialProgress = new Map();
      files.forEach(file => {
        initialProgress.set(file.name, {
          status: 'pending',
          percent: 0
        });
      });
      setProgress(initialProgress);

      // 并行加密所有文件
      const encryptPromises = Array.from(files).map(file => encryptFile(file));
      const encryptedFiles = await Promise.all(encryptPromises);

      // 调用完成回调
      onEncryptComplete(encryptedFiles);
      message.success('文件加密完成');
      
      // 清理状态
      setPassword('');
      setConfirmPassword('');
      onCancel();
    } catch (error) {
      console.error('加密失败:', error);
      message.error('加密失败: ' + (error.message || '未知错误'));
    } finally {
      setEncrypting(false);
    }
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text ellipsis>{text}</Text>
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = size;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
          value /= 1024;
          unitIndex++;
        }
        return `${value.toFixed(2)} ${units[unitIndex]}`;
      }
    },
    {
      title: '状态',
      key: 'status',
      width: 200,
      render: (_, record) => {
        const fileProgress = progress.get(record.name);
        if (!fileProgress) {
          return '等待加密';
        }

        return (
          <ProgressWrapper>
            <Progress
              percent={fileProgress.percent}
              size="small"
              status={
                fileProgress.status === 'error' ? 'exception' :
                fileProgress.status === 'completed' ? 'success' :
                'active'
              }
            />
          </ProgressWrapper>
        );
      }
    }
  ];

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
        <Button key="cancel" onClick={onCancel} disabled={encrypting}>
          取消
        </Button>,
        <Button
          key="encrypt"
          type="primary"
          onClick={handleEncrypt}
          loading={encrypting}
          icon={<LockOutlined />}
        >
          开始加密
        </Button>
      ]}
      width={600}
      maskClosable={false}
      closable={!encrypting}
      keyboard={false}
      getContainer={() => document.body}
      style={{ position: 'fixed' }}
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
          <Input.Password
            placeholder="请输入加密密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
          <Input.Password
            placeholder="请确认加密密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
          <Text type="secondary">
            请记住您的加密密码，文件解密时需要使用相同的密码
          </Text>
        </Space>
      </PasswordInput>

      <Table
        dataSource={Array.from(files).map(file => ({
          key: file.name,
          name: file.name,
          size: file.size
        }))}
        columns={columns}
        pagination={false}
        size="small"
      />
    </StyledModal>
  );
};

export default FileEncryptModal; 