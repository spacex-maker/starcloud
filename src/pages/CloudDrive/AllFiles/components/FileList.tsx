import React, { memo, useMemo, useState } from 'react';
import type { FC } from 'react';
import type { Key } from 'react';
import { Table, Space, Button, Typography, theme, Grid, Modal, Input, Image, Dropdown, Tooltip, message } from 'antd';
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

interface FileListProps {
  loading: boolean;
  filteredFiles: FileModel[];
  searchText: string;
  handleFolderClick: (record: FileModel) => void;
  handlePreview: (record: FileModel) => void;
  handleDelete: (record: FileModel) => void;
  handleBatchDelete: (files: FileModel[]) => void;
  handleBatchDownload: (files: FileModel[]) => void;
  selectedRowKeys: Key[];
  onSelectChange: (selectedRowKeys: Key[]) => void;
  onDownload: (record: FileModel) => void;
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
  setPagination: (pagination: any) => void;
}

interface ThemedTableProps {
  theme?: {
    mode?: 'dark' | 'light';
  };
}

const TableWrapper = styled.div`
  margin-bottom: 0;
  
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

  .ant-table {
    margin-bottom: 0 !important;
  }

  .ant-table-wrapper {
    margin-bottom: 0 !important;
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
  ], [handleFolderClick, handlePreview, handleDelete, onDownload, deletingIds, currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText, setPagination]);

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
        overflow: 'hidden',
        marginBottom: 0
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          overflow: 'auto'
        }}>
          <TableWrapper>
            <Table<FileModel>
              rowSelection={rowSelection}
              columns={columns}
              dataSource={sortedFiles}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 800, y: 'calc(100vh - 300px)' }}
              tableLayout="fixed"
              rowClassName={(record) => record.isDirectory ? 'folder-row' : ''}
              style={{ marginBottom: 0 }}
            />
          </TableWrapper>
        </div>
      </div>

      <Modal
        title={<FormattedMessage id="filelist.modal.newFolder.title" defaultMessage="新建文件夹" />}
        open={newFolderModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => {
          setNewFolderModalVisible(false);
          setNewFolderName('');
        }}
        okButtonProps={{ 
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
            if (newFolderName.trim()) {
              handleCreateFolder();
            }
          }}
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
