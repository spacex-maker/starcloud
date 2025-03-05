import React, { useEffect, useState } from 'react';
import { Card, Input, Space, Button, Row, Col } from 'antd';
import { DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import instance from 'api/axios';
import type { FileModel } from 'models/file/FileModel';
import FileList from './components/FileList';
import { useFileOperations } from './hooks/useFileOperations';
import styled from 'styled-components';

const { Search } = Input;

const StyledCard = styled(Card)`
  margin: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
`;

const Trash: React.FC = () => {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  const loadRecycledFiles = async (searchName?: string, page?: number, pageSize?: number) => {
    try {
      const params = {
        searchName: searchName || '',
        page: page || pagination.currentPage,
        pageSize: pageSize || pagination.pageSize,
      };

      const response = await instance.get('/productx/file-storage/recycle', { params });
      
      if (response.data && Array.isArray(response.data.data)) {
        setFiles(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
        }));
      } else {
        console.error('Invalid response format:', response.data);
        setFiles([]);
      }
    } catch (error) {
      console.error('加载回收站文件失败:', error);
      setFiles([]);
    }
  };

  const {
    selectedRowKeys,
    loading,
    handleRestore,
    handleDelete,
    handleBatchRestore,
    handleBatchDelete,
    handleSelectChange,
  } = useFileOperations(loadRecycledFiles, searchText, pagination);

  useEffect(() => {
    loadRecycledFiles();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadRecycledFiles(value, 1, pagination.pageSize);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize,
    }));
    loadRecycledFiles(searchText, page, pageSize);
  };

  return (
    <StyledCard>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Search
            placeholder="搜索文件名"
            allowClear
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>
        <Col>
          <Space>
            <Button
              icon={<UndoOutlined />}
              onClick={handleBatchRestore}
              disabled={selectedRowKeys.length === 0}
            >
              <FormattedMessage id="trash.action.batchRestore" />
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              <FormattedMessage id="trash.action.batchDelete" />
            </Button>
          </Space>
        </Col>
      </Row>

      <FileList
        loading={loading}
        files={files}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={handleSelectChange}
        onRestore={handleRestore}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </StyledCard>
  );
};

export default Trash; 