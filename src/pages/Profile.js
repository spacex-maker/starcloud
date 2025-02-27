import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import SimpleHeader from "components/headers/simple.js";
import { ReactComponent as EditIcon } from "feather-icons/dist/icons/edit-2.svg";
import { ReactComponent as SaveIcon } from "feather-icons/dist/icons/check.svg";
import { ReactComponent as CancelIcon } from "feather-icons/dist/icons/x.svg";
import Modal from 'react-modal';
import { motion } from "framer-motion";
import tw from "twin.macro";

// 确保只设置一次 appElement
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

const PageWrapper = styled.div`
  ${tw`
    w-full
    h-screen  // 改为固定高度
    flex
    flex-col
    overflow-hidden  // 防止整体滚动
  `}
`;

const Container = styled.div`
  ${tw`
    relative 
    w-full
    flex-grow
  `}
  background: var(--ant-color-bg-container);
`;

const Content = styled.div`
  ${tw`
    mx-auto 
    w-full
    h-full
  `}
  height: calc(100vh - 64px);
  overflow: auto;
  margin-top: 64px;
  padding: 24px;
  max-width: 1000px;  // 限制最大宽度
`;

// 定义跑马灯效果
const marqueeGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

// 定义脉冲效果
const pulseEffect = keyframes`
  0% {
    transform: scale(0.97);
    opacity: 0.8;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.97);
    opacity: 0.8;
  }
`;

const ProfileHeader = styled(motion.div)`
  background: var(--ant-color-bg-container);
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  position: relative;  // 为绝对定位的编辑按钮做准备

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 1px solid var(--ant-color-border);
    pointer-events: none;
  }
`;

const AvatarSection = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const AvatarGlow = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 16px;
  z-index: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      #1890ff 25%, 
      #40a9ff 50%, 
      #1890ff 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${marqueeGlow} 3s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: 14px;
    background: ${props => props.isDark ? '#141414' : '#ffffff'};
    z-index: 0;
  }
`;

const GlowOverlay = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 16px;
  box-shadow: 0 0 8px 2px rgba(24, 144, 255, 0.3);
  opacity: 0.7;
  z-index: 0;
  animation: ${pulseEffect} 2s ease-in-out infinite;
`;

const Avatar = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
`;

const AvatarFallback = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2.5rem;
  position: relative;
  z-index: 1;
`;

const UserInfo = styled.div`
  flex-grow: 1;
`;

const Username = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--ant-color-text);
  margin-bottom: 8px;
`;

const UserDescription = styled.p`
  font-size: 14px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--ant-color-border);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background: var(--ant-color-bg-elevated);
  border-radius: 8px;
  border: 1px solid var(--ant-color-border);
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--ant-color-text);
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: var(--ant-color-text-secondary);
`;

const TabsContainer = styled.div`
  background: var(--ant-color-bg-container);
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  width: 100%;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 1px solid var(--ant-color-border);
    pointer-events: none;
  }
`;

const TabList = styled.div`
  display: flex;
  padding: 16px 24px;
  gap: 8px;
  border-bottom: 1px solid var(--ant-color-border);
`;

const Tab = styled.button`
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--ant-color-primary)' : 'var(--ant-color-text-secondary)'};
  background: ${props => props.active ? 'var(--ant-color-primary-bg)' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
  }
`;

const InfoSection = styled.div`
  padding: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);  // 固定两列
  gap: 20px;
`;

const InfoItem = styled.div`
  padding: 20px;
  background: var(--ant-color-bg-container);
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    border: 1px solid var(--ant-color-border);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const Label = styled.div`
  font-size: 13px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 8px;
`;

const Value = styled.div`
  font-size: 15px;
  color: var(--ant-color-text);
  font-weight: 500;
`;

const StyledButton = styled.button`
  ${tw`
    px-6 py-3 
    rounded-xl 
    font-medium 
    transition duration-200 
    flex items-center gap-2
  `}
  ${props => props.primary 
    ? tw`
      bg-primary-500 text-white 
      hover:bg-primary-600 
      dark:bg-primary-600 dark:hover:bg-primary-500
      transform hover:scale-105
      shadow-md hover:shadow-lg
    ` 
    : tw`
      bg-gray-200 text-gray-700 
      hover:bg-gray-300 
      dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600
      transform hover:scale-105
    `}
`;

