import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Table, Button, Space, Input, Upload, Modal, Image } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SearchOutlined,
  HomeOutlined,
  RightOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  FileImageOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import tw, { styled } from 'twin.macro';
import SimpleHeader from "components/headers/simple";
import AboutModal from "components/modals/AboutModal";
import { cosService } from 'services/cos';
import { message } from 'antd';
import UploadProgressModal from 'components/modals/UploadProgressModal';
import instance from 'api/axios'; // 导入已配置的 axios 实例
import { Helmet } from 'react-helmet';
import DuplicateFilesModal from 'components/modals/DuplicateFilesModal';
import FileList from './FileList';
import NewFolderModal from './NewFolderModal';
import PathHistory from './PathHistory';
import SideMenu from './SideMenu';
import { fetchRootDirectory, loadFiles, checkDuplicates, deleteFile } from 'services/fileService';
import debounce from 'lodash/debounce';

const { Content, Sider } = Layout;
const { confirm } = Modal;

const StyledLayout = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  background: var(--ant-color-bg-container);
`;

const MainLayout = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--ant-color-bg-container);
`;

const StyledContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow: auto;
`;

const TableContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding-left: 8px;  // 添加左边距
  
  .ant-table-wrapper {
    flex: 1;
    overflow: hidden;
    
    .ant-spin-nested-loading {
      height: 100%;
      
      .ant-spin-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        
        .ant-table {
          flex: 1;
          overflow: hidden;
          
          .ant-table-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            
            .ant-table-header {
              flex-shrink: 0;
            }
            
            .ant-table-body {
              flex: 1;
              overflow-y: auto;
            }
          }
        }
      }
    }
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  
  .ant-space {
    gap: 12px !important;
  }
`;

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--ant-color-bg-container);
  color: var(--ant-color-text);
`;

const ContentContainer = styled.div`
  flex: 1;
  margin-top: 64px; // 为固定头部留出空间
  display: flex;
  overflow: hidden; // 防止内容溢出
`;

// 添加新的样式组件
const RoundedButton = styled(Button)`
  border-radius: 20px;
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &.ant-btn-default {
    background-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.02)'};
    color: var(--ant-color-text);
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.04)'};
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
  
  &.ant-btn-text {
    padding: 0 12px;
    box-shadow: none;
    background: transparent;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'};
    }
  }
  
  &.ant-btn-primary {
    background-color: #1677ff;
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
    
    &:hover {
      background-color: #4096ff;
      box-shadow: 0 4px 8px rgba(22, 119, 255, 0.3);
    }
    
    &:active {
      background-color: #0958d9;
      box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
    }
    
    &.ant-btn-loading {
      opacity: 0.8;
      background-color: #4096ff;
    }
    
    .anticon {
      color: #ffffff;
    }
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  .anticon {
    font-size: 16px;
  }
`;

const RoundedSearch = styled(Input)`
  border-radius: 24px;
  height: 44px;
  padding: 0 16px;
  width: 300px;
  border: none;
  background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.02)'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'};
  }
  
  &:focus, &.ant-input-affix-wrapper-focused {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'white'};
    box-shadow: 0 1px 6px ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  .ant-input {
    background: transparent;
    font-size: 14px;
    
    &::placeholder {
      color: var(--ant-color-text-quaternary);
    }
  }
  
  .ant-input-prefix {
    margin-right: 12px;
    color: var(--ant-color-text-quaternary);
  }
  
  .ant-input-clear-icon {
    color: var(--ant-color-text-quaternary);
    margin-left: 8px;
    
    &:hover {
      color: var(--ant-color-text-secondary);
    }
  }
`;

// 修改表格操作按钮的样式
const TableActionButton = styled(RoundedButton)`
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

const Footer = styled.footer`
  ${tw`
    text-center
    py-4
    text-gray-500 dark:text-gray-400
    text-sm
    border-t border-gray-200 dark:border-gray-700
    mt-auto
  `}
`;

const FooterContent = styled.div`
  ${tw`
    flex items-center justify-center
    space-x-1
  `}
`;

