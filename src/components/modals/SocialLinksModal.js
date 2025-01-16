import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

const ModalOverlay = styled.div`
  ${tw`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center`}
  backdrop-filter: blur(5px);
`;

const ModalDialog = styled.div`
  ${tw`w-full max-w-md mx-4`}
`;

const ModalContent = styled.div`
  ${tw`relative rounded-2xl`}
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalHeader = styled.div`
  ${tw`flex items-center justify-between p-6`}
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h5`
  ${tw`text-xl text-white flex items-center gap-2 m-0`}
`;

const CloseButton = styled.button`
  ${tw`text-white opacity-75 hover:opacity-100 transition-opacity`}
  background: none;
  border: none;
  font-size: 1.5rem;
  padding: 0;
  cursor: pointer;
`;

const ModalBody = styled.div`
  ${tw`p-6`}
`;

const SocialLinks = styled.div`
  ${tw`flex flex-col gap-4`}
`;

const SocialLink = styled.a`
  ${tw`flex items-center gap-4 p-4 rounded-xl text-white no-underline transition-all duration-300`}
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    color: white;
  }
`;

const SocialIcon = styled.div`
  ${tw`w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0`}
  background: rgba(255, 255, 255, 0.1);
  
  i {
    color: ${props => {
      const platform = props.className?.split(' ')[0];
      return platformConfigs[platform]?.color || '#FFFFFF';
    }};
  }
`;

const SocialInfo = styled.div`
  ${tw`flex-1 flex flex-col gap-1`}
`;

const PlatformName = styled.span`
  ${tw`text-lg font-medium`}
`;

const Username = styled.span`
  ${tw`text-sm opacity-50`}
`;

const ExternalIcon = styled.i`
  ${tw`text-xl opacity-50 transition-all duration-300`}
  
  ${SocialLink}:hover & {
    transform: translate(2px, -2px);
    opacity: 1;
  }
`;

// 平台配置，包含正确的图标和名称
const platformConfigs = {
  weibo: {
    icon: 'bi-sina-weibo',
    name: '微博',
    color: '#E6162D'
  },
  wechat: {
    icon: 'bi-wechat',
    name: '微信公众号',
    color: '#07C160'
  },
  xiaohongshu: {
    icon: 'bi-book',
    name: '小红书',
    color: '#FE2C55'
  },
  douyin: {
    icon: 'bi-music-note-beamed',
    name: '抖音',
    color: '#000000'
  },
  twitter: {
    icon: 'bi-twitter',
    name: 'Twitter',
    color: '#1DA1F2'
  },
  facebook: {
    icon: 'bi-facebook',
    name: 'Facebook',
    color: '#1877F2'
  },
  instagram: {
    icon: 'bi-instagram',
    name: 'Instagram',
    color: '#E4405F'
  },
  youtube: {
    icon: 'bi-youtube',
    name: 'YouTube',
    color: '#FF0000'
  },
  linkedin: {
    icon: 'bi-linkedin',
    name: 'LinkedIn',
    color: '#0A66C2'
  },
  telegram: {
    icon: 'bi-telegram',
    name: 'Telegram',
    color: '#26A5E4'
  }
};

const SocialLinksModal = ({ show, onClose, websiteName, socialLinks }) => {
  console.log('SocialLinksModal 渲染:', { show, websiteName, socialLinks });

  if (!show) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalDialog onClick={e => e.stopPropagation()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <i className="bi bi-share"></i>
              关注 {websiteName}
            </ModalTitle>
            <CloseButton onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <SocialLinks>
              {socialLinks && Object.entries(socialLinks).map(([platform, url]) => {
                console.log('渲染社交链接:', { platform, url });
                const config = platformConfigs[platform] || {
                  icon: 'bi-link',
                  name: platform,
                  color: '#FFFFFF'
                };
                const username = url.split('/').pop();

                return (
                  <SocialLink 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon className={platform}>
                      <i className={`bi ${config.icon}`} />
                    </SocialIcon>
                    <SocialInfo>
                      <PlatformName>{config.name}</PlatformName>
                      <Username>@{username}</Username>
                    </SocialInfo>
                    <ExternalIcon className="bi bi-box-arrow-up-right" />
                  </SocialLink>
                );
              })}
            </SocialLinks>
          </ModalBody>
        </ModalContent>
      </ModalDialog>
    </ModalOverlay>
  );
};

export default SocialLinksModal; 