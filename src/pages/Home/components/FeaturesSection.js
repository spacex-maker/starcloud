import React from 'react';
import { Typography, Row, Col } from 'antd';
import {
  CloudUploadOutlined,
  SecurityScanOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { ContentWrapper, Section, FeatureCard } from '../styles';

const { Title, Text } = Typography;

const features = [
  {
    icon: <CloudUploadOutlined />,
    title: '便捷存储',
    description: '支持拖拽上传、文件夹上传，轻松管理您的文件'
  },
  {
    icon: <SecurityScanOutlined />,
    title: '安全加密',
    description: '端到端加密，确保您的数据安全'
  },
  {
    icon: <TeamOutlined />,
    title: '协作共享',
    description: '灵活的文件分享和协作功能'
  },
  {
    icon: <RocketOutlined />,
    title: '高速传输',
    description: '采用先进的传输技术，提供极速的上传下载体验'
  }
];

const FeaturesSection = () => {
  return (
    <Section>
      <ContentWrapper>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          产品特性
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <FeatureCard>
                <div className="icon-wrapper">{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Text type="secondary">{feature.description}</Text>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </Section>
  );
};

export default FeaturesSection; 