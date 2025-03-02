import React from 'react';
import { Space, Card } from 'antd';
import { 
  SafetyOutlined,
  InboxOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { StyledStepsCard, StyledStepsGrid, StyledStepItem } from '../styles/StyledComponents';

const DecryptSteps = () => {
  return (
    <StyledStepsCard
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1677ff' }} />
          <span>解密步骤</span>
        </Space>
      }
    >
      <StyledStepsGrid>
        <StyledStepItem>
          <div className="step-number">1</div>
          <InboxOutlined className="step-icon" />
          <h4>选择加密文件</h4>
          <p>选择使用 MyStorage 加密工具加密的 .encrypted 文件，支持拖拽或点击选择</p>
        </StyledStepItem>
        
        <StyledStepItem>
          <div className="step-number">2</div>
          <LockOutlined className="step-icon" />
          <h4>输入解密密码</h4>
          <p>输入加密时设置的密码，密码将仅用于本地解密，不会被传输或存储</p>
        </StyledStepItem>
        
        <StyledStepItem>
          <div className="step-number">3</div>
          <SafetyCertificateOutlined className="step-icon" />
          <h4>开始解密</h4>
          <p>点击按钮后，系统将使用 AES-256-CBC 算法在本地解密您的文件</p>
        </StyledStepItem>
        
        <StyledStepItem>
          <div className="step-number">4</div>
          <CheckCircleOutlined className="step-icon" />
          <h4>获取原始文件</h4>
          <p>解密完成后，原始文件将自动下载，解密过程完全无损，保证文件完整性</p>
        </StyledStepItem>
      </StyledStepsGrid>
    </StyledStepsCard>
  );
};

export default DecryptSteps; 