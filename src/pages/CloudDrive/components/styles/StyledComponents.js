import tw, { styled } from 'twin.macro';
import { Layout, Button, Input } from 'antd';

export const StyledLayout = styled.div`
  ${tw`flex h-full w-full`}
  height: calc(100vh - 64px);
  background: var(--ant-color-bg-container);
  position: relative;
`;

export const MainLayout = styled.main`
  ${tw`flex flex-col flex-1`}
  overflow: hidden;
  background: var(--ant-color-bg-container);
  min-width: 0;
  transition: margin-left 0.2s ease-in-out;
  
  @media (max-width: 768px) {
    margin-left: ${props => props.collapsed ? 0 : '200px'};
  }
`;

export const StyledContent = styled.div`
  ${tw`flex-1`}
  padding: 0;
  overflow: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  
  .ant-space {
    gap: 8px !important;
    
    @media (max-width: 768px) {
      gap: 4px !important;
    }
  }
  
  .action-button-text {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

export const PathContainer = styled.div`
  padding: 4px 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
`;

export const FileListContainer = styled.div`
  flex: 1;
  padding: 0 16px;
  
  .ant-table-wrapper {
    height: 100%;
  }

  .ant-table {
    background: transparent;
  }
`;

export const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--ant-color-bg-container);
  color: var(--ant-color-text);
`;

export const ContentContainer = styled.div`
  ${tw`flex flex-1`}
  margin-top: 64px;
  display: flex;
  overflow: hidden;
  width: 100%;
`;

export const RoundedButton = styled(Button)`
  @media (min-width: 769px) {
    border-radius: 20px;
    height: 36px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  @media (max-width: 768px) {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    min-width: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  transition: all 0.2s ease;
  
  &.ant-btn-default {
    background-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.02)'};
    color: var(--ant-color-text);
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.04)'};
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
  
  &.ant-btn-text {
    @media (min-width: 769px) {
      padding: 0 12px;
    }
    box-shadow: none;
    background: transparent;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'};
    }
  }
  
  &.ant-btn-primary {
    background-color: #1677ff;
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
    
    &:hover {
      background-color: #4096ff;
      box-shadow: 0 4px 8px rgba(22, 119, 255, 0.3);
    }
    
    &:active {
      background-color: #0958d9;
      box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
    }
    
    &.ant-btn-loading {
      opacity: 0.8;
      background-color: #4096ff;
    }
    
    .anticon {
      color: #ffffff;
    }
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  .anticon {
    font-size: 16px;
  }
`;

export const RoundedSearch = styled(Input)`
  border-radius: 24px;
  height: 44px;
  padding: 0 16px;
  width: 300px;
  border: none;
  background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.02)'};
  transition: all 0.2s ease;
  
  &[type="search"] {
    -webkit-appearance: none;
  }
  
  &:hover {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.04)'};
  }
  
  &:focus, &.ant-input-affix-wrapper-focused {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'white'};
    box-shadow: 0 1px 6px ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  .ant-input {
    background: transparent;
    font-size: 14px;
    
    &::placeholder {
      color: var(--ant-color-text-quaternary);
    }
  }
  
  .ant-input-prefix {
    margin-right: 12px;
    color: var(--ant-color-text-quaternary);
  }
  
  .ant-input-clear-icon {
    color: var(--ant-color-text-quaternary);
    margin-left: 8px;
    
    &:hover {
      color: var(--ant-color-text-secondary);
    }
  }
`; 