import React from 'react';
import { Card, Alert, Space, Typography } from 'antd';
import { 
  SafetyCertificateOutlined, 
  SecurityScanOutlined,
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Paragraph } = Typography;

const SecurityFeatureCard = styled(Card)`
  height: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  
  .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-body {
    padding: 16px 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--ant-color-bg-container-disabled);
  border-radius: 8px;
  
  .icon {
    font-size: 24px;
    color: var(--ant-color-primary);
  }
  
  .content {
    flex: 1;
    
    h4 {
      margin: 0 0 8px;
      color: var(--ant-color-text);
    }
    
    p {
      margin: 0;
      color: var(--ant-color-text-secondary);
      font-size: 13px;
    }
  }
`;

const SecurityFeatures = () => {
  return (
    <SecurityFeatureCard
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
          <span>安全特性</span>
        </Space>
      }
    >
      <Alert
        message="端到端加密保护"
        description={
          <div>
            <Paragraph>
              <SafetyCertificateOutlined /> 采用军事级别的 AES-256 加密算法，使用 CBC 模式和 PKCS7 填充确保最高安全性
            </Paragraph>
            <Paragraph>
              <SafetyCertificateOutlined /> 使用标准的 Base64 编码传输加密数据，确保文件完整性和跨平台兼容性
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
      />
      
      <FeatureList>
        <FeatureItem>
          <SecurityScanOutlined className="icon" />
          <div className="content">
            <h4>高级加密标准</h4>
            <p>采用 AES-256-CBC 加密模式，是目前最安全的对称加密标准，可抵御各种已知攻击</p>
          </div>
        </FeatureItem>
        
        <FeatureItem>
          <SafetyCertificateOutlined className="icon" />
          <div className="content">
            <h4>数据完整性</h4>
            <p>使用 Base64 编码和 PKCS7 填充，确保加密数据的完整性和准确性</p>
          </div>
        </FeatureItem>
        
        <FeatureItem>
          <SafetyOutlined className="icon" />
          <div className="content">
            <h4>本地解密保护</h4>
            <p>所有解密操作在浏览器本地完成，密码和原始数据不会通过网络传输</p>
          </div>
        </FeatureItem>
        
        <FeatureItem>
          <CheckCircleOutlined className="icon" />
          <div className="content">
            <h4>全类型文件支持</h4>
            <p>完美支持图片、视频、文档等所有类型文件的加密解密，无损处理二进制数据</p>
          </div>
        </FeatureItem>
      </FeatureList>
    </SecurityFeatureCard>
  );
};

export default SecurityFeatures; 