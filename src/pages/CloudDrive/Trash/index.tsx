import React, { useEffect, useState } from 'react';
import { Card, Input, Space, Row, Col, Typography, Tooltip } from 'antd';
import { DeleteOutlined, UndoOutlined, SearchOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import instance from '../../../api/axios';
import type { FileModel } from '../../../models/file/FileModel';
import FileList from './components/FileList';
import useFileOperations from './hooks/useFileOperations';
import styled from 'styled-components';
import { RoundedButton, RoundedSearch } from '../components/styles/StyledComponents';
import { TablePaginationConfig } from 'antd';
import type { Key } from 'react';

const { Title } = Typography;

const StyledCard = styled(Card)`
  margin: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  .ant-card-body {
    padding: 24px;
  }
  
  @media (max-width: 576px) {
    margin: 8px;
    .ant-card-body {
      padding: 16px;
    }
  }
`;

const HeaderWrapper = styled.div`
  margin-bottom: 24px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;

  .action-button-text {
    @media (max-width: 576px) {
      display: none;
    }
  }
`;
const Trash: React.FC = () => {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  const {
    handleRestore,
    handleDelete,
    handleBatchRestore,
    handleBatchDelete,
    handleSelectChange,
    loadRecycledFiles,
  } = useFileOperations({
    pagination,
    setPagination,
    setFiles,
    setSearchText,
    selectedRowKeys,
    setSelectedRowKeys,
    setLoading,
  });

  useEffect(() => {
    loadRecycledFiles();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
    loadRecycledFiles(value);
  };

  return (
    <StyledCard>
      <HeaderWrapper>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Title level={4} style={{ margin: 0 }}>
              <FormattedMessage id="trash.title" defaultMessage="回收站" />
            </Title>
          </Col>
        </Row>
      </HeaderWrapper>

      <ActionBar>
        <Space size={8}>
          <Tooltip title={<FormattedMessage id="trash.action.batchRestore" defaultMessage="批量还原" />}>
            <RoundedButton
              type="primary"
              icon={<UndoOutlined />}
              onClick={handleBatchRestore}
              disabled={selectedRowKeys.length === 0}
            >
              <span className="action-button-text">
                <FormattedMessage id="trash.action.batchRestore" defaultMessage="批量还原" />
              </span>
            </RoundedButton>
          </Tooltip>
          <Tooltip title={<FormattedMessage id="trash.action.batchDelete" defaultMessage="永久删除" />}>
            <RoundedButton
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              <span className="action-button-text">
                <FormattedMessage id="trash.action.batchDelete" defaultMessage="永久删除" />
              </span>
            </RoundedButton>
          </Tooltip>
        </Space>
        <RoundedSearch
          placeholder="搜索文件名"
          prefix={<SearchOutlined />}
          allowClear
          onSearch={handleSearch}
          style={{ width: 200 }}
        />
      </ActionBar>

      <div style={{ marginTop: 24 }}>
        <FileList
          files={files}
          loading={loading}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={handleSelectChange}
          onRestore={handleRestore}
          onDelete={handleDelete}
          pagination={{
            ...pagination,
            onChange: (page: number, pageSize: number) => {
              setPagination({
                ...pagination,
                current: page,
                pageSize: pageSize
              });
              loadRecycledFiles(searchText);
            }
          }}
        />
      </div>
    </StyledCard>
  );
};

export default Trash; 