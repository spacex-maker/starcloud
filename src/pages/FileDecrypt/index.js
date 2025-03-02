import React, { useState } from 'react';
import { Layout, Typography, Upload, Input, Button, Card, Progress, message, Space, Divider, Tag, Table, Modal, Tooltip, Collapse, App, Alert } from 'antd';
import { 
  InboxOutlined, 
  LockOutlined, 
  SafetyCertificateOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import SimpleHeader from 'components/headers/simple';
import SecurityFeatures from 'components/features/SecurityFeatures';
import {
  formatTime,
  formatSpeed,
  formatFileSize,
  getEllipsisFileName,
  readFileAsArrayBuffer,
  downloadFile,
  getRecommendedFileSize,
  decryptContent
} from '../../utils';

// 导入组件
import FileUploadSection from './components/UploadSection';
import FileListSectionComponent from './components/FileListSection';
import DecryptStepsComponent from './components/DecryptSteps';
import SecurityTipModalComponent from './components/SecurityTipModal';
import PasswordModalComponent from './components/PasswordModal';

// 导入样式
import {
  PageContainer as StyledPageContainer,
  ContentWrapper as StyledContentWrapper,
  TopSection as StyledTopSection,
  DecryptCard as StyledDecryptCard,
  DecryptLayout as StyledDecryptLayout,
  PageTitle as StyledPageTitle
} from './styles/StyledComponents';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--ant-color-bg-container);
  padding-top: 64px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 64px auto 40px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin: 32px auto 24px;
    padding: 0 8px;
    gap: 16px;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
`;

const DecryptCard = styled(Card)`
  position: relative;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .ant-card-head {
    border-bottom: none;
  }
  
  .ant-card-body {
    padding: 24px;
  }

  .security-tip-btn {
    position: absolute;
    right: 24px;
    top: 16px;
    z-index: 1;
  }
`;

const DecryptLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 280px 1fr;
    gap: 16px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 240px 1fr;
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  .upload-area {
    width: 100%;
    
    .ant-upload-drag {
      padding: 16px;
      height: 240px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.3s;
      
      @media (max-width: 1200px) {
        height: 220px;
        padding: 14px;
      }
      
      @media (max-width: 992px) {
        height: 200px;
        padding: 12px;
      }
      
      @media (max-width: 768px) {
        height: 180px;
      }
      
      @media (max-width: 576px) {
        height: 160px;
        padding: 10px;
      }
    }
    
    .ant-upload-drag-icon {
      margin: 0;
      transition: all 0.3s;
      
      .anticon {
        font-size: 36px;
        color: var(--ant-color-primary);
        
        @media (max-width: 992px) {
          font-size: 32px;
        }
        
        @media (max-width: 576px) {
          font-size: 28px;
        }
      }
    }
    
    .ant-upload-text {
      font-size: 16px;
      margin: 12px 0 8px;
      transition: all 0.3s;
      
      @media (max-width: 992px) {
        font-size: 14px;
        margin: 10px 0 6px;
      }
      
      @media (max-width: 576px) {
        font-size: 13px;
        margin: 8px 0 4px;
      }
    }
    
    .ant-upload-hint {
      font-size: 13px;
      padding: 0 16px;
      transition: all 0.3s;
      
      @media (max-width: 992px) {
        font-size: 12px;
        padding: 0 12px;
      }
      
      @media (max-width: 576px) {
        font-size: 11px;
        padding: 0 8px;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-direction: column;
    width: 100%;

    .ant-btn {
      width: 100%;
      height: 40px;
      font-size: 14px;
      
      @media (max-width: 992px) {
        height: 36px;
        font-size: 13px;
      }
      
      @media (max-width: 576px) {
        height: 32px;
        font-size: 12px;
      }
    }
  }
`;

const FileListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  .ant-table-wrapper {
    width: 100%;
    overflow-x: auto;
    
    .ant-table {
      min-width: 500px;
    }
    
    .ant-table-cell {
      background: transparent !important;
      
      @media (max-width: 992px) {
        padding: 12px 8px;
      }
      
      @media (max-width: 576px) {
        padding: 8px 6px;
      }
    }
    
    .file-info {
      .file-name {
        font-size: 14px;
        
        @media (max-width: 992px) {
          font-size: 13px;
        }
      }
      
      .file-size {
        font-size: 12px;
        
        @media (max-width: 992px) {
          font-size: 11px;
        }
      }
    }
    
    .progress {
      width: 160px;
      
      @media (max-width: 1200px) {
        width: 140px;
      }
      
      @media (max-width: 992px) {
        width: 120px;
      }
      
      @media (max-width: 768px) {
        width: 100px;
      }
    }
    
    .ant-tag {
      margin: 0;
      font-size: 12px;
      
      @media (max-width: 992px) {
        font-size: 11px;
        padding: 0 6px;
      }
    }
  }
