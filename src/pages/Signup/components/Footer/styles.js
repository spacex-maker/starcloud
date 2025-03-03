import styled from 'styled-components';
import { fadeInScale } from '../../styles';

export const FooterWrapper = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  animation: ${fadeInScale} 0.5s ease-out forwards;
  animation-delay: 0.8s;
  opacity: 0;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const PhilosophyQuoteWrapper = styled.div`
  position: fixed;
  bottom: 3.5rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  font-style: italic;
  padding: 0.75rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  z-index: 10;
  
  @media (max-width: 768px) {
    bottom: 2.5rem;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
`;

export const Copyright = styled.div`
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  text-align: center;
`;

export const PoweredByWrapper = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  backdrop-filter: blur(10px);
  z-index: 10;
  
  @media (max-width: 768px) {
    bottom: 0.5rem;
    font-size: 0.7rem;
    padding: 0.25rem 0.75rem;
  }
  
  .version {
    margin-top: 0.25rem;
    opacity: 0.7;
    font-size: 0.7rem;
  }
`; 