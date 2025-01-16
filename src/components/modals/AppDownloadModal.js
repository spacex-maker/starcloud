import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

const ModalOverlay = styled.div`
  ${tw`fixed inset-0 z-50`}
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
`;

const ModalDialog = styled.div`
  ${tw`w-full max-w-md mx-4`}
`;

const ModalContent = styled.div`
  ${tw`bg-[rgba(33,33,33,0.95)] rounded-2xl border border-white border-opacity-10`}
  backdrop-filter: blur(10px);
`;

const ModalHeader = styled.div`
  ${tw`flex items-center justify-between p-6 border-b border-white border-opacity-10`}
`;

const ModalTitle = styled.h5`
  ${tw`text-xl text-white flex items-center gap-2 m-0`}
`;

const CloseButton = styled.button`
  ${tw`text-white opacity-75 hover:opacity-100 transition-opacity bg-transparent border-0`}
  font-size: 1.5rem;
  cursor: pointer;
`;

const ModalBody = styled.div`
  ${tw`p-6`}
`;

const DownloadOptions = styled.div`
  ${tw`flex flex-col gap-4`}
`;

const DownloadButton = styled.button`
  ${tw`flex items-center gap-4 w-full p-4 text-left text-white transition-all duration-300 rounded-xl`}
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  &:disabled {
    ${tw`opacity-50 cursor-not-allowed`}
    transform: none;
  }
`;

const PlatformIcon = styled.div`
  ${tw`w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0`}
  background: rgba(255, 255, 255, 0.1);

  i.android {
    color: #3DDC84;
  }

  i.ios {
    color: #007AFF;
  }

  i.harmony {
    color: #FF0000;
  }
`;

const PlatformInfo = styled.div`
  ${tw`flex-1 flex flex-col gap-1`}
`;

const PlatformName = styled.span`
  ${tw`text-lg font-medium`}
`;

const PlatformDesc = styled.span`
  ${tw`text-sm opacity-50`}
`;

const ChevronIcon = styled.i`
  ${tw`text-xl opacity-50 transition-all duration-300`}
  
  ${DownloadButton}:hover & {
    transform: translateX(4px);
    opacity: 1;
  }
`;

const AppDownloadModal = ({ show, onClose, urls }) => {
  if (!show) return null;

  const { androidUrl, iosUrl, harmonyUrl } = urls || {};

  const handleDownload = (url) => {
    if (url) {
      window.open(url, '_blank');
      onClose();
    }
  };

  // 添加控制台日志来调试
  console.log('Modal props:', { show, urls });

  return (
    <ModalOverlay show={show} onClick={onClose}>
      <ModalDialog onClick={e => e.stopPropagation()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <i className="bi bi-download"></i>
              选择下载版本
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <DownloadOptions>
              <DownloadButton
                disabled={!androidUrl}
                onClick={() => handleDownload(androidUrl)}
              >
                <PlatformIcon>
                  <i className="bi bi-android2 android"></i>
                </PlatformIcon>
                <PlatformInfo>
                  <PlatformName>Android 版本</PlatformName>
                  <PlatformDesc>适用于各品牌安卓设备</PlatformDesc>
                </PlatformInfo>
                <ChevronIcon className="bi bi-chevron-right" />
              </DownloadButton>

              <DownloadButton
                disabled={!iosUrl}
                onClick={() => handleDownload(iosUrl)}
              >
                <PlatformIcon>
                  <i className="bi bi-apple ios"></i>
                </PlatformIcon>
                <PlatformInfo>
                  <PlatformName>iOS 版本</PlatformName>
                  <PlatformDesc>适用于 iPhone 和 iPad 设备</PlatformDesc>
                </PlatformInfo>
                <ChevronIcon className="bi bi-chevron-right" />
              </DownloadButton>

              <DownloadButton
                disabled={!harmonyUrl}
                onClick={() => handleDownload(harmonyUrl)}
              >
                <PlatformIcon>
                  <i className="bi bi-hexagon harmony"></i>
                </PlatformIcon>
                <PlatformInfo>
                  <PlatformName>HarmonyOS 版本</PlatformName>
                  <PlatformDesc>适用于华为鸿蒙系统设备</PlatformDesc>
                </PlatformInfo>
                <ChevronIcon className="bi bi-chevron-right" />
              </DownloadButton>
            </DownloadOptions>
          </ModalBody>
        </ModalContent>
      </ModalDialog>
    </ModalOverlay>
  );
};

export default AppDownloadModal; 