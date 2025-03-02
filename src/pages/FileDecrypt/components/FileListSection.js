import React from 'react';
import { Table, Space, Tag, Progress, Button, Tooltip, Divider, Typography } from 'antd';
import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { formatFileSize, formatSpeed, formatTime, getEllipsisFileName } from '../../../utils';
import { StyledFileListSection } from '../styles/StyledComponents';

const { Text } = Typography;

const FileListSection = ({
  files,
  selectedFiles,
  fileProgress,
  fileStats,
  decrypting,
  handleSelectionChange,
  handleShowFileInfo
}) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '等待解密';
      case 'decrypting': return '解密中';
      case 'success': return '解密成功';
      case 'error': return '解密失败';
      default: return '未知状态';
    }
  };

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
              {fileStatus.status === 'error' && fileStatus.errorMessage ? (
                <Tooltip title={fileStatus.errorMessage}>
                  <Tag 
                    color="error" 
                    style={{ cursor: 'pointer' }}
                  >
                    解密失败
                  </Tag>
                </Tooltip>
              ) : (
                <Tag color={
                  fileStatus.status === 'success' ? 'success' :
                  fileStatus.status === 'error' ? 'error' :
                  fileStatus.status === 'decrypting' ? 'processing' :
                  'default'
                }>
                  {getStatusText(fileStatus.status)}
                </Tag>
              )}
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
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => {
        const fileStatus = fileProgress.get(record.uid) || { progress: 0, status: 'pending' };
        return (
          <Space size={4}>
            <Tooltip title="查看文件信息">
              <Button
                type="text"
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => handleShowFileInfo(record)}
              >
                文件信息
              </Button>
            </Tooltip>
          </Space>
        );
      },
    }
  ];

  return (
    <StyledFileListSection>
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
    </StyledFileListSection>
  );
};

export default FileListSection; 