import React from 'react';
import { Button } from 'antd';
import styled, { keyframes } from 'styled-components';
import type { ButtonProps } from 'antd';

const colorRotate = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
`;

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

const GradientButtonWrapper = styled(StyledButton)<{
  $gradientColors?: string[];
  $animationDuration?: number;
  $glowEffect?: boolean;
}>`
  &&.ant-btn {
    position: relative;
    overflow: hidden;
    border: none !important;
    background: ${props => 
      props.$gradientColors 
        ? `linear-gradient(45deg, ${props.$gradientColors.join(', ')})` 
        : 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)'
    } !important;
    background-size: 200% 200% !important;
    animation: ${colorRotate} ${props => props.$animationDuration || 10}s linear infinite;
    transition: all 0.3s ease;
    color: white !important;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      opacity: 0.95;
      animation-play-state: paused;
    }

    &:active {
      transform: translateY(1px);
    }

    ${props => props.$glowEffect && `
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: inherit;
        filter: blur(10px);
        opacity: 0.5;
        z-index: -1;
      }
    `}
  }
`;

export interface GradientButtonProps extends ButtonProps {
  gradientColors?: string[];
  animationDuration?: number;
  glowEffect?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  gradientColors,
  animationDuration = 10,
  glowEffect = true,
  children,
  ...props
}) => {
  return (
    <GradientButtonWrapper
      $gradientColors={gradientColors}
      $animationDuration={animationDuration}
      $glowEffect={glowEffect}
      {...props}
    >
      {children}
    </GradientButtonWrapper>
  );
};

export default GradientButton; 