export interface FileEncryptModalProps {
  visible: boolean;
  files: File[];
  onComplete: (encryptedFiles: File[], originalFiles: File[]) => void;
  onCancel?: () => void;
  onOk?: () => void;
}

export interface EncryptedFile extends File {
  name: string;
  size: number;
  type: string;
  isEncrypted: boolean;
} 