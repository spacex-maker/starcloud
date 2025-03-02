import React from 'react';
import { Modal, Input, Typography } from 'antd';

const { Text } = Typography;

const PasswordModal = ({
  visible,
  password,
  onPasswordChange,
  onOk,
  onCancel,
  decrypting
}) => {
  return (
    <Modal
      title="输入解密密码"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={decrypting}
    >
      <Input.Password
        placeholder="请输入解密密码"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        style={{ marginTop: 16 }}
      />
      <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
        请输入加密时设置的密码，密码将仅用于本地解密
      </Text>
    </Modal>
  );
};

export default PasswordModal; 