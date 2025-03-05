import type { CosError as TencentCosError } from 'cos-js-sdk-v5';

export type CosError = TencentCosError;

export interface COSProgressInfo {
  loaded: number;
  total: number;
  speed?: number;
  percent: number;
}

export interface FileFinishInfo {
  err: CosError | null;
  data: any;
  options: any;
}

export type UploadStatus = 'pending' | 'uploading' | 'paused' | 'success' | 'error' | 'cancelled';

export interface UploadTask {
  file: File;
  status: 'uploading' | 'paused' | 'error' | 'success' | 'cancelled';
  progress: number;
  key: string;
  taskId: string;
  error?: CosError;
  uploadId?: string;
  requestId?: string;
  startTime?: number;
  useChunkUpload: boolean;
  uploadedBytes?: number;
  totalBytes?: number;
  speed?: number;
  lastProgress?: number;
  lastTime?: number;
  lastUploadedBytes?: number;
  totalUploadTime?: number;
  onProgress?: (task: UploadTask) => void;
}

export interface UploadOptions {
  bucket?: string;
  region?: string;
  path: string;
  taskId?: string;
  useChunkUpload?: boolean;
  onProgress?: (task: UploadTask) => void;
  onSuccess?: (task: UploadTask) => void;
  onError?: (task: UploadTask) => void;
}

export interface BatchUploadCallbacks extends Omit<UploadOptions, 'taskId'> {
  path: string;
  onBatchProgress?: (progress: number) => void;
  onBatchComplete?: (successCount: number, failedCount: number) => void;
}

export interface COSConfig {
  SecretId: string;
  SecretKey: string;
  SecurityToken: string;
  UseAccelerate: boolean;
  Protocol: string;
  Domain: string;
  WithCredentials: boolean;
} 