import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
import {
  SafetyCertificateOutlined,
  LockOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { ContentWrapper, Section } from '../styles';

const { Title, Text } = Typography;

const SecuritySection = () => {
  return (
    <Section style={{ background: 'var(--ant-color-bg-container-disabled)' }}>
      <ContentWrapper>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2}>安全保障</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space>
                <SafetyCertificateOutlined style={{ fontSize: '24px', color: 'var(--ant-color-primary)' }} />
                <div>
                  <Title level={4} style={{ marginBottom: '8px' }}>端到端加密</Title>
                  <Text type="secondary">全程加密保护，确保数据传输和存储安全</Text>
                </div>
              </Space>
              <Space>
                <LockOutlined style={{ fontSize: '24px', color: 'var(--ant-color-primary)' }} />
                <div>
                  <Title level={4} style={{ marginBottom: '8px' }}>多重身份验证</Title>
                  <Text type="secondary">支持多因素认证，提升账户安全性</Text>
                </div>
              </Space>
              <Space>
                <GlobalOutlined style={{ fontSize: '24px', color: 'var(--ant-color-primary)' }} />
                <div>
                  <Title level={4} style={{ marginBottom: '8px' }}>全球节点分布</Title>
                  <Text type="secondary">数据多地备份，确保数据可靠性</Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <img 
              src="/images/security.svg" 
              alt="Security" 
              style={{ width: '100%', maxWidth: '500px' }}
            />
          </Col>
        </Row>
      </ContentWrapper>
    </Section>
  );
};

export default SecuritySection; 