import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Progress, Table, Space, Badge, Tooltip, Typography, message, Upload, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { AlignType } from 'rc-table/lib/interface';
import type { ButtonType } from 'antd/es/button';
import type { BaseButtonProps } from 'antd/es/button/button';
import { 
  WarningFilled,
  DeleteOutlined,
  PlusOutlined,
  LockOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { getEllipsisFileName, formatFileSize as formatBytes, formatSpeed, formatTime } from '../../utils/format';
import { getFileIcon } from '../../utils/fileIcon';
import { getStatusIcon, getStatusText } from '../../utils/uploadStatus';
import { FormattedMessage, useIntl } from 'react-intl';
import FileEncryptModal from './FileEncryptModal';

const { Text } = Typography;

// 样式组件
const FileName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
  
  .file-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
`;

const FileSize = styled.span`
  color: var(--ant-color-text-secondary);
  font-size: 12px;
`;

const ProgressText = styled.span`
  color: var(--ant-color-text);
  font-size: 12px;
  white-space: nowrap;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

const TotalProgressText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

const DuplicateTag = styled.span`
  color: #faad14;
  font-size: 12px;
  margin-left: 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ChunkUploadTag = styled(DuplicateTag)`
  color: #1890ff;
`;

interface UploadFile {
  file: File;
  name: string;
  fileSize: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'paused' | 'creating' | 'skipped';
  progress?: number;
  speed?: number;
  isDuplicate?: boolean;
  isEncrypted?: boolean;
  useChunkUpload?: boolean;
  taskId?: string;
  errorMessage?: string;
}

interface DesktopFileUploadModalProps {
  visible: boolean;
  uploadingFiles: Map<string, UploadFile>;
  isUploading: boolean;
  onStartUpload: () => void;
  onCancel: () => void;
  onDuplicateDecision: (fileName: string, action: string) => void;
  onRemoveFiles: (fileNames: string[]) => void;
  onAddFiles: (files: any[]) => void;
  onEncryptFiles: (files: any[], callback: (encryptedFiles: any[], originalFiles: any[]) => void) => void;
  onEncryptComplete: (encryptedFiles: any[], originalFiles: any[]) => void;
  existingFiles: any[];
  onPauseUpload: (taskId: string) => void;
  onResumeUpload: (taskId: string) => void;
  setUploadStates: React.Dispatch<React.SetStateAction<{
    files: Map<string, UploadFile>;
    isUploading: boolean;
  }>>;
}

const DesktopFileUploadModal: React.FC<DesktopFileUploadModalProps> = ({
  visible,
  uploadingFiles = new Map(),
  isUploading = false,
  onStartUpload,
  onCancel,
  onDuplicateDecision,
  onRemoveFiles = () => {
    console.warn('onRemoveFiles callback is not provided');
    message.warning('移除文件功能未实现');
  },
  onAddFiles = () => {
    console.warn('onAddFiles callback is not provided');
    message.warning('添加文件功能未实现');
  },
  onEncryptFiles = () => {
    console.warn('onEncryptFiles callback is not provided');
    message.warning('加密文件功能未实现');
  },
  onPauseUpload = () => {
    console.warn('onPauseUpload callback is not provided');
    message.warning('暂停上传功能未实现');
  },
  onResumeUpload = () => {
    console.warn('onResumeUpload callback is not provided');
    message.warning('恢复上传功能未实现');
  },
  onEncryptComplete,
  existingFiles = [],
  setUploadStates,
}) => {
  const intl = useIntl();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { token } = theme.useToken();

  // 添加加密模态框的状态
  const [encryptModalVisible, setEncryptModalVisible] = useState(false);
  const [selectedFilesToEncrypt, setSelectedFilesToEncrypt] = useState<File[]>([]);

  // 监听文件列表变化，设置全选状态
  useEffect(() => {
    if (uploadingFiles.size > 0) {
      const pendingFiles = Array.from(uploadingFiles.values())
        .filter(file => file.status === 'pending')
        .map(file => file.file.name);
      setSelectedRowKeys(pendingFiles);
    }
  }, [uploadingFiles]);

  // 统计不同类型的文件数量
  const fileStats = useMemo(() => {
    const total = uploadingFiles.size;
    const duplicates = Array.from(uploadingFiles.values()).filter(f => f.isDuplicate).length;
    const succeeded = Array.from(uploadingFiles.values()).filter(f => f.status === 'success').length;
    const failed = Array.from(uploadingFiles.values()).filter(f => f.status === 'error').length;
    const uploading = Array.from(uploadingFiles.values()).filter(f => f.status === 'uploading' || f.status === 'creating').length;
    const skipped = Array.from(uploadingFiles.values()).filter(f => f.status === 'skipped').length;
    const progress = total > 0 
      ? Math.round((succeeded + failed) / total * 100) 
      : 0;
      
    return {
      total,
      duplicates,
      succeeded,
      failed,
      uploading,
      skipped,
      progress
    };
  }, [uploadingFiles]);

  // 计算上传进度和速度信息
  const uploadStats = useMemo(() => {
    if (fileStats.total === 0 || !isUploading) {
      return {
        progress: 0,
        speed: 0,
        remainingTime: 0,
        totalSize: 0,
        uploadedSize: 0
      };
    }
    
    const validFiles = Array.from(uploadingFiles.values()).filter(
      file => file.status !== 'skipped' && file.status !== 'error'
    );
    
    if (validFiles.length === 0) return { progress: 0, speed: 0, remainingTime: 0, totalSize: 0, uploadedSize: 0 };
    
    let totalSize = 0;
    let uploadedSize = 0;
    let currentSpeed = 0;
    
    validFiles.forEach(file => {
      totalSize += file.fileSize;
      
      if (file.status === 'success') {
        uploadedSize += file.fileSize;
      } else if (file.status === 'uploading' || file.status === 'creating') {
        uploadedSize += (file.fileSize * (file.progress || 0)) / 100;
        if (file.speed) {
          currentSpeed += file.speed;
        }
      }
    });
    
    const progress = Math.round((uploadedSize / totalSize) * 100);
    const remainingSize = totalSize - uploadedSize;
    const remainingTime = currentSpeed > 0 ? remainingSize / currentSpeed : 0;
    
    return {
      progress,
      speed: currentSpeed,
      remainingTime,
      totalSize,
      uploadedSize
    };
  }, [uploadingFiles, isUploading, fileStats.total]);

  // 处理批量移除
  const handleBatchRemove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(intl.formatMessage({ id: 'modal.fileUpload.error.noSelection' }));
      return;
    }
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles(selectedRowKeys.map(key => key.toString()));
      setSelectedRowKeys([]);
    }
  };

  // 处理单个文件移除
  const handleSingleRemove = (fileName: string) => {
    if (typeof onRemoveFiles === 'function') {
      onRemoveFiles([fileName]);
    }
  };

  // 处理加密文件
  const handleEncryptFiles = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(intl.formatMessage({ id: 'modal.fileUpload.error.noSelection' }));
      return;
    }

    const selectedFiles = Array.from(uploadingFiles.values())
      .filter(file => selectedRowKeys.includes(file.file.name))
      .map(file => file.file);

    setSelectedFilesToEncrypt(selectedFiles);
    setEncryptModalVisible(true);
  };

  // 处理加密完成
  const handleEncryptComplete = (encryptedFiles: File[], originalFiles: File[]) => {
    if (typeof onEncryptComplete === 'function') {
      onEncryptComplete(encryptedFiles, originalFiles);
    }
    setSelectedRowKeys([]);
    setEncryptModalVisible(false);
  };

  // 处理分片上传标记
  const handleMarkChunkUpload = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(intl.formatMessage({ id: 'modal.fileUpload.error.noSelection' }));
      return;
    }

    const newFiles = new Map(uploadingFiles);
    selectedRowKeys.forEach(fileName => {
      const file = newFiles.get(fileName.toString());
      if (file) {
        newFiles.set(fileName.toString(), {
          ...file,
          useChunkUpload: true
        });
      }
    });

    setUploadStates(prev => ({
      ...prev,
      files: newFiles
    }));
    message.success('已标记选中文件为分片上传');
  };

  // 表格列定义
  const columns: ColumnsType<UploadFile> = [
    {
      title: <FormattedMessage id="modal.fileUpload.table.filename" />,
      dataIndex: 'name',
      key: 'name',
      align: 'left' as AlignType,
      width: '70%',
      ellipsis: true,
      render: (text: string, record: UploadFile) => (
        <FileName>
          <div className="file-header">
            {getFileIcon(record.file?.name || text)}
            <Tooltip title={record.file?.name || text}>
              <Text className="name" ellipsis>{getEllipsisFileName(record.file?.name || text)}</Text>
            </Tooltip>
            {record.isDuplicate && (
              <DuplicateTag>
                <WarningFilled />
                重复文件
              </DuplicateTag>
            )}
            {record.isEncrypted && (
              <DuplicateTag style={{ color: token.colorSuccess }}>
                <LockOutlined />
                已加密
              </DuplicateTag>
            )}
            {record.useChunkUpload && (
              <ChunkUploadTag>
                <CloudUploadOutlined />
                分片上传
              </ChunkUploadTag>
            )}
          </div>
          <div className="file-info">
            {(record.status === 'uploading' || record.status === 'creating') ? (
              <Space direction="vertical" size={1} style={{ flex: 1 }}>
                <Progress 
                  percent={record.progress || 0} 
                  size="small" 
                  status={'active'}
                  style={{ margin: 0, lineHeight: 1 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ProgressText>
                    <span className="uploaded">{formatBytes(record.fileSize * (record.progress || 0) / 100)}</span>
                    <span className="total"> / {formatBytes(record.fileSize)}</span>
                  </ProgressText>
                  {record.speed && record.speed > 0 && (
                    <span className="speed" style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
                      {formatSpeed(record.speed)}
                    </span>
                  )}
                </div>
              </Space>
            ) : (
              <FileSize>{formatBytes(record.fileSize)}</FileSize>
            )}
          </div>
        </FileName>
      ),
    },
    {
      title: <FormattedMessage id="modal.fileUpload.table.status" />,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center' as AlignType,
      render: (_: any, record: UploadFile) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text type={
            record.status === 'success' ? 'success' :
            record.status === 'error' ? 'danger' :
            'secondary'
          }>
            {getStatusText(record.status, record.isDuplicate || false)}
          </Text>
        </Space>
      ),
    },
    {
      title: <FormattedMessage id="modal.fileUpload.table.actions" />,
      key: 'actions',
      width: 100,
      align: 'center' as AlignType,
      fixed: 'right' as const,
      render: (_: any, record: UploadFile) => {
        if (record.status === 'pending') {
          return (
            <Space>
              <Tooltip title="移除">
                <DeleteOutlined
                  style={{ color: '#ff4d4f', cursor: 'pointer' }}
                  onClick={() => handleSingleRemove(record.file.name)}
                />
              </Tooltip>
            </Space>
          );
        }
        if (record.status === 'uploading') {
          return (
            <Space>
              <Tooltip title="暂停">
                <PauseCircleOutlined
                  style={{ color: token.colorPrimary, cursor: 'pointer' }}
                  onClick={() => {
                    console.log('点击暂停按钮，文件信息:', record);
                    if (record.taskId) {
                      console.log('调用暂停上传，taskId:', record.taskId);
                      onPauseUpload(record.taskId);
                    } else {
                      console.log('没有找到 taskId');
                      message.error('无法暂停上传：找不到上传任务');
                    }
                  }}
                />
              </Tooltip>
            </Space>
          );
        }
        if (record.status === 'paused') {
          return (
            <Space>
              <Tooltip title="继续">
                <PlayCircleOutlined
                  style={{ color: token.colorSuccess, cursor: 'pointer' }}
                  onClick={() => record.taskId && onResumeUpload(record.taskId)}
                />
              </Tooltip>
            </Space>
          );
        }
        if (record.status === 'error') {
          return (
            <Tooltip title={record.errorMessage || '上传失败'}>
              <Text type="danger">失败</Text>
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  // 表格数据
  const tableData = useMemo(() => {
    return Array.from(uploadingFiles.values()).map(file => ({
      ...file,
      key: file.file.name, // 添加key属性用于选择功能
    }));
  }, [uploadingFiles]);

  // 表格选择配置
  const rowSelection: TableRowSelection<UploadFile> = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: UploadFile[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record: UploadFile) => ({
      disabled: record.status !== 'pending',
    }),
  };

  // 计算是否可以开始上传
  const canStartUpload = useMemo(() => {
    return !isUploading && Array.from(uploadingFiles.values()).some(file => 
      file.status === 'pending'
    );
  }, [isUploading, uploadingFiles]);

  return (
    <>
      <Modal
        open={visible}
        title={<FormattedMessage id="modal.fileUpload.title" />}
        width={800}
        maskClosable={false}
        closable={!isUploading}
        onCancel={onCancel}
        footer={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <Space size="middle">
              <Button 
                icon={<LockOutlined />}
                onClick={handleEncryptFiles} 
                disabled={isUploading || selectedRowKeys.length === 0}
              >
                <FormattedMessage id="modal.fileUpload.encrypt" />
              </Button>
              <Button 
                onClick={handleBatchRemove} 
                disabled={isUploading}
              >
                <FormattedMessage id="modal.fileUpload.clear" />
              </Button>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={handleMarkChunkUpload}
                disabled={isUploading || selectedRowKeys.length === 0}
              >
                <FormattedMessage id="modal.fileUpload.markChunkUpload" defaultMessage="分片上传" />
              </Button>
            </Space>
            <Space size="middle">
              <Button 
                onClick={onCancel}
                disabled={isUploading}
              >
                <FormattedMessage id="modal.fileUpload.cancel" />
              </Button>
              <Button
                type="primary"
                onClick={onStartUpload}
                disabled={!canStartUpload}
              >
                <FormattedMessage id="modal.fileUpload.start" />
              </Button>
            </Space>
          </div>
        }
        styles={{ 
          body: {
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {isUploading && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space>
                <Text>总进度</Text>
                <Text style={{ color: token.colorPrimary }}>{uploadStats.progress}%</Text>
              </Space>
              <Space>
                <Text type="secondary">速度：{formatSpeed(uploadStats.speed)}</Text>
                <Text type="secondary">剩余时间：{formatTime(uploadStats.remainingTime)}</Text>
              </Space>
            </div>
            <Progress 
              percent={uploadStats.progress} 
              status={uploadStats.progress === 100 ? 'success' : 'active'} 
              strokeColor={{
                '0%': token.colorPrimary,
                '100%': token.colorSuccess,
              }}
            />
            <TotalProgressText>
              已上传：<span className="uploaded">{formatBytes(uploadStats.uploadedSize)}</span>
              <span className="total"> / {formatBytes(uploadStats.totalSize)}</span>
            </TotalProgressText>
          </div>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Upload
              showUploadList={false}
              multiple
              beforeUpload={(file, fileList) => {
                // 检查文件是否与现有文件重复
                const duplicateFiles = fileList.filter(newFile => 
                  existingFiles.some(existingFile => existingFile.name === newFile.name) ||
                  Array.from(uploadingFiles.keys()).includes(newFile.name)
                );
                
                // 如果有重复文件，标记它们
                if (duplicateFiles.length > 0) {
                  const filesWithDuplicateFlag = fileList.map(file => ({
                    file,
                    isDuplicate: existingFiles.some(existingFile => existingFile.name === file.name) ||
                                Array.from(uploadingFiles.keys()).includes(file.name)
                  }));
                  onAddFiles(filesWithDuplicateFlag);
                } else {
                  onAddFiles(fileList.map(file => ({ file, isDuplicate: false })));
                }
                return false;
              }}
              disabled={isUploading}
            >
              <Button 
                icon={<PlusOutlined />}
                disabled={isUploading}
              >
                <FormattedMessage id="modal.fileUpload.addMore" />
              </Button>
            </Upload>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchRemove}
              disabled={isUploading || selectedRowKeys.length === 0}
            >
              <FormattedMessage id="modal.fileUpload.remove" defaultMessage="移除" />
            </Button>
          </Space>
        </div>
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="small"
          scroll={{ y: 350, x: 'max-content' }}
          locale={{
            emptyText: '没有选择文件'
          }}
          style={{ 
            width: '100%',
            overflowX: 'auto'
          }}
        />
      </Modal>
      
      <FileEncryptModal
        visible={encryptModalVisible}
        files={selectedFilesToEncrypt}
        onCancel={() => setEncryptModalVisible(false)}
        onEncryptComplete={handleEncryptComplete}
      />
    </>
  );
};

export default DesktopFileUploadModal; 