const EditButton = styled.button`
  position: absolute;
  right: 32px;
  top: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--ant-color-bg-container);
  color: var(--ant-color-text);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--ant-color-border);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      rgba(24, 144, 255, 0.1) 25%, 
      rgba(64, 169, 255, 0.2) 50%, 
      rgba(24, 144, 255, 0.1) 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${marqueeGlow} 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: var(--ant-color-primary);
    border-color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
    
    &::before {
      opacity: 1;
    }
  }
`;

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease-out'
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '600px',
    width: '90%',
    margin: '20px',
    padding: 0,
    border: 'none',
    borderRadius: '1.25rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transform: 'translateY(20px)',
    opacity: 0,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

const ModalHeader = tw.div`
  p-4 
  border-b border-gray-200 dark:border-gray-700 
  flex items-center justify-between
`;

const ModalTitle = tw.h2`
  text-lg font-bold 
  text-gray-900 dark:text-gray-100
`;

const ModalContent = tw.div`p-4`;

const ModalFooter = tw.div`
  p-4 
  border-t border-gray-200 dark:border-gray-700 
  flex justify-end gap-4
`;

const FormLabel = tw.label`
  block 
  text-xs font-medium 
  text-gray-700 dark:text-gray-300 
  mb-1
`;

const FormInput = tw.input`
  w-full 
  px-3 py-2
  text-sm 
  rounded-lg
  border border-gray-300 dark:border-gray-600 
  bg-white dark:bg-gray-700 
  text-gray-900 dark:text-gray-100 
  placeholder-gray-500 dark:placeholder-gray-400
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25 
  transition duration-200
`;

const FormTextarea = tw.textarea`
  w-full 
  px-3 py-2
  text-sm 
  rounded-lg
  border border-gray-300 dark:border-gray-600 
  bg-white dark:bg-gray-700 
  text-gray-900 dark:text-gray-100 
  placeholder-gray-500 dark:placeholder-gray-400
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25 
  transition duration-200
  min-h-[100px]
  resize-none
`;

const AvatarUploadSection = tw.div`
  flex flex-col items-center 
  mb-6
`;

const AvatarUpload = styled.div`
  ${tw`
    relative 
    cursor-pointer 
    mb-4
  `}
`;

const UploadOverlay = styled.div`
  ${tw`
    absolute inset-0 
    bg-black bg-opacity-50 
    rounded-full 
    flex items-center justify-center 
    opacity-0 
    hover:opacity-100 
    transition-opacity duration-200
  `}
`;

const UploadLabel = tw.label`
  text-white 
  text-sm 
  cursor-pointer 
  flex items-center gap-2 
  hover:underline
`;

