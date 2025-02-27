import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../api/auth";
import { base } from "../api/base";
import { message } from "antd";
import styled, { ThemeContext, keyframes } from "styled-components";
import { 
  GoogleOutlined, 
  GithubOutlined, 
  AppleOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useLocale } from 'contexts/LocaleContext';
import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet';

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

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-bg-container)' 
    : '#f5f7fa'};
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-7) 100%)'
    : 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)'};
  padding: 2rem;
  color: white;
  display: none;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.mode === 'dark'
      ? 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3))'
      : 'linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1))'};
    pointer-events: none;
  }

  @media (min-width: 1024px) {
    display: flex;
  }
`;

const WelcomeText = styled.div`
  max-width: 480px;
  text-align: center;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    font-size: 1.125rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-bg-container)' 
    : '#ffffff'};
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background: ${props => props.theme.mode === 'dark' 
    ? 'transparent' 
    : '#ffffff'};
  border-radius: 1rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? 'none' 
    : '0 4px 24px rgba(0, 0, 0, 0.08)'};
`;

const Logo = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--ant-color-text);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

// 完全重新设计的边框发光效果
const BorderGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 9999px;
  pointer-events: none;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px; /* 控制边框宽度 */
    border-radius: inherit;
    background: linear-gradient(
      90deg, 
      transparent 0%, 
      #1890ff 25%, 
      #40a9ff 50%, 
      #1890ff 75%, 
      transparent 100%
    );
    background-size: 200% 100%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: ${marqueeGlow} 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &.active::before {
    opacity: 1;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-border)' 
    : '#e5e7eb'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : '#f9fafb'};
  color: var(--ant-color-text);
  font-size: 0.875rem;
  transition: all 0.3s;
  position: relative;
  z-index: 1;

  &:focus {
    outline: none;
    border-color: transparent; /* 当输入框获得焦点时，隐藏原始边框 */
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.04)' 
      : '#ffffff'};
  }

  &::placeholder {
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(0, 0, 0, 0.25)'};
  }
`;

const EmailSuffixButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 3; /* 确保按钮在最上层 */

  &:hover {
    color: var(--ant-color-text);
  }
`;

const EmailSuffixDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : '#ffffff'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'var(--ant-color-border)' 
    : '#e5e7eb'};
  border-radius: 0.5rem;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: none;
  
  &.show {
    display: block;
  }
`;

const EmailSuffixOption = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--ant-color-text);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'var(--ant-color-primary-bg)'};
    color: var(--ant-color-primary);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 1.1rem;
  
  &:hover {
    color: var(--ant-color-text);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.5rem;
  border: none;
  background: var(--ant-color-primary);
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;

  &:hover {
    background: var(--ant-color-primary-hover);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: var(--ant-color-text-quaternary);
  font-size: 0.875rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'var(--ant-color-border)' 
      : '#e5e7eb'};
  }

  span {
    padding: 0 1rem;
  }
`;

const SocialLogin = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

// 添加社交媒体的品牌颜色
const SOCIAL_COLORS = {
  google: {
    color: '#DB4437',
    hoverColor: '#C13B2F'
  },
  github: {
    color: '#333333',
    hoverColor: '#24292E'
  },
  apple: {
    color: '#000000',
    hoverColor: '#1A1A1A'
  },
  facebook: {
    color: '#4267B2',
    hoverColor: '#385899'
  },
  twitter: {
    color: '#1DA1F2',
    hoverColor: '#1A91DA'
  },
  linkedin: {
    color: '#0077B5',
    hoverColor: '#006399'
  }
};

// 修改 SocialButton 组件
const SocialButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.socialType ? SOCIAL_COLORS[props.socialType].color : 'transparent'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.25rem;

  &:hover {
    background: ${props => props.socialType ? SOCIAL_COLORS[props.socialType].hoverColor : 'transparent'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: var(--ant-color-text-secondary);
  font-size: 0.875rem;

  a {
    color: var(--ant-color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: var(--ant-color-primary-hover);
    }
  }
`;

const ErrorText = styled.div`
  color: var(--ant-color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const TopRightControls = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 1rem;
  z-index: 10;
`;

const IconButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : '#ffffff'};
  color: var(--ant-color-text-secondary);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: var(--ant-color-primary);
    border-color: var(--ant-color-primary);
    background: var(--ant-color-primary-bg);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

// 添加邮箱后缀列表
const emailSuffixes = [
  "@qq.com",
  "@gmail.com",
  "@163.com",
  "@126.com",
  "@outlook.com",
  "@hotmail.com",
  "@yahoo.com",
  "@foxmail.com",
  "@sina.com",
  "@sohu.com"
];

// 添加样式组件
const PoweredBy = styled.div`
  position: absolute;
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
  box-shadow: ${props => props.theme.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(255, 255, 255, 0.5)'};
`;

