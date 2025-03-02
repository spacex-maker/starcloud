import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/logo.svg";
import { ReactComponent as SunIcon } from "feather-icons/dist/icons/sun.svg";
import { ReactComponent as MoonIcon } from "feather-icons/dist/icons/moon.svg";
import { auth } from "../../api/auth.js";
import { ThemeContext } from "styled-components";

// 定义旋转发光效果
const rotateGlow = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// 定义脉冲发光效果
const pulseGlow = keyframes`
  0% {
    opacity: 0.6;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.98);
  }
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

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 64px;
  z-index: 100;
  background: var(--ant-color-primary);
  border-bottom: 1px solid var(--ant-color-border);
  padding: 0 24px;
  opacity: ${props => props.scrolled ? 0.8 : 1};
  backdrop-filter: ${props => props.scrolled ? 'blur(8px)' : 'none'};
  transition: all 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  margin: 0 auto;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const glowingEffect = keyframes`
  0% {
    text-shadow: 0 0 5px rgba(24, 144, 255, 0.3), 0 0 10px rgba(24, 144, 255, 0.2);
  }
  50% {
    text-shadow: 0 0 10px rgba(24, 144, 255, 0.5), 0 0 20px rgba(24, 144, 255, 0.3), 0 0 30px rgba(24, 144, 255, 0.2);
  }
  100% {
    text-shadow: 0 0 5px rgba(24, 144, 255, 0.3), 0 0 10px rgba(24, 144, 255, 0.2);
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const BrandName = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.02em;
  color: var(--ant-color-text);
  display: flex;
  align-items: center;
`;

const XHighlight = styled.span`
  color: var(--ant-color-primary-active);
  font-weight: 900;
  font-size: 1.6rem;
  margin-left: 2px;
  position: relative;
  top: -1px;
  text-shadow: 0 0 5px rgba(var(--ant-primary-rgb), 0.5), 0 0 10px rgba(var(--ant-primary-rgb), 0.3);
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PrimaryLink = styled(NavLink)`
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.85);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  height: 36px;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: var(--ant-color-primary);
    background: white;
    border-color: white;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 1.5rem;
`;

const UserButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 50px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1;
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50px;
  z-index: -1;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50px;
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
    border-radius: 48px;
    background: ${props => props.isDark ? '#141414' : '#ffffff'};
    z-index: 0;
  }
`;

const GlowOverlay = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50px;
  box-shadow: 0 0 8px 2px rgba(24, 144, 255, 0.3);
  opacity: 0.7;
  z-index: -1;
  animation: ${pulseEffect} 2s ease-in-out infinite;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  margin-right: 10px;
`;

const UserAvatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  box-sizing: border-box;
`;

const AvatarFallback = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
  border: 2px solid transparent;
  box-sizing: border-box;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #52c41a;
  border: 2px solid ${props => props.isDark ? '#141414' : '#ffffff'};
  z-index: 3;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--ant-color-text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserEmail = styled.span`
  font-size: 0.75rem;
  color: var(--ant-color-text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: #1890ff;
  font-weight: 500;
`;

const UserDropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 220px;
  background: ${props => props.isDark ? 'rgba(22, 24, 29, 0.85)' : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  box-shadow: 0 8px 32px ${props => props.isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 50;
  overflow: hidden;
  padding: 8px;

  &:before {
    content: '';
    position: absolute;
    top: -4px;
    right: 20px;
    width: 8px;
    height: 8px;
    background: ${props => props.isDark ? 'rgba(22, 24, 29, 0.85)' : 'rgba(255, 255, 255, 0.7)'};
    backdrop-filter: blur(10px);
    transform: rotate(45deg);
    border-left: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    border-top: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    z-index: 1;
  }
`;

const DropdownHeader = styled.div`
  padding: 8px 12px;
  font-weight: 600;
  color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
  border-bottom: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  margin-bottom: 8px;
`;

const UserMenuItem = styled.button`
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 0.875rem;
  color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.isDark ? '#61dafb' : '#3b82f6'};
  }

  .icon {
    margin-right: 10px;
    font-size: 1rem;
    color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }

  &:hover .icon {
    color: ${props => props.isDark ? '#61dafb' : '#3b82f6'};
  }
`;

const LogoutMenuItem = styled(UserMenuItem)`
  margin-top: 8px;
  border-top: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  padding-top: 12px;
  
  &:hover {
    color: #ff4d4f;
    background: ${props => props.isDark ? 'rgba(255, 77, 79, 0.25)' : 'rgba(255, 77, 79, 0.1)'};
  }
  
  &:hover .icon {
    color: #ff4d4f;
  }
`;

const DarkModeButton = styled.button`
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--ant-color-text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--ant-color-text-secondary);
    background: var(--ant-color-bg-container);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }
`;

export default function SimpleHeader() {
  const navigate = useNavigate();
  const theme = React.useContext(ThemeContext);
  const [isDark, setIsDark] = useState(theme.mode === 'dark');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 从本地存储获取用户信息
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      // 如果本地没有用户信息但有token，尝试重新获取
      const token = localStorage.getItem('token');
      if (token) {
        auth.getUserInfo().then(result => {
          if (result.success) {
            setUserInfo(result.data);
          }
        });
      }
    }
  }, []);

  const toggleDarkMode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newIsDark = !isDark;
    theme.setTheme(newIsDark);
    setIsDark(newIsDark);
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  console.log("Rendering SimpleHeader without icon");

  // 获取用户名首字母的函数
  const getInitial = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  useEffect(() => {
    // 从CSS变量中提取主题色RGB值
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-primary')
      .trim();
    
    const bgContainerColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-bg-container')
      .trim();
      
    const borderColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-border')
      .trim();
      
    const errorColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--ant-color-error')
      .trim();
    
    // 将十六进制颜色转换为RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '255, 255, 255'; // 默认白色
    };
    
    // 设置RGB变量
    document.documentElement.style.setProperty(
      '--ant-primary-rgb', 
      hexToRgb(primaryColor)
    );
    
    document.documentElement.style.setProperty(
      '--ant-bg-container-rgb', 
      hexToRgb(bgContainerColor)
    );
    
    document.documentElement.style.setProperty(
      '--ant-border-rgb', 
      hexToRgb(borderColor)
    );
    
    document.documentElement.style.setProperty(
      '--ant-error-rgb', 
      hexToRgb(errorColor)
    );
  }, [isDark]); // 当主题切换时重新计算

  return (
    <Header scrolled={scrolled}>
      <HeaderContent>
        <LeftSection>
          <LogoLink to="/">
            <BrandName>
              MyStorage<XHighlight>X</XHighlight>
            </BrandName>
          </LogoLink>
        </LeftSection>

        <RightSection>
          <DarkModeButton 
            onClick={toggleDarkMode}
            aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </DarkModeButton>
          
          {userInfo ? (
            <UserMenu className="user-menu">
              <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
                <ButtonGlow isDark={isDark} />
                <GlowOverlay />
                <AvatarContainer>
                  {userInfo.avatar ? (
                    <UserAvatar 
                      src={userInfo.avatar} 
                      alt={userInfo.username} 
                      isDark={isDark}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <AvatarFallback isDark={isDark}>{getInitial(userInfo.username)}</AvatarFallback>
                  )}
                  <StatusIndicator isDark={isDark} />
                </AvatarContainer>
                <UserInfo>
                  <UserName>{userInfo.username}</UserName>
                  <UserEmail>{userInfo.email}</UserEmail>
                </UserInfo>
              </UserButton>
              
              <UserDropdown 
                show={showUserMenu} 
                isDark={isDark}
              >
                <DropdownHeader isDark={isDark}>账号</DropdownHeader>
                <UserMenuItem 
                  isDark={isDark}
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                >
                  <i className="bi bi-person icon" />
                  个人中心
                </UserMenuItem>
                <UserMenuItem 
                  isDark={isDark}
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                >
                  <i className="bi bi-gear icon" />
                  账号设置
                </UserMenuItem>
                <LogoutMenuItem 
                  isDark={isDark}
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right icon" />
                  退出登录
                </LogoutMenuItem>
              </UserDropdown>
            </UserMenu>
          ) : (
            <>
              <NavLink to="/login">登录</NavLink>
              <PrimaryLink to="/signup">注册</PrimaryLink>
            </>
          )}
        </RightSection>
      </HeaderContent>
    </Header>
  );
} 