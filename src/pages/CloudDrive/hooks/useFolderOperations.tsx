import { useState } from 'react';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FileModel } from 'models/file/FileModel';
import type { UserInfo } from '../AllFiles';
import { loadFiles } from 'services/fileService';
import { message } from 'antd';
import instance from 'api/axios';

interface UseFolderOperationsProps {
  currentParentId: number;
  userInfo: UserInfo;
  currentPath: string;
  pagination: TablePaginationConfig;
  setPagination: (pagination: TablePaginationConfig) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentParentId: (id: number) => void;
  setCurrentFolder: (folder: FileModel | null) => void;
}

export const useFolderOperations = ({
  currentParentId,
  userInfo,
  currentPath,
  pagination,
  setPagination,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setLoading,
  setCurrentParentId,
  setCurrentFolder
}: UseFolderOperationsProps) => {
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [pathHistory, setPathHistory] = useState<{ id: number; name: string }[]>([]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.warning('请输入文件夹名称');
      return;
    }

    try {
      setCreatingFolder(true);
      const response = await instance.post('/productx/file-storage/create', {
        name: newFolderName.trim(),
        parentId: currentParentId,
        isDirectory: true
      });

      if (response.data && response.data.success) {
        message.success('创建文件夹成功');
        setNewFolderModalVisible(false);
        setNewFolderName('');
        
        // 刷新文件列表
        await loadFiles({
          parentId: currentParentId,
          setLoading,
          setFiles,
          setFilteredFiles,
          setSearchText,
          setPagination,
          pagination
        });
      } else {
        throw new Error(response.data.message || '创建文件夹失败');
      }
    } catch (error) {
      console.error('创建文件夹失败:', error);
      message.error('创建文件夹失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFolderClick = async (folder: FileModel) => {
    try {
      setCurrentParentId(folder.id);
      setCurrentFolder(folder);
      
      // 更新路径历史
      setPathHistory(prev => [...prev, { id: folder.id, name: folder.name }]);
      
      // 加载文件夹内容
      await loadFiles({
        parentId: folder.id,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText,
        setPagination,
        pagination
      });
    } catch (error) {
      console.error('加载文件夹内容失败:', error);
      message.error('加载文件夹内容失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handlePathClick = async (index: number) => {
    try {
      const targetPath = pathHistory[index];
      if (!targetPath) return;

      setCurrentParentId(targetPath.id);
      setPathHistory(prev => prev.slice(0, index + 1));
      
      // 加载目标路径的内容
      await loadFiles({
        parentId: targetPath.id,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText,
        setPagination,
        pagination
      });
    } catch (error) {
      console.error('加载目录内容失败:', error);
      message.error('加载目录内容失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleHomeClick = async (rootId: number) => {
    try {
      setCurrentParentId(rootId);
      setPathHistory([]);
      
      // 加载根目录内容
      await loadFiles({
        parentId: rootId,
        setLoading,
        setFiles,
        setFilteredFiles,
        setSearchText,
        setPagination,
        pagination
      });
    } catch (error) {
      console.error('加载根目录内容失败:', error);
      message.error('加载根目录内容失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return {
    newFolderModalVisible,
    setNewFolderModalVisible,
    newFolderName,
    setNewFolderName,
    creatingFolder,
    pathHistory,
    handleCreateFolder,
    handleFolderClick,
    handlePathClick,
    handleHomeClick
  };
}; 