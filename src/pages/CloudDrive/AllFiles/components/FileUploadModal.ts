import type { FileModel } from 'models/file/FileModel';
import type { UploadState } from '../../hooks/useUpload';

export type DuplicateAction = 'replace' | 'rename' | 'skip';

export interface FileUploadModalProps {
  visible: boolean;
  uploadingFiles: Map<string, any>;
  isUploading: boolean;
  onStartUpload: () => Promise<void>;
  onCancel: () => void;
  onDuplicateDecision: (fileName: string, action: DuplicateAction) => void;
  onRemoveFiles: (fileNames: string[]) => void;
  onAddFiles: (files: File[]) => void;
  onEncryptFiles: (files: File[]) => void;
  onEncryptComplete: (encryptedFiles: File[], originalFiles: File[]) => void;
  existingFiles: FileModel[];
  onPauseUpload: () => void;
  onResumeUpload: () => void;
  setUploadStates: (state: UploadState | ((prev: UploadState) => UploadState)) => void;
  onUploadComplete: () => void;
} 