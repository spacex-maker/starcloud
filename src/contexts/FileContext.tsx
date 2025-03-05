import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileModel } from 'models/file/FileModel';
import { loadFiles, updateFileName } from 'services/fileService';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface FileContextType {
  files: FileModel[];
  filteredFiles: FileModel[];
  searchText: string;
  loading: boolean;
  currentParentId: number;
  pagination: PaginationState;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: PaginationState) => void;
  refreshFiles: () => Promise<void>;
  renameFile: (fileId: number, newName: string) => Promise<boolean>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
  initialParentId: number;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children, initialParentId }) => {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileModel[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentParentId, setCurrentParentId] = useState(initialParentId);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });

  const refreshFiles = async () => {
    await loadFiles(
      currentParentId,
      { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination }
    );
  };

  const renameFile = async (fileId: number, newName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await updateFileName(fileId, newName, currentParentId);
      if (success) {
        await refreshFiles();
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    files,
    filteredFiles,
    searchText,
    loading,
    currentParentId,
    pagination,
    setFiles,
    setFilteredFiles,
    setSearchText,
    setLoading,
    setPagination,
    refreshFiles,
    renameFile
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export default FileContext; 