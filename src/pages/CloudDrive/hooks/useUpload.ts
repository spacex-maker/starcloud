import { useState } from 'react';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FileModel } from 'models/file/FileModel';
import type { FileEncryptModalProps, EncryptedFile } from '../AllFiles/components/FileEncryptModal';
import type { DuplicateAction } from '../AllFiles/components/FileUploadModal';

export interface UploadState {
  files: Map<string, any>;
  isUploading: boolean;
}

interface UseUploadProps {
  currentParentId: number;
  uploadStates: UploadState;
  setUploadStates: (state: UploadState | ((prev: UploadState) => UploadState)) => void;
  setFileUploadModalVisible: (visible: boolean) => void;
  setFileEncryptModalProps: (props: FileEncryptModalProps | null) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setPagination: (pagination: TablePaginationConfig) => void;
  pagination: TablePaginationConfig;
}

export const useUpload = ({
  currentParentId,
  uploadStates,
  setUploadStates,
  setFileUploadModalVisible,
  setFileEncryptModalProps,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setPagination,
  pagination
}: UseUploadProps) => {
  const handleUpload = (files: File[], existingFiles: FileModel[]) => {
    const newFiles = new Map(uploadStates.files);
    files.forEach(file => {
      newFiles.set(file.name, {
        file,
        name: file.name,
        fileSize: file.size,
        status: 'pending',
        progress: 0,
        isDuplicate: existingFiles.some(existingFile => existingFile.name === file.name),
        action: 'upload',
        isEncrypted: false
      });
    });
    setUploadStates(prev => ({
      ...prev,
      files: newFiles
    }));
  };

  const uploadFiles = async () => {
    // 实现文件上传逻辑
  };

  const handleDuplicateDecision = (fileName: string, action: DuplicateAction) => {
    const newFiles = new Map(uploadStates.files);
    const fileInfo = newFiles.get(fileName);
    if (!fileInfo) return;

    switch (action) {
      case 'replace':
        fileInfo.isDuplicate = false;
        break;
      case 'rename':
        // 实现重命名逻辑
        break;
      case 'skip':
        newFiles.delete(fileName);
        break;
    }

    setUploadStates(prev => ({
      ...prev,
      files: newFiles
    }));
  };

  const handleRemoveFiles = (fileNames: string[]) => {
    const newFiles = new Map(uploadStates.files);
    fileNames.forEach(fileName => {
      newFiles.delete(fileName);
    });
    setUploadStates(prev => ({
      ...prev,
      files: newFiles
    }));
  };

  const handleAddFiles = (files: File[]) => {
    handleUpload(files, []);
  };

  const handleEncryptFiles = (files: File[]) => {
    setFileEncryptModalProps({
      visible: true,
      files,
      onComplete: (encryptedFiles: File[], originalFiles: File[]) => {
        const newFiles = new Map();
        Array.from(uploadStates.files.entries()).forEach(([key, value]) => {
          if (!originalFiles.find((f: File) => f.name === key)) {
            newFiles.set(key, value);
          }
        });

        encryptedFiles.forEach((encryptedFile: File) => {
          newFiles.set(encryptedFile.name, {
            file: encryptedFile,
            name: encryptedFile.name,
            fileSize: encryptedFile.size,
            status: 'pending',
            progress: 0,
            isDuplicate: false,
            action: 'upload',
            isEncrypted: true
          });
        });

        setUploadStates(prev => ({
          ...prev,
          files: newFiles
        }));
        setFileEncryptModalProps(null);
      }
    });
  };

  const handlePauseUpload = () => {
    setUploadStates(prev => ({
      ...prev,
      isUploading: false
    }));
  };

  const handleResumeUpload = () => {
    setUploadStates(prev => ({
      ...prev,
      isUploading: true
    }));
  };

  return {
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