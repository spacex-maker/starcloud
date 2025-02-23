import React, { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Space, Input, Upload } from 'antd';
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
} from '@ant-design/icons';
import tw, { styled } from 'twin.macro';
import SimpleHeader from "components/headers/simple";
import AboutModal from "components/modals/AboutModal";
import { cosService } from 'services/cos';
import { message } from 'antd';
import UploadProgressModal from 'components/modals/UploadProgressModal';

const { Content, Sider } = Layout;

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
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  
  .ant-table-wrapper {
    height: 100%;
    
    .ant-spin-nested-loading {
      height: 100%;
      
      .ant-spin-container {
        height: 100%;
        display: flex;
        flex-direction: column;
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

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await cosService.listFiles(currentPath);
      
      const files = [
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
      ].filter(file => file.name); // 过滤掉空名称

      setFiles(files);
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
    
    // 初始化进度信息
    files.forEach(file => {
      newStartTimes[file.name] = Date.now();
      newFileSizes[file.name] = file.size;
    });
    
    setUploadStartTimes(newStartTimes);
    setUploadFileSizes(newFileSizes);

    try {
      await Promise.all(files.map(file => 
        cosService.uploadFile(file, currentPath, (progress, speed) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.round(progress * 100)
          }));
          setUploadSpeeds(prev => ({
            ...prev,
            [file.name]: speed
          }));
        })
      ));

      message.success('上传成功');
      loadFiles();
    } catch (error) {
      message.error('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (key) => {
    try {
      await cosService.deleteFile(key);
      message.success('删除成功');
      loadFiles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePathClick = (index) => {
    const newPath = currentPath.split('/').slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const handleFolderClick = (folder) => {
    setCurrentPath(folder.key);
  };

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
          {text}
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '修改日期',
      dataIndex: 'modifiedDate',
      key: 'modifiedDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Button type="text" danger icon={<DeleteOutlined />}>
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
                />
              </ActionBar>

              <Table
                columns={[
                  {
                    title: '文件名',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text, record) => (
                      <Space>
                        {record.type === 'folder' ? (
                          <FolderOutlined style={{ color: '#ffd591' }} />
                        ) : (
                          <FileOutlined style={{ color: '#91d5ff' }} />
                        )}
                        <span
                          style={{ 
                            cursor: record.type === 'folder' ? 'pointer' : 'default',
                            color: record.type === 'folder' ? 'var(--ant-color-primary)' : 'inherit'
                          }}
                          onClick={() => record.type === 'folder' && handleFolderClick(record)}
                        >
                          {text}
                        </span>
                      </Space>
                    ),
                  },
                  {
                    title: '大小',
                    dataIndex: 'size',
                    key: 'size',
                  },
                  {
                    title: '修改日期',
                    dataIndex: 'modifiedDate',
                    key: 'modifiedDate',
                  },
                  {
                    title: '操作',
                    key: 'action',
                    render: (_, record) => (
                      <Space size="middle">
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
                ]}
                dataSource={files}
                loading={loading}
                pagination={false}
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

export default CloudDrivePage; 