import React, { memo, useMemo } from 'react';
import type { FC } from 'react';
import { Table, Space, Button, Typography, TablePaginationConfig, theme, Pagination, Grid, Modal, Input, Image } from 'antd';
import { ThemeContext } from 'styled-components';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { FileModel } from 'models/file/FileModel';
import type { ColumnsType } from 'antd/es/table';
import { RoundedButton } from '../../components/styles/StyledComponents';
import { FormattedMessage, useIntl } from 'react-intl';
import FileItem from './FileItem';
import { formatFileSize, isImageFile } from 'utils/format';

const { Text } = Typography;
const { useToken } = theme;

interface PreviewImageType {
  visible: boolean;
  url: string;
  title: string;
  key: number;
}

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
  newFolderModalVisible: boolean;
  setNewFolderModalVisible: (visible: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: () => void;
  previewImage: PreviewImageType;
  handlePreviewClose: () => void;
};

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
  newFolderModalVisible,
  setNewFolderModalVisible,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  previewImage,
  handlePreviewClose,
}) => {
  const { token } = useToken();
  const screens = Grid.useBreakpoint();
  const themeContext = React.useContext(ThemeContext);
  const isDark = themeContext?.mode === 'dark';
  const intl = useIntl();

  const columns: ColumnsType<FileModel> = useMemo(() => [
    {
      title: <FormattedMessage id="filelist.column.name" />,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '50%',
      render: (_, record: FileModel) => (
        <FileItem
          file={record}
          onFolderClick={handleFolderClick}
          showSize={false}
        />
      ),
    },
    {
      title: <FormattedMessage id="filelist.column.size" />,
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
      title: <FormattedMessage id="filelist.column.updateTime" />,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: <FormattedMessage id="filelist.column.actions" />,
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record: FileModel) => (
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
  ], [handleFolderClick, handlePreview, handleDelete, onDownload]);

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate'
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
                    {screens.md && <FormattedMessage id="filelist.action.batchDownload" />}
                  </RoundedButton>
                  <RoundedButton
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleBatchDelete(filteredFiles)}
                  >
                    {screens.md && <FormattedMessage id="filelist.action.batchDelete" />}
                  </RoundedButton>
                  <span className="d-none d-md-inline">
                    <FormattedMessage 
                      id="filelist.selected" 
                      values={{ count: selectedRowKeys.length }} 
                    />
                  </span>
                </Space>
              )}
            </div>
            <div className="col-auto pe-3">
              <Pagination 
                {...pagination}
                onChange={onPageChange}
                showTotal={(total) => intl.formatMessage(
                  { id: 'filelist.total' },
                  { total }
                )}
                size={screens.md ? 'default' : 'small'}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Modal
        title={<FormattedMessage id="filelist.modal.newFolder.title" defaultMessage="新建文件夹" />}
        open={newFolderModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => setNewFolderModalVisible(false)}
        okText={<FormattedMessage id="filelist.modal.newFolder.ok" defaultMessage="创建" />}
        cancelText={<FormattedMessage id="filelist.modal.newFolder.cancel" defaultMessage="取消" />}
      >
        <Input
          placeholder={intl.formatMessage({ 
            id: "filelist.modal.newFolder.placeholder",
            defaultMessage: "请输入文件夹名称"
          })}
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolder}
          autoFocus
        />
      </Modal>

      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            visible: previewImage.visible,
            current: previewImage.key,
            onVisibleChange: (visible) => {
              if (!visible) handlePreviewClose();
            }
          }}
        >
          {filteredFiles
            .filter(file => !file.isDirectory && isImageFile(file.name))
            .map(file => (
              <Image
                key={file.id}
                src={file.downloadUrl || ''}
                alt={file.name}
              />
            ))}
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default memo(FileList);
