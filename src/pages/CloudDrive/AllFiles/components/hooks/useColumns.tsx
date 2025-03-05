import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { FormattedMessage } from 'react-intl';
import { FileModel } from 'models/file/FileModel';
import { formatFileSize } from 'utils/format';
import FileItem from '../FileItem';
import FileActions from '../FileActions';
import FileSize from '../FileSize';

interface FileHandlers {
  onFolderClick: (record: FileModel) => void;
  onPreview: (record: FileModel) => void;
  onDelete: (record: FileModel) => void;
  onDownload: (record: FileModel) => void;
}

interface UseColumnsProps {
  handlers: FileHandlers;
  deletingIds: React.Key[];
  currentParentId: number;
  setLoading: (loading: boolean) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setPagination: (pagination: any) => void;
  pagination: any;
}

export const useColumns = ({
  handlers,
  deletingIds,
}: UseColumnsProps) => {
  const columns: ColumnsType<FileModel> = useMemo(() => [
    {
      title: <FormattedMessage id="filelist.column.name" />,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '50%',
      render: (_, record: FileModel) => (
        <FileItem
          file={record}
          onFolderClick={handlers.onFolderClick}
        />
      ),
    },
    {
      title: <FormattedMessage id="filelist.column.size" />,
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (_, record: FileModel) => <FileSize file={record} />,
      sorter: (a: FileModel, b: FileModel) => {
        if (a.size == null) return -1;
        if (b.size == null) return 1;
        return Number(a.size) - Number(b.size);
      },
      sortDirections: ['descend', 'ascend']
    },
    {
      title: <FormattedMessage id="filelist.column.updateTime" />,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: <FormattedMessage id="filelist.column.actions" />,
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record: FileModel) => (
        <FileActions
          record={record}
          isDeleting={deletingIds.includes(record.id)}
          onDownload={handlers.onDownload}
          onDelete={handlers.onDelete}
          onPreview={handlers.onPreview}
        />
      ),
    },
  ], [handlers, deletingIds]);

  return columns;
}; 