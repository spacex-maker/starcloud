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
} from '@ant-design/icons';
import tw, { styled } from 'twin.macro';
import SimpleHeader from "components/headers/simple";
import AboutModal from "components/modals/AboutModal";
import { cosService } from 'services/cos';
import { message } from 'antd';
import UploadProgressModal from 'components/modals/UploadProgressModal';

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

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await cosService.listFiles(currentPath);
      
      const newFiles = [
        ...(result.CommonPrefixes || []).map(prefix => ({
          key: prefix.Prefix,
          name: prefix.Prefix.split('/').slice(-2)[0] || prefix.Prefix,
          type: 'folder',
          size: '-',
          modifiedDate: '-'
        })),
        ...(result.Contents || []).filter(file => file.Key !== currentPath).map(file => ({
          key: file.Key,
          name: file.Key.split('/').pop(),
          type: 'file',
          size: formatSize(file.Size),
          modifiedDate: new Date(file.LastModified).toLocaleString()
        }))
      ].filter(file => file.name);

      setFiles(newFiles);
      setFilteredFiles(newFiles);  // 初始化过滤后的文件列表
      setSearchText('');  // 重置搜索文本
    } catch (error) {
      console.error('加载文件列表失败:', error);
      message.error('加载文件列表失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    setUploadModalVisible(true);
    setIsUploading(true);
    
    const newStartTimes = {};
    const newFileSizes = {};
    const newProgress = {};
    const newSpeeds = {};
    
    // 初始化进度信息
    files.forEach(file => {
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
      await Promise.all(files.map(file => 
        cosService.uploadFile(file, currentPath, (progress, speed) => {
          // 使用函数形式的 setState 确保获取最新状态
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            // 确保进度只能增加，不能减少
            const newProgress = Math.max(currentProgress, Math.round(progress));
            return {
              ...prev,
              [file.name]: newProgress
            };
          });
          
          setUploadSpeeds(prev => ({
            ...prev,
            [file.name]: speed ? formatSpeed(speed) : '0 KB/s'
          }));
        })
      ));

      message.success('上传成功');
      loadFiles();
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败: ' + (error.message || '未知错误'));
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadModalVisible(false);
        setUploadProgress({});
        setUploadSpeeds({});
        setUploadStartTimes({});
        setUploadFileSizes({});
      }, 1000);
    }
  };

  const handleDelete = (key) => {
    const fileName = key.split('/').pop();
    
    confirm({
      title: '确认删除',
      content: `确定要删除 "${fileName}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await cosService.deleteFile(key);
          message.success('删除成功');
          loadFiles();  // 刷新文件列表
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      },
      onCancel() {
        // 用户取消删除，不做任何操作
      },
    });
  };

  const handlePathClick = (index) => {
    const newPath = currentPath.split('/').slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const handleFolderClick = (folder) => {
    setCurrentPath(folder.key);
  };

  // 判断是否是图片文件
  const isImageFile = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const ext = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(ext);
  };

  // 处理图片预览
  const handlePreview = (file) => {
    setPreviewImage({
      url: `${cosService.host}${file.key}`,
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
          {record.type === 'file' && isImageFile(text) && (
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
      title: '修改日期',
      dataIndex: 'modifiedDate',
      key: 'modifiedDate',
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
          {record.type === 'file' && (
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              onClick={() => window.open(`${cosService.host}${record.key}`)}
            >
              下载
            </Button>
          )}
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

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
                  style={{ color: 'var(--ant-color-text-secondary)' }}
                  onClick={() => setCurrentPath('')}
                />
                {currentPath.split('/').filter(Boolean).map((path, index) => (
                  <React.Fragment key={index}>
                    <PathSeparator />
                    <PathItem onClick={() => handlePathClick(index)}>
                      {path}
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
                  <Button icon={<FolderOutlined />}>新建文件夹</Button>
                </Space>
                <Input
                  placeholder="搜索文件"
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear  // 添加清除按钮
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
                  x: 1200  // 增加最小宽度以确保固定列正常工作
                }}
                size="middle"     // 稍微紧凑一点的尺寸
                rowKey="key"      // 使用文件的 key 作为行的唯一标识
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