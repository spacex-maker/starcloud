export interface FileModel {
  id: number;
  userId: number;
  parentId: number;
  isDirectory: boolean;
  name: string;
  extension: string | null;
  size: number;
  mimeType: string | null;
  storageType: 'COS' | 'LOCAL';
  downloadUrl: string | null;
  visibility: 'PRIVATE' | 'PUBLIC';
  status: 'ACTIVE' | 'DELETED';
  color: string | null;
  createTime: string;
  updateTime: string;
}