export default () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [afterOpen, setAfterOpen] = useState(false);
  const [editedInfo, setEditedInfo] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedInfo);
      setEditedInfo(parsedInfo);
    }
  }, []);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedInfo(prev => ({
          ...prev,
          avatar: reader.result
        }));
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setEditedInfo({...userInfo});
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setAfterOpen(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 300);
  };

  const handleSave = async () => {
    try {
      if (selectedFile) {
        // TODO: 实现头像上传逻辑
      }
      setUserInfo(editedInfo);
      localStorage.setItem('userInfo', JSON.stringify(editedInfo));
      handleClose();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAfterOpen = () => {
    requestAnimationFrame(() => {
      setAfterOpen(true);
    });
  };

  const currentModalStyles = {
    overlay: {
      ...modalStyles.overlay,
      backgroundColor: afterOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)'
    },
    content: {
      ...modalStyles.content,
      transform: afterOpen ? 'translateY(0)' : 'translateY(20px)',
      opacity: afterOpen ? 1 : 0,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#ffffff'
    }
  };

  // 将 Modal 组件的渲染条件化
  const modalElement = isModalOpen ? (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      onAfterOpen={handleAfterOpen}
      style={currentModalStyles}
      contentLabel="编辑个人信息"
      closeTimeoutMS={300}
      shouldCloseOnOverlayClick={true}
    >
      <ModalHeader>
        <ModalTitle>编辑个人信息</ModalTitle>
        <StyledButton 
          onClick={handleClose}
          css={tw`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full`}
        >
          <CancelIcon />
        </StyledButton>
      </ModalHeader>
      
      <ModalContent>
        <AvatarUploadSection>
          <AvatarUpload className="group">
            <Avatar src={editedInfo.avatar} />
            <UploadOverlay className="group-hover:opacity-100">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                id="avatar-upload"
              />
              <UploadLabel htmlFor="avatar-upload">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                更换头像
              </UploadLabel>
            </UploadOverlay>
          </AvatarUpload>
          <p tw="text-sm text-gray-500 dark:text-gray-400">
            支持 jpg、png、gif 格式，最大 5MB
          </p>
        </AvatarUploadSection>

        <div tw="space-y-6">
          <div>
            <FormLabel>昵称</FormLabel>
            <FormInput
              type="text"
              value={editedInfo.nickname || ''}
              onChange={e => handleChange('nickname', e.target.value)}
              placeholder="请输入昵称"
            />
          </div>
          <div>
            <FormLabel>手机号码</FormLabel>
            <FormInput
              type="tel"
              value={editedInfo.phoneNumber || ''}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="请输入手机号码"
            />
          </div>
          <div>
            <FormLabel>个人简介</FormLabel>
            <FormTextarea
              value={editedInfo.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="请输入个人简介"
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <StyledButton onClick={handleClose}>
          <CancelIcon />
          取消
        </StyledButton>
        <StyledButton primary onClick={handleSave}>
          <SaveIcon />
          保存
        </StyledButton>
      </ModalFooter>
    </Modal>
  ) : null;

  if (!userInfo) return <div>加载中...</div>;

  return (
    <PageWrapper>
      <SimpleHeader />
      <Container>
        <Content>
          <ProfileHeader
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AvatarSection>
              <AvatarGlow isDark={document.documentElement.getAttribute('data-theme') === 'dark'} />
              <GlowOverlay />
              {userInfo.avatar ? (
                <Avatar src={userInfo.avatar} />
              ) : (
                <AvatarFallback>{userInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
              )}
            </AvatarSection>
            
            <UserInfo>
              <Username>{userInfo.username}</Username>
              <UserDescription>
                {userInfo.description || '这个用户很懒，还没有填写简介'}
              </UserDescription>
              <Stats>
                <StatItem>
                  <StatValue>{userInfo.creditScore || 0}</StatValue>
                  <StatLabel>信用分</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{userInfo.level || 1}</StatValue>
                  <StatLabel>等级</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{(userInfo.balance || 0).toFixed(2)}</StatValue>
                  <StatLabel>余额</StatLabel>
                </StatItem>
              </Stats>
            </UserInfo>
            
            <EditButton onClick={handleEdit}>
              <EditIcon />
              编辑资料
            </EditButton>
          </ProfileHeader>

          <TabsContainer>
            <TabList>
              <Tab 
                active={activeTab === 'basic'} 
                onClick={() => setActiveTab('basic')}
              >
                基本信息
              </Tab>
              <Tab 
                active={activeTab === 'account'} 
                onClick={() => setActiveTab('account')}
              >
                账户信息
              </Tab>
            </TabList>

            {activeTab === 'basic' && (
              <InfoSection>
                <Grid>
                  <InfoItem>
                    <Label>昵称</Label>
                    <Value>{userInfo.nickname || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>邮箱</Label>
                    <Value>{userInfo.email}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>手机号码</Label>
                    <Value>{userInfo.phoneNumber || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>真实姓名</Label>
                    <Value>{userInfo.fullName || '未设置'}</Value>
                  </InfoItem>
                </Grid>
              </InfoSection>
            )}

            {activeTab === 'account' && (
              <InfoSection>
                <Grid>
                  <InfoItem>
                    <Label>USDT 地址</Label>
                    <Value>{userInfo.usdtAddress || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>USDT 余额</Label>
                    <Value>{(userInfo.usdtAmount || 0).toFixed(6)}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>USDT 冻结金额</Label>
                    <Value>{(userInfo.usdtFrozenAmount || 0).toFixed(6)}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>注册时间</Label>
                    <Value>{userInfo.createTime || '未知'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>账户状态</Label>
                    <Value>{userInfo.isActive ? '正常' : '已禁用'}</Value>
                  </InfoItem>
                </Grid>
              </InfoSection>
            )}
          </TabsContainer>
        </Content>
      </Container>
      {modalElement}
    </PageWrapper>
  );
}; 