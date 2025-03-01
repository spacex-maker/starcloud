import React, { memo, useMemo } from 'react';
import type { FC } from 'react';
import { Table, Space, Button, Typography, TablePaginationConfig, theme, Pagination } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FileImageOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { formatFileSize, isImageFile } from 'utils/format';
import { FileModel } from 'models/file/FileModel';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { useToken } = theme;

type FileListProps = {
  loading: boolean;
  filteredFiles: FileModel[];
  searchText: string;
  handleFolderClick: (record: FileModel) => void;
  handlePreview: (record: FileModel) => void;
  handleDelete: (record: FileModel) => void;
  handleBatchDelete: (files: FileModel[]) => void;
  handleBatchDownload: (files: FileModel[]) => void;
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedRowKeys: React.Key[]) => void;
  onDownload: (record: FileModel) => void;
  pagination: TablePaginationConfig;
  onPageChange: (page: number, pageSize: number) => void;
};

const FileIcon: FC<{ 
  isDirectory: boolean; 
  fileName: string; 
  token: any;
}> = memo(({ isDirectory, fileName, token }) => {
  if (isDirectory) {
    return <FolderOutlined style={{ fontSize: '16px', color: token.colorPrimary }} />;
  }
  
  if (isImageFile(fileName)) {
    return <FileImageOutlined style={{ fontSize: '16px', color: token.colorInfo }} />;
  }
  
  return <FileOutlined style={{ fontSize: '16px' }} />;
});

const FileList: FC<FileListProps> = ({
  loading,
  filteredFiles,
  handleFolderClick,
  handlePreview,
  handleDelete,
  handleBatchDelete,
  handleBatchDownload,
  selectedRowKeys,
  onSelectChange,
  onDownload,
  pagination,
  onPageChange,
}) => {
  const { token } = useToken();

  const columns: ColumnsType<FileModel> = useMemo(() => [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string, record: FileModel) => (
        <Space>
          <FileIcon 
            isDirectory={record.isDirectory} 
            fileName={name} 
            token={token}
          />
          <Text
            style={{ cursor: record.isDirectory ? 'pointer' : 'default' }}
            onClick={() => record.isDirectory && handleFolderClick(record)}
          >
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: string | number, record: FileModel) => {
        if (record.isDirectory) return '-';
        if (typeof size === 'string') return size;
        return formatFileSize(size);
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: FileModel) => (
        <Space size={4}>
          {!record.isDirectory && (
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => onDownload(record)}
            />
          )}
          {!record.isDirectory && isImageFile(record.name) && (
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ], [token, handleFolderClick, handlePreview, handleDelete, onDownload]);

  return (
    <Table<FileModel>
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      columns={columns}
      dataSource={filteredFiles}
      rowKey="id"
      loading={loading}
      pagination={false}
      scroll={{ x: 800 }}
      tableLayout="fixed"
      footer={() => (
        <div className="container-fluid px-0">
          <div className="row align-items-center">
            <div className="col">
              {selectedRowKeys.length > 0 && (
                <Space size={8}>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleBatchDownload(
                      filteredFiles.filter(file => selectedRowKeys.includes(file.id))
                    )}
                  >
                    批量下载
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleBatchDelete(filteredFiles)}
                  >
                    批量删除
                  </Button>
                  <span>已选择 {selectedRowKeys.length} 项</span>
                </Space>
              )}
            </div>
            <div className="col-auto">
              <Pagination 
                {...pagination}
                onChange={onPageChange}
                showTotal={(total) => `共 ${total} 项`}
              />
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default memo(FileList); 