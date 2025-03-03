import styled from 'styled-components';
import { slideInFromLeft } from '../../styles';

export const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-7) 100%)'
    : 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)'};
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  animation: ${slideInFromLeft} 0.8s ease-out forwards;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const WelcomeText = styled.div`
  max-width: 480px;
  text-align: center;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const Description = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  max-width: 480px;
  margin: 1.5rem auto 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`; 