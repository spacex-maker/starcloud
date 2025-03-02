import React from 'react';
import {Typography, Grid } from 'antd';

import DesktopFileUploadModal from './DesktopFileUploadModal';
import MobileFileUploadModal from './MobileFileUploadModal';

const { useBreakpoint } = Grid;

const FileUploadModal = ({
  visible,
  uploadingFiles,
  isUploading,
  onStartUpload,
  onCancel,
  onDuplicateDecision,
  onRemoveFiles,
  onAddFiles,
  onEncryptFiles,
  onEncryptComplete,
  onUploadComplete,
  existingFiles = [],
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const props = {
    visible,
    uploadingFiles,
    isUploading,
    onStartUpload,
    onCancel,
    onDuplicateDecision,
    onRemoveFiles,
    onAddFiles,
    onEncryptFiles,
    onEncryptComplete,
    onUploadComplete,
    existingFiles,
  };

  if (isMobile) {
    return <MobileFileUploadModal {...props} />;
  }

  return <DesktopFileUploadModal {...props} />;
};

export default FileUploadModal; 