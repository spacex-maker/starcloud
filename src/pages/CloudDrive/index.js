import React, { useState, useEffect} from 'react';
import { Layout,Button, Space, Input, Upload, Modal, Image } from 'antd';
import {
  FolderOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import tw, { styled } from 'twin.macro';
import SimpleHeader from "components/headers/simple";
import AboutModal from "components/modals/AboutModal";
import { cosService } from 'services/cos';
import { message } from 'antd';
import instance from 'api/axios'; // 导入已配置的 axios 实例
import { Helmet } from 'react-helmet';
import DuplicateFilesModal from 'components/modals/DuplicateFilesModal';
import FileList from './FileList';
import NewFolderModal from './NewFolderModal';
import PathHistory from './PathHistory';
import SideMenu from './SideMenu';
import { fetchRootDirectory, loadFiles, checkDuplicates, deleteFile } from 'services/fileService';
import debounce from 'lodash/debounce';
import _ from 'lodash';
import FileUploadModal from 'components/modals/FileUploadModal';
import DownloadManager from 'components/modals/DownloadManager';

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

const CloudDrivePage = () => {
  const [selectedKeys, setSelectedKeys] = useState(['all']);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentParentId, setCurrentParentId] = useState(0);
  const [pathHistory, setPathHistory] = useState([]);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [fileUploadModalVisible, setFileUploadModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    url: '',
    title: '',
    key: 0
  });
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
  const [uploadStates, setUploadStates] = useState({
    files: new Map(),
    isUploading: false
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloadTasks, setDownloadTasks] = useState([]);
  const [downloadManagerVisible, setDownloadManagerVisible] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });

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
        setSearchText,
        setPagination,
        pagination
      );
    }
  }, [userInfo]);

  // 添加分页变化处理函数
  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize
    }));
    
    // 重新加载当前目录的文件
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

  // 修改文件夹点击处理函数
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
      
      // 重置分页到第一页
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      await loadFiles(
        folder.id,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText,
        setPagination,
        {
          ...pagination,
          currentPage: 1
        }
      );
    } catch (error) {
      console.error('Failed to navigate to folder:', error);
      message.error('打开文件夹失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 添加检查文件重复的函数
  const checkDuplicateFiles = (newFiles) => {
    // 获取当前目录下的所有文件
    const currentFiles = files.filter(f => !f.isDirectory);
    const duplicates = [];
    const unique = [];

    newFiles.forEach(file => {
      const existingFile = currentFiles.find(f => f.name === file.name);
      if (existingFile) {
        duplicates.push({
          file,
          existingFile
        });
      } else {
        unique.push(file);
      }
    });

    return { duplicates, unique };
  };

  // 修改 handleUpload 函数
  const handleUpload = async (files) => {
    const fileList = Array.from(files);
    
    // 检查重复文件
    const uploadStates = new Map();
    
    fileList.forEach(file => {
      const isDuplicate = filteredFiles.some(existingFile => existingFile.name === file.name);
      uploadStates.set(file.name, {
        file,
        name: file.name,
        fileSize: file.size,
        status: 'pending',
        progress: 0,
        isDuplicate,
        action: isDuplicate ? 'ask' : 'upload',
      });
    });
    
    setUploadStates(prev => ({
      ...prev,
      files: uploadStates
    }));
    setFileUploadModalVisible(true);
  };

  // 修改 handleStartUpload 函数
  const handleStartUpload = async () => {
    setUploadStates(prev => ({
      ...prev,
      isUploading: true
    }));
    
    const filesToUpload = Array.from(uploadStates.files.values())
      .filter(fileState => fileState.status === 'pending')
      .map(fileState => fileState.file);

    if (filesToUpload.length === 0) {
      message.info('没有需要上传的文件');
      setUploadStates(prev => ({
        ...prev,
        isUploading: false
      }));
      return;
    }

    try {
      await uploadFiles(filesToUpload);
    } catch (error) {
      console.error('上传过程中发生错误:', error);
      message.error('上传过程中发生错误: ' + (error.message || '未知错误'));
    } finally {
      setUploadStates(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  };

  // 处理批量重复文件决策
  const handleBatchDuplicateDecision = (action) => {
    setUploadStates(prev => {
      const newFiles = new Map(prev.files);
      Array.from(newFiles.values())
        .filter(file => file.isDuplicate)
        .forEach(file => {
          newFiles.set(file.file.name, {
            ...file,
            action: action,
            status: action === 'skip' ? 'skipped' : 'pending'
          });
        });
      return {
        ...prev,
        files: newFiles
      };
    });
    setShowDuplicateModal(false);
  };

  // 处理单个文件的重复决策
  const handleDuplicateDecision = (fileName, action) => {
    setUploadStates(prev => {
      const newFiles = new Map(prev.files);
      const fileState = newFiles.get(fileName);
      if (fileState) {
        newFiles.set(fileName, {
          ...fileState,
          action,
          status: action === 'skip' ? 'skipped' : 'pending'
        });
      }
      return {
        ...prev,
        files: newFiles
      };
    });
  };

  // 修改 uploadFiles 函数
  const uploadFiles = async (filesToUpload) => {
    // 初始化上传状态
    const initialUploadStates = new Map(filesToUpload.map(file => [
      file.name,
      {
        progress: 0,
        speed: 0,
        startTime: Date.now(),
        fileSize: file.size,
        isCompleted: false,
        lastProgress: 0,
        lastTime: Date.now(),
        uploadCompleted: false,
        fileCreated: false,
        status: 'pending',
        isDuplicate: uploadStates.files.get(file.name)?.isDuplicate || false,
        file
      }
    ]));

    setUploadStates(prev => ({
      isUploading: true,
      files: initialUploadStates
    }));

    try {
      const fullPath = `${userInfo.username}/${currentPath}`;
      const controller = new AbortController();
      
      // 并行上传所有文件
      const uploadPromises = filesToUpload.map(async file => {
        try {
          // 更新状态为上传中，保持 isDuplicate 状态
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'uploading',
              startTime: Date.now(),
              lastTime: Date.now(),
              lastProgress: 0,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          // 上传到对象存储
          const uploadResult = await cosService.uploadFile(
            file,
            fullPath,
            (progress) => {
              setUploadStates(prev => {
                const state = prev.files.get(file.name);
                if (!state || state.uploadCompleted) return prev;

                const now = Date.now();
                const timeDiff = (now - state.lastTime) / 1000; // 转换为秒
                
                if (timeDiff >= 0.5) { // 每0.5秒更新一次速度
                  const progressDiff = progress - state.lastProgress;
                  const uploadedBytes = (progressDiff / 100) * file.size;
                  const speed = uploadedBytes / timeDiff;
                  
                  const newFiles = new Map(prev.files);
                  newFiles.set(file.name, {
                    ...state,
                    progress: Math.round(progress),
                    speed: speed,
                    lastProgress: progress,
                    lastTime: now
                  });
                  
                  return {
                    ...prev,
                    files: newFiles
                  };
                }
                
                return prev;
              });
            },
            controller.signal
          );

          // 更新状态为创建文件记录
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'creating',
              progress: 100,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          // 创建文件记录
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

          // 更新为上传成功状态
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'success',
              uploadCompleted: true,
              fileCreated: true,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          return { success: true, file };
        } catch (error) {
          // 更新为失败状态
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'error',
              progress: 0,
              speed: 0,
              errorMessage: error.message
            });
            return { ...prev, files: newFiles };
          });

          return { success: false, file, error };
        }
      });

      // 等待所有上传完成
      const results = await Promise.all(uploadPromises);
      
      // 统计成功和失败的数量
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      // 显示上传结果
      if (failureCount === 0) {
        message.success(`成功上传 ${successCount} 个文件`);
      } else {
        message.warning(`${successCount} 个文件上传成功，${failureCount} 个文件上传失败`);
      }
      
      // 刷新文件列表
      await loadFiles(currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText);
    } catch (error) {
      console.error('上传过程中发生错误:', error);
      message.error('上传过程中发生错误: ' + (error.message || '未知错误'));
    } finally {
      setUploadStates(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  };

  // 修改 handleDuplicateResolution 函数
  const handleDuplicateResolution = (action) => {
    setUploadStates(prev => {
      const newFiles = new Map(prev.files);
      Array.from(newFiles.values())
        .filter(file => file.isDuplicate)
        .forEach(file => {
          newFiles.set(file.file.name, {
            ...file,
            action: action
          });
        });
      return {
        ...prev,
        files: newFiles
      };
    });
    setShowDuplicateModal(false);
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
      
      setPathHistory([]);
      setCurrentPath('');
      
      const targetId = rootDirectoryId || 0;
      setCurrentParentId(targetId);
      
      // 重置分页到第一页
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      await loadFiles(
        targetId,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText,
        setPagination,
        {
          ...pagination,
          currentPage: 1
        }
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

  // 修改预览处理函数
  const handlePreview = (file) => {
    if (!file.downloadUrl) {
      message.error('无法预览，下载链接不存在');
      return;
    }
    
    // 直接设置新的预览状态，使用新的 key 强制重新渲染
    setPreviewImage({
      visible: true,
      url: file.downloadUrl,
      title: file.name,
      key: Date.now()  // 使用时间戳作为唯一 key
    });
  };

  // 处理预览关闭
  const handlePreviewClose = () => {
    setPreviewImage({
      visible: false,
      url: '',
      title: '',
      key: 0
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

  const handleCloseUploadModal = () => {
    if (!uploadStates.isUploading) {
      setFileUploadModalVisible(false);
      setUploadStates(prev => ({
        ...prev,
        files: new Map()
      }));
    }
  };

  // 处理文件移除
  const handleRemoveFiles = (fileNames) => {
    const newUploadStates = { ...uploadStates };
    const newFiles = new Map(newUploadStates.files);
    
    fileNames.forEach(fileName => {
      newFiles.delete(fileName);
    });
    
    newUploadStates.files = newFiles;
    setUploadStates(newUploadStates);
    message.success('已移除选中的文件');
  };

  // 处理添加更多文件
  const handleAddFiles = (newFiles) => {
    const newUploadStates = new Map(uploadStates.files);
    
    newFiles.forEach(file => {
      const isDuplicate = filteredFiles.some(existingFile => existingFile.name === file.name) ||
                         Array.from(newUploadStates.keys()).includes(file.name);
      
      newUploadStates.set(file.name, {
        file,
        name: file.name,
        fileSize: file.size,
        status: 'pending',
        progress: 0,
        isDuplicate,
        action: 'upload' // 所有文件都设置为上传
      });
    });
    
    setUploadStates(prev => ({
      ...prev,
      files: newUploadStates
    }));
    
    message.success(`已添加 ${newFiles.length} 个文件`);
  };

  // 处理多选变化
  const handleSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    const selectedItems = filteredFiles.filter(file => selectedRowKeys.includes(file.key));
    const fileNames = selectedItems.map(file => file.name).join('、');

    confirm({
      title: '确认删除',
      content: `确定要删除以下 ${selectedRowKeys.length} 个文件吗？此操作不可恢复。\n${fileNames}`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          
          // 并行删除所有选中的文件
          const deletePromises = selectedItems.map(async (file) => {
            if (file.storagePath) {
              await cosService.deleteFile(file.storagePath);
            }
            return file.id;
          });
          
          await Promise.all(deletePromises);
          
          // 删除数据库记录
          const response = await instance.post('/productx/file-storage/delete', selectedRowKeys);
          
          if (response.data && response.data.success) {
            message.success(`成功删除 ${selectedRowKeys.length} 个文件`);
            setSelectedRowKeys([]); // 清空选择
            // 刷新文件列表
            await loadFiles(currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText);
          } else {
            throw new Error(response.data.message || '删除失败');
          }
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败: ' + (error.message || '未知错误'));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 处理下载任务
  const startDownload = async (file) => {
    try {
      if (!file.downloadUrl) {
        throw new Error('下载链接不存在');
      }

      const xhr = new XMLHttpRequest();
      const downloadId = Date.now().toString();

      // 创建新的下载任务，确保文件大小被正确转换为数字
      const newTask = {
        id: downloadId,
        filename: file.name,
        size: Number(file.size) || 0,
        progress: 0,
        speed: 0,
        status: 'downloading',
        xhr: xhr,
        totalBytes: Number(file.size) || 0,
        loadedBytes: 0
      };

      // 显示下载管理器
      setDownloadManagerVisible(true);
      
      // 添加新的下载任务
      setDownloadTasks(prev => [...prev, newTask]);

      xhr.open('GET', file.downloadUrl, true);
      xhr.responseType = 'blob';

      let lastLoaded = 0;
      let lastTime = Date.now();

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const now = Date.now();
          const timeElapsed = (now - lastTime) / 1000; // 转换为秒
          const loadedDiff = event.loaded - lastLoaded;
          const speed = timeElapsed > 0 ? loadedDiff / timeElapsed : 0;
          const totalBytes = Number(event.total) || Number(file.size) || 0;
          const loadedBytes = Number(event.loaded) || 0;

          setDownloadTasks(prev => 
            prev.map(task => 
              task.id === downloadId
                ? {
                    ...task,
                    progress: Math.round((loadedBytes / totalBytes) * 100),
                    speed: speed,
                    totalBytes: totalBytes,
                    loadedBytes: loadedBytes
                  }
                : task
            )
          );

          lastLoaded = loadedBytes;
          lastTime = now;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          
          // 创建下载链接
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          
          // 显示保存位置提示
          message.success(
            <span>
              文件将保存到下载目录：<br />
              <strong style={{ wordBreak: 'break-all' }}>~/Downloads/{file.name}</strong>
            </span>,
            4
          );
          
          // 触发下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // 更新下载状态
          setDownloadTasks(prev =>
            prev.map(task =>
              task.id === downloadId
                ? { ...task, status: 'completed', progress: 100, speed: 0 }
                : task
            )
          );

          // 清理
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        } else {
          throw new Error('下载失败');
        }
      };

      xhr.onerror = () => {
        setDownloadTasks(prev =>
          prev.map(task =>
            task.id === downloadId
              ? { ...task, status: 'error', progress: 0, speed: 0 }
              : task
          )
        );
      };

      xhr.send();
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败: ' + (error.message || '未知错误'));
    }
  };

  // 处理取消下载
  const handleCancelDownload = (downloadId) => {
    setDownloadTasks(prev => {
      const task = prev.find(t => t.id === downloadId);
      if (task && task.xhr) {
        task.xhr.abort();
      }
      return prev.map(t =>
        t.id === downloadId
          ? { ...t, status: 'error', progress: 0, speed: 0 }
          : t
      );
    });
  };

  // 清除已完成的下载
  const handleClearDownloads = () => {
    setDownloadTasks(prev => prev.filter(task => task.status === 'downloading'));
  };

  // 修改批量下载函数
  const handleBatchDownload = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要下载的文件');
      return;
    }

    const selectedItems = filteredFiles.filter(file => 
      selectedRowKeys.includes(file.key) && !file.isDirectory
    );

    if (selectedItems.length === 0) {
      message.error('没有可下载的文件');
      return;
    }

    // 显示下载管理器
    setDownloadManagerVisible(true);

    // 开始下载所有选中的文件
    selectedItems.forEach(file => {
      startDownload(file);
    });

    // 清除选中状态
    setSelectedRowKeys([]);
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
                      disabled={uploadStates.isUploading}
                    >
                      <RoundedButton
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        loading={uploadStates.isUploading}
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
                    {selectedRowKeys.length > 0 && (
                      <>
                        <RoundedButton
                          icon={<DownloadOutlined />}
                          onClick={handleBatchDownload}
                        >
                          批量下载
                        </RoundedButton>
                        <RoundedButton
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleBatchDelete}
                        >
                          批量删除
                        </RoundedButton>
                      </>
                    )}
                    <RoundedButton
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
                  selectedRowKeys={selectedRowKeys}
                  onSelectChange={handleSelectChange}
                  onDownload={startDownload}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </StyledContent>
            </MainLayout>
          </StyledLayout>

          <AboutModal 
            isVisible={isAboutModalVisible}
            onClose={() => setIsAboutModalVisible(false)}
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

          {/* 修改图片预览组件，使用 key 强制重新渲染 */}
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

          <FileUploadModal
            visible={fileUploadModalVisible}
            uploadingFiles={uploadStates.files}
            isUploading={uploadStates.isUploading}
            onStartUpload={handleStartUpload}
            onCancel={handleCloseUploadModal}
            onDuplicateDecision={handleDuplicateDecision}
            onRemoveFiles={handleRemoveFiles}
            onAddFiles={handleAddFiles}
          />

          <DownloadManager
            downloads={downloadTasks}
            onCancel={handleCancelDownload}
            onClear={handleClearDownloads}
            onCollapse={(collapsed) => setDownloadManagerVisible(!collapsed)}
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