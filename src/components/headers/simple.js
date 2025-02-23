import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/logo.svg";
import { ReactComponent as SunIcon } from "feather-icons/dist/icons/sun.svg";
import { ReactComponent as MoonIcon } from "feather-icons/dist/icons/moon.svg";
import { auth } from "../../api/auth.js";
import { ThemeContext } from "styled-components";

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 50;
  background: var(--ant-color-bg-container);
  border-bottom: 1px solid var(--ant-color-border);
  padding: 0 24px;
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
    color: #fff;
    text-shadow: 
      0 0 5px var(--ant-color-primary),
      0 0 10px var(--ant-color-primary),
      0 0 20px var(--ant-color-primary),
      0 0 40px var(--ant-color-primary);
  }
  50% {
    color: #fff;
    text-shadow: 
      0 0 10px var(--ant-color-primary),
      0 0 20px var(--ant-color-primary),
      0 0 40px var(--ant-color-primary),
      0 0 80px var(--ant-color-primary),
      0 0 120px var(--ant-color-primary);
  }
  100% {
    color: #fff;
    text-shadow: 
      0 0 5px var(--ant-color-primary),
      0 0 10px var(--ant-color-primary),
      0 0 20px var(--ant-color-primary),
      0 0 40px var(--ant-color-primary);
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--ant-color-text);
  text-decoration: none;
  
  img {
    width: 1.75rem;
    margin-right: 0.5rem;
  }

  &:hover {
    color: var(--ant-color-primary);
  }
`;

const BrandName = styled.span`
  display: flex;
  align-items: center;
  
  &:after {
    content: 'X';
    margin-left: 4px;
    font-size: 2em;
    font-weight: 900;
    animation: ${glowingEffect} 2s ease-in-out infinite;
    transform: translateY(-2px);
    text-shadow: 
      0 0 5px var(--ant-color-primary),
      0 0 10px var(--ant-color-primary),
      0 0 20px var(--ant-color-primary),
      0 0 40px var(--ant-color-primary);
    -webkit-text-stroke: 1px var(--ant-color-primary);
    position: relative;
    z-index: 1;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ant-color-text-secondary);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
  }
`;

const PrimaryLink = styled(NavLink)`
  color: var(--ant-color-primary);
  border: 1px solid var(--ant-color-primary);
  padding: 0.375rem 1rem;
  border-radius: 4px;

  &:hover {
    color: white;
    background: var(--ant-color-primary);
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 1.5rem;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--ant-color-border);
  background: var(--ant-color-bg-container);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--ant-color-bg-elevated);
    border-color: var(--ant-color-primary);
  }
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
`;

const UserName = styled.span`
  margin-left: 0.75rem;
  margin-right: 0.5rem;
  font-size: 0.875rem;
  color: var(--ant-color-text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserDropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 200px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  border-radius: 8px;
  border: 1px solid var(--ant-color-border);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 50;
  overflow: hidden;
  padding: 4px;

  &:before {
    content: '';
    position: absolute;
    top: -4px;
    right: 20px;
    width: 8px;
    height: 8px;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
    transform: rotate(45deg);
    border-left: 1px solid var(--ant-color-border);
    border-top: 1px solid var(--ant-color-border);
    z-index: 1;
  }
`;

const UserMenuItem = styled.button`
  width: 100%;
  padding: 0.625rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--ant-color-text);
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--ant-color-primary-bg);
    color: var(--ant-color-primary);
  }

  .icon {
    margin-right: 0.75rem;
    font-size: 1.125rem;
    color: var(--ant-color-text-secondary);
  }

  &:hover .icon {
    color: var(--ant-color-primary);
  }
`;

const DarkModeButton = styled.button`
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--ant-color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
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

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
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

  return (
    <Header>
      <HeaderContent>
        <LeftSection>
          <LogoLink to="/">
            <img src={logo} alt="logo" />
            <BrandName>MyStorage</BrandName>
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
                <UserAvatar 
                  src={userInfo.avatar || 'https://via.placeholder.com/100'} 
                  alt={userInfo.username} 
                />
                <UserName>{userInfo.username}</UserName>
              </UserButton>
              <UserDropdown show={showUserMenu}>
                <UserMenuItem onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}>
                  <i className="bi bi-person icon" />
                  个人中心
                </UserMenuItem>
                <UserMenuItem onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}>
                  <i className="bi bi-gear icon" />
                  账号设置
                </UserMenuItem>
                <UserMenuItem onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right icon" />
                  退出登录
                </UserMenuItem>
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