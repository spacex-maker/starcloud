import React, { memo, useMemo } from 'react';
import type { FC } from 'react';
import { Table, Space, Button, Typography, TablePaginationConfig, theme, Pagination, Grid } from 'antd';
import { ThemeContext } from 'styled-components';
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
import { RoundedButton } from './components/styles/StyledComponents';

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
  const screens = Grid.useBreakpoint();
  const themeContext = React.useContext(ThemeContext);
  const isDark = themeContext?.mode === 'dark';

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
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate'  // 创建新的堆叠上下文
    }}>
      <div style={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          overflow: 'auto',
          WebkitMask: 'linear-gradient(to bottom, black calc(100% - 60px), transparent 100%)',
          mask: 'linear-gradient(to bottom, black calc(100% - 60px), transparent 100%)'
        }}>
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
            scroll={{ x: 800, y: 'calc(100% - 8px)' }}
            tableLayout="fixed"
          />
        </div>
      </div>
      <div style={{ 
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        background: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}`,
        padding: '12px 0',
        zIndex: 10,
        marginTop: '-60px'
      }}>
        <div className="container-fluid px-0">
          <div className="row align-items-center">
            <div className="col ps-3">
              {selectedRowKeys.length > 0 && (
                <Space size={8}>
                  <RoundedButton
                    icon={<DownloadOutlined />}
                    onClick={() => handleBatchDownload(
                      filteredFiles.filter(file => selectedRowKeys.includes(file.id))
                    )}
                  >
                    {screens.md && "批量下载"}
                  </RoundedButton>
                  <RoundedButton
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleBatchDelete(filteredFiles)}
                  >
                    {screens.md && "批量删除"}
                  </RoundedButton>
                  <span className="d-none d-md-inline">已选择 {selectedRowKeys.length} 项</span>
                </Space>
              )}
            </div>
            <div className="col-auto pe-3">
              <Pagination 
                {...pagination}
                onChange={onPageChange}
                showTotal={(total) => `共 ${total} 项`}
                size={screens.md ? 'default' : 'small'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FileList);
