import React from 'react';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ContentWrapper, Section, StyledButton } from '../styles';

const { Title, Paragraph } = Typography;

const CallToActionSection = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default CallToActionSection; 