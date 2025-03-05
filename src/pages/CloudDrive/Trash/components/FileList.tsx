import React, { FC, memo, useMemo } from 'react';
import { Table, Typography, Tooltip, Button } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { formatFileSize } from 'utils/format';
import FileItem from '../../AllFiles/components/FileItem';
import type { FileModel } from 'models/file/FileModel';
import styled from 'styled-components';

const { Text } = Typography;

const ActionButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionIconButton = styled(Button)`
  &.restore-button {
    color: var(--ant-color-primary);
    
    &:hover {
      color: var(--ant-color-primary-hover);
      background: var(--ant-color-primary-bg-hover);
    }
  }
  
  &.delete-button {
    color: var(--ant-color-error);
    
    &:hover {
      color: var(--ant-color-error-hover);
      background: var(--ant-color-error-bg-hover);
    }
  }
`;

interface FileListProps {
  loading: boolean;
  files: FileModel[];
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedRowKeys: React.Key[]) => void;
  onRestore: (file: FileModel) => void;
  onDelete: (file: FileModel) => void;
  pagination: TablePaginationConfig;
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

const FileList: FC<FileListProps> = memo(({
  loading,
  files,
  selectedRowKeys,
  onSelectChange,
  onRestore,
  onDelete,
  pagination,
}) => {
  const columns: ColumnsType<FileModel> = useMemo(() => [
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
          pagination={pagination}
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
  ], [pagination, onRestore, onDelete]);

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <TableWrapper>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={files}
        loading={loading}
        pagination={pagination}
        rowKey="id"
      />
    </TableWrapper>
  );
});

export default FileList; 