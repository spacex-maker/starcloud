import { useState } from 'react';
import { message } from 'antd';
import { cosService } from 'services/cos';
import instance from 'api/axios';
import { loadFiles } from 'services/fileService';

export const useUpload = (currentParentId, userInfo, currentPath, pagination, setPagination) => {
  const [uploadStates, setUploadStates] = useState({
    files: new Map(),
    isUploading: false
  });

  const handleUpload = async (files, existingFiles = []) => {
    const fileList = Array.from(files);
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
    const initialUploadStates = new Map(filesToUpload.map(file => [
      file.name,
      {
        progress: 0,
        speed: 0,
        startTime: Date.now(),
        fileSize: file.size,
        isCompleted: false,
        lastProgress: 0,
        lastTime: Date.now(),
        uploadCompleted: false,
        fileCreated: false,
        status: 'pending',
        isDuplicate: uploadStates.files.get(file.name)?.isDuplicate || false,
        file
      }
    ]));

    setUploadStates(prev => ({
      isUploading: true,
      files: initialUploadStates
    }));

    try {
      const fullPath = `${userInfo.username}/${currentPath}`;
      const controller = new AbortController();
      
      const uploadPromises = filesToUpload.map(async file => {
        try {
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'uploading',
              startTime: Date.now(),
              lastTime: Date.now(),
              lastProgress: 0,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          const uploadResult = await cosService.uploadFile(
            file,
            fullPath,
            (progress) => {
              setUploadStates(prev => {
                const state = prev.files.get(file.name);
                if (!state || state.uploadCompleted) return prev;

                const now = Date.now();
                const timeDiff = (now - state.lastTime) / 1000;
                
                if (timeDiff >= 0.5) {
                  const progressDiff = progress - state.lastProgress;
                  const uploadedBytes = (progressDiff / 100) * file.size;
                  const speed = uploadedBytes / timeDiff;
                  
                  const newFiles = new Map(prev.files);
                  newFiles.set(file.name, {
                    ...state,
                    progress: Math.round(progress),
                    speed: speed,
                    lastProgress: progress,
                    lastTime: now
                  });
                  
                  return {
                    ...prev,
                    files: newFiles
                  };
                }
                
                return prev;
              });
            },
            controller.signal
          );

          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'creating',
              progress: 100,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          await instance.post('/productx/file-storage/create-directory', {
            parentId: currentParentId,
            isDirectory: false,
            name: file.name,
            extension: file.name.split('.').pop(),
            size: file.size,
            storagePath: uploadResult.key,
            hash: uploadResult.etag?.replace(/"/g, ''),
            mimeType: file.type,
            storageType: 'COS',
            downloadUrl: uploadResult.url,
            visibility: 'PRIVATE'
          });

          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'success',
              uploadCompleted: true,
              fileCreated: true,
              speed: 0
            });
            return { ...prev, files: newFiles };
          });

          return { success: true, file };
        } catch (error) {
          setUploadStates(prev => {
            const newFiles = new Map(prev.files);
            const state = newFiles.get(file.name);
            newFiles.set(file.name, {
              ...state,
              status: 'error',
              progress: 0,
              speed: 0,
              errorMessage: error.message
            });
            return { ...prev, files: newFiles };
          });

          return { success: false, file, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      if (failureCount === 0) {
        message.success(`成功上传 ${successCount} 个文件`);
      } else {
        message.warning(`${successCount} 个文件上传成功，${failureCount} 个文件上传失败`);
      }
      
      await loadFiles(
        currentParentId, 
        () => {}, // setLoading
        () => {}, // setFiles 
        () => {}, // setFilteredFiles 
        () => {}, // setSearchText
        setPagination,
        pagination
      );
    } catch (error) {
      console.error('上传过程中发生错误:', error);
      message.error('上传过程中发生错误: ' + (error.message || '未知错误'));
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
    message.success('已移除选中的文件');
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
      message.error('请选择要加密的文件');
      return null;
    }

    // 创建加密模态框的 props
    return {
      visible: true,
      files: selectedFiles
    };
  };

  return {
    uploadStates,
    setUploadStates,
    handleUpload,
    uploadFiles,
    handleDuplicateDecision,
    handleRemoveFiles,
    handleAddFiles,
    handleEncryptFiles
  };
}; 