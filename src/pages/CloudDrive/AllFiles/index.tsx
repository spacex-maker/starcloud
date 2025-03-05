import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Upload, Space, Grid, Pagination } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { Key } from 'react';
import {
  FolderOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import FileList from './components/FileList';
import PathHistory from '../components/PathHistory';
import { fetchRootDirectory, loadFiles } from 'services/fileService';
import FileUploadModal from 'components/modals/FileUploadModal';
import FileEncryptModal from 'components/modals/FileEncryptModal';
import DownloadManager from 'components/modals/DownloadManager';
import { formatFileSize } from 'utils/format';
import { ActionBar, RoundedButton, RoundedSearch } from '../components/styles/StyledComponents';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import type { FileModel } from 'models/file/FileModel';

// Import custom hooks
import { useUpload } from '../hooks/useUpload';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { useSearch } from '../hooks/useSearch';
import { useDownload } from '../hooks/useDownload';
import type { DuplicateAction } from './components/FileUploadModal';

const { Content } = Layout;

// 新增样式组件
const PageContainer = styled(Content)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
`;

const HeaderSection = styled.div`
  padding: 0;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  box-shadow: var(--ant-box-shadow-sm);
`;

const PathSection = styled.div`
  padding: 12px 16px;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  box-shadow: var(--ant-box-shadow-sm);
`;

const ListSection = styled.div`
  flex: 1;
  overflow: hidden;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  box-shadow: var(--ant-box-shadow-sm);
`;

const FooterSection = styled.div`
  padding: 12px 16px;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  box-shadow: var(--ant-box-shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface UserInfo {
  username: string;
  [key: string]: any;
}

interface EncryptedFile extends File {
  name: string;
  size: number;
  type: string;
}

interface FileEncryptModalProps {
  visible: boolean;
  files: File[];
  [key: string]: any;
}

interface UploadState {
  files: Map<string, any>;
  isUploading: boolean;
}

const AllFiles = () => {
  // 基础状态
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileModel[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileModel[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentParentId, setCurrentParentId] = useState(0);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  // 文件夹相关状态
  const [currentPath, setCurrentPath] = useState('');
  const [rootDirectoryId, setRootDirectoryId] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<FileModel | null>(null);

  // 上传相关状态
  const [fileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const [fileEncryptModalProps, setFileEncryptModalProps] = useState<FileEncryptModalProps | null>(null);
  const [uploadStates, setUploadStates] = useState<UploadState>({
    files: new Map(),
    isUploading: false
  });

  // 用户信息
  const [userInfo, setUserInfo] = useState<UserInfo>({ username: '' });

  const screens = Grid.useBreakpoint();
  const intl = useIntl();

  const {
    selectedRowKeys,
    previewImage,
    handleDelete,
    modalDeletingId,
    handleBatchDelete,
    handlePreview,
    handlePreviewClose,
    handleSelectChange: handleFileSelectChange
  } = useFileOperations({
    currentParentId,
    pagination,
    setPagination,
    setFiles,
    setFilteredFiles,
    setSearchText
  });

  const {
    newFolderModalVisible: useFolderModalVisible,
    setNewFolderModalVisible: setUseFolderModalVisible,
    newFolderName: useFolderName,
    setNewFolderName: setUseFolderName,
    creatingFolder,
    pathHistory,
    handleCreateFolder,
    handleFolderClick,
    handlePathClick,
    handleHomeClick
  } = useFolderOperations({
    currentParentId,
    userInfo,
    currentPath,
    pagination,
    setPagination,
    setFiles,
    setFilteredFiles,
    setSearchText,
    setLoading,
    setCurrentParentId,
    setCurrentFolder
  });

  const {
    downloadTasks,
    downloadManagerVisible,
    setDownloadManagerVisible,
    startDownload,
    handleCancelDownload,
    handleClearDownloads,
    handleBatchDownload
  } = useDownload();

  const {
    handleUpload,
    uploadFiles,
    handleDuplicateDecision,
    handleRemoveFiles,
    handleAddFiles,
    handleEncryptFiles,
    handlePauseUpload,
    handleResumeUpload
  } = useUpload({
    currentParentId,
    uploadStates,
    setUploadStates,
    setFileUploadModalVisible,
    setFileEncryptModalProps,
    setFiles,
    setFilteredFiles,
    setSearchText,
    setPagination,
    pagination
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value) {
      setFilteredFiles(files);
      return;
    }
    const filtered = files.filter(file => 
      file.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredFiles(filtered);
  };

  const handleDownloadCollapse = (collapsed: boolean) => {
    setDownloadManagerVisible(!collapsed);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
    
    loadFiles({
      parentId: currentParentId,
      setLoading,
      setFiles,
      setFilteredFiles,
      setSearchText,
      setPagination,
      pagination: {
        ...pagination,
        current: page,
        pageSize: pageSize
      }
    });
  };

  useEffect(() => {
    fetchRootDirectory({
      setLoading,
      setRootDirectoryId,
      setCurrentParentId,
      setFiles,
      setFilteredFiles,
      setSearchText,
      setPagination,
      pagination
    });
  }, []);

  const handleCloseUploadModal = () => {
    if (!uploadStates.isUploading) {
      setFileUploadModalVisible(false);
    }
  };

  const handleCloseEncryptModal = () => {
    setFileEncryptModalProps(null);
  };

  const handleEncryptComplete = (encryptedFiles: EncryptedFile[], originalFiles: File[]) => {
    const newFiles = new Map();
    
    Array.from(uploadStates.files.entries()).forEach(([key, value]) => {
      if (!originalFiles.find((f: File) => f.name === key)) {
        newFiles.set(key, value);
      }
    });
    
    encryptedFiles.forEach((encryptedFile: EncryptedFile) => {
      newFiles.set(encryptedFile.name, {
        file: encryptedFile,
        name: encryptedFile.name,
        fileSize: encryptedFile.size,
        status: 'pending',
        progress: 0,
        isDuplicate: false,
        action: 'upload',
        isEncrypted: true
      });
    });
    
    setUploadStates(prev => ({
      ...prev,
      files: newFiles
    }));
    
    setFileEncryptModalProps(null);
    message.success('文件加密成功');
  };

  const handleBatchDownloadWithCheck = (files: FileModel[]) => {
    const downloadableFiles = files.filter(file => 
      selectedRowKeys.includes(file.id.toString()) && !file.isDirectory
    );
    
    if (downloadableFiles.length === 0) {
      message.warning('请选择要下载的文件（不支持文件夹下载）');
      return;
    }

    handleBatchDownload(downloadableFiles);
  };

  const handleBatchDeleteSafely = async (files: FileModel[]) => {
    if (isBatchDeleting) return;
    try {
      setIsBatchDeleting(true);
      await handleBatchDelete(files.filter(file => 
        selectedRowKeys.includes(file.id.toString())
      ));
    } finally {
      setIsBatchDeleting(false);
    }
  };

  return (
    <PageContainer>
      {/* 头部操作区 */}
      <HeaderSection>
        <ActionBar>
          <Space size={screens.md ? 8 : 4} className="flex-nowrap">
            <Upload
              multiple
              showUploadList={false}
              beforeUpload={(file, fileList) => {
                if (!file || !fileList || fileList.length === 0) {
                  return false;
                }
                const validFiles = fileList.filter(f => f && f.name && f.size);
                if (validFiles.length === 0) {
                  message.warning('没有有效的文件可上传');
                  return false;
                }
                handleUpload(validFiles, files);
                setFileUploadModalVisible(true);
                return false;
              }}
              disabled={uploadStates.isUploading}
            >
              <RoundedButton
                type="primary"
                icon={<CloudUploadOutlined />}
                loading={uploadStates.isUploading}
              >
                <span className="action-button-text">
                  <FormattedMessage id="filelist.action.upload" />
                </span>
              </RoundedButton>
            </Upload>
            <RoundedButton
              icon={<FolderOutlined />}
              onClick={() => setNewFolderModalVisible(true)}
            >
              <span className="action-button-text">
                <FormattedMessage id="filelist.action.newFolder" />
              </span>
            </RoundedButton>
            <RoundedButton
              icon={<ReloadOutlined />}
              onClick={() => loadFiles({
                parentId: currentParentId, 
                setLoading, 
                setFiles, 
                setFilteredFiles, 
                setSearchText,
                setPagination,
                pagination
              })}
              loading={loading}
            >
              <span className="action-button-text">
                <FormattedMessage id="filelist.action.refresh" />
              </span>
            </RoundedButton>
          </Space>
          <RoundedSearch
            placeholder={intl.formatMessage({ id: 'filelist.action.search' })}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            allowClear
          />
        </ActionBar>
      </HeaderSection>

      {/* 历史路径区域 */}
      <PathSection>
        <PathHistory
          pathHistory={pathHistory}
          onHomeClick={() => handleHomeClick(rootDirectoryId)}
          onPathClick={handlePathClick}
        />
      </PathSection>

      {/* 列表区域 */}
      <ListSection>
        <FileList
          loading={loading}
          filteredFiles={filteredFiles}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={handleFileSelectChange}
          handleFolderClick={handleFolderClick}
          handlePreview={handlePreview}
          handleDelete={handleDelete}
          handleBatchDelete={handleBatchDelete}
          handleBatchDownload={handleBatchDownload}
          onDownload={startDownload}
          newFolderModalVisible={newFolderModalVisible}
          setNewFolderModalVisible={setNewFolderModalVisible}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          handleCreateFolder={handleCreateFolder}
          previewImage={previewImage}
          handlePreviewClose={handlePreviewClose}
          currentParentId={currentParentId}
          setLoading={setLoading}
          setFiles={setFiles}
          setFilteredFiles={setFilteredFiles}
          setSearchText={setSearchText}
          setPagination={setPagination}
          pagination={pagination}
        />
      </ListSection>

      {/* 底部操作区 */}
      <FooterSection>
        <div>
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
        <Pagination 
          {...pagination}
          onChange={handlePageChange}
          showTotal={(total: number) => intl.formatMessage(
            { id: 'filelist.total' },
            { total }
          )}
          size={screens.md ? 'default' : 'small'}
        />
      </FooterSection>

      {/* Modals */}
      <FileUploadModal
        visible={fileUploadModalVisible}
        uploadingFiles={uploadStates.files}
        isUploading={uploadStates.isUploading}
        onStartUpload={uploadFiles}
        onCancel={handleCloseUploadModal}
        onDuplicateDecision={handleDuplicateDecision as (fileName: string, action: DuplicateAction) => void}
        onRemoveFiles={handleRemoveFiles}
        onAddFiles={handleAddFiles}
        onEncryptFiles={handleEncryptFiles}
        onEncryptComplete={handleEncryptComplete}
        existingFiles={files}
        onPauseUpload={handlePauseUpload}
        onResumeUpload={handleResumeUpload}
        setUploadStates={setUploadStates}
        onUploadComplete={() => {
          loadFiles({
            parentId: currentParentId,
            setLoading,
            setFiles,
            setFilteredFiles,
            setSearchText,
            setPagination,
            pagination
          });
        }}
      />

      {fileEncryptModalProps && (
        <FileEncryptModal {...fileEncryptModalProps} />
      )}

      <DownloadManager
        downloads={downloadTasks}
        onCancel={handleCancelDownload}
        onClear={handleClearDownloads}
        onCollapse={handleDownloadCollapse}
      />
    </PageContainer>
  );
};

export default AllFiles; 