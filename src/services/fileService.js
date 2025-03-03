import instance from 'api/axios';
import { message } from 'antd';
import { cosService } from 'services/cos';
import { formatFileSize } from 'utils/format';


// 获取根目录信息
export const fetchRootDirectory = async (
  setLoading, 
  setRootDirectoryId, 
  setCurrentParentId, 
  setFiles, 
  setFilteredFiles, 
  setSearchText,
  setPagination,
  pagination
) => {
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
          // 使用根目录 ID 加载其内容，添加分页参数
          const secondLevelResponse = await instance.post('/productx/file-storage/list', { 
            parentId: rootDir.id,
            pageSize: pagination.pageSize,
            currentPage: pagination.currentPage
          });
          
          if (secondLevelResponse.data && secondLevelResponse.data.success) {
            const secondLevelFiles = secondLevelResponse.data.data.data || [];
            
            // 转换数据格式
            const newFiles = secondLevelFiles.map(file => ({
              key: file.id.toString(),
              id: file.id,
              name: file.name,
              type: file.isDirectory ? 'folder' : 'file',
              size: formatFileSize(file.size),
              downloadUrl: file.downloadUrl,
              createTime: file.createTime ? new Date(file.createTime).toLocaleString() : '-',
              updateTime: file.updateTime ? new Date(file.updateTime).toLocaleString() : '-',
              storagePath: file.storagePath,
              isDirectory: file.isDirectory
            }));
            
            // 设置文件列表
            setFiles(newFiles);
            setFilteredFiles(newFiles);
            setSearchText('');

            // 更新分页信息
            setPagination({
              ...pagination,
              total: secondLevelResponse.data.data.totalNum,
              currentPage: pagination.currentPage,
              pageSize: pagination.pageSize
            });
          }
        } catch (secondLevelError) {
          console.error('加载第二层数据失败:', secondLevelError);
          message.error('加载文件列表失败: ' + (secondLevelError.message || '未知错误'));
        }
        
        // 设置当前父目录 ID
        setCurrentParentId(rootDir.id);
      } else {
        console.warn('未找到根目录');
        setRootDirectoryId(null);
        // 直接加载 parentId 为 0 的内容，并传入分页参数
        loadFiles(0, setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination);
      }
    } else {
      throw new Error(response.data.message || '获取根目录信息失败');
    }
  } catch (error) {
    console.error('获取根目录信息失败:', error);
    message.error('获取根目录信息失败: ' + (error.message || '未知错误'));
    // 加载 parentId 为 0 的内容时也传入分页参数
    loadFiles(0, setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination);
  } finally {
    setLoading(false);
  }
};

// 修改加载文件的函数以支持分页
export const loadFiles = async (
  parentId,
  setLoading,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setPagination,
  pagination
) => {
  try {
    setLoading(true);
    const response = await instance.post('/productx/file-storage/list', {
      parentId: parentId,
      pageSize: pagination.pageSize,
      currentPage: pagination.currentPage
    });

    if (response.data && response.data.success) {
      const fileList = response.data.data.data.map(file => ({
        key: file.id,
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.isDirectory ? 'folder' : 'file',
        createTime: file.createTime ? new Date(file.createTime).toLocaleString() : '-',
        updateTime: file.updateTime ? new Date(file.updateTime).toLocaleString() : '-',
        downloadUrl: file.downloadUrl,
        storagePath: file.storagePath,
        isDirectory: file.isDirectory
      }));

      setFiles(fileList);
      setFilteredFiles(fileList);
      setSearchText('');
      
      // 更新分页信息
      setPagination({
        ...pagination,
        total: response.data.data.totalNum,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize
      });
    } else {
      throw new Error(response.data.message || '加载文件失败');
    }
  } catch (error) {
    console.error('加载文件失败:', error);
    message.error('加载文件失败: ' + (error.message || '未知错误'));
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

export const deleteFile = async (
  record, 
  setLoading, 
  currentParentId, 
  setFiles, 
  setFilteredFiles, 
  setSearchText,
  setPagination,
  pagination
) => {
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
      // Refresh file list with pagination
      await loadFiles(
        currentParentId, 
        setLoading, 
        setFiles, 
        setFilteredFiles, 
        setSearchText,
        setPagination,
        pagination
      );
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