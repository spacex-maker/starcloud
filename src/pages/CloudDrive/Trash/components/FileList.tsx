import React, { FC } from 'react';
import { Table, Space, Button, Typography, theme, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { formatFileSize } from 'utils/format';
import FileItem from '../../AllFiles/components/FileItem';
import type { FileModel } from 'models/file/FileModel';
import styled from 'styled-components';

const { Text } = Typography;

interface FileListProps {
  loading: boolean;
  files: FileModel[];
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedRowKeys: React.Key[]) => void;
  onRestore: (file: FileModel) => void;
  onDelete: (file: FileModel) => void;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number, pageSize: number) => void;
}

const TableWrapper = styled.div`
  .ant-table {
    background: transparent;
  }

  .ant-table-wrapper {
    border-radius: 12px;
    overflow: hidden;
  }

  .ant-table-thead > tr > th {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.04)' 
      : 'rgba(0, 0, 0, 0.02)'};
    padding: 16px;
    font-weight: 600;
  }

  .ant-table-tbody > tr > td {
    padding: 16px;
    transition: all 0.3s ease;
  }
  
  .ant-table-row {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
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

  .ant-table-pagination {
    margin: 16px 0;
    padding: 16px;
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.02)'};
    border-radius: 8px;
  }
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0.8;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const ActionIconButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;

  &.ant-btn-text:not(:disabled):hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'};
  }

  .anticon {
    font-size: 16px;
  }

  &.restore-button {
    color: ${props => props.theme.token?.colorPrimary};
    
    &:hover {
      color: ${props => props.theme.token?.colorPrimaryHover};
    }
  }

  &.delete-button {
    color: ${props => props.theme.token?.colorError};
    
    &:hover {
      color: ${props => props.theme.token?.colorErrorHover};
    }
  }
`;

const FileList: FC<FileListProps> = ({
  loading,
  files,
  selectedRowKeys,
  onSelectChange,
  onRestore,
  onDelete,
  pagination,
  onPageChange,
}) => {
  const { token } = theme.useToken();

  const columns: ColumnsType<FileModel> = [
    {
      title: <FormattedMessage id="filelist.column.name" />,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '60%',
      render: (_, record: FileModel) => (
        <FileItem
          file={record}
          showSize={false}
          currentParentId={0}
          setLoading={() => {}}
          setFiles={() => {}}
          setFilteredFiles={() => {}}
          setSearchText={() => {}}
          setPagination={() => {}}
          pagination={{
            currentPage: 1,
            pageSize: 10,
            total: 0
          }}
        />
      ),
    },
    {
      title: <FormattedMessage id="filelist.column.size" />,
      dataIndex: 'size',
      key: 'size',
      width: '20%',
      render: (size: number) => (
        <Text type="secondary">{formatFileSize(size)}</Text>
      ),
    },
    {
      title: <FormattedMessage id="filelist.column.actions" />,
      key: 'actions',
      width: '20%',
      render: (_, record: FileModel) => (
        <ActionButtonWrapper>
          <Tooltip title={<FormattedMessage id="trash.action.restore" defaultMessage="还原" />}>
            <ActionIconButton
              type="text"
              className="restore-button"
              icon={<UndoOutlined />}
              onClick={() => onRestore(record)}
            />
          </Tooltip>
          <Tooltip title={<FormattedMessage id="trash.action.delete" defaultMessage="永久删除" />}>
            <ActionIconButton
              type="text"
              className="delete-button"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </ActionButtonWrapper>
      ),
    },
  ];

  return (
    <TableWrapper>
      <Table<FileModel>
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
          columnWidth: 48,
        }}
        columns={columns}
        dataSource={files}
        rowKey="id"
        loading={loading}
        rowClassName={(record) => record.isDirectory ? 'folder-row' : ''}
        locale={{
          emptyText: (
            <div style={{ padding: '24px 0' }}>
              <Text type="secondary">回收站为空</Text>
            </div>
          )
        }}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: onPageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 项`,
          size: 'default',
        }}
      />
    </TableWrapper>
  );
};

export default FileList; 