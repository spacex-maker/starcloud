import { useState } from 'react';
import { message } from 'antd';
import instance from 'api/axios';
import type { FileModel } from 'models/file/FileModel';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export const useFileOperations = (
  loadRecycledFiles: (searchName?: string, page?: number, pageSize?: number) => Promise<void>,
  searchText: string,
  pagination: PaginationState
) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRestore = async (file: FileModel) => {
    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/restore', [file.id]);

      if (response.data && response.data.success) {
        message.success('恢复成功');
        await loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
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

  const handleDelete = async (file: FileModel) => {
    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/delete', [file.id]);

      if (response.data && response.data.success) {
        message.success('永久删除成功');
        await loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
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
        await loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
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
        await loadRecycledFiles(searchText, pagination.currentPage, pagination.pageSize);
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

  const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return {
    selectedRowKeys,
    loading,
    handleRestore,
    handleDelete,
    handleBatchRestore,
    handleBatchDelete,
    handleSelectChange,
  };
}; 