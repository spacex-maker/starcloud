import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { cosService } from '../../../services/cos';
import { COS_CONFIG } from '../../../services/cos/config';
import instance from '../../../api/axios';
import { loadFiles } from '../../../services/fileService';
import { formatFileSize } from '../../../utils/format';

// 添加调试信息
console.log('cosService 对象:', cosService);
console.log('cosService 类型:', Object.prototype.toString.call(cosService));
console.log('cosService 方法列表:', Object.getOwnPropertyNames(Object.getPrototypeOf(cosService)));
console.log('cosService 属性列表:', Object.keys(cosService));

export const useUpload = (
  currentParentId, 
  userInfo, 
  currentPath,
  currentFolder,
  pagination, 
  setPagination,
  setLoading,
  setFiles,
  setFilteredFiles,
  setSearchText
) => {
  const [uploadStates, setUploadStates] = useState({
    files: new Map(),
    isUploading: false
  });

  const [messageApi] = message.useMessage();
  const [messageQueue, setMessageQueue] = useState([]);

  // 使用 useEffect 处理消息队列
  useEffect(() => {
    if (messageQueue.length > 0 && messageApi) {
      const [currentMessage, ...rest] = messageQueue;
      messageApi[currentMessage.type](currentMessage.content);
      setMessageQueue(rest);
    }
  }, [messageQueue, messageApi]);

  const showMessage = useCallback((type, content) => {
    setMessageQueue(prev => [...prev, { type, content }]);
  }, []);

  const handleUpload = async (files, existingFiles = []) => {
    if (!Array.isArray(files)) {
      console.warn('Files must be an array');
      return false;
    }

    const fileList = files.filter(file => file && file.name && file.size);
    if (fileList.length === 0) {
      console.warn('No valid files to upload');
      return false;
    }

    const uploadStates = new Map();
    
    fileList.forEach(file => {
      const isDuplicate = existingFiles.some(existingFile => existingFile.name === file.name);
      uploadStates.set(file.name, {
        file,
        name: file.name,
        fileSize: file.size,
        status: 'pending',
        progress: 0,
        isDuplicate,
        action: isDuplicate ? 'ask' : 'upload',
      });
    });
    
    setUploadStates(prev => ({
      ...prev,
      files: uploadStates
    }));
    
    return true;
  };

  const uploadFiles = async (filesToUpload) => {
    if (!Array.isArray(filesToUpload) || filesToUpload.length === 0) {
      console.warn('没有文件需要上传');
      return;
    }

    console.log('[Upload] 开始上传文件:', {
      targetFolderId: currentParentId,
      folderName: currentFolder?.name || '根目录',
      fileCount: filesToUpload.length,
      files: filesToUpload.map(file => {
        const fileObj = file instanceof File ? file : file.file;
        return {
          name: fileObj.name,
          size: formatFileSize(fileObj.size),
          type: fileObj.type
        };
      })
    });

    if (!userInfo || !userInfo.username) {
      console.error('[Upload] 用户信息不完整，无法上传');
      showMessage('error', '上传失败：用户信息不完整');
      return;
    }

    const initialUploadStates = new Map();
    
    filesToUpload.forEach(file => {
      const fileObj = file instanceof File ? file : file.file;
      
      if (!fileObj || !fileObj.name) {
        console.warn('[Upload] 无效的文件对象:', file);
        return;
      }

      initialUploadStates.set(fileObj.name, {
        progress: 0,
        speed: 0,
        startTime: Date.now(),
        fileSize: fileObj.size,
        isCompleted: false,
        lastProgress: 0,
        lastTime: Date.now(),
        uploadCompleted: false,
        fileCreated: false,
        status: 'pending',
        isDuplicate: file.isDuplicate || false,
        file: fileObj,
        taskId: `${fileObj.name}_${Date.now()}`,
        useChunkUpload: false  // 默认不使用分片上传，由用户手动选择
      });
    });

    if (initialUploadStates.size === 0) {
      console.warn('[Upload] 没有有效的文件需要上传');
      return;
    }

    setUploadStates(prev => ({
      isUploading: true,
      files: initialUploadStates
    }));

    try {
      const fullPath = `${userInfo.username}/`;
      console.log('[Upload] 上传路径:', fullPath);
      
      const uploadPromises = Array.from(initialUploadStates.values()).map(async fileState => {
        try {
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(fileState.file.name);
            newFiles.set(fileState.file.name, {
              ...state,
              status: 'uploading',
              startTime: Date.now(),
              lastTime: Date.now(),
              lastProgress: 0,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          console.log(`[Upload] 开始上传文件: ${fileState.file.name}`);
          // 添加更多调试信息
          console.log('cosService 状态:', {
            isObject: typeof cosService === 'object',
            hasUploadFile: typeof cosService.uploadFile === 'function',
            prototype: Object.getPrototypeOf(cosService),
            constructor: cosService.constructor?.name
          });
          
          const uploadResult = await cosService.uploadFile(
            fileState.file,
            {
              path: fullPath + fileState.file.name,
              taskId: fileState.taskId,
              onProgress: (task) => {
                setUploadStates(prev => {
                  const state = prev.files.get(fileState.file.name);
                  if (!state || state.uploadCompleted) return prev;

                  const now = Date.now();
                  const timeDiff = (now - state.lastTime) / 1000;
                  
                  if (timeDiff >= 0.5) {
                    const progressDiff = task.progress - (state.lastProgress || 0);
                    const uploadedBytes = task.uploadedBytes;
                    const currentSpeed = task.uploadedBytes && timeDiff > 0 
                      ? Math.round((task.uploadedBytes - (state.lastUploadedBytes || 0)) / timeDiff)
                      : 0;
                    
                    const newFiles = new Map(prev.files);
                    newFiles.set(fileState.file.name, {
                      ...state,
                      progress: task.progress,
                      speed: currentSpeed,
                      lastProgress: task.progress,
                      lastTime: now,
                      lastUploadedBytes: task.uploadedBytes,
                      totalUploadedBytes: task.uploadedBytes,
                      totalFileSize: task.totalBytes,
                      totalUploadTime: (state.totalUploadTime || 0) + timeDiff
                    });
                    
                    return {
                      ...prev,
                      files: newFiles
                    };
                  }
                  
                  return prev;
                });
              }
            }
          );

          console.log(`[Upload] 文件上传成功，开始创建文件记录: ${fileState.file.name}`);
          
          let calculatedAverageSpeed = 0;
          setUploadStates(prev => {
            const state = prev.files.get(fileState.file.name);
            calculatedAverageSpeed = Math.round(
              state?.totalFileSize / (state?.totalUploadTime || 1)
            );

            const newFiles = new Map(prev.files);
            newFiles.set(fileState.file.name, {
              ...state,
              status: 'creating',
              progress: 100,
              speed: 0,
              averageSpeed: calculatedAverageSpeed
            });

            return { ...prev, files: newFiles };
          });

          const createResponse = await instance.post('/productx/file-storage/create-directory', {
            parentId: currentParentId,
            isDirectory: false,
            name: fileState.file.name,
            extension: fileState.file.name.split('.').pop(),
            size: fileState.file.size,
            storagePath: fullPath + fileState.file.name,
            hash: uploadResult.etag?.replace(/"/g, ''),
            mimeType: fileState.file.type,
            storageType: 'COS',
            downloadUrl: uploadResult.url,
            visibility: 'PRIVATE',
            uploadAverageSpeed: calculatedAverageSpeed
          });

          console.log(`[Upload] 文件记录创建成功: ${fileState.file.name}`, createResponse.data);

          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(fileState.file.name);
            newFiles.set(fileState.file.name, {
              ...state,
              status: 'success',
              uploadCompleted: true,
              fileCreated: true,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          return { success: true, file: fileState.file };
        } catch (error) {
          console.error(`[Upload] 文件上传失败: ${fileState.file.name}`, error);
          
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(fileState.file.name);
            newFiles.set(fileState.file.name, {
              ...state,
              status: 'error',
              progress: 0,
              speed: 0,
              errorMessage: error.message || '上传失败'
            });
            return { ...prev, files: newFiles };
          });

          return { success: false, file: fileState.file, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      console.log('[Upload] 上传完成统计:', {
        total: results.length,
        success: successCount,
        failure: failureCount
      });
      
      if (failureCount === 0) {
        showMessage('success', `成功上传 ${successCount} 个文件`);
      } else {
        showMessage('warning', `${successCount} 个文件上传成功，${failureCount} 个文件上传失败`);
      }
      
      await loadFiles(
        currentParentId, 
        setLoading,
        setFiles, 
        setFilteredFiles, 
        setSearchText,
        setPagination,
        pagination
      );
    } catch (error) {
      console.error('[Upload] 上传过程中发生错误:', error);
      showMessage('error', '上传失败: ' + (error.message || '未知错误'));
    } finally {
      setUploadStates(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  };

  const handleDuplicateDecision = (fileName, action) => {
    setUploadStates(prev => {
      const newFiles = new Map(prev.files);
      const fileState = newFiles.get(fileName);
      if (fileState) {
        newFiles.set(fileName, {
          ...fileState,
          action,
          status: action === 'skip' ? 'skipped' : 'pending'
        });
      }
      return {
        ...prev,
        files: newFiles
      };
    });
  };

  const handleRemoveFiles = (fileNames) => {
    setUploadStates(prev => {
      const newFiles = new Map(prev.files);
      fileNames.forEach(fileName => {
        newFiles.delete(fileName);
      });
      return {
        ...prev,
        files: newFiles
      };
    });
    showMessage('success', '已移除选中的文件');
  };

  const handleAddFiles = (newFiles) => {
    const fileList = Array.from(newFiles);
    const currentFiles = new Map(uploadStates.files);
    
    fileList.forEach(fileObj => {
      // 处理从 beforeUpload 传来的带有 isDuplicate 标记的文件对象
      if (fileObj.file && typeof fileObj.isDuplicate !== 'undefined') {
        const file = fileObj.file;
        currentFiles.set(file.name, {
          file,
          name: file.name,
          fileSize: file.size,
          status: 'pending',
          progress: 0,
          isDuplicate: fileObj.isDuplicate,
          action: fileObj.isDuplicate ? 'ask' : 'upload',
        });
      } else {
        // 处理普通文件对象（如加密后的文件）
        currentFiles.set(fileObj.name, {
          file: fileObj,
          name: fileObj.name,
          fileSize: fileObj.size,
          status: 'pending',
          progress: 0,
          isDuplicate: false,
          action: 'upload',
        });
      }
    });
    
    setUploadStates(prev => ({
      ...prev,
      files: currentFiles
    }));
  };

  const handleEncryptFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showMessage('error', '请选择要加密的文件');
      return null;
    }

    // 创建加密模态框的 props
    return {
      visible: true,
      files: selectedFiles
    };
  };

  const handlePauseUpload = async (taskId) => {
    console.log('handlePauseUpload 被调用，taskId:', taskId);
    if (!taskId) {
      console.log('taskId 为空，退出');
      return;
    }
    
    const success = await cosService.pauseUpload(taskId);
    console.log('暂停上传结果:', success);
    
    if (success) {
      setUploadStates(prev => {
        const newFiles = new Map(prev.files);
        console.log('当前文件状态:', Array.from(newFiles.entries()));
        
        for (const [fileName, fileState] of newFiles.entries()) {
          console.log('检查文件:', fileName, '当前taskId:', fileState.taskId);
          if (fileState.taskId === taskId) {
            console.log('找到匹配的文件，更新状态');
            newFiles.set(fileName, {
              ...fileState,
              status: 'paused',
              speed: 0
            });
            break;
          }
        }
        return { ...prev, files: newFiles };
      });
      showMessage('success', '已暂停上传');
    }
  };

  const handleResumeUpload = async (taskId) => {
    if (!taskId) return;
    
    const success = await cosService.resumeUpload(taskId);
    if (success) {
      setUploadStates(prev => {
        const newFiles = new Map(prev.files);
        for (const [fileName, fileState] of newFiles.entries()) {
          if (fileState.taskId === taskId) {
            newFiles.set(fileName, {
              ...fileState,
              status: 'uploading',
              lastTime: Date.now(),
              lastProgress: fileState.progress
            });
            break;
          }
        }
        return { ...prev, files: newFiles };
      });
      showMessage('success', '已恢复上传');
    }
  };

  return {
    uploadStates,
    setUploadStates,
    handleUpload,
    uploadFiles,
    handleDuplicateDecision,
    handleRemoveFiles,
    handleAddFiles,
    handleEncryptFiles,
    handlePauseUpload,
    handleResumeUpload
  };
}; 