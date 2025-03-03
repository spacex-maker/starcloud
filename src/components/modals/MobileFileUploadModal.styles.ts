import styled from 'styled-components';
import { List } from 'antd';
import { theme } from 'antd';

type ThemeToken = ReturnType<typeof theme.useToken>['token'];

interface StyledProps {
  $token?: ThemeToken;
}

interface FileItemProps extends StyledProps {
  selected?: boolean;
}

export const FileList = styled(List)`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  
  .ant-list-item {
    padding: 0;
    border: none;
  }
`;

export const DuplicateTag = styled.div<StyledProps>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 8px;
  background: ${props => props.$token?.colorWarningBg};
  border: 1px solid ${props => props.$token?.colorWarningBorder};
  border-radius: 6px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  
  .anticon {
    font-size: 12px;
    color: ${props => props.$token?.colorWarning};
  }
  
  span {
    color: ${props => props.$token?.colorWarning};
  }
`;

export const FileItem = styled.div<FileItemProps>`
  display: flex;
  flex-direction: column;
  padding: 16px;
  margin: 4px 0;
  background: ${props => props.selected ? props.$token?.colorPrimaryBg : props.$token?.colorBgContainer};
  border-radius: 12px;
  border: 1px solid ${props => props.selected ? props.$token?.colorPrimary : 'transparent'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
  box-shadow: ${props => props.selected ? 
    `0 2px 8px ${props.$token?.colorPrimary}20` : 
    `0 1px 2px ${props.$token?.colorBorder}20`
  };
  
  ${props => props.selected && `
    .select-indicator {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  `}
  
  &:active {
    transform: scale(0.99);
  }
  
  &:hover {
    border-color: ${props => props.selected ? props.$token?.colorPrimary : props.$token?.colorBorder};
    box-shadow: ${props => props.selected ? 
      `0 4px 16px ${props.$token?.colorPrimary}30` : 
      `0 4px 8px ${props.$token?.colorBorder}30`
    };
  }
`;

export const SelectIndicator = styled.div<StyledProps>`
  position: absolute;
  right: 12px;
  top: 12px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${props => props.$token?.colorPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8) translateY(-4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px ${props => props.$token?.colorPrimary}40;
  
  .anticon {
    color: #fff;
    font-size: 14px;
  }
`;

export const FileHeader = styled.div<StyledProps>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding-right: 32px;
  
  .icon {
    font-size: 32px;
    flex-shrink: 0;
    margin-top: 2px;
    opacity: 0.9;
  }
  
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .name {
    font-size: 15px;
    line-height: 1.4;
    color: ${props => props.$token?.colorText};
    font-weight: 500;
  }
  
  .meta {
    color: ${props => props.$token?.colorTextSecondary};
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    
    .size {
      flex-shrink: 0;
      background: ${props => props.$token?.colorFillQuaternary};
      padding: 2px 8px;
      border-radius: 6px;
    }
  }
`;

export const FileProgress = styled.div<StyledProps>`
  margin-top: 4px;
  
  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    
    .anticon {
      font-size: 14px;
    }
    
    .ant-typography {
      font-size: 13px;
      font-weight: 500;
    }
  }
  
  .ant-progress {
    margin: 8px 0;
    
    .ant-progress-inner {
      background-color: ${props => props.$token?.colorFillQuaternary};
      border-radius: 4px;
      height: 6px;
    }

    .ant-progress-bg {
      border-radius: 4px;
      height: 6px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .progress-text {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: ${props => props.$token?.colorTextSecondary};
    margin-top: 4px;
  }
`;

export const ActionBar = styled.div<StyledProps>`
  padding: 12px 16px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 9;
  border-bottom: 1px solid ${props => props.$token?.colorBorderSecondary}40;

  .ant-space {
    width: 100%;
    display: flex !important;
    gap: 8px !important;
  }
  
  .ant-space-item {
    flex: 1;
    width: 0;
  }
  
  .ant-btn {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;

    .anticon {
      font-size: 18px;
      margin-right: 4px;
    }
  }

  .ant-upload {
    display: block;
    width: 100%;
    
    .ant-btn {
      width: 100%;
    }
  }
`;

export const UploadProgress = styled.div<StyledProps>`
  padding: 12px 16px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 9;
  border-bottom: 1px solid ${props => props.$token?.colorBorderSecondary}40;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .title {
      font-size: 15px;
      color: ${props => props.$token?.colorText};
      font-weight: 600;
    }
    
    .speed {
      font-size: 13px;
      color: ${props => props.$token?.colorTextSecondary};
      background: ${props => props.$token?.colorFillQuaternary};
      padding: 2px 8px;
      border-radius: 6px;
    }
  }
  
  .ant-progress {
    margin-bottom: 12px;

    .ant-progress-inner {
      background-color: ${props => props.$token?.colorFillQuaternary};
      border-radius: 4px;
      height: 8px;
    }

    .ant-progress-bg {
      border-radius: 4px;
      height: 8px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .total {
    font-size: 13px;
    color: ${props => props.$token?.colorTextSecondary};
    display: flex;
    justify-content: space-between;
  }
`;

export const MobileFileName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
  
  .file-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
`;

export const MobileFileSize = styled.span`
  color: var(--ant-color-text-secondary);
  font-size: 12px;
`;

export const MobileProgressText = styled.span`
  color: var(--ant-color-text);
  font-size: 12px;
  white-space: nowrap;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

export const MobileStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  .status-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .speed {
    font-size: 12px;
    color: var(--ant-color-text-secondary);
  }
`;

export const MobileTotalProgressText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

export const MobileDuplicateTag = styled.span`
  color: #faad14;
  font-size: 12px;
  margin-left: 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const MobileChunkUploadTag = styled(MobileDuplicateTag)`
  color: #1890ff;
`; 