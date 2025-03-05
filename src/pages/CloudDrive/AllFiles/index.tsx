import React, { useState, useEffect } from 'react';
import { Layout, Upload, Space, Grid } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import {
  FolderOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ReloadOutlined,
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
import { FileProvider } from 'contexts/FileContext';

// Import custom hooks
import { useUpload } from '../hooks/useUpload';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { useSearch } from '../hooks/useSearch';
import { useDownload } from '../hooks/useDownload';

const { Content } = Layout;

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface UserInfo {
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

const AllFiles = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentParentId, setCurrentParentId] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<any>(null);
  const [fileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const [fileEncryptModalProps, setFileEncryptModalProps] = useState<FileEncryptModalProps | null>(null);
  const [rootDirectoryId, setRootDirectoryId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  const screens = Grid.useBreakpoint();
  const intl = useIntl();

  // 获取用户信息
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // Initialize custom hooks
  const { searchText, filteredFiles, setFilteredFiles, handleSearch, setSearchText } = useSearch(files);
  
  const { 
    uploadStates,
    setUploadStates,
    handleUpload,
    uploadFiles,
    handleDuplicateDecision,
    handleRemoveFiles,
    handleAddFiles,
    handleEncryptFiles,
    handlePauseUpload,
    handleResumeUpload
  } = useUpload(
    currentParentId, 
    userInfo,
    currentPath,
    currentFolder,
    pagination, 
    setPagination,
    setLoading,
    setFiles,
    setFilteredFiles,
    setSearchText
  );

  const {
    selectedRowKeys,
    previewImage,
    handleDelete,
    handleBatchDelete,
    handlePreview,
    handlePreviewClose,
    handleSelectChange
  } = useFileOperations(
    currentParentId, 
    pagination, 
    setPagination,
    setFiles,
    setFilteredFiles,
    setSearchText,
    setLoading
  );

  const {
    newFolderModalVisible,
    setNewFolderModalVisible,
    newFolderName,
    setNewFolderName,
    creatingFolder,
    pathHistory,
    handleCreateFolder,
    handleFolderClick,
    handlePathClick,
    handleHomeClick
  } = useFolderOperations(
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
  );

  const {
    downloadTasks,
    downloadManagerVisible,
    setDownloadManagerVisible,
    startDownload,
    handleCancelDownload,
    handleClearDownloads,
    handleBatchDownload
  } = useDownload();

  const handleDownloadCollapse = (collapsed: boolean) => {
    setDownloadManagerVisible(!collapsed);
  };

  useEffect(() => {
    fetchRootDirectory(
      setLoading,
      setRootDirectoryId,
      setCurrentParentId,
      setFiles,
      setFilteredFiles,
      setSearchText,
      setPagination,
      pagination
    );
  }, []);

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize
    }));
    
    loadFiles(
      currentParentId,
      { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination: { currentPage: page, pageSize: pageSize } }
    );
  };

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

  return (
    <Content style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '10px 10px 0 10px'
    }}>
      <FileProvider initialParentId={rootDirectoryId || 0}>
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
              onClick={() => loadFiles(
                currentParentId, 
                { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination }
              )}
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

        <div className="px-4 py-2 border-b">
          <PathHistory
            pathHistory={pathHistory}
            onHomeClick={() => handleHomeClick(rootDirectoryId)}
            onPathClick={handlePathClick}
          />
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <FileList
            loading={loading}
            filteredFiles={filteredFiles}
            searchText={searchText}
            handleFolderClick={handleFolderClick}
            handlePreview={handlePreview}
            handleDelete={handleDelete}
            handleBatchDelete={handleBatchDelete}
            handleBatchDownload={handleBatchDownload}
            selectedRowKeys={selectedRowKeys}
            onSelectChange={handleSelectChange}
            onDownload={startDownload}
            pagination={pagination}
            onPageChange={handlePageChange}
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
          />
        </div>

        <FileUploadModal
          visible={fileUploadModalVisible}
          uploadingFiles={uploadStates.files}
          isUploading={uploadStates.isUploading}
          onStartUpload={uploadFiles}
          onCancel={handleCloseUploadModal}
          onDuplicateDecision={handleDuplicateDecision}
          onRemoveFiles={handleRemoveFiles}
          onAddFiles={handleAddFiles}
          onEncryptFiles={handleEncryptFiles}
          onEncryptComplete={handleEncryptComplete}
          existingFiles={files}
          onPauseUpload={handlePauseUpload}
          onResumeUpload={handleResumeUpload}
          setUploadStates={setUploadStates}
          onUploadComplete={() => {
            loadFiles(
              currentParentId,
              { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination }
            );
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
      </FileProvider>
    </Content>
  );
};

export default AllFiles; 