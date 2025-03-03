import styled from 'styled-components';

export const PhilosophyQuoteWrapper = styled.div`
  position: fixed;
  bottom: 3.5rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  color: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.75)' 
    : 'rgba(0, 0, 0, 0.65)'};
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

export const PoweredByWrapper = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: var(--ant-color-text-quaternary);
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.8)'};
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