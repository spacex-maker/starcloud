import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../api/auth";
import { base } from "../api/base";
import { message, Dropdown, Select } from "antd";
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
  DownOutlined,
  CaretDownOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from "react-intl";
import { useLocale } from "../contexts/LocaleContext";
import axios from '../api/axios';
import { Helmet } from 'react-helmet';

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

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ant-color-text-secondary);
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

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
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
  z-index: 3;  // 添加较高的 z-index 值
  
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

const ErrorText = styled.div`
  color: var(--ant-color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

const Description = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  max-width: 480px;
  margin: 1.5rem auto 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

// 邮箱后缀列表
const emailSuffixes = [
  "@qq.com",
  "@gmail.com",
  "@163.com",
  "@126.com",
  "@outlook.com",
  "@hotmail.com",
  "@yahoo.com",
  "@foxmail.com"
];

const PoweredBy = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  text-align: center;
  color: var(--ant-color-text-quaternary);
  font-size: 0.75rem;
`;

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

// 在已有的 styled components 中添加国家选择的样式
const CountryDropdown = styled(EmailSuffixDropdown)`
  // 继承邮箱下拉框的样式
`;

const CountryOption = styled(EmailSuffixOption)`
  // 继承邮箱选项的样式
`;

// 添加国旗图标的样式
const CountryFlag = styled.img`
  width: 28px;  // 增加宽度
  height: 21px; // 保持宽高比
  margin-right: 12px;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CountryOptionContent = styled.div`
  display: flex;
  align-items: center;