const CloudDrivePage = () => {
  const [selectedKeys, setSelectedKeys] = useState(['all']);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentParentId, setCurrentParentId] = useState(0);
  const [pathHistory, setPathHistory] = useState([]);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadSpeeds, setUploadSpeeds] = useState({});
  const [uploadStartTimes, setUploadStartTimes] = useState({});
  const [uploadFileSizes, setUploadFileSizes] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [rootDirectoryId, setRootDirectoryId] = useState(null);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    // 从本地存储获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      // 首先获取根目录信息
      fetchRootDirectory(
        setLoading,
        setRootDirectoryId,
        setCurrentParentId,
        setFiles,
        setFilteredFiles,
        setSearchText
      );
    }
  }, [userInfo]);

  // 修改所有使用 loadFiles 的地方
  const handleFolderClick = async (folder) => {
    try {
      setLoading(true);
      
      const newHistory = [...pathHistory, {
        id: folder.id,
        name: folder.name
      }];
      
      const newPath = newHistory.map(p => p.name).join('/') + '/';
      
      setPathHistory(newHistory);
      setCurrentPath(newPath);
      setCurrentParentId(folder.id);
      
      await loadFiles(
        folder.id,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText
      );
    } catch (error) {
      console.error('Failed to navigate to folder:', error);
      message.error('打开文件夹失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 修改 handleUpload 函数
  const handleUpload = async (fileList) => {
    if (!userInfo) {
      message.error('请先登录');
      return;
    }

    // 将文件列表转换为数组并去重（基于文件名）
    const uniqueFiles = Array.from(fileList).reduce((acc, file) => {
      if (!acc.find(f => f.name === file.name)) {
        acc.push(file);
      }
      return acc;
    }, []);

    // 检查重复文件
    const { duplicates, unique } = checkDuplicates(uniqueFiles);
    setSelectedFiles(uniqueFiles);

    if (duplicates.length > 0) {
      setDuplicateFiles(duplicates);
      setShowDuplicateModal(true);
      return;
    }

    // 只有在没有重复文件时，才直接上传
    await uploadFiles(unique);
  };

  // 修改 uploadFiles 函数
  const uploadFiles = async (filesToUpload) => {
    setUploadModalVisible(true);
    setIsUploading(true);
    
    const progressTracker = {};
    const speedTracker = {};
    
    // 初始化状态
    const newStartTimes = {};
    const newFileSizes = {};
    filesToUpload.forEach(file => {
      newStartTimes[file.name] = Date.now();
      newFileSizes[file.name] = file.size;
      progressTracker[file.name] = 0;
      speedTracker[file.name] = '0 KB/s';
    });
    
    setUploadStartTimes(newStartTimes);
    setUploadFileSizes(newFileSizes);
    
    // 使用防抖更新UI状态
    const debouncedUpdateProgress = debounce(() => {
      setUploadProgress({...progressTracker});
      setUploadSpeeds({...speedTracker});
    }, 100);

    try {
      const fullPath = `${userInfo.username}/${currentPath}`;
      const controller = new AbortController();
      
      const uploadPromises = filesToUpload.map(file => {
        let isCompleted = false; // 添加标志来追踪是否已完成

        return new Promise(async (resolve, reject) => {
          try {
            let lastProgress = 0;
            let lastTime = Date.now();
            
            const uploadResult = await cosService.uploadFile(
              file,
              fullPath,
              (progress) => {
                // 如果已经完成，不再处理进度更新
                if (isCompleted) return;
                
                // 确保进度不会倒退或重复完成
                if (progress < lastProgress) return;
                
                const now = Date.now();
                const timeDiff = (now - lastTime) / 1000;
                const progressDiff = progress - lastProgress;
                const actualSpeed = (progressDiff / 100) * file.size / timeDiff;
                
                progressTracker[file.name] = Math.round(progress);
                speedTracker[file.name] = formatSpeed(actualSpeed);
                
                lastProgress = progress;
                lastTime = now;
                
                // 当进度达到100%时，标记为完成
                if (progress >= 100) {
                  isCompleted = true;
                }
                
                debouncedUpdateProgress();
              },
              controller.signal
            );

            // 只有在上传成功后才创建文件记录
            if (!isCompleted) {
              isCompleted = true;
              progressTracker[file.name] = 100;
              speedTracker[file.name] = '已完成';
              debouncedUpdateProgress();
            }

            await instance.post('/productx/file-storage/create-directory', {
              parentId: currentParentId,
              isDirectory: false,
              name: file.name,
              extension: file.name.split('.').pop(),
              size: file.size,
              storagePath: uploadResult.key,
              hash: uploadResult.etag?.replace(/"/g, ''),
              mimeType: file.type,
              storageType: 'COS',
              downloadUrl: uploadResult.url,
              visibility: 'PRIVATE'
            });

            resolve(uploadResult);
          } catch (error) {
            if (!isCompleted) {
              progressTracker[file.name] = -1;
              speedTracker[file.name] = '上传失败';
              debouncedUpdateProgress();
            }
            reject(error);
          }
        });
      });

      await Promise.all(uploadPromises);
      message.success('上传成功');
      
      // 确保所有防抖更新都已执行
      debouncedUpdateProgress.flush();
      
      // 刷新文件列表
      await loadFiles(currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText);
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败: ' + (error.message || '未知错误'));
    } finally {
      debouncedUpdateProgress.cancel();
      setIsUploading(false);
    }
  };

  // Add new function to handle duplicate resolution
  const handleDuplicateResolution = async (action) => {
    setShowDuplicateModal(false);
    
    if (action === 'overwrite') {
      // Upload all files including duplicates
      await uploadFiles(selectedFiles);
    } else if (action === 'skip') {
      // Upload only unique files
      const { unique } = checkDuplicates(selectedFiles);
      if (unique.length > 0) {
        await uploadFiles(unique);
      } else {
        // 如果没有可上传的文件，显示提示
        message.info('没有新文件需要上传');
      }
    }
    
    // Clear selected files after upload
    setSelectedFiles([]);
    setDuplicateFiles([]);
  };

  const handleDelete = (record) => {
    const fileName = record.name;
    const isFolder = record.type === 'folder';
    
    confirm({
      title: '确认删除',
      content: `确定要删除${isFolder ? '文件夹' : '文件'} "${fileName}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteFile(record, setLoading, currentParentId, setFiles, setFilteredFiles, setSearchText);
      },
      onCancel() {
        // User cancelled deletion, no action needed
      },
    });
  };

  // 修改 handlePathClick 函数
  const handlePathClick = async (index) => {
    try {
      setLoading(true);
      
      const targetPath = pathHistory[index];
      if (!targetPath?.id) {
        throw new Error('无效的路径');
      }
      
      // 更新路径历史
      const newHistory = pathHistory.slice(0, index + 1);
      
      // 更新当前路径
      const newPath = newHistory.map(p => p.name).join('/') + '/';
      
      // 更新状态
      setPathHistory(newHistory);
      setCurrentPath(newPath);
      setCurrentParentId(targetPath.id);
      
      // 加载目标目录的文件
      await loadFiles(
        targetPath.id,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText
      );
    } catch (error) {
      console.error('Failed to navigate to path:', error);
      message.error('导航失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 修改 handleHomeClick 函数
  const handleHomeClick = async () => {
    try {
      setLoading(true);
      
      // 重置路径状态
      setPathHistory([]);
      setCurrentPath('');
      
      // 加载根目录内容
      const targetId = rootDirectoryId || 0;
      setCurrentParentId(targetId);
      await loadFiles(
        targetId,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText
      );
    } catch (error) {
      console.error('Failed to navigate to home:', error);
      message.error('返回主页失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 判断是否是图片文件
  const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const ext = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(ext);
  };

  // 处理图片预览
  const handlePreview = (file) => {
    if (!file.downloadUrl) {
      message.error('无法预览，下载链接不存在');
      return;
    }
    
    setPreviewImage({
      url: file.downloadUrl,
      title: file.name
    });
  };

  // 搜索处理函数
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredFiles(files);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.includes(searchValue);
    });
    setFilteredFiles(filtered);
  };

  // 处理新建文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.error('文件夹名称不能为空');
      return;
    }
    
    try {
      setCreatingFolder(true);
      
      // 构建完整路径
      const fullPath = userInfo ? `${userInfo.username}/${currentPath}${newFolderName}/` : '';
      
      // 1. 先在对象存储创建文件夹
      await cosService.createFolder(fullPath);
      
      // 2. 调用后端接口保存信息
      const response = await instance.post('/productx/file-storage/create-directory', {
        parentId: currentParentId,
        isDirectory: true,
        name: newFolderName,
        size: 0,
        storagePath: fullPath, // 添加存储路径参数
        visibility: 'PRIVATE'
      });
      
      if (response.data && response.data.success) {
        message.success('文件夹创建成功');
        setNewFolderModalVisible(false);
        setNewFolderName('');
        
        // 刷新文件列表
        loadFiles(currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText);
      } else {
        throw new Error(response.data.message || '创建文件夹失败');
      }
    } catch (error) {
      console.error('创建文件夹失败:', error);
      message.error('创建文件夹失败: ' + (error.message || '未知错误'));
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleMenuSelect = (key) => {
    setSelectedKeys([key]);
    // 这里可以添加其他菜单选择的处理逻辑
  };

  return (
    <>
      <Helmet>
        <title>我的云盘 - MyStorageX</title>
        <meta name="description" content="MyStorageX 云盘 - 安全存储和管理您的文件" />
      </Helmet>
      <PageContainer>
        <SimpleHeader />
        <ContentContainer>
          <StyledLayout>
            <SideMenu
              selectedKeys={selectedKeys}
              onSelect={handleMenuSelect}
              onAboutClick={() => setIsAboutModalVisible(true)}
            />
            
            <MainLayout>
              <StyledContent>
                <PathHistory
                  pathHistory={pathHistory}
                  onHomeClick={handleHomeClick}
                  onPathClick={handlePathClick}
                />
                
                <ActionBar>
                  <Space>
                    <Upload
                      multiple
                      showUploadList={false}
                      beforeUpload={(file, fileList) => {
                        handleUpload(fileList);
                        return false;
                      }}
                      disabled={isUploading}
                    >
                      <RoundedButton
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        loading={isUploading}
                      >
                        上传文件
                      </RoundedButton>
                    </Upload>
                    <RoundedButton
                      icon={<FolderOutlined />}
                      onClick={() => setNewFolderModalVisible(true)}
                    >
                      新建文件夹
                    </RoundedButton>
                    <RoundedButton
                      icon={<ReloadOutlined />}
                      onClick={() => loadFiles(currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText)}
                      loading={loading}
                    >
                      刷新
                    </RoundedButton>
                  </Space>
                  <RoundedSearch
                    placeholder="搜索文件"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                  />
                </ActionBar>

                <FileList
                  loading={loading}
                  filteredFiles={filteredFiles}
                  searchText={searchText}
                  handleFolderClick={handleFolderClick}
                  handlePreview={handlePreview}
                  handleDelete={handleDelete}
                  isImageFile={isImageFile}
                />
              </StyledContent>
              
              <Footer>
                <FooterContent>
                  <span>©{new Date().getFullYear()}</span>
                  <span>MyStorageX</span>
                  <span>版权所有</span>
                </FooterContent>
              </Footer>
            </MainLayout>
          </StyledLayout>

          <AboutModal 
            isVisible={isAboutModalVisible}
            onClose={() => setIsAboutModalVisible(false)}
          />
          <UploadProgressModal
            visible={uploadModalVisible}
            uploading={isUploading}
            progress={uploadProgress}
            speeds={uploadSpeeds}
            startTimes={uploadStartTimes}
            fileSizes={uploadFileSizes}
            onClose={() => {
              if (!isUploading) {
                setUploadModalVisible(false);
                setUploadProgress({});
                setUploadSpeeds({});
                setUploadStartTimes({});
                setUploadFileSizes({});
              }
            }}
          />

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

          {/* 添加图片预览组件 */}
          <Image
            style={{ display: 'none' }}
            preview={{
              visible: previewImage !== null,
              src: previewImage?.url,
              title: previewImage?.title,
              onVisibleChange: (visible) => {
                if (!visible) setPreviewImage(null);
              },
            }}
          />

          <DuplicateFilesModal
            visible={showDuplicateModal}
            duplicateFiles={duplicateFiles}
            onCancel={() => {
              setShowDuplicateModal(false);
              setSelectedFiles([]);
              setDuplicateFiles([]);
            }}
            onSkip={() => handleDuplicateResolution('skip')}
            onOverwrite={() => handleDuplicateResolution('overwrite')}
          />
        </ContentContainer>
      </PageContainer>
    </>
  );
};

// 工具函数
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化速度显示
const formatSpeed = (speed) => {
  if (!speed) return '0 KB/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = speed;
  let unitIndex = 0;
  
  while (value > 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

export default CloudDrivePage; 