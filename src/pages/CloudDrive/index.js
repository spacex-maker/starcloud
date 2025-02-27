import React, { useState, useEffect } from 'react';
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

const { Content, Sider } = Layout;
const { confirm } = Modal;

const StyledLayout = styled(Layout)`
  flex: 1;
  background: var(--ant-color-bg-container);
`;

const StyledSider = styled(Sider)`
  background: var(--ant-color-bg-container);
  border-right: 1px solid var(--ant-color-border);
  height: 100%;
  overflow: auto;
  
  .ant-menu {
    background: transparent;
    border-right: none;
  }
`;

const MainLayout = styled(Layout)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled(Content)`
  flex: 1;
  padding: 24px;
  background: var(--ant-color-bg-container);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TableContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  
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
  margin-bottom: 16px;
`;

const PathContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--ant-color-border);
`;

const PathItem = styled.span`
  ${tw`
    text-gray-600 dark:text-gray-300
    hover:text-primary-500 dark:hover:text-primary-400
    cursor-pointer
    flex items-center
    text-sm
  `}
`;

const PathSeparator = styled(RightOutlined)`
  ${tw`
    text-gray-400 dark:text-gray-600
    text-xs
  `}
`;

// 添加底部商标样式
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

const AboutButton = styled(Button)`
  ${tw`
    absolute
  `}
  bottom: 5rem;
  left: 1.5rem;
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

