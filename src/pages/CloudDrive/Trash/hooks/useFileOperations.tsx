import { message } from 'antd';
import type { Key } from 'react';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FileModel } from '../../../../models/file/FileModel';
import instance from '../../../../api/axios';

interface UseFileOperationsProps {
  pagination: TablePaginationConfig;
  setPagination: (pagination: TablePaginationConfig) => void;
  setFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  selectedRowKeys: Key[];
  setSelectedRowKeys: (keys: Key[]) => void;
  setLoading: (loading: boolean) => void;
}

const useFileOperations = ({
  pagination,
  setPagination,
  setFiles,
  setSearchText,
  selectedRowKeys,
  setSelectedRowKeys,
  setLoading,
}: UseFileOperationsProps) => {
  const loadRecycledFiles = async (searchName?: string) => {
    try {
      setLoading(true);
      const params = {
        name: searchName || '',
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await instance.post('/productx/file-storage/list-recycled', params);
      
      if (response.data?.success && response.data?.data?.data) {
        setFiles(response.data.data.data);
        setPagination({
          ...pagination,
          total: response.data.data.totalNum || 0,
        });
      } else {
        console.error('Invalid response format:', response.data);
        setFiles([]);
      }
    } catch (error) {
      console.error('加载回收站文件失败:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (file: FileModel) => {
    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/restore', [file.id]);

      if (response.data?.success) {
        message.success('文件已还原');
        await loadRecycledFiles();
      } else {
        message.error('还原文件失败');
      }
    } catch (error) {
      console.error('还原文件失败:', error);
      message.error('还原文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: FileModel) => {
    try {
      setLoading(true);
      const response = await instance.post('/productx/file-storage/delete-permanently', [file.id]);

      if (response.data?.success) {
        message.success('文件已永久删除');
        await loadRecycledFiles();
      } else {
        message.error('删除文件失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
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

      if (response.data?.success) {
        message.success('文件已批量还原');
        setSelectedRowKeys([]);
        await loadRecycledFiles();
      } else {
        message.error('批量还原文件失败');
      }
    } catch (error) {
      console.error('批量还原文件失败:', error);
      message.error('批量还原文件失败');
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
      const response = await instance.post('/productx/file-storage/delete-permanently', selectedRowKeys);

      if (response.data?.success) {
        message.success('文件已批量永久删除');
        setSelectedRowKeys([]);
        await loadRecycledFiles();
      } else {
        message.error('批量删除文件失败');
      }
    } catch (error) {
      console.error('批量删除文件失败:', error);
      message.error('批量删除文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return {
    handleRestore,
    handleDelete,
    handleBatchRestore,
    handleBatchDelete,
    handleSelectChange,
    loadRecycledFiles,
  };
};

export default useFileOperations; 