// 添加一个新的样式组件
const PhilosophyQuote = styled.div`
  position: absolute;
  bottom: 3.5rem; // 放在版权信息上方
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
  
  &::before, &::after {
    content: '"';
    font-family: serif;
    font-size: 1.2em;
    opacity: 0.7;
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuffixDropdown, setShowSuffixDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const emailSuffixButtonRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const theme = React.useContext(ThemeContext);
  const [isDark, setIsDark] = useState(theme.mode === 'dark');
  const { locale, changeLocale } = useLocale();
  const intl = useIntl();
  const [languages, setLanguages] = useState([]); // 添加语言列表状态
  
  // 添加输入框焦点状态
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // 获取支持的语言列表
  useEffect(() => {
    const fetchLanguages = async () => {
      const result = await base.getEnabledLanguages();
      if (result.success) {
        const sortedLanguages = result.data.sort((a, b) => b.usageCount - a.usageCount);
        setLanguages(sortedLanguages);
      }
    };
    fetchLanguages();
  }, []);

  // 构建语言菜单项
  const languageItems = languages.map(language => ({
    key: language.languageCode,
    label: language.languageNameNative
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await auth.login({ email, password });
      if (result.success) {
        message.success("登录成功");
        navigate("/");
      } else {
        setError(result.message || "登录失败");
      }
    } catch (error) {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 修改邮箱后缀下拉框的处理逻辑
  const handleSuffixButtonClick = (e) => {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    setShowSuffixDropdown(!showSuffixDropdown);
  };
  
  // 处理点击文档其他地方关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        emailSuffixButtonRef.current && 
        !emailSuffixButtonRef.current.contains(event.target)
      ) {
        setShowSuffixDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value.length > 0 && !value.includes('@')) {
      setShowSuffixDropdown(true);
    } else {
      setShowSuffixDropdown(false);
    }
  };

  const handleSuffixClick = (suffix) => {
    const emailPrefix = email.split("@")[0];
    setEmail(emailPrefix + suffix);
    setShowSuffixDropdown(false);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    theme.setTheme(newIsDark);
  };

  return (
    <>
      <Helmet>
        <title>登录 - MyStorageX</title>
        <meta name="description" content="登录 MyStorageX，开启您的云存储之旅" />
      </Helmet>
      <PageContainer>
        <TopRightControls>
          <IconButton onClick={toggleTheme}>
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </IconButton>
          <Dropdown
            menu={{
              items: languageItems,
              selectedKeys: [locale],
              onClick: ({ key }) => {
                changeLocale(key);
              },
            }}
            placement="bottomRight"
          >
            <IconButton>
              <GlobalOutlined />
            </IconButton>
          </Dropdown>
        </TopRightControls>

        <LeftSection>
          <WelcomeText>
            <h1>
              <FormattedMessage id="login.welcome" />
            </h1>
            <p>
              <FormattedMessage id="login.description" />
            </p>
          </WelcomeText>
        </LeftSection>

        <RightSection>
          <LoginBox>
            <Logo>
              <FormattedMessage id="login.title" />
            </Logo>
            <Form onSubmit={handleSubmit} autoComplete="off">
              <FormItem>
                <InputWrapper>
                  <Input
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    placeholder={intl.formatMessage({ id: 'login.email.placeholder' })}
                    autoComplete="off"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={(e) => {
                      // 检查点击是否在下拉按钮上，如果是则不失去焦点
                      if (
                        emailSuffixButtonRef.current && 
                        !emailSuffixButtonRef.current.contains(e.relatedTarget)
                      ) {
                        setEmailFocused(false);
                      }
                    }}
                  />
                  <BorderGlow className={emailFocused ? "active" : ""} />
                  {!email.includes('@') && (
                    <EmailSuffixButton
                      type="button"
                      onClick={handleSuffixButtonClick}
                      ref={emailSuffixButtonRef}
                    >
                      <DownOutlined />
                    </EmailSuffixButton>
                  )}
                  <EmailSuffixDropdown 
                    ref={dropdownRef}
                    className={showSuffixDropdown ? "show" : ""}
                  >
                    {emailSuffixes.map((suffix, index) => (
                      <EmailSuffixOption
                        key={index}
                        type="button"
                        onClick={() => handleSuffixClick(suffix)}
                      >
                        {suffix}
                      </EmailSuffixOption>
                    ))}
                  </EmailSuffixDropdown>
                </InputWrapper>
              </FormItem>

              <FormItem>
                <InputWrapper>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={intl.formatMessage({ id: 'login.password.placeholder' })}
                    autoComplete="new-password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <BorderGlow className={passwordFocused ? "active" : ""} />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </PasswordToggle>
                </InputWrapper>
              </FormItem>

              {error && <ErrorText>{error}</ErrorText>}

              <SubmitButton type="submit" disabled={loading}>
                <FormattedMessage 
                  id={loading ? 'login.loading' : 'login.button'} 
                />
              </SubmitButton>

              <Divider>
                <span>
                  <FormattedMessage id="login.divider" />
                </span>
              </Divider>

              <SocialLogin>
                <SocialButton type="button" socialType="google">
                  <GoogleOutlined />
                </SocialButton>
                <SocialButton type="button" socialType="github">
                  <GithubOutlined />
                </SocialButton>
                <SocialButton type="button" socialType="apple">
                  <AppleOutlined />
                </SocialButton>
                <SocialButton type="button" socialType="facebook">
                  <FacebookOutlined />
                </SocialButton>
                <SocialButton type="button" socialType="twitter">
                  <TwitterOutlined />
                </SocialButton>
                <SocialButton type="button" socialType="linkedin">
                  <LinkedinOutlined />
                </SocialButton>
              </SocialLogin>

              <Footer>
                <FormattedMessage id="login.signup" />{' '}
                <Link to="/signup">
                  <FormattedMessage id="login.signup.link" />
                </Link>
              </Footer>
            </Form>
          </LoginBox>
        </RightSection>
        <PhilosophyQuote>
          技术应是为人民服务
        </PhilosophyQuote>
        
        <PoweredBy>
          © 2024 ProTX Team. All rights reserved.
        </PoweredBy>
      </PageContainer>
    </>
  );
}