`;

const StepsCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .ant-card-head {
    border-bottom: none;
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StepItem = styled.div`
  background: var(--ant-color-bg-container-disabled);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: var(--ant-color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .step-icon {
    font-size: 32px;
    color: var(--ant-color-primary);
    margin-bottom: 16px;
  }
  
  h4 {
    margin: 0 0 12px;
    color: var(--ant-color-text);
    font-size: 16px;
  }
  
  p {
    margin: 0;
    color: var(--ant-color-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
`;

const FileDecryptPage = ({
  isVipUser = false  // 添加会员状态参数
}) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [fileProgress, setFileProgress] = useState(new Map());
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [securityTipVisible, setSecurityTipVisible] = useState(false);
  const [fileStats, setFileStats] = useState(new Map());
  const [maxFileSize] = useState(getRecommendedFileSize());

  // 处理文件选择
  const handleFileSelect = (info) => {
    const selectedFiles = info.fileList;
    
    // 检查是否为加密文件
    const invalidFiles = selectedFiles.filter(file => !file.name.endsWith('.encrypted'));
    if (invalidFiles.length > 0) {
      message.error('请只选择带有 .encrypted 后缀的加密文件');
      return;
    }
    
    // 文件去重处理
    const uniqueFiles = selectedFiles.reduce((acc, current) => {
      const isDuplicate = acc.some(file => 
        file.name === current.name && 
        file.size === current.size &&
        file.lastModified === current.originFileObj?.lastModified
      );
      if (!isDuplicate) {
        acc.push(current);
      } else {
        message.warning(`文件 "${current.name}" 已存在，已自动去重`);
      }
      return acc;
    }, []);
    
    // 非会员大小限制检查
    if (!isVipUser) {
      const largeFiles = uniqueFiles.filter(file => file.size > 4 * 1024 * 1024 * 1024);
      if (largeFiles.length > 0) {
        Modal.warning({
          title: '文件大小超出限制',
          content: (
            <div>
              <p>以下文件超出非会员解密上限(4GB)：</p>
              <ul>
                {largeFiles.map(file => (
                  <li key={file.uid}>{file.name} ({formatFileSize(file.size)})</li>
                ))}
              </ul>
              <p style={{ color: '#ff4d4f', marginTop: 16 }}>
                开通会员后可解密任意大小文件，并支持分块解密功能
              </p>
            </div>
          ),
          okText: '我知道了'
        });
        return;
      }
    }
    
    const newFiles = uniqueFiles.map(file => ({
      ...file,
      status: 'pending',
      progress: 0
    }));
    
    setFiles(newFiles);
  };

  // 处理文件选择状态变化
  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedFiles(selectedRowKeys);
  };

  // 处理开始解密
  const handleStartDecrypt = () => {
    if (selectedFiles.length === 0) {
      message.error('请选择要解密的文件');
      return;
    }
    setPasswordModalVisible(true);
  };

  // 修改密码确认处理函数
  const handlePasswordConfirm = async () => {
    if (!password) {
      message.error('请输入解密密码');
      return;
    }

    setPasswordModalVisible(false);
    setDecrypting(true);

    try {
      const selectedFileObjects = files.filter(file => selectedFiles.includes(file.uid));
      
      const hasFileSystemAccess = 'showSaveFilePicker' in window;
      
      for (const file of selectedFileObjects) {
        try {
          updateFileProgress(file.uid, 10);
          const fileContent = await readFileAsArrayBuffer(file.originFileObj);
          
          updateFileProgress(file.uid, 30);
          const decrypted = await decryptContent(
            fileContent, 
            password, 
            file.uid, 
            isVipUser,
            (fileUid, progress) => updateFileProgress(fileUid, progress)
          );
          updateFileProgress(file.uid, 80);
          
          const fileName = file.name.replace('.encrypted', '');
          const decryptedFile = new File([decrypted], fileName, {
            type: 'application/octet-stream',
            lastModified: Date.now()
          });

          if (hasFileSystemAccess && file.saveLocation) {
            try {
              const fileHandle = await file.saveLocation.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(decryptedFile);
              await writable.close();
              updateFileProgress(file.uid, 100, 'success');
              message.success(`文件 ${fileName} 已保存到选定位置`);
            } catch (error) {
              if (error.name === 'AbortError') {
                updateFileProgress(file.uid, 0, 'error');
                message.info(`已取消保存文件 ${fileName}`);
              } else {
                throw error;
              }
            }
          } else {
            const url = URL.createObjectURL(decryptedFile);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            updateFileProgress(file.uid, 100, 'success');
            message.success(`文件 ${fileName} 已保存到下载目录`);
          }
        } catch (error) {
          console.error('文件解密失败:', file.name, error);
          updateFileProgress(file.uid, 0, 'error', error.message);
          message.error(`文件 ${file.name} 解密失败: ${error.message}`);
        }
      }

      setSelectedFiles([]);
      setPassword('');
    } catch (error) {
      console.error('批量解密失败:', error);
      message.error('批量解密失败，请重试');
    } finally {
      setDecrypting(false);
    }
  };

  // 清空文件列表
  const handleClearFiles = () => {
    setFiles([]);
    setFileProgress(new Map());
    setSelectedFiles([]);
    setFileStats(new Map());
  };

  // 更新文件进度
  const updateFileProgress = (fileUid, progress, status = 'decrypting', errorMessage = '') => {
    const now = Date.now();
    
    setFileProgress(prev => {
      const next = new Map(prev);
      next.set(fileUid, { progress, status, errorMessage });
      return next;
    });
    
    setFileStats(prev => {
      const stats = prev.get(fileUid) || {
        startTime: now,
        lastUpdateTime: now,
        lastProgress: 0,
        processedSize: 0,
        totalSize: files.find(f => f.uid === fileUid)?.size || 0
      };
      
      const timeElapsed = (now - stats.lastUpdateTime) / 1000;
      const progressDiff = progress - (stats.lastProgress || 0);
      const processedSize = (stats.totalSize * progress) / 100;
      const speed = timeElapsed > 0 ? (processedSize - stats.processedSize) / timeElapsed : 0;
      
      const remainingSize = stats.totalSize - processedSize;
      const remainingTime = speed > 0 ? remainingSize / speed : 0;
      
      const next = new Map(prev);
      next.set(fileUid, {
        ...stats,
        lastUpdateTime: now,
        lastProgress: progress,
        processedSize,
        speed,
        timeSpent: (now - stats.startTime) / 1000,
        remainingTime,
      });
      return next;
    });
    
    setFiles(prev => 
      prev.map(file => 
        file.uid === fileUid 
          ? { ...file, status, progress }
          : file
      )
    );
  };

  // 获取文件信息
  const getFileLocationInfo = (file) => {
    const lastModified = file.originFileObj?.lastModified ? new Date(file.originFileObj.lastModified) : null;
    
    return {
      name: file.name,
      size: formatFileSize(file.size),
      lastModified: lastModified ? lastModified.toLocaleString() : '未知',
      type: file.type || 'application/octet-stream'
    };
  };

  // 显示文件信息
  const handleShowFileInfo = (file) => {
    const fileInfo = getFileLocationInfo(file);
    
    Modal.info({
      title: '文件信息',
      width: 480,
      content: (
        <div style={{ 
          background: 'var(--ant-color-bg-container-disabled)', 
          padding: 16, 
          borderRadius: 8,
          marginTop: 16
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">文件名称：</Text>
              <Text copyable>{fileInfo.name}</Text>
            </div>
            <div>
              <Text type="secondary">文件大小：</Text>
              <Text>{fileInfo.size}</Text>
            </div>
            <div>
              <Text type="secondary">最后修改：</Text>
              <Text>{fileInfo.lastModified}</Text>
            </div>
            <div>
              <Text type="secondary">文件类型：</Text>
              <Text>{fileInfo.type}</Text>
            </div>
          </Space>
        </div>
      ),
    });
  };

  return (
    <App>
      <StyledPageContainer>
        <Helmet>
          <title>文件解密工具 - MyStorage</title>
          <meta name="description" content="安全的文件解密工具 - 在浏览器中本地解密您的文件，保护您的隐私" />
        </Helmet>
        
        <SimpleHeader />
        
        <StyledPageTitle>
          <Title level={2}>
            <LockOutlined /> MyStorage 文件解密工具
          </Title>
          <Text type="secondary" className="subtitle">
            安全、快速、无损地解密您的文件
          </Text>
        </StyledPageTitle>

        <StyledContentWrapper>
          <StyledTopSection>
            <StyledDecryptCard
              title={
                <Space>
                  <LockOutlined style={{ color: '#1677ff' }} />
                  <span>文件解密</span>
                  {files.length > 0 && (
                    <Tag color="blue">{files.length} 个文件</Tag>
                  )}
                </Space>
              }
            >
              <Button
                type="text"
                icon={<SafetyCertificateOutlined />}
                onClick={() => setSecurityTipVisible(true)}
                className="security-tip-btn"
              >
                安全提示
              </Button>
              <StyledDecryptLayout>
                <FileUploadSection
                  files={files}
                  maxFileSize={maxFileSize}
                  decrypting={decrypting}
                  selectedFiles={selectedFiles}
                  handleFileSelect={handleFileSelect}
                  handleStartDecrypt={handleStartDecrypt}
                  handleClearFiles={handleClearFiles}
                />

                <FileListSectionComponent
                  files={files}
                  selectedFiles={selectedFiles}
                  fileProgress={fileProgress}
                  fileStats={fileStats}
                  decrypting={decrypting}
                  handleSelectionChange={handleSelectionChange}
                  handleShowFileInfo={handleShowFileInfo}
                />
              </StyledDecryptLayout>
            </StyledDecryptCard>

            <SecurityFeatures />
            <DecryptStepsComponent />
          </StyledTopSection>
        </StyledContentWrapper>

        <PasswordModalComponent
          visible={passwordModalVisible}
          password={password}
          onPasswordChange={setPassword}
          onOk={handlePasswordConfirm}
          onCancel={() => {
            setPasswordModalVisible(false);
            setPassword('');
          }}
          decrypting={decrypting}
        />

        <SecurityTipModalComponent
          visible={securityTipVisible}
          onClose={() => setSecurityTipVisible(false)}
          isVipUser={isVipUser}
        />
      </StyledPageContainer>
    </App>
  );
};

export default FileDecryptPage; 