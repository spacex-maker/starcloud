import React, { useState } from 'react';
import { Layout, Typography, Upload, Input, Button, Card, Progress, message, Space, Divider, Tag, Table, Modal, Tooltip, Collapse, App } from 'antd';
import { 
  InboxOutlined, 
  LockOutlined, 
  SafetyCertificateOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
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

const PageTitle = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    margin: 0;
  }
  
  .subtitle {
    margin-top: 8px;
    color: var(--ant-color-text-secondary);
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
    
    h2 {
      font-size: 24px !important;
    }
    
    .subtitle {
      font-size: 14px;
    }
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
    const newFiles = info.fileList.map(file => ({
      ...file,
      status: 'pending',
      progress: 0
    }));
    
    // 验证文件格式
    const invalidFiles = newFiles.filter(file => !file.name.endsWith('.encrypted'));
    if (invalidFiles.length > 0) {
      message.error('请只选择带有 .encrypted 后缀的加密文件');
      return;
    }
    
    // 针对非会员用户的大文件限制
    if (!isVipUser) {
      const largeFiles = newFiles.filter(file => file.size > 4 * 1024 * 1024 * 1024); // 4GB
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
    
    // 检查是否有重复文件
    const existingFileNames = new Set(files.map(f => f.name));
    const duplicateFiles = newFiles.filter(file => existingFileNames.has(file.name));
    if (duplicateFiles.length > 0) {
      message.warning('已跳过重复的文件');
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    message.success('文件已添加到列表');
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
          downloadFile(decrypted, fileName);
          updateFileProgress(file.uid, 100, 'success');
        } catch (error) {
          console.error('文件解密失败:', file.name, error);
          updateFileProgress(file.uid, 0, 'error');
          message.error(`文件 ${file.name} 解密失败: ${error.message}`);
        }
      }

      setSelectedFiles([]); // 清空选择
      setPassword(''); // 清空密码
    } catch (error) {
      console.error('批量解密失败:', error);
      message.error('批量解密失败，请重试');
    } finally {
      setDecrypting(false);
    }
  };

  // 移除单个文件
  const handleRemoveFile = (file) => {
    setFiles(prev => prev.filter(f => f.uid !== file.uid));
    setFileProgress(prev => {
      const next = new Map(prev);
      next.delete(file.uid);
      return next;
    });
  };

  // 清空文件列表
  const handleClearFiles = () => {
    setFiles([]);
    setFileProgress(new Map());
    setSelectedFiles([]);
    setFileStats(new Map());
  };

  // 更新文件进度
  const updateFileProgress = (fileUid, progress, status = 'decrypting') => {
    const now = Date.now();
    
    setFileProgress(prev => {
      const next = new Map(prev);
      next.set(fileUid, { progress, status });
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
      
      const timeElapsed = (now - stats.lastUpdateTime) / 1000; // 转换为秒
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

  // 获取文件状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '等待解密';
      case 'decrypting': return '解密中';
      case 'success': return '解密成功';
      case 'error': return '解密失败';
      default: return '未知状态';
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined className="file-icon" />
          <div className="file-info">
            <Tooltip title={text}>
              <Text className="file-name">
                {getEllipsisFileName(text)}
              </Text>
            </Tooltip>
            <div className="file-size">
              {formatFileSize(record.size)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 280,
      render: (_, record) => {
        const fileStatus = fileProgress.get(record.uid) || { progress: 0, status: 'pending' };
        const stats = fileStats.get(record.uid);
        
        if (fileStatus.status === 'pending') {
          return <Tag>等待解密</Tag>;
        }
        
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space align="center" size={8} style={{ width: '100%' }}>
              <Progress
                percent={fileStatus.progress}
                size="small"
                status={
                  fileStatus.status === 'error' ? 'exception' :
                  fileStatus.status === 'success' ? 'success' :
                  'active'
                }
                style={{ flex: 1, minWidth: 100, maxWidth: 160 }}
              />
              <Tag color={
                fileStatus.status === 'success' ? 'success' :
                fileStatus.status === 'error' ? 'error' :
                fileStatus.status === 'decrypting' ? 'processing' :
                'default'
              }>
                {getStatusText(fileStatus.status)}
              </Tag>
            </Space>
            {(fileStatus.status === 'decrypting' || fileStatus.status === 'success') && stats && (
              <div style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
                <Space split={<Divider type="vertical" style={{ margin: '0 4px' }} />}>
                  {fileStatus.status === 'decrypting' && <span>速度：{formatSpeed(stats.speed)}</span>}
                  <span>用时：{formatTime(stats.timeSpent)}</span>
                  {fileStatus.status === 'decrypting' && <span>剩余：{formatTime(stats.remainingTime)}</span>}
                </Space>
              </div>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <App>
      <PageContainer>
        <Helmet>
          <title>文件解密工具 - MyStorage</title>
          <meta name="description" content="安全的文件解密工具 - 在浏览器中本地解密您的文件，保护您的隐私" />
        </Helmet>
        
        <SimpleHeader />
        
        <PageTitle>
          <Title level={2}>
            <LockOutlined /> MyStorage 文件解密工具
          </Title>
          <Text type="secondary" className="subtitle">
            安全、快速、无损地解密您的文件
          </Text>
        </PageTitle>

        <ContentWrapper>
          <TopSection>
            <DecryptCard
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
              <DecryptLayout>
                <UploadSection>
                  <div className="upload-area">
                    <Dragger
                      accept=".encrypted"
                      beforeUpload={() => false}
                      onChange={handleFileSelect}
                      showUploadList={false}
                      multiple={true}
                      fileList={files}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        点击或拖拽文件
                      </p>
                      <p className="ant-upload-hint">
                        支持批量添加 .encrypted 文件，单个文件最大 {formatFileSize(maxFileSize)}
                      </p>
                    </Dragger>
                  </div>

                  <div className="action-buttons">
                    <Button
                      type="primary"
                      icon={<LockOutlined />}
                      onClick={handleStartDecrypt}
                      loading={decrypting}
                      disabled={selectedFiles.length === 0}
                    >
                      解密选中文件
                    </Button>
                    {files.length > 0 && (
                      <Button
                        danger
                        onClick={handleClearFiles}
                        disabled={decrypting}
                      >
                        清空列表
                      </Button>
                    )}
                  </div>
                </UploadSection>

                <FileListSection>
                  <Table
                    rowSelection={{
                      selectedRowKeys: selectedFiles,
                      onChange: handleSelectionChange,
                      getCheckboxProps: (record) => ({
                        disabled: record.status !== 'pending' || decrypting,
                      }),
                    }}
                    columns={columns}
                    dataSource={files}
                    rowKey="uid"
                    pagination={false}
                    size="middle"
                    locale={{
                      emptyText: '暂无文件，请添加需要解密的文件'
                    }}
                  />
                </FileListSection>
              </DecryptLayout>
            </DecryptCard>

            <SecurityFeatures />

            <StepsCard
              title={
                <Space>
                  <SafetyOutlined style={{ color: '#1677ff' }} />
                  <span>解密步骤</span>
                </Space>
              }
            >
              <StepsGrid>
                <StepItem>
                  <div className="step-number">1</div>
                  <InboxOutlined className="step-icon" />
                  <h4>选择加密文件</h4>
                  <p>选择使用 MyStorage 加密工具加密的 .encrypted 文件，支持拖拽或点击选择</p>
                </StepItem>
                
                <StepItem>
                  <div className="step-number">2</div>
                  <LockOutlined className="step-icon" />
                  <h4>输入解密密码</h4>
                  <p>输入加密时设置的密码，密码将仅用于本地解密，不会被传输或存储</p>
                </StepItem>
                
                <StepItem>
                  <div className="step-number">3</div>
                  <SafetyCertificateOutlined className="step-icon" />
                  <h4>开始解密</h4>
                  <p>点击按钮后，系统将使用 AES-256-CBC 算法在本地解密您的文件</p>
                </StepItem>
                
                <StepItem>
                  <div className="step-number">4</div>
                  <CheckCircleOutlined className="step-icon" />
                  <h4>获取原始文件</h4>
                  <p>解密完成后，原始文件将自动下载，解密过程完全无损，保证文件完整性</p>
                </StepItem>
              </StepsGrid>
            </StepsCard>
          </TopSection>
        </ContentWrapper>

        <Modal
          title="输入解密密码"
          open={passwordModalVisible}
          onOk={handlePasswordConfirm}
          onCancel={() => {
            setPasswordModalVisible(false);
            setPassword('');
          }}
          confirmLoading={decrypting}
        >
          <Input.Password
            placeholder="请输入解密密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: 16 }}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            请输入加密时设置的密码，密码将仅用于本地解密
          </Text>
        </Modal>

        <Modal
          title={
            <Space>
              <SafetyCertificateOutlined />
              <span>安全提示</span>
            </Space>
          }
          open={securityTipVisible}
          onOk={() => setSecurityTipVisible(false)}
          onCancel={() => setSecurityTipVisible(false)}
          width={600}
        >
          <div style={{ padding: '8px 0' }}>
            <p>所有解密操作均在本地完成，您的密码和文件内容不会上传到服务器</p>
            {isVipUser ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: '#52c41a', fontWeight: 500 }}>
                  尊敬的会员用户，您可以：
                </p>
                <ul style={{ color: '#52c41a', marginTop: 8, paddingLeft: 16 }}>
                  <li>解密任意大小的文件</li>
                  <li>使用智能分块解密功能，更高效且节省内存</li>
                  <li>支持批量解密多个大文件</li>
                </ul>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: '#ff4d4f', fontWeight: 500 }}>
                  重要提示：解密过程需要在浏览器内存中进行，实际内存占用约为文件大小的3倍。
                </p>
                <ul style={{ color: '#ff4d4f', marginTop: 8, paddingLeft: 16 }}>
                  <li>非会员用户单个文件大小限制为4GB</li>
                  <li>开通会员后可解密任意大小文件，并支持分块解密</li>
                  <li>如果出现浏览器崩溃，建议开通会员使用分块解密功能</li>
                </ul>
              </div>
            )}
          </div>
        </Modal>
      </PageContainer>
    </App>
  );
};

export default FileDecryptPage; 