import React, { memo, useMemo, useState } from 'react';
import type { FC } from 'react';
import { Table, Space, Button, Typography, TablePaginationConfig, theme, Pagination, Grid, Modal, Input, Image, Dropdown, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import { ThemeContext } from 'styled-components';
import styled from 'styled-components';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
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

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface FileListProps {
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
  pagination: PaginationState;
  onPageChange: (page: number, pageSize: number) => void;
  newFolderModalVisible: boolean;
  setNewFolderModalVisible: (visible: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: () => void;
  previewImage: PreviewImageType;
  handlePreviewClose: () => void;
  currentParentId: number;
  setLoading: (loading: boolean) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setPagination: (pagination: PaginationState) => void;
}

interface ThemedTableProps {
  theme?: {
    mode?: 'dark' | 'light';
  };
}

const TableWrapper = styled.div`
  .ant-table-row {
    transition: all 0.3s ease;
  }
  
  .folder-row {
    background-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.02)' 
      : 'rgba(24, 144, 255, 0.02)'};
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(24, 144, 255, 0.04)'} !important;
    }
    
    td {
      padding: 12px 8px !important;
      
      &:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }
      
      &:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }
  }

  .ant-table-row:not(.folder-row) {
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.02)'} !important;
    }
  }

  .ant-table-cell {
    border-bottom: 1px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.04)'} !important;
  }
`;

const FileList: FC<FileListProps> = memo(({
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
  currentParentId,
  setLoading,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setPagination,
}) => {
  const { token } = useToken();
  const screens = Grid.useBreakpoint();
  const themeContext = React.useContext(ThemeContext);
  const isDark = themeContext?.mode === 'dark';
  const intl = useIntl();
  
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<React.Key[]>([]);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  const handleCreateFolderSafely = async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      await handleCreateFolder();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSafely = async (record: FileModel) => {
    if (deletingIds.includes(record.id)) return;
    try {
      setDeletingIds(prev => [...prev, record.id]);
      await handleDelete(record);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== record.id));
    }
  };

  const handleBatchDeleteSafely = async (files: FileModel[]) => {
    if (isBatchDeleting) return;
    try {
      setIsBatchDeleting(true);
      await handleBatchDelete(files);
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [filteredFiles]);

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
          currentParentId={currentParentId}
          setLoading={setLoading}
          setFiles={setFiles}
          setFilteredFiles={setFilteredFiles}
          setSearchText={setSearchText}
          setPagination={setPagination}
          pagination={pagination}
        />
      ),
    },
    {
      title: <FormattedMessage id="filelist.column.size" />,
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: string | number, record: FileModel) => {
        if (size == null) return '-';
        if (typeof size === 'string') return size;
        return formatFileSize(size);
      },
      sorter: (a: FileModel, b: FileModel) => {
        if (a.size == null) return -1;
        if (b.size == null) return 1;
        return Number(a.size) - Number(b.size);
      },
      sortDirections: ['descend', 'ascend']
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
      width: 80,
      render: (_, record: FileModel) => {
        const isDeleting = deletingIds.includes(record.id);
        const menuItems: MenuProps['items'] = [
          !record.isDirectory ? {
            key: 'download',
            icon: <DownloadOutlined />,
            label: <FormattedMessage id="filelist.action.download" defaultMessage="下载" />,
            onClick: () => onDownload(record),
          } : null,
          (!record.isDirectory && isImageFile(record.name)) ? {
            key: 'preview',
            icon: <EyeOutlined />,
            label: <FormattedMessage id="filelist.action.preview" defaultMessage="预览" />,
            onClick: () => handlePreview(record),
          } : null,
        ].filter((item): item is NonNullable<typeof item> => item !== null);

        return (
          <Space size={4}>
            {!record.isDirectory && (
              <Tooltip title={<FormattedMessage id="filelist.action.download" defaultMessage="下载" />}>
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => onDownload(record)}
                  disabled={isDeleting}
                />
              </Tooltip>
            )}
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSafely(record)}
              loading={isDeleting}
              disabled={isDeleting}
            />
            {menuItems.length > 0 && (
              <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                trigger={['click']}
                arrow={{ pointAtCenter: true }}
                disabled={isDeleting}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  disabled={isDeleting}
                />
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ], [handleFolderClick, handlePreview, handleDelete, onDownload, deletingIds, currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination]);

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: FileModel) => ({
      disabled: record.isDirectory,
    }),
  };

  const handleBatchDownloadWithCheck = (files: FileModel[]) => {
    const downloadableFiles = files.filter(file => 
      selectedRowKeys.includes(file.id) && !file.isDirectory
    );
    
    if (downloadableFiles.length === 0) {
      message.warning('请选择要下载的文件（不支持文件夹下载）');
      return;
    }

    handleBatchDownload(downloadableFiles);
  };

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
          <TableWrapper>
            <Table<FileModel>
              rowSelection={rowSelection}
              columns={columns}
              dataSource={sortedFiles}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 800, y: 'calc(100% - 8px)' }}
              tableLayout="fixed"
              rowClassName={(record) => record.isDirectory ? 'folder-row' : ''}
            />
          </TableWrapper>
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
                    onClick={() => handleBatchDownloadWithCheck(filteredFiles)}
                  >
                    {screens.md && <FormattedMessage id="filelist.action.batchDownload" />}
                  </RoundedButton>
                  <RoundedButton
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleBatchDeleteSafely(filteredFiles)}
                    loading={isBatchDeleting}
                    disabled={isBatchDeleting}
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
        onOk={handleCreateFolderSafely}
        onCancel={() => {
          setNewFolderModalVisible(false);
          setNewFolderName('');
        }}
        okButtonProps={{ 
          loading: isCreating,
          disabled: !newFolderName.trim()
        }}
        okText={<FormattedMessage id="filelist.modal.newFolder.ok" defaultMessage="创建" />}
        cancelText={<FormattedMessage id="filelist.modal.newFolder.cancel" defaultMessage="取消" />}
        maskClosable={false}
        keyboard={false}
        destroyOnClose
      >
        <Input
          placeholder={intl.formatMessage({ 
            id: "filelist.modal.newFolder.placeholder",
            defaultMessage: "请输入文件夹名称"
          })}
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          onPressEnter={(e) => {
            if (newFolderName.trim() && !isCreating) {
              handleCreateFolderSafely();
            }
          }}
          disabled={isCreating}
          autoFocus
          maxLength={255}
        />
      </Modal>

      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewImage.visible,
          src: previewImage.url,
          title: previewImage.title,
          onVisibleChange: (visible) => {
            if (!visible) handlePreviewClose();
          }
        }}
      />
    </div>
  );
});

export default FileList;
