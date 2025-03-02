import React from 'react';
import { Modal, Space } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const SecurityTipModal = ({ visible, onClose, isVipUser }) => {
  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>安全提示</span>
        </Space>
      }
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      width={600}
    >
      <div style={{ padding: '8px 0' }}>
        <p>所有解密操作均在本地完成，您的密码和文件内容不会上传到服务器</p>
        {isVipUser ? (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#52c41a', fontWeight: 500 }}>
              尊敬的会员用户，您可以：
            </p>
            <ul style={{ color: '#52c41a', marginTop: 8, paddingLeft: 16 }}>
              <li>解密任意大小的文件</li>
              <li>使用智能分块解密功能，更高效且节省内存</li>
              <li>支持批量解密多个大文件</li>
            </ul>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#ff4d4f', fontWeight: 500 }}>
              重要提示：解密过程需要在浏览器内存中进行，实际内存占用约为文件大小的3倍。
            </p>
            <ul style={{ color: '#ff4d4f', marginTop: 8, paddingLeft: 16 }}>
              <li>非会员用户单个文件大小限制为4GB</li>
              <li>开通会员后可解密任意大小文件，并支持分块解密</li>
              <li>如果出现浏览器崩溃，建议开通会员使用分块解密功能</li>
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SecurityTipModal; 