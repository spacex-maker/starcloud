import React, { useState, useEffect } from 'react';
import { Layout, Upload, Space, Input, Image, Grid, Button } from 'antd';
import {
  FolderOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import SimpleHeader from "components/headers/simple";
import { message } from 'antd';
import { Helmet } from 'react-helmet';
import FileList from './FileList';
import NewFolderModal from './NewFolderModal';
import PathHistory from './PathHistory';
import SideMenu from './SideMenu';
import { fetchRootDirectory, loadFiles } from 'services/fileService';
import FileUploadModal from 'components/modals/FileUploadModal';
import FileEncryptModal from 'components/modals/FileEncryptModal';
import DownloadManager from 'components/modals/DownloadManager';
import { useNavigate } from 'react-router-dom';
import { formatFileSize } from 'utils/format';

// Import custom hooks
import { useUpload } from './hooks/useUpload';
import { useDownload } from './hooks/useDownload';
import { useFileOperations } from './hooks/useFileOperations';
import { useFolderOperations } from './hooks/useFolderOperations';
import { useSearch } from './hooks/useSearch';

const { Content, Sider, Header } = Layout;

const CloudDrivePage = () => {
  const [selectedKeys, setSelectedKeys] = useState(['all']);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentParentId, setCurrentParentId] = useState(0);
  const [fileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const [fileEncryptModalProps, setFileEncryptModalProps] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [rootDirectoryId, setRootDirectoryId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 769);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const screens = Grid.useBreakpoint();

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
    handleEncryptFiles
  } = useUpload(currentParentId, userInfo, currentPath, pagination, setPagination);

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
    selectedRowKeys,
    previewImage,
    handleDelete,
    handleBatchDelete,
    handlePreview,
    handlePreviewClose,
    handleSelectChange
  } = useFileOperations(currentParentId, pagination, setPagination);

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
    setLoading
  );

  // Add login check
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));
  }, [navigate]);

  useEffect(() => {
    if (userInfo) {
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
    }
  }, [userInfo]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize
    }));
    
    loadFiles(
      currentParentId,
      setLoading,
      setFiles,
      setFilteredFiles,
      setSearchText,
      setPagination,
      {
        currentPage: page,
        pageSize: pageSize
      }
    );
  };

  const handleMenuSelect = (key) => {
    setSelectedKeys([key]);
  };

  const handleCloseUploadModal = () => {
    if (!uploadStates.isUploading) {
      setFileUploadModalVisible(false);
    }
  };

  const handleCloseEncryptModal = () => {
    setFileEncryptModalProps(null);
  };

  const handleEncryptComplete = (encryptedFiles, originalFiles) => {
    // 创建新的文件列表
    const newFiles = new Map();
    
    // 遍历现有的文件列表，保留未加密的文件
    Array.from(uploadStates.files.entries()).forEach(([key, value]) => {
      if (!originalFiles.find(f => f.name === key)) {
        newFiles.set(key, value);
      }
    });
    
    // 添加加密后的文件
    encryptedFiles.forEach(encryptedFile => {
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
    
    // 更新状态
    setUploadStates(prev => ({
      ...prev,
      files: newFiles
    }));
    
    // 关闭加密模态框
    setFileEncryptModalProps(null);
    
    // 显示成功消息
    message.success('文件加密成功');
  };

  return (
    <>
      <Helmet>
        <title>我的云盘 - MyStorageX</title>
        <meta name="description" content="MyStorageX 云盘 - 安全存储和管理您的文件" />
      </Helmet>
      <Layout style={{ minHeight: '100vh' }}>
        <SimpleHeader />
        <Layout>
          <SideMenu
            selectedKeys={selectedKeys}
            onSelect={handleMenuSelect}
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />
          <Layout style={{ 
            marginLeft: isMobile ? 0 : (collapsed ? 80 : 200),
            transition: 'margin-left 0.2s'
          }}>
            <Content style={{ marginTop: 64 }}>
              <div className="container-fluid border-b">
                <div className="row g-0 align-items-center py-3">
                  <div className="col">
                    <Space size={screens.md ? 8 : 4}>
                      <Upload
                        multiple
                        showUploadList={false}
                        beforeUpload={(file, fileList) => {
                          handleUpload(fileList, files);
                          setFileUploadModalVisible(true);
                          return false;
                        }}
                        disabled={uploadStates.isUploading}
                      >
                        <Button
                          type="primary"
                          icon={<CloudUploadOutlined />}
                          loading={uploadStates.isUploading}
                        >
                          {screens.md && "上传文件"}
                        </Button>
                      </Upload>
                      <Button
                        icon={<FolderOutlined />}
                        onClick={() => setNewFolderModalVisible(true)}
                      >
                        {screens.md && "新建文件夹"}
                      </Button>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => loadFiles(
                          currentParentId, 
                          setLoading, 
                          setFiles, 
                          setFilteredFiles, 
                          setSearchText,
                          setPagination,
                          pagination
                        )}
                        loading={loading}
                      >
                        {screens.md && "刷新"}
                      </Button>
                    </Space>
                  </div>
                  <div className="col-auto pe-4">
                    <Input
                      placeholder="搜索文件"
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={e => handleSearch(e.target.value)}
                      allowClear
                      style={{ width: 300 }}
                    />
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-b">
                <PathHistory
                  pathHistory={pathHistory}
                  onHomeClick={() => handleHomeClick(rootDirectoryId)}
                  onPathClick={handlePathClick}
                />
              </div>

              <div>
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
                  formatSize={formatFileSize}
                />
              </div>
            </Content>
          </Layout>
        </Layout>

        <NewFolderModal
          visible={newFolderModalVisible}
          folderName={newFolderName}
          onFolderNameChange={setNewFolderName}
          onOk={handleCreateFolder}
          onCancel={() => {
            setNewFolderModalVisible(false);
            setNewFolderName('');
          }}
          loading={creatingFolder}
        />

        {previewImage.visible && (
          <Image
            key={previewImage.key}
            style={{ display: 'none' }}
            preview={{
              visible: true,
              src: previewImage.url,
              title: previewImage.title,
              onVisibleChange: (visible) => {
                if (!visible) {
                  handlePreviewClose();
                }
              },
            }}
          />
        )}

        <FileUploadModal
          visible={fileUploadModalVisible}
          uploadingFiles={uploadStates.files}
          isUploading={uploadStates.isUploading}
          onStartUpload={() => uploadFiles(Array.from(uploadStates.files.values()).map(f => f.file))}
          onCancel={handleCloseUploadModal}
          onDuplicateDecision={handleDuplicateDecision}
          onRemoveFiles={handleRemoveFiles}
          onAddFiles={handleAddFiles}
          existingFiles={files}
          onEncryptFiles={(selectedFiles, onComplete) => {
            const props = handleEncryptFiles(selectedFiles);
            if (!props) return;
            
            setFileEncryptModalProps({
              ...props,
              onCancel: handleCloseEncryptModal,
              onEncryptComplete: handleEncryptComplete
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
          onCollapse={(collapsed) => setDownloadManagerVisible(!collapsed)}
        />
      </Layout>
    </>
  );
};

export default CloudDrivePage;