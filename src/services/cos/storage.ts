import { STORAGE_KEYS } from './config';
import type { UploadTask } from './types';

interface StorageTask {
  taskId: string;
  file: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  status: UploadTask['status'];
  progress: number;
  key: string;
  uploadId?: string;
  requestId?: string;
  useChunkUpload?: boolean;
}

/**
 * 保存任务信息到本地存储
 */
export const saveTasksToStorage = (tasks: Map<string, UploadTask>) => {
  const tasksData = Array.from(tasks.entries()).map(([taskId, task]) => ({
    taskId,
    file: {
      name: task.file.name,
      size: task.file.size,
      type: task.file.type,
      lastModified: task.file.lastModified
    },
    status: task.status,
    progress: task.progress,
    key: task.key,
    uploadId: task.uploadId,
    requestId: task.requestId,
    useChunkUpload: task.useChunkUpload
  }));

  try {
    localStorage.setItem(STORAGE_KEYS.UPLOAD_TASKS, JSON.stringify(tasksData));
    console.log('保存任务信息成功:', tasksData);
  } catch (error) {
    console.error('保存任务信息失败:', error);
  }
};

/**
 * 从本地存储恢复任务信息
 */
export const restoreTasksFromStorage = (): Map<string, UploadTask> => {
  const tasks = new Map<string, UploadTask>();

  try {
    const tasksData = localStorage.getItem(STORAGE_KEYS.UPLOAD_TASKS);
    if (tasksData) {
      const parsedTasks = JSON.parse(tasksData) as StorageTask[];
      parsedTasks.forEach((task) => {
        if (task.status === 'paused') {
          tasks.set(task.taskId, {
            file: new File(
              [new Blob([])], // 创建一个空的 Blob 作为占位符
              task.file.name,
              {
                type: task.file.type,
                lastModified: task.file.lastModified
              }
            ),
            status: task.status,
            progress: task.progress,
            key: task.key,
            taskId: task.taskId,
            uploadId: task.uploadId,
            requestId: task.requestId,
            startTime: Date.now(),
            useChunkUpload: task.useChunkUpload || false
          });
        }
      });
      console.log('恢复任务信息成功:', tasks);
    }
  } catch (error) {
    console.error('恢复任务信息失败:', error);
  }

  return tasks;
}; 