import React from 'react';
import { Table, Space, Button, Tooltip, Typography, Grid } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FileImageOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { styled } from 'twin.macro';

const { Text } = Typography;
const { useBreakpoint } = Grid;

// 从原文件复制相关样式
const TableActionButton = styled(Button)`
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  box-shadow: none;
  
  &:hover {
    background-color: ${props => props.danger 
      ? 'var(--ant-color-error-bg)'
      : `color-mix(in srgb, var(--ant-color-primary) 8%, transparent)`};
    color: ${props => props.danger 
      ? 'var(--ant-color-error)'
      : 'var(--ant-color-primary)'};
  }
`;

// 添加文件名容器样式
const FileNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .filename-text {
    flex: 1;
    min-width: 0;
  }
  
  .preview-button {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover .preview-button {
    opacity: 1;
  }
`;

// 添加智能省略函数
const getSmartEllipsis = (filename) => {
  if (filename.length <= 30) return filename;
  
  const ext = filename.lastIndexOf('.') !== -1 
    ? filename.slice(filename.lastIndexOf('.')) 
    : '';
  
  const name = filename.slice(0, filename.length - ext.length);
  const start = name.slice(0, 15);
  const end = name.slice(-10);
  
  return `${start}...${end}${ext}`;
};

const FileList = ({
  loading,
  filteredFiles,
  searchText,
  handleFolderClick,
  handlePreview,
  handleDelete,
  isImageFile,
  selectedRowKeys,
  onSelectChange,
  onDownload,
  pagination,
  onPageChange
}) => {
  const screens = useBreakpoint();

  // 响应式列配置
  const getResponsiveColumns = () => {
    const baseColumns = [
      {
        title: '文件名',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: screens.md ? '40%' : '100%',
        render: (text, record) => (
          <FileNameContainer>
            <Space>
              {record.type === 'folder' ? (
                <FolderOutlined style={{ color: '#ffd591', fontSize: '16px' }} />
              ) : isImageFile(text) ? (
                <FileImageOutlined style={{ color: '#85a5ff', fontSize: '16px' }} />
              ) : (
                <FileOutlined style={{ color: '#91d5ff', fontSize: '16px' }} />
              )}
              <Tooltip title={text}>
                <Text
                  className="filename-text"
                  style={{ 
                    cursor: record.type === 'folder' ? 'pointer' : 'default',
                    color: record.type === 'folder' ? 'var(--ant-color-primary)' : 'inherit'
                  }}
                  onClick={() => {
                    if (record.type === 'folder') {
                      handleFolderClick(record);
                    }
                  }}
                >
                  {getSmartEllipsis(text)}
                </Text>
              </Tooltip>
            </Space>
            {record.type === 'file' && isImageFile(text) && record.downloadUrl && (
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record)}
                className="preview-button"
              >
                {screens.md && '预览'}
              </Button>
            )}
          </FileNameContainer>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: screens.md ? 180 : 120,
        fixed: screens.md ? 'right' : false,
        align: 'center',
        render: (_, record) => (
          <Space size={4}>
            {record.type === 'file' && record.downloadUrl && (
              <TableActionButton
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => onDownload(record)}
              >
                {screens.md && '下载'}
              </TableActionButton>
            )}
            <TableActionButton
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              {screens.md && '删除'}
            </TableActionButton>
          </Space>
        ),
      }
    ];

    // 在桌面端添加额外的列
    if (screens.md) {
      baseColumns.splice(1, 0, 
        {
          title: '大小',
          dataIndex: 'size',
          key: 'size',
          width: '15%',
          align: 'right',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: '20%',
          align: 'center',
        },
        {
          title: '修改时间',
          dataIndex: 'updateTime',
          key: 'updateTime',
          width: '20%',
          align: 'center',
        }
      );
    }

    return baseColumns;
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: record.type === 'folder',
      style: { opacity: record.type === 'folder' ? 0.5 : 1 },
    }),
  };

  return (
    <Table
      columns={getResponsiveColumns()}
      dataSource={filteredFiles}
      loading={loading}
      pagination={{
        current: pagination.currentPage,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: screens.md,
        showQuickJumper: screens.md,
        showTotal: screens.md ? (total) => `共 ${total} 项` : undefined,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
        size: screens.md ? 'default' : 'small'
      }}
      locale={{
        emptyText: searchText ? '没有找到相关文件' : '当前文件夹为空'
      }}
      scroll={{
        y: screens.md ? 'calc(100vh - 300px)' : 'calc(100vh - 240px)',
        x: screens.md ? 1200 : undefined
      }}
      size={screens.md ? 'middle' : 'small'}
      rowKey="key"
      rowSelection={rowSelection}
    />
  );
};

export default FileList; 