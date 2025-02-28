import instance from 'api/axios';
import { message } from 'antd';
import { cosService } from 'services/cos';

// 格式化文件大小的工具函数
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取根目录信息
export const fetchRootDirectory = async (setLoading, setRootDirectoryId, setCurrentParentId, setFiles, setFilteredFiles, setSearchText) => {
  try {
    setLoading(true);
    
    // 请求根目录信息（父级 ID 为 0）
    const response = await instance.post('/productx/file-storage/list', { 
      parentId: 0, 
      status: 'ACTIVE' 
    });
    
    if (response.data && response.data.success) {
      const fileList = response.data.data.data || [];
      
      // 如果返回了数据，直接使用第一条作为根目录
      if (fileList.length > 0) {
        const rootDir = fileList[0];
        
        // 保存根目录 ID
        setRootDirectoryId(rootDir.id);
        
        try {
          // 使用根目录 ID 加载其内容
          const secondLevelResponse = await instance.post('/productx/file-storage/list', { 
            parentId: rootDir.id, 
            status: 'ACTIVE' 
          });
          
          if (secondLevelResponse.data && secondLevelResponse.data.success) {
            const secondLevelFiles = secondLevelResponse.data.data.data || [];
            
            // 转换数据格式
            const newFiles = secondLevelFiles.map(file => ({
              key: file.id.toString(),
              id: file.id,
              parentId: file.parentId,
              name: file.name,
              type: file.isDirectory ? 'folder' : 'file',
              size: file.size ? formatSize(file.size) : '-',
              extension: file.extension,
              mimeType: file.mimeType,
              downloadUrl: file.downloadUrl,
              createTime: file.createTime ? new Date(file.createTime).toLocaleString() : '-',
              updateTime: file.updateTime ? new Date(file.updateTime).toLocaleString() : '-'
            }));
            
            // 设置文件列表
            setFiles(newFiles);
            setFilteredFiles(newFiles);
            setSearchText('');
          }
        } catch (secondLevelError) {
          console.error('加载第二层数据失败:', secondLevelError);
        }
        
        // 设置当前父目录 ID
        setCurrentParentId(rootDir.id);
      } else {
        console.warn('未找到根目录');
        setRootDirectoryId(null);
        loadFiles(0, setLoading, setFiles, setFilteredFiles, setSearchText); // 直接加载 parentId 为 0 的内容
      }
    } else {
      throw new Error(response.data.message || '获取根目录信息失败');
    }
  } catch (error) {
    console.error('获取根目录信息失败:', error);
    message.error('获取根目录信息失败: ' + (error.message || '未知错误'));
    loadFiles(0, setLoading, setFiles, setFilteredFiles, setSearchText);
  } finally {
    setLoading(false);
  }
};

// 加载指定目录的内容
export const loadFiles = async (parentId, setLoading, setFiles, setFilteredFiles, setSearchText) => {
  if (parentId === undefined || parentId === null) {
    console.error('Invalid parentId:', parentId);
    message.error('无效的目录ID');
    return;
  }
  
  console.log('loadFiles called with parentId:', parentId);
  
  try {
    setLoading(true);
    console.log('Sending request for files with parentId:', parentId);
    
    const response = await instance.post('/productx/file-storage/list', { 
      parentId, 
      status: 'ACTIVE' 
    });
    
    console.log('Received response:', response.data);
    
    if (response.data && response.data.success) {
      const fileList = response.data.data.data || [];
      console.log('Received files:', fileList.length);
      
      // 转换数据格式
      const newFiles = fileList.map(file => ({
        key: file.id.toString(),
        id: file.id,
        parentId: file.parentId,
        name: file.name,
        type: file.isDirectory ? 'folder' : 'file',
        size: file.size ? formatSize(file.size) : '-',
        extension: file.extension,
        mimeType: file.mimeType,
        downloadUrl: file.downloadUrl,
        createTime: file.createTime ? new Date(file.createTime).toLocaleString() : '-',
        updateTime: file.updateTime ? new Date(file.updateTime).toLocaleString() : '-'
      }));
      
      console.log('Setting files state with', newFiles.length, 'files');
      setFiles(newFiles);
      setFilteredFiles(newFiles);
      setSearchText('');
    } else {
      throw new Error(response.data.message || '获取文件列表失败');
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
    message.error('加载文件列表失败: ' + (error.message || '未知错误'));
    // 出错时设置空数组，避免显示旧数据
    setFiles([]);
    setFilteredFiles([]);
  } finally {
    setLoading(false);
  }
};

// 检查重复文件
export const checkDuplicates = (files, existingFiles = []) => {
  const duplicates = [];
  const unique = [];

  files.forEach(file => {
    const isDuplicate = existingFiles.some(existingFile => 
      existingFile.name === file.name
    );
    
    if (isDuplicate) {
      duplicates.push(file);
    } else {
      unique.push(file);
    }
  });

  return { duplicates, unique };
};

export const deleteFile = async (record, setLoading, currentParentId, setFiles, setFilteredFiles, setSearchText) => {
  try {
    setLoading(true);
    
    // 1. Delete from object storage if storagePath exists
    if (record.storagePath) {
      await cosService.deleteFile(record.storagePath);
    }
    
    // 2. Delete database record through backend API
    const response = await instance.post('/productx/file-storage/delete', [record.id]);
    
    if (response.data && response.data.success) {
      message.success('删除成功');
      // Refresh file list
      await loadFiles(currentParentId, setLoading, setFiles, setFilteredFiles, setSearchText);
    } else {
      throw new Error(response.data.message || '删除失败');
    }
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败: ' + (error.message || '未知错误'));
  } finally {
    setLoading(false);
  }
}; 