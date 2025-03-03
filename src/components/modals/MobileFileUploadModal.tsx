import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Progress, List, Space, Badge, Tooltip, Typography, message, Upload, theme } from 'antd';
import { 
  WarningFilled,
  DeleteOutlined,
  PlusOutlined,
  LockOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CloudUploadOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { getEllipsisFileName, formatFileSize as formatBytes, formatSpeed, formatTime } from '../../utils/format';
import { getFileIcon } from '../../utils/fileIcon';
import { getStatusIcon, getStatusText } from '../../utils/uploadStatus';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  FileList,
  FileItem,
  SelectIndicator,
  FileHeader,
  FileProgress,
  ActionBar,
  UploadProgress,
  DuplicateTag
} from './MobileFileUploadModal.styles';

const { Text } = Typography;

interface MobileFileUploadModalProps {
  visible: boolean;
  uploadingFiles: Map<string, any>;
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
    files: Map<string, any>;
    isUploading: boolean;
  }>>;
}

const MobileFileUploadModal: React.FC<MobileFileUploadModalProps> = ({
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const { token } = theme.useToken();

  // 统计不同类型的文件数量
  const fileStats = useMemo(() => {
    const total = uploadingFiles.size;
    const duplicates = [...uploadingFiles.values()].filter(f => f.isDuplicate).length;
    const succeeded = [...uploadingFiles.values()].filter(f => f.status === 'success').length;
    const failed = [...uploadingFiles.values()].filter(f => f.status === 'error').length;
    const uploading = [...uploadingFiles.values()].filter(f => f.status === 'uploading' || f.status === 'creating').length;
    const skipped = [...uploadingFiles.values()].filter(f => f.status === 'skipped').length;
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
      onRemoveFiles(selectedRowKeys);
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

    if (typeof onEncryptFiles === 'function') {
      onEncryptFiles(selectedFiles, (encryptedFiles, originalFiles) => {
        if (typeof onEncryptComplete === 'function') {
          onEncryptComplete(encryptedFiles, originalFiles);
        }
        setSelectedRowKeys([]);
      });
    }
  };

  // 处理分片上传标记
  const handleMarkChunkUpload = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(intl.formatMessage({ id: 'modal.fileUpload.error.noSelection' }));
      return;
    }

    const newFiles = new Map(uploadingFiles);
    selectedRowKeys.forEach(fileName => {
      const file = newFiles.get(fileName);
      if (file) {
        newFiles.set(fileName, {
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

  // 渲染文件列表项
  const renderItem = (item: any) => {
    const isSelected = selectedRowKeys.includes(item.file.name);
    const fileProgress = item.progress || 0;
    const fileSpeed = item.speed || 0;

    return (
      <FileItem 
        selected={isSelected}
        onClick={() => {
          if (item.status === 'pending') {
            if (isSelected) {
              setSelectedRowKeys(prev => prev.filter(key => key !== item.file.name));
            } else {
              setSelectedRowKeys(prev => [...prev, item.file.name]);
            }
          }
        }}
        $token={token}
      >
        <SelectIndicator className="select-indicator" $token={token}>
          <CheckOutlined />
        </SelectIndicator>

        <FileHeader $token={token}>
          <div className="icon">
            {getFileIcon(item.file.name)}
          </div>
          <div className="info">
            <div className="name">
              {getEllipsisFileName(item.file.name)}
              {item.isDuplicate && (
                <DuplicateTag $token={token}>
                  <WarningFilled />
                  <span>重复文件</span>
                </DuplicateTag>
              )}
              {item.useChunkUpload && (
                <DuplicateTag style={{ color: token.colorPrimary }} $token={token}>
                  <CloudUploadOutlined />
                  <span>分片上传</span>
                </DuplicateTag>
              )}
            </div>
            <div className="meta">
              <span className="size">{formatBytes(item.fileSize)}</span>
            </div>
          </div>
        </FileHeader>

        <FileProgress $token={token}>
          <div className="status">
            {getStatusIcon(item.status)}
            <Text type={
              item.status === 'success' ? 'success' :
              item.status === 'error' ? 'danger' :
              'secondary'
            }>
              {getStatusText(item.status, item.isDuplicate)}
            </Text>
          </div>

          {(item.status === 'uploading' || item.status === 'creating') && (
            <>
              <Progress 
                percent={fileProgress} 
                size="small"
                status={item.status === 'error' ? 'exception' : 'active'}
              />
              <div className="progress-text">
                <span>{formatBytes(item.fileSize * fileProgress / 100)} / {formatBytes(item.fileSize)}</span>
                {fileSpeed > 0 && <span>{formatSpeed(fileSpeed)}</span>}
              </div>
            </>
          )}
        </FileProgress>

        {item.status === 'pending' && (
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleSingleRemove(item.file.name);
            }}
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
            }}
          />
        )}

        {item.status === 'uploading' && (
          <Button
            type="text"
            icon={<PauseCircleOutlined style={{ color: token.colorPrimary }} />}
            onClick={(e) => {
              e.stopPropagation();
              if (item.taskId) {
                onPauseUpload(item.taskId);
              } else {
                message.error('无法暂停上传：找不到上传任务');
              }
            }}
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
            }}
          />
        )}

        {item.status === 'paused' && (
          <Button
            type="text"
            icon={<PlayCircleOutlined style={{ color: token.colorSuccess }} />}
            onClick={(e) => {
              e.stopPropagation();
              onResumeUpload(item.taskId);
            }}
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
            }}
          />
        )}
      </FileItem>
    );
  };

  return (
    <Modal
      open={visible}
      title={<FormattedMessage id="modal.fileUpload.title" />}
      width="100%"
      style={{ top: 0 }}
      bodyStyle={{ 
        minHeight: '100vh',
        padding: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
      maskClosable={false}
      closable={!isUploading}
      onCancel={onCancel}
      footer={null}
    >
      {isUploading ? (
        <UploadProgress $token={token}>
          <div className="header">
            <div className="title">
              {uploadStats.progress}%
            </div>
            <div className="speed">
              {formatSpeed(uploadStats.speed)}
            </div>
          </div>
          <Progress 
            percent={uploadStats.progress} 
            status={uploadStats.progress === 100 ? 'success' : 'active'} 
            strokeColor={{
              '0%': token.colorPrimary,
              '100%': token.colorSuccess,
            }}
          />
          <div className="total">
            <span>已上传：{formatBytes(uploadStats.uploadedSize)} / {formatBytes(uploadStats.totalSize)}</span>
            <span>剩余时间：{formatTime(uploadStats.remainingTime)}</span>
          </div>
        </UploadProgress>
      ) : (
        <ActionBar $token={token}>
          <Space>
            <Upload
              showUploadList={false}
              multiple
              beforeUpload={(file, fileList) => {
                const duplicateFiles = fileList.filter(newFile => 
                  existingFiles.some(existingFile => existingFile.name === newFile.name) ||
                  Array.from(uploadingFiles.keys()).includes(newFile.name)
                );
                
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
                type="primary"
                icon={<PlusOutlined />}
                disabled={isUploading}
              >
                添加文件
              </Button>
            </Upload>
            <Button
              icon={<LockOutlined />}
              onClick={handleEncryptFiles}
              disabled={isUploading || selectedRowKeys.length === 0}
            >
              加密
            </Button>
            <Button
              icon={<CloudUploadOutlined />}
              onClick={handleMarkChunkUpload}
              disabled={isUploading || selectedRowKeys.length === 0}
            >
              分片上传
            </Button>
          </Space>
        </ActionBar>
      )}

      <FileList
        dataSource={Array.from(uploadingFiles.values())}
        renderItem={renderItem}
      />

      {!isUploading && uploadingFiles.size > 0 && (
        <div style={{ padding: '16px' }}>
          <Button
            type="primary"
            block
            size="large"
            onClick={onStartUpload}
            style={{ borderRadius: '8px' }}
          >
            开始上传
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default MobileFileUploadModal; 