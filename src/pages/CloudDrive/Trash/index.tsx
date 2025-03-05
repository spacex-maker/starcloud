import React, { useState, useEffect } from 'react';
import { Layout, Table, Input, Space, Button, message, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import type { ColumnsType } from 'antd/es/table';
import { formatFileSize } from 'utils/format';
import instance from 'api/axios';
import FileItem from '../AllFiles/components/FileItem';
import { RoundedButton, RoundedSearch } from '../components/styles/StyledComponents';
import type { FileModel } from 'models/file/FileModel';
import { FileProvider } from 'contexts/FileContext';

const { Content } = Layout;
const { Text } = Typography;

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 定义回收站文件接口，确保与 FileModel 类型兼容
interface RecycledFile {
  id: number;
  userId: number;
  parentId: number | null;
  isDirectory: boolean;
  name: string;
  extension: string | null;
  size: number;
  tag: string | null;
  storagePath: string;
  hash: string | null;
  mimeType: string | null;
  storageType: 'LOCAL' | 'COS';
  downloadUrl: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  version: number;
  status: 'ACTIVE' | 'DELETED' | 'RECYCLED';
  createTime: string;
  updateTime: string;
  color?: string;
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
  }
`;

const Trash = () => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<RecycledFile[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  const intl = useIntl();

  const loadRecycledFiles = async (searchName?: string, page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const params: any = {
        currentPage: page,
        pageSize: pageSize
      };
      
      if (searchName) {
        params.name = searchName;
      }
      
      const response = await instance.post('/productx/file-storage/list-recycled', params);

      if (response.data && response.data.success) {
        const { data, total } = response.data.data;
        const fileList = Array.isArray(data) ? data : [];

        console.log('回收站文件列表:', fileList);

        const convertedFiles: RecycledFile[] = fileList.map((file: any) => ({
          ...file,
          userId: file.userId || 0,
          tag: file.tag || null,
          storagePath: file.storagePath || '',
          hash: file.hash || null,
          mimeType: file.mimeType || null,
          storageType: file.storageType || 'COS',
          downloadUrl: file.downloadUrl || null,
          visibility: file.visibility || 'PRIVATE',
          version: file.version || 1,
          status: 'RECYCLED',
          createTime: file.createTime || '-',
          updateTime: file.updateTime || '-',
          extension: file.extension || null
        }));
        
        setFiles(convertedFiles);
        setPagination(prev => ({
          ...prev,
          total: total || 0
        }));
      } else {
        throw new Error(response.data.message || '加载失败');
      }
    } catch (error: any) {
      console.error('加载回收站文件失败:', error);
      console.error('错误详情:', {
        error,
        response: error.response?.data,
        data: error.response?.data?.data
      });
      message.error('加载失败: ' + (error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadRecycledFiles(value, 1, pagination.pageSize);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize
    }));
  };

  const columns: ColumnsType<RecycledFile> = [
    {
      title: <FormattedMessage id="filelist.column.name" />,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '50%',
      render: (_, record: RecycledFile) => (
        <FileItem
          file={record}
        />
      ),
    },
    {
      title: <FormattedMessage id="filelist.column.size" />,
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: <FormattedMessage id="filelist.column.actions" />,
      key: 'actions',
      width: 120,
      render: (_, record: RecycledFile) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<UndoOutlined />}
            size="small"
            onClick={() => handleRestore(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleRestore = async (file: RecycledFile) => {
    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/restore', [file.id]);

      if (response.data && response.data.success) {
        message.success('恢复成功');
        loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
      } else {
        throw new Error(response.data.message || '恢复失败');
      }
    } catch (error: any) {
      console.error('恢复文件失败:', error);
      message.error('恢复失败: ' + (error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: RecycledFile) => {
    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/delete', [file.id]);

      if (response.data && response.data.success) {
        message.success('永久删除成功');
        loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
      } else {
        throw new Error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      console.error('永久删除失败:', error);
      message.error('删除失败: ' + (error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要还原的文件');
      return;
    }

    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/restore', selectedRowKeys);

      if (response.data && response.data.success) {
        message.success('批量恢复成功');
        setSelectedRowKeys([]);
        loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
      } else {
        throw new Error(response.data.message || '批量恢复失败');
      }
    } catch (error: any) {
      console.error('批量恢复失败:', error);
      message.error('批量恢复失败: ' + (error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/delete', selectedRowKeys);

      if (response.data && response.data.success) {
        message.success('批量永久删除成功');
        setSelectedRowKeys([]);
        loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
      } else {
        throw new Error(response.data.message || '批量删除失败');
      }
    } catch (error: any) {
      console.error('批量永久删除失败:', error);
      message.error('批量删除失败: ' + (error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FileProvider initialParentId={0}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={8}>
            <RoundedButton
              icon={<ReloadOutlined />}
              onClick={() => loadRecycledFiles(searchText)}
              loading={loading}
            >
              <FormattedMessage id="filelist.action.refresh" />
            </RoundedButton>
            {selectedRowKeys.length > 0 && (
              <>
                <RoundedButton
                  icon={<UndoOutlined />}
                  onClick={handleBatchRestore}
                >
                  还原
                </RoundedButton>
                <RoundedButton
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                >
                  永久删除
                </RoundedButton>
                <Text type="secondary">
                  已选择 {selectedRowKeys.length} 项
                </Text>
              </>
            )}
          </Space>
          <RoundedSearch
            placeholder={intl.formatMessage({ id: 'filelist.action.search' })}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
        </div>

        <TableWrapper>
          <Table<RecycledFile>
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            columns={columns}
            dataSource={files}
            rowKey="id"
            loading={loading}
            rowClassName={(record) => record.isDirectory ? 'folder-row' : ''}
            locale={{
              emptyText: '回收站为空'
            }}
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePageChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 项`
            }}
          />
        </TableWrapper>
      </Content>
    </FileProvider>
  );
};

export default Trash; 