`;

// 修改输入框内容的显示样式
const SelectedCountryContent = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  gap: 12px;
  color: var(--ant-color-text);
  
  &.placeholder {
    color: #8E99AB;
  }
`;

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuffixDropdown, setShowSuffixDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const emailSuffixButtonRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = React.useContext(ThemeContext);
  const [isDark, setIsDark] = useState(theme.mode === 'dark');
  const { locale, changeLocale } = useLocale();
  const intl = useIntl();
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState('');
  
  // 添加输入框焦点状态
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [countryFocused, setCountryFocused] = useState(false);
  
  // 在组件中添加国家选择的状态
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef(null);
  const countryButtonRef = useRef(null);
  
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

  useEffect(() => {
    // 获取国家列表
    const fetchCountries = async () => {
      try {
        const response = await axios.get('/base/countries/list-all-enable');
        if (response.data.success) {
          setCountries(response.data.data);
          // 默认选中中国（如果存在）
          const china = response.data.data.find(country => country.code === 'CN');
          if (china) {
            setCountryCode(china.code);
          }
        }
      } catch (error) {
        console.error('获取国家列表失败:', error);
        message.error('获取国家列表失败');
      }
    };

    fetchCountries();
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    theme.setTheme(newIsDark);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // 只有当输入了@并且@后面有内容时才隐藏下拉框
    const atIndex = value.indexOf('@');
    if (atIndex !== -1 && value.length > atIndex + 1) {
      setShowSuffixDropdown(false);
    } else {
      setShowSuffixDropdown(true);
    }
  };

  const handleSuffixClick = (suffix) => {
    const emailPrefix = email.split("@")[0];
    setEmail(emailPrefix + suffix);
    setShowSuffixDropdown(false);
  };

  // 将 languageItems 的构建移到 render 内部
  const items = languages.map(language => ({
    key: language.languageCode,
    label: language.languageNameNative
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!username || !email || !password || !countryCode) {
      setError("请填写所有必填字段");
      return;
    }

    // 验证用户名长度
    if (username.length < 4 || username.length > 10) {
      setError("用户名长度必须在4-10个字符之间");
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);

    try {
      const result = await auth.register({
        username,
        email,
        password,
        countryCode
      });

      if (result.success) {
        message.success("注册成功");
        navigate("/login");
      } else {
        setError(result.message || "注册失败，请检查输入信息");
      }
    } catch (error) {
      console.error('注册错误:', error);
      setError(error.response?.data?.message || "注册失败，请稍后重试");
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
  }, [showSuffixDropdown]);

  return (
    <>
      <Helmet>
        <title>注册 - MyStorageX</title>
        <meta name="description" content="注册 MyStorageX，获取专属云存储空间" />
      </Helmet>
      <PageContainer>
        <TopRightControls>
          <IconButton onClick={toggleTheme}>
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </IconButton>
          <Dropdown
            menu={{
              items: items,
              selectedKeys: [locale],
              onClick: ({ key }) => changeLocale(key),
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
              <FormattedMessage id="signup.welcome" />
            </h1>
          </WelcomeText>
          <Description>
            <FormattedMessage id="signup.description" />
          </Description>
        </LeftSection>

        <RightSection>
          <LoginBox>
            <Logo>
              <FormattedMessage id="signup.title" />
            </Logo>
            <Form onSubmit={handleSubmit} autoComplete="off">
              <FormItem>
                <InputWrapper>
                  <Input
                    as="div"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    style={{ 
                      padding: 0,
                      height: '50px',
                      lineHeight: '50px'
                    }}
                  >
                    <SelectedCountryContent className={!countryCode ? 'placeholder' : ''}>
                      {countryCode && countries.find(c => c.code === countryCode) ? (
                        <>
                          <CountryFlag 
                            src={countries.find(c => c.code === countryCode)?.flagImageUrl} 
                            alt={countries.find(c => c.code === countryCode)?.name}
                            onError={(e) => {
                              e.target.src = '/default-flag.png';
                            }}
                          />
                          <span>{countries.find(c => c.code === countryCode)?.name}</span>
                        </>
                      ) : (
                        <span>选择国家/地区</span>
                      )}
                    </SelectedCountryContent>
                  </Input>
                  <BorderGlow className={countryFocused ? "active" : ""} />
                  <EmailSuffixButton
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    ref={countryButtonRef}
                    style={{ right: '16px' }}
                  >
                    <DownOutlined />
                  </EmailSuffixButton>
                  <CountryDropdown 
                    ref={countryDropdownRef}
                    className={showCountryDropdown ? "show" : ""}
                  >
                    {countries.map(country => (
                      <CountryOption
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(country.code);
                          setShowCountryDropdown(false);
                        }}
                      >
                        <CountryOptionContent>
                          <CountryFlag 
                            src={country.flagImageUrl} 
                            alt={country.name}
                            onError={(e) => {
                              e.target.src = '/default-flag.png';
                            }}
                          />
                          <span>{country.name}</span>
                        </CountryOptionContent>
                      </CountryOption>
                    ))}
                  </CountryDropdown>
                </InputWrapper>
              </FormItem>

              <FormItem>
                <InputWrapper>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={intl.formatMessage({ id: "signup.username.placeholder" })}
                    autoComplete="off"
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                  />
                  <BorderGlow className={usernameFocused ? "active" : ""} />
                </InputWrapper>
              </FormItem>

              <FormItem>
                <InputWrapper>
                  <Input
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    placeholder={intl.formatMessage({ id: "signup.email.placeholder" })}
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
                    placeholder={intl.formatMessage({ id: "signup.password.placeholder" })}
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

              <FormItem>
                <InputWrapper>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder={intl.formatMessage({ id: "signup.confirmPassword.placeholder" })}
                    autoComplete="new-password"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <BorderGlow className={confirmPasswordFocused ? "active" : ""} />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </PasswordToggle>
                </InputWrapper>
              </FormItem>

              {error && <ErrorText>{error}</ErrorText>}

              <SubmitButton type="submit" disabled={loading}>
                <FormattedMessage 
                  id={loading ? "signup.loading" : "signup.button"} 
                />
              </SubmitButton>

              <Footer>
                <FormattedMessage id="signup.login" />{' '}
                <Link to="/login">
                  <FormattedMessage id="signup.login.link" />
                </Link>
              </Footer>
            </Form>
          </LoginBox>
        </RightSection>
        <PhilosophyQuote>
          技术应是为人民服务
        </PhilosophyQuote>
        <PoweredBy>
          Powered by ProTX
        </PoweredBy>
      </PageContainer>
    </>
  );
}
