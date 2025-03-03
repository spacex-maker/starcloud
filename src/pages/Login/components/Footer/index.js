import React from 'react';
import { PhilosophyQuoteWrapper, PoweredByWrapper } from './styles';

export const PhilosophyQuote = ({ children }) => (
  <PhilosophyQuoteWrapper>
    {children}
  </PhilosophyQuoteWrapper>
);

export const PoweredBy = ({ children }) => (
  <PoweredByWrapper>
    {children}
  </PoweredByWrapper>
); 