const CloudDrivePage = () => {
  const [selectedKeys, setSelectedKeys] = useState(['all']);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [currentParentId, setCurrentParentId] = useState(0);
  const [pathHistory, setPathHistory] = useState([]);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      fetchRootDirectory();
    }
  }, [userInfo]);

  // 获取根目录信息
  const fetchRootDirectory = async () => {
    try {
      setLoading(true);
      
      // 请求根目录信息（父级 ID 为 0）
      const response = await instance.post('/productx/file-storage/list', { 
        parentId: 0, 
        status: 'ACTIVE' 
      });
      
      if (response.data && response.data.success) {
        const fileList = response.data.data.data || [];
        
        // 如果返回了数据，直接使用第一条作为根目录
        if (fileList.length > 0) {
          const rootDir = fileList[0]; // 直接使用第一条数据
          
          // 保存根目录 ID
          setRootDirectoryId(rootDir.id);
          
          // 保持加载状态，直接获取第二层数据
          try {
            // 使用根目录 ID 加载其内容
            const secondLevelResponse = await instance.post('/productx/file-storage/list', { 
              parentId: rootDir.id, 
              status: 'ACTIVE' 
            });
            
            if (secondLevelResponse.data && secondLevelResponse.data.success) {
              const secondLevelFiles = secondLevelResponse.data.data.data || [];
              
              // 转换数据格式
              const newFiles = secondLevelFiles.map(file => ({
                key: file.id.toString(),
                id: file.id,
                parentId: file.parentId,
                name: file.name,
                type: file.isDirectory ? 'folder' : 'file',
                size: file.size ? formatSize(file.size) : '-',
                extension: file.extension,
                mimeType: file.mimeType,
                downloadUrl: file.downloadUrl,
                createTime: file.createTime ? new Date(file.createTime).toLocaleString() : '-',
                updateTime: file.updateTime ? new Date(file.updateTime).toLocaleString() : '-'
              }));
              
              // 设置文件列表
              setFiles(newFiles);
              setFilteredFiles(newFiles);
              setSearchText('');
            }
          } catch (secondLevelError) {
            console.error('加载第二层数据失败:', secondLevelError);
            // 出错时不显示错误消息，避免用户看到两个错误消息
          }
          
          // 设置当前父目录 ID
          setCurrentParentId(rootDir.id);
        } else {
          console.warn('未找到根目录');
          setRootDirectoryId(null);
          loadFiles(0); // 直接加载 parentId 为 0 的内容
        }
      } else {
        throw new Error(response.data.message || '获取根目录信息失败');
      }
    } catch (error) {
      console.error('获取根目录信息失败:', error);
      message.error('获取根目录信息失败: ' + (error.message || '未知错误'));
      loadFiles(0);
    } finally {
      setLoading(false);
    }
  };

  // 加载指定目录的内容
  const loadFiles = async (parentId) => {
    if (!userInfo) {
      console.error('User info not available, cannot load files');
      return;
    }
    
    if (parentId === undefined || parentId === null) {
      console.error('Invalid parentId:', parentId);
      message.error('无效的目录ID');
      return;
    }
    
    console.log('loadFiles called with parentId:', parentId);
    
    try {
      setLoading(true);
      console.log('Sending request for files with parentId:', parentId);
      
      // 使用已配置的 axios 实例发送请求
      const response = await instance.post('/productx/file-storage/list', { 
        parentId, 
        status: 'ACTIVE' 
      });
      
      console.log('Received response:', response.data);
      
      // 根据 axios 的响应结构，数据在 response.data 中
      if (response.data && response.data.success) {
        const fileList = response.data.data.data || [];
        console.log('Received files:', fileList.length);
        
        // 转换数据格式
        const newFiles = fileList.map(file => ({
          key: file.id.toString(),
          id: file.id,
          parentId: file.parentId,
          name: file.name,
          type: file.isDirectory ? 'folder' : 'file',
          size: file.size ? formatSize(file.size) : '-',
          extension: file.extension,
          mimeType: file.mimeType,
          downloadUrl: file.downloadUrl,
          createTime: file.createTime ? new Date(file.createTime).toLocaleString() : '-',
          updateTime: file.updateTime ? new Date(file.updateTime).toLocaleString() : '-'
        }));
        
        console.log('Setting files state with', newFiles.length, 'files');
        setFiles(newFiles);
        setFilteredFiles(newFiles);
        setSearchText('');
      } else {
        throw new Error(response.data.message || '获取文件列表失败');
      }
    } catch (error) {
      console.error('加载文件列表失败:', error);
      message.error('加载文件列表失败: ' + (error.message || '未知错误'));
      // 出错时设置空数组，避免显示旧数据
      setFiles([]);
      setFilteredFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (fileList) => {
    if (!userInfo) {
      message.error('请先登录');
      return;
    }
    
    setUploadModalVisible(true);
    setIsUploading(true);
    
    const newStartTimes = {};
    const newFileSizes = {};
    const newProgress = {};
    const newSpeeds = {};
    
    // 初始化进度信息
    fileList.forEach(file => {
      newStartTimes[file.name] = Date.now();
      newFileSizes[file.name] = file.size;
      newProgress[file.name] = 0;
      newSpeeds[file.name] = '0 KB/s';
    });
    
    setUploadStartTimes(newStartTimes);
    setUploadFileSizes(newFileSizes);
    setUploadProgress(newProgress);
    setUploadSpeeds(newSpeeds);

    try {
      // 构建包含用户名的完整路径
      const fullPath = `${userInfo.username}/${currentPath}`;
      
      // 上传所有文件
      const uploadResults = await Promise.all(fileList.map(file => 
        cosService.uploadFile(file, fullPath, (progress, speed) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.round(progress)
          }));
          
          setUploadSpeeds(prev => ({
            ...prev,
            [file.name]: speed ? formatSpeed(speed) : '0 KB/s'
          }));
        })
      ));
      
      // 为每个上传的文件调用后端接口保存信息
      await Promise.all(uploadResults.map(async (result, index) => {
        const file = fileList[index];
        const fileExtension = file.name.split('.').pop();
        
        // 调用后端接口保存文件信息
        await instance.post('/productx/file-storage/create-directory', {
          parentId: currentParentId,
          isDirectory: false,
          name: file.name,
          extension: fileExtension,
          size: file.size,
          storagePath: result.key, // 使用对象存储返回的 key 作为存储路径
          hash: result.etag, // 使用对象存储返回的 ETag 作为哈希值
          mimeType: file.type,
          storageType: 'COS', // 假设使用腾讯云对象存储
          downloadUrl: result.url, // 使用对象存储返回的 URL
          visibility: 'PRIVATE'
        });
      }));

      message.success('上传成功');
      loadFiles(currentParentId);
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败: ' + (error.message || '未知错误'));
    } finally {
      setIsUploading(false);
    }
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
      async onOk() {
        try {
          setLoading(true);
          
          // 1. 先从对象存储中删除文件或文件夹
          if (record.storagePath) {
            await cosService.deleteFile(record.storagePath);
          }
          
          // 2. 调用后端接口删除数据库记录
          const response = await instance.post('/productx/file-storage/delete', [record.id]);
          
          if (response.data && response.data.success) {
            message.success('删除成功');
            // 刷新文件列表
            loadFiles(currentParentId);
          } else {
            throw new Error(response.data.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败: ' + (error.message || '未知错误'));
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        // 用户取消删除，不做任何操作
      },
    });
  };

  // 处理文件夹点击
  const handleFolderClick = (folder) => {
    console.log('Folder clicked:', folder.name, 'id:', folder.id);
    
    // 保存当前路径到历史记录，使用文件夹的ID而不是currentParentId
    setPathHistory(prev => {
      const newHistory = [...prev, {
        id: folder.id,  // 使用文件夹的ID
        name: folder.name
      }];
      console.log('New path history:', newHistory);
      return newHistory;
    });
    
    // 更新当前路径
    setCurrentPath(prev => {
      const newPath = prev ? `${prev}${folder.name}/` : `${folder.name}/`;
      console.log('New current path:', newPath);
      return newPath;
    });
    
    // 更新当前父目录ID，这会触发 useEffect 重新加载文件列表
    setCurrentParentId(folder.id);
  };

  // 处理路径点击
  const handlePathClick = (index) => {
    console.log('Path clicked at index:', index, 'current history:', pathHistory);
    
    // 获取目标路径信息
    const targetPath = pathHistory[index];
    console.log('Target path:', targetPath);
    
    if (!targetPath || targetPath.id === undefined) {
      console.error('Invalid target path:', targetPath);
      return;
    }
    
    // 更新路径历史记录 - 保留到点击的索引
    setPathHistory(prev => {
      const newHistory = prev.slice(0, index + 1);
      console.log('Updated path history:', newHistory);
      return newHistory;
    });
    
    // 更新当前路径
    const pathParts = [];
    for (let i = 0; i <= index; i++) {
      if (pathHistory[i]) {
        pathParts.push(pathHistory[i].name);
      }
    }
    const newPath = pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
    console.log('New current path:', newPath);
    setCurrentPath(newPath);
    
    // 直接调用 loadFiles 加载目标目录内容
    const parentId = targetPath.id;
    console.log('Directly loading files for parentId:', parentId);
    
    // 直接加载文件
    loadFiles(parentId);
    
    // 更新当前父目录ID
    setCurrentParentId(parentId);
  };

  // 处理返回根目录
  const handleHomeClick = () => {
    console.log('Home icon clicked, loading root directory content');
    setCurrentPath('');
    setPathHistory([]);
    
    // 显示加载状态
    setLoading(true);
    
    // 使用根目录 ID 加载其内容
    if (rootDirectoryId) {
      loadFiles(rootDirectoryId);
      setCurrentParentId(rootDirectoryId);
    } else {
      loadFiles(0);
      setCurrentParentId(0);
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
        loadFiles(currentParentId);
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

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '50%',
      render: (text, record) => (
        <div>
          <Space>
            {record.type === 'folder' ? (
              <FolderOutlined style={{ color: '#ffd591' }} />
            ) : isImageFile(text) ? (
              <FileImageOutlined style={{ color: '#85a5ff' }} />
            ) : (
              <FileOutlined style={{ color: '#91d5ff' }} />
            )}
            <span
              style={{ 
                cursor: record.type === 'folder' ? 'pointer' : 'default',
                color: record.type === 'folder' ? 'var(--ant-color-primary)' : 'inherit'
              }}
              onClick={() => {
                if (record.type === 'folder') {
                  handleFolderClick(record);
                }
              }}
            >
              {text}
            </span>
          </Space>
          {record.type === 'file' && isImageFile(text) && record.downloadUrl && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
              style={{ marginLeft: 24, padding: 0 }}
            >
              预览图片
            </Button>
          )}
        </div>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: '15%',    // 固定宽度
      align: 'right',  // 右对齐
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '20%',    // 固定宽度
      align: 'center', // 居中对齐
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: '20%',    // 固定宽度
      align: 'center', // 居中对齐
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          {record.type === 'file' && record.downloadUrl && (
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.downloadUrl)}
            >
              下载
            </Button>
          )}
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 添加一个新的 useEffect 来监听 currentParentId 的变化
  useEffect(() => {
    // 避免初始加载时重复请求
    if (currentParentId !== 0 && currentParentId !== rootDirectoryId && userInfo) {
      console.log('Loading files for parentId:', currentParentId);
      loadFiles(currentParentId);
    }
  }, [currentParentId, rootDirectoryId, userInfo]);

  // 添加新建文件夹模态框
  const renderNewFolderModal = () => (
    <Modal
      title="新建文件夹"
      open={newFolderModalVisible}
      onOk={handleCreateFolder}
      onCancel={() => {
        setNewFolderModalVisible(false);
        setNewFolderName('');
      }}
      confirmLoading={creatingFolder}
    >
      <Input
        placeholder="请输入文件夹名称"
        value={newFolderName}
        onChange={e => setNewFolderName(e.target.value)}
        onPressEnter={handleCreateFolder}
        autoFocus
      />
    </Modal>
  );

  return (
    <PageContainer>
      <SimpleHeader />
      <ContentContainer>
        <StyledLayout>
          <StyledSider width={200}>
            <Menu
              mode="inline"
              selectedKeys={selectedKeys}
              onSelect={({ key }) => setSelectedKeys([key])}
              items={[
                {
                  key: 'all',
                  icon: <FolderOutlined />,
                  label: '全部文件',
                },
                {
                  key: 'images',
                  icon: <FolderOutlined />,
                  label: '图片',
                },
                {
                  key: 'documents',
                  icon: <FolderOutlined />,
                  label: '文档',
                },
                {
                  key: 'videos',
                  icon: <FolderOutlined />,
                  label: '视频',
                },
              ]}
            />
            <AboutButton
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => setIsAboutModalVisible(true)}
            >
              关于我们
            </AboutButton>
          </StyledSider>
          
          <MainLayout>
            <StyledContent>
              <PathContainer>
                <HomeOutlined 
                  style={{ 
                    color: 'var(--ant-color-text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    console.log('Home icon clicked');
                    handleHomeClick();
                  }}
                />
                {pathHistory.map((path, index) => (
                  <React.Fragment key={index}>
                    <PathSeparator />
                    <PathItem 
                      onClick={() => {
                        console.log('Path item clicked:', path.name, 'index:', index);
                        handlePathClick(index);
                      }}
                    >
                      {path.name}
                    </PathItem>
                  </React.Fragment>
                ))}
              </PathContainer>
              
              <ActionBar>
                <Space>
                  <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={(file, fileList) => {
                      handleUpload(fileList);
                      return false; // 阻止默认上传
                    }}
                    disabled={isUploading}
                  >
                    <Button 
                      type="primary" 
                      icon={<CloudUploadOutlined />}
                      loading={isUploading}
                    >
                      上传文件
                    </Button>
                  </Upload>
                  <Button 
                    icon={<FolderOutlined />}
                    onClick={() => setNewFolderModalVisible(true)}
                  >
                    新建文件夹
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => loadFiles(currentParentId)}
                    loading={loading}
                  >
                    刷新
                  </Button>
                </Space>
                <Input
                  placeholder="搜索文件"
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                />
              </ActionBar>

              <Table
                columns={columns}
                dataSource={filteredFiles}
                loading={loading}
                pagination={false}
                locale={{
                  emptyText: searchText ? '没有找到相关文件' : '当前文件夹为空'
                }}
                scroll={{
                  y: 'calc(100vh - 300px)',
                  x: 1200
                }}
                size="middle"
                rowKey="key"
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

        {/* 渲染新建文件夹模态框 */}
        {renderNewFolderModal()}

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
      </ContentContainer>
    </PageContainer>
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