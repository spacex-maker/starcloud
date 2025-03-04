import React, { useContext } from 'react';
import { Typography, Space } from 'antd';
import styled, { ThemeContext, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ContentWrapper, StyledButton } from '../styles';

const { Title, Paragraph } = Typography;

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 50% 50%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 50% 50%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

const floatingAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(-15px);
  }
  75% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const HeroContainer = styled.div`
  position: relative;
  padding: 180px 0 120px;
  min-height: 800px;
  display: flex;
  align-items: center;
  text-align: center;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(-45deg, #000428, #004e92, #2a5298, #7303c0, #ec38bc)'
    : 'linear-gradient(-45deg, #89f7fe, #66a6ff, #764ba2, #6B8DD6, #8E37D7)'};
  background-size: 300% 300%;
  animation: ${gradientAnimation} 30s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 25%),
      url('/images/pattern.svg') center/cover;
    opacity: ${props => props.theme.mode === 'dark' ? '0.15' : '0.2'};
    pointer-events: none;
    mix-blend-mode: overlay;
    transition: opacity 0.5s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${props => props.theme.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.6)' 
        : 'rgba(255, 255, 255, 0.6)'} 100%
    );
    pointer-events: none;
    transition: background 0.5s ease;
  }

  .content-wrapper {
    position: relative;
    z-index: 2;
    animation: ${floatingAnimation} 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .hero-title {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'} !important;
    margin-bottom: 24px;
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -1px;
    text-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)'};
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(to right, #fff, #a5b4fc, #818cf8)'
      : 'linear-gradient(to right, #1e40af, #3b82f6, #60a5fa)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: ${props => props.theme.mode === 'dark' ? 'transparent' : 'initial'};
  }

  .hero-description {
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(45, 55, 72, 0.95)'};
    font-size: 20px;
    margin-bottom: 48px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    text-shadow: ${props => props.theme.mode === 'dark'
      ? '0 1px 2px rgba(0, 0, 0, 0.3)'
      : '0 1px 2px rgba(255, 255, 255, 0.5)'};
  }

  .ant-btn {
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'};
    border-color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(45, 55, 72, 0.8)'};
    padding: 0 32px;
    height: 48px;
    font-size: 16px;
    backdrop-filter: blur(8px);
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.2)' 
      : 'rgba(255, 255, 255, 0.2)'};
    transition: all 0.3s ease;

    &:hover {
      color: ${props => props.theme.mode === 'dark' ? '#1a365d' : '#fff'};
      border-color: ${props => props.theme.mode === 'dark' ? '#fff' : '#2d3748'};
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.9)' 
        : 'rgba(45, 55, 72, 0.9)'};
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateY(1px);
    }
  }
`;

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);

  return (
    <HeroContainer theme={theme}>
      <ContentWrapper className="content-wrapper">
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
    </HeroContainer>
  );
};

export default HeroSection; 