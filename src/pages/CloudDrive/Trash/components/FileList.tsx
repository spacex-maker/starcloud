import React, { FC } from 'react';
import { Table, Space, Button, Typography, theme } from 'antd';
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
      width: '50%',
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
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: <FormattedMessage id="filelist.column.actions" />,
      key: 'actions',
      width: 120,
      render: (_, record: FileModel) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<UndoOutlined />}
            size="small"
            onClick={() => onRestore(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <TableWrapper>
      <Table<FileModel>
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
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
          onChange: onPageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 项`
        }}
      />
    </TableWrapper>
  );
};

export default FileList; 