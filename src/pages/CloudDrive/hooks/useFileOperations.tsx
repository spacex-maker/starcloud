import { useState } from 'react';
import { message } from 'antd';
import type { Key } from 'react';
import { deleteFile, loadFiles } from 'services/fileService';
import { isImageFile } from 'utils/format';
import DeleteFileModal from '../AllFiles/components/DeleteFileModal';
import BatchDeleteModal from '../AllFiles/components/BatchDeleteModal';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FileModel } from 'models/file/FileModel';

interface UseFileOperationsProps {
  currentParentId: number;
  pagination: TablePaginationConfig;
  setPagination: (pagination: TablePaginationConfig) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
}

export const useFileOperations = ({
  currentParentId,
  pagination,
  setPagination,
  setFiles,
  setFilteredFiles,
  setSearchText
}: UseFileOperationsProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    url: '',
    title: '',
    key: 0
  });
  const [modalDeletingId, setModalDeletingId] = useState<number | null>(null);

  const handleDelete = (record: FileModel) => {
    DeleteFileModal({
      record,
      onConfirm: async () => {
        try {
          setModalDeletingId(record.id);
          await deleteFile({
            record,
            setLoading: () => {},
            currentParentId,
            setFiles,
            setFilteredFiles,
            setSearchText,
            setPagination,
            pagination
          });
        } finally {
          setModalDeletingId(null);
        }
      },
      isDeleting: modalDeletingId === record.id,
      isImageFile
    });
  };

  const handleBatchDelete = async (filteredFiles: FileModel[]) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    const selectedItems = filteredFiles.filter(file => 
      selectedRowKeys.includes(file.id.toString())
    );

    BatchDeleteModal({
      selectedItems,
      onConfirm: async () => {
        let loading = false;
        try {
          loading = true;
          await Promise.all(selectedItems.map(item =>
            deleteFile({
              record: item,
              setLoading: (value: boolean) => loading = value,
              currentParentId,
              setFiles,
              setFilteredFiles,
              setSearchText,
              setPagination,
              pagination
            })
          ));

          message.success(`成功删除 ${selectedItems.length} 个文件`);
          setSelectedRowKeys([]);

          await loadFiles({
            parentId: currentParentId,
            setLoading: (value: boolean) => loading = value,
            setFiles,
            setFilteredFiles,
            setSearchText,
            setPagination,
            pagination
          });
        } catch (error) {
          console.error('批量删除失败:', error);
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          message.error('批量删除失败: ' + errorMessage);
        } finally {
          loading = false;
        }
      }
    });
  };

  const handlePreview = (file: FileModel) => {
    if (!file.downloadUrl) {
      message.error('无法预览，下载链接不存在');
      return;
    }

    if (!isImageFile(file.name)) {
      message.error('此文件类型不支持预览');
      return;
    }

    setPreviewImage({
      visible: true,
      url: file.downloadUrl,
      title: file.name,
      key: file.id
    });
  };

  const handlePreviewClose = () => {
    setPreviewImage(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return {
    selectedRowKeys,
    previewImage,
    handleDelete,
    modalDeletingId,
    handleBatchDelete,
    handlePreview,
    handlePreviewClose,
    handleSelectChange
  };
}; 