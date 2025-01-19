import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithBackground.js";
import { ReactComponent as EditIcon } from "feather-icons/dist/icons/edit-2.svg";
import { ReactComponent as SaveIcon } from "feather-icons/dist/icons/check.svg";
import { ReactComponent as CancelIcon } from "feather-icons/dist/icons/x.svg";
import Modal from 'react-modal';
import { motion } from "framer-motion";
import tw from "twin.macro";
import { css } from "styled-components/macro";

// 确保只设置一次 appElement
if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

const PageWrapper = styled.div`
  ${tw`
    w-full
    min-h-screen
    flex
    flex-col
  `}
`;

const Container = tw.div`
  relative 
  bg-gray-100 dark:bg-gray-900 
  w-full
  flex-grow
  min-h-screen
`;

const Content = tw.div`
  max-w-screen-xl 
  mx-auto 
  py-12
  px-4 sm:px-6 lg:px-8
  w-full
  flex-grow
  mt-20
`;

const ProfileHeader = styled(motion.div)`
  ${tw`
    bg-white dark:bg-gray-800 
    rounded-lg 
    shadow-md 
    p-6 
    mb-8 
    flex 
    items-start 
    gap-6
    w-full
    flex-wrap sm:flex-nowrap  // 在小屏幕上允许换行
  `}
`;

const AvatarSection = tw.div`flex-shrink-0`;

const Avatar = styled.div`
  ${tw`w-24 h-24 rounded-full bg-cover bg-center border-4 border-gray-200 dark:border-gray-700`}
  background-image: url(${props => props.src});
`;

const UserInfo = tw.div`flex-grow`;

const Username = tw.h1`text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2`;

const UserDescription = tw.p`text-gray-600 dark:text-gray-400 mb-4`;

const Stats = tw.div`grid grid-cols-3 gap-4`;

const StatItem = tw.div`text-center`;

const StatValue = tw.div`text-xl font-bold text-gray-900 dark:text-gray-100`;

const StatLabel = tw.div`text-sm text-gray-600 dark:text-gray-400`;

const TabsContainer = tw.div`
  bg-white dark:bg-gray-800 
  rounded-lg 
  shadow-md 
  p-6
  w-full
  mb-8
`;

const TabList = tw.div`
  flex 
  gap-4 
  border-b 
  border-gray-200 dark:border-gray-700 
  mb-6
  overflow-x-auto  // 只允许标签栏在必要时横向滚动
  pb-2  // 为滚动条留出空间
`;

const Tab = styled.button`
  ${tw`px-4 py-2 text-gray-600 dark:text-gray-400 font-medium transition-colors duration-200`}
  ${props => props.active && tw`text-primary-500 border-b-2 border-primary-500`}
`;

const InfoSection = tw.div`mt-6`;

const SectionTitle = tw.h2`text-xl font-bold text-gray-900 dark:text-gray-100 mb-4`;

const Grid = tw.div`
  grid 
  grid-cols-1 
  md:grid-cols-2 
  gap-6
  w-full
`;

const InfoItem = tw.div``;

const Label = tw.div`text-sm font-medium text-gray-600 dark:text-gray-400 mb-1`;

const Value = tw.div`text-gray-900 dark:text-gray-100`;

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

const EditButton = styled(StyledButton)`
  ${tw`
    z-10
    cursor-pointer
    px-4 py-2
    bg-white dark:bg-gray-800
    hover:bg-gray-100 dark:hover:bg-gray-700
    text-gray-700 dark:text-gray-300
    rounded-lg
    flex items-center gap-2
    transition-all duration-200
    shadow-sm hover:shadow
  `}
  
  svg {
    ${tw`w-4 h-4`}
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

const afterOpenStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    transform: 'translateY(0)',
    opacity: 1
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
      <Header />
      <Container>
        <Content>
          <ProfileHeader
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AvatarSection>
              <Avatar src={userInfo.avatar} />
            </AvatarSection>
            <UserInfo>
              <Username>{userInfo.username}</Username>
              <UserDescription>
                {userInfo.description || '这个用户很懒，还没有填写简介'}
              </UserDescription>
              <Stats>
                <StatItem>
                  <StatValue>{userInfo.creditScore}</StatValue>
                  <StatLabel>信用分</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{userInfo.level}</StatValue>
                  <StatLabel>等级</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{userInfo.balance?.toFixed(2)}</StatValue>
                  <StatLabel>余额</StatLabel>
                </StatItem>
              </Stats>
            </UserInfo>
            <EditButton 
              type="button"
              onClick={handleEdit}
            >
              <EditIcon />
              编辑资料
            </EditButton>
          </ProfileHeader>

          <TabsContainer
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
              <Tab 
                active={activeTab === 'address'} 
                onClick={() => setActiveTab('address')}
              >
                地址信息
              </Tab>
            </TabList>

            {activeTab === 'basic' && (
              <InfoSection>
                <SectionTitle>基本信息</SectionTitle>
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
                <SectionTitle>账户信息</SectionTitle>
                <Grid>
                  <InfoItem>
                    <Label>USDT 地址</Label>
                    <Value>{userInfo.usdtAddress || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>USDT 余额</Label>
                    <Value>{userInfo.usdtAmount?.toFixed(6) || '0.000000'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>USDT 冻结金额</Label>
                    <Value>{userInfo.usdtFrozenAmount?.toFixed(6) || '0.000000'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>注册时间</Label>
                    <Value>{userInfo.createTime}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>账户状态</Label>
                    <Value>{userInfo.isActive ? '正常' : '已禁用'}</Value>
                  </InfoItem>
                </Grid>
              </InfoSection>
            )}

            {activeTab === 'address' && (
              <InfoSection>
                <SectionTitle>地址信息</SectionTitle>
                <Grid>
                  <InfoItem>
                    <Label>地址</Label>
                    <Value>{userInfo.address || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>城市</Label>
                    <Value>{userInfo.city || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>省份/州</Label>
                    <Value>{userInfo.state || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>邮政编码</Label>
                    <Value>{userInfo.postalCode || '未设置'}</Value>
                  </InfoItem>
                  <InfoItem>
                    <Label>国家</Label>
                    <Value>{userInfo.country || '未设置'}</Value>
                  </InfoItem>
                </Grid>
              </InfoSection>
            )}
          </TabsContainer>
        </Content>
      </Container>
      <Footer />
      {modalElement}
    </PageWrapper>
  );
}; 