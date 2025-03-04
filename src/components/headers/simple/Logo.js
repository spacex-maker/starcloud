import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const glowPulse = keyframes`
  0% {
    filter: drop-shadow(0 0 8px var(--ant-color-primary))
           drop-shadow(0 0 16px var(--ant-color-primary));
    opacity: 0.15;
  }
  50% {
    filter: drop-shadow(0 0 16px var(--ant-color-primary))
           drop-shadow(0 0 32px var(--ant-color-primary));
    opacity: 0.25;
  }
  100% {
    filter: drop-shadow(0 0 8px var(--ant-color-primary))
           drop-shadow(0 0 16px var(--ant-color-primary));
    opacity: 0.15;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 8px;
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-1px);
  }
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
`;

const BrandText = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--ant-color-primary);
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 1.35rem;
    
    .full-name {
      display: none;
    }
    
    .short-name {
      display: block;
    }
  }

  @media (min-width: 769px) {
    .full-name {
      display: block;
    }
    
    .short-name {
      display: none;
    }
  }
`;

const XLogoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 72px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const XLogo = styled.svg`
  position: absolute;
  width: 180px;
  height: 180px;
  left: 180px;
  top: -54px;
  animation: ${glowPulse} 4s ease-in-out infinite;
  color: var(--ant-color-primary);
  opacity: 0.18;
  transform: rotate(-15deg);
  filter: contrast(1.2);
`;

const Logo = () => {
  return (
    <>
      <XLogoContainer>
        <XLogo viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 20L180 180M180 20L20 180"
            stroke="currentColor"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </XLogo>
      </XLogoContainer>
      <LogoLink to="/">
        <BrandContainer>
          <BrandText>
            <span className="full-name">MyStorage</span>
            <span className="short-name">MS</span>
          </BrandText>
        </BrandContainer>
      </LogoLink>
    </>
  );
};

export default Logo; 