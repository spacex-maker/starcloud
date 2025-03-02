import React, { useContext } from 'react';
import { Button, Typography, Space, Card, Row, Col, Statistic, List } from 'antd';
import {
  CloudUploadOutlined,
  SecurityScanOutlined,
  TeamOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  LockOutlined
} from '@ant-design/icons';
import styled, { keyframes, ThemeContext } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from 'components/headers/simple';

const { Title, Text, Paragraph } = Typography;

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--ant-color-bg-container);
`;

const HeroSection = styled.div`
  position: relative;
  padding: 120px 0 80px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a365d 0%, #2d3748 50%, #1a365d 100%)'
    : 'linear-gradient(135deg, #ebf4ff 0%, #e6fffa 50%, #ebf4ff 100%)'};
  text-align: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/pattern.svg') center/cover;
    opacity: ${props => props.theme.mode === 'dark' ? '0.05' : '0.1'};
    pointer-events: none;
  }

  .hero-title {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'} !important;
    margin-bottom: 24px;
    font-size: 48px;
    text-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
      : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  }

  .hero-description {
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.9)' 
      : 'rgba(45, 55, 72, 0.9)'};
    font-size: 18px;
    margin-bottom: 40px;
  }

  .ant-btn {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'};
    border-color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'};

    &:hover {
      color: ${props => props.theme.mode === 'dark' ? '#1a365d' : '#fff'};
      border-color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'};
      background: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'};
    }
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

const Section = styled.section`
  padding: 80px 0;
  background: ${props => props.background || 'transparent'};
`;

const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
      : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }

  .ant-card-body {
    padding: 24px;
  }

  .icon-wrapper {
    font-size: 36px;
    color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    margin-bottom: 16px;
  }
`;

const PriceCard = styled(Card)`
  height: 100%;
  text-align: center;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border: ${props => props.popular 
    ? `2px solid ${props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'}`
    : `1px solid ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
      : '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }

  .ant-card-body {
    padding: 24px;
  }

  .price {
    font-size: 48px;
    font-weight: bold;
    color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    margin: 16px 0;
    
    .currency {
      font-size: 24px;
      vertical-align: super;
    }
    
    .period {
      font-size: 16px;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
    }
  }
`;

const StatsSection = styled(Section)`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #1a365d 0%, #2d3748 100%)' 
    : 'linear-gradient(180deg, #ebf8ff 0%, #e6fffa 100%)'};
`;

// 添加自定义按钮样式
const StyledButton = styled(Button)`
  border-radius: 20px !important;
  height: 36px;
  padding: 0 20px;

  &.ant-btn-lg {
    height: 40px;
    padding: 0 24px;
    font-size: 16px;
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const EnterpriseButton = styled(StyledButton)`
  &&.ant-btn {
    position: relative;
    overflow: hidden;
    border: none !important;
    background: linear-gradient(
      90deg,
      #3182ce,
      #63b3ed,
      #4299e1,
      #3182ce
    ) !important;
    background-size: 300% 100% !important;
    animation: ${gradientShift} 5s linear infinite;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(49, 130, 206, 0.3);
      opacity: 0.9;
    }

    &:active {
      transform: translateY(1px);
    }
  }
`;

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);

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

  const plans = [
    {
      title: '基础版',
      price: '0',
      storage: '10GB',
      features: [
        '10GB 存储空间',
        '基础文件管理',
        '标准传输速度',
        '基础技术支持'
      ]
    },
    {
      title: '专业版',
      price: '29',
      storage: '100GB',
      popular: true,
      features: [
        '100GB 存储空间',
        '高级文件管理',
        '高速传输',
        '优先技术支持',
        '文件协作功能'
      ]
    },
    {
      title: '企业版',
      price: '99',
      storage: '1TB',
      features: [
        '1TB 存储空间',
        '企业级管理功能',
        '极速传输',
        '24/7专属支持',
        '高级协作功能',
        '自定义功能'
      ]
    }
  ];

  return (
    <PageContainer>
      <SimpleHeader />
      
      <HeroSection theme={theme}>
        <ContentWrapper>
          <Title level={1} className="hero-title">
            安全、高效的云存储解决方案
          </Title>
          <Paragraph className="hero-description">
            为您的数据提供安全可靠的存储空间，随时随地轻松访问和管理
          </Paragraph>
          <Space size="large">
            <StyledButton type="primary" size="large" ghost onClick={() => navigate('/signup')}>
              免费注册
            </StyledButton>
            <StyledButton size="large" onClick={() => navigate('/login')}>
              立即登录
            </StyledButton>
          </Space>
        </ContentWrapper>
      </HeroSection>

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

      <StatsSection>
        <ContentWrapper>
          <Row gutter={[48, 24]} justify="center">
            <Col xs={12} sm={6}>
              <Statistic title="注册用户" value={100000} suffix="+" />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="文件存储量" value={500} suffix="TB+" />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="正常运行时间" value={99.9} suffix="%" />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="每日上传文件" value={1000000} suffix="+" />
            </Col>
          </Row>
        </ContentWrapper>
      </StatsSection>

      <Section>
        <ContentWrapper>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            价格方案
          </Title>
          <Row gutter={[24, 24]}>
            {plans.map((plan, index) => (
              <Col xs={24} sm={8} key={index}>
                <PriceCard popular={plan.popular}>
                  <Title level={3}>{plan.title}</Title>
                  <div className="price">
                    <span className="currency">¥</span>
                    {plan.price}
                    <span className="period">/月</span>
                  </div>
                  <List
                    dataSource={plan.features}
                    renderItem={item => (
                      <List.Item>
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                  />
                  {plan.title === '企业版' ? (
                    <EnterpriseButton
                      type="primary"
                      size="large"
                      style={{ marginTop: '24px', width: '100%' }}
                      onClick={() => navigate('/signup')}
                    >
                      开始使用
                    </EnterpriseButton>
                  ) : (
                    <StyledButton
                      type={plan.popular ? 'primary' : 'default'}
                      size="large"
                      style={{ marginTop: '24px', width: '100%' }}
                      onClick={() => navigate('/signup')}
                    >
                      开始使用
                    </StyledButton>
                  )}
                </PriceCard>
              </Col>
            ))}
          </Row>
        </ContentWrapper>
      </Section>

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

      <Section>
        <ContentWrapper style={{ textAlign: 'center' }}>
          <Title level={2}>开始使用</Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            立即注册，享受安全可靠的云存储服务
          </Paragraph>
          <StyledButton type="primary" size="large" onClick={() => navigate('/signup')}>
            免费注册
          </StyledButton>
        </ContentWrapper>
      </Section>
    </PageContainer>
  );
};

export default HomePage; 