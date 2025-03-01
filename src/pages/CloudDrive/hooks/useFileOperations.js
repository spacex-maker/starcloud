import { useState } from 'react';
import { message, Modal } from 'antd';
import { DeleteOutlined, WarningFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import { deleteFile, loadFiles } from 'services/fileService';
import { isImageFile } from 'utils/format';

const { Text } = Typography;

export const useFileOperations = (currentParentId, pagination, setPagination) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    url: '',
    title: '',
    key: 0
  });

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <span>确认删除此{record.isDirectory ? '文件夹' : '文件'}？</span>
        </div>
      ),
      icon: null,
      content: (
        <div>
          <div style={{ 
            padding: '12px',
            background: 'var(--ant-color-error-bg)',
            border: '1px solid var(--ant-color-error-border)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <Text type="danger">
              <WarningFilled style={{ marginRight: '8px' }} />
              此操作将永久删除该{record.isDirectory ? '文件夹' : '文件'}，且无法恢复
            </Text>
          </div>
          <div>
            <Text>文件名：{record.name}</Text>
            {!record.isDirectory && (
              <div>
                <Text>大小：{record.size}</Text>
              </div>
            )}
          </div>
        </div>
      ),
      okText: '删除',
      okButtonProps: {
        danger: true
      },
      cancelText: '取消',
      onOk: () => {
        deleteFile(
          record, 
          () => {}, // setLoading
          currentParentId, 
          () => {}, // setFiles
          () => {}, // setFilteredFiles
          () => {}, // setSearchText
          setPagination,
          pagination
        );
      }
    });
  };

  const handleBatchDelete = (filteredFiles) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    const selectedItems = filteredFiles.filter(file => selectedRowKeys.includes(file.key));
    const maxDisplayItems = 5;

    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <span>确认删除 {selectedRowKeys.length} 个文件？</span>
        </div>
      ),
      icon: null,
      width: 520,
      content: (
        <div>
          <div style={{ 
            padding: '12px',
            background: 'var(--ant-color-error-bg)',
            border: '1px solid var(--ant-color-error-border)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <Text type="danger">
              <WarningFilled style={{ marginRight: '8px' }} />
              此操作将永久删除以下文件，且无法恢复
            </Text>
          </div>
          <div style={{ 
            maxHeight: '200px',
            overflow: 'auto',
            border: '1px solid var(--ant-color-border)',
            borderRadius: '8px'
          }}>
            {selectedItems.slice(0, maxDisplayItems).map(item => (
              <div key={item.key} style={{ padding: '8px', borderBottom: '1px solid var(--ant-color-border)' }}>
                <Text>{item.name}</Text>
              </div>
            ))}
            {selectedItems.length > maxDisplayItems && (
              <div style={{ 
                padding: '8px', 
                borderTop: '1px solid var(--ant-color-border)',
                color: 'var(--ant-color-text-secondary)',
                textAlign: 'center'
              }}>
                还有 {selectedItems.length - maxDisplayItems} 个文件未显示
              </div>
            )}
          </div>
        </div>
      ),
      okText: '删除',
      okButtonProps: {
        danger: true,
      },
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(selectedItems.map(item => 
            deleteFile(
              item,
              () => {}, // setLoading
              currentParentId,
              () => {}, // setFiles
              () => {}, // setFilteredFiles
              () => {}, // setSearchText
              setPagination,
              pagination
            )
          ));
          
          message.success(`成功删除 ${selectedItems.length} 个文件`);
          setSelectedRowKeys([]);
          
          // 刷新文件列表
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
          console.error('批量删除失败:', error);
          message.error('批量删除失败: ' + (error.message || '未知错误'));
        }
      },
    });
  };

  const handlePreview = (file) => {
    if (!file.downloadUrl) {
      message.error('无法预览，下载链接不存在');
      return;
    }
    
    if (!isImageFile(file.name)) {
      message.error('此文件类型不支持预览');
      return;
    }
    
    setPreviewImage({
      visible: true,
      url: file.downloadUrl,
      title: file.name,
      key: Date.now()
    });
  };

  const handlePreviewClose = () => {
    setPreviewImage({
      visible: false,
      url: '',
      title: '',
      key: 0
    });
  };

  const handleSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return {
    selectedRowKeys,
    previewImage,
    handleDelete,
    handleBatchDelete,
    handlePreview,
    handlePreviewClose,
    handleSelectChange
  };
}; 