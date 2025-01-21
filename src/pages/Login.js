import React, { useMemo, useEffect } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import illustration from "images/login-illustration.svg";
import logo from "images/logo.svg";
import { ReactComponent as LoginIcon } from "feather-icons/dist/icons/log-in.svg";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { auth } from '../api';
import { axios } from '../api';
import { API_CONFIG } from '../api';

const Container = styled(ContainerBase)`
  ${tw`min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 text-white font-medium flex items-center justify-center -m-8`}
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
`;

const Content = styled.div`
  ${tw`max-w-4xl m-0 sm:mx-8 text-gray-100 shadow-2xl sm:rounded-2xl flex justify-center flex-1`}
  height: calc(100vh - 20rem);
  min-height: 600px;
  transform: scale(0.95) translateY(20px);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform, opacity;
`;

const MainContainer = styled.div`
  ${tw`lg:w-1/2 xl:w-5/12 p-6 backdrop-blur-sm flex flex-col justify-center`}
  transform: translateX(-100px);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
`;

const LogoLink = tw(Link)``;
const LogoImage = styled.img`
  ${tw`h-8 mx-auto mb-4`}
  transform: translateY(20px) rotate(-180deg);
  opacity: 0;
  transition: all 0.8s ease-in-out;
`;
const MainContent = tw.div`flex flex-col items-center`;
const Heading = styled.h1`
  ${tw`text-xl font-bold text-white mb-8`}
  transform: scale(0.8) translateY(30px);
  opacity: 0;
  transition: all 0.8s ease-in-out;
`;
const FormContainer = tw.div`w-full mt-2`;

const SubmitButton = styled.button`
  ${tw`tracking-wide font-semibold text-gray-100 w-full py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative overflow-hidden`}
  background: linear-gradient(92.88deg, rgb(55, 126, 248) 9.16%, rgb(132, 59, 255) 43.89%, rgb(159, 48, 255) 64.72%);
  transform: translateY(30px) rotate(-5deg);
  opacity: 0;
  transition: all 0.8s ease-in-out;

  &:before {
    content: '';
    ${tw`absolute inset-0 opacity-0 transition-opacity duration-300`}
    background: linear-gradient(92.88deg, rgb(132, 59, 255) 9.16%, rgb(159, 48, 255) 43.89%, rgb(55, 126, 248) 64.72%);
  }

  &:hover {
    ${tw`transform scale-105 shadow-lg`}
    &:before {
      ${tw`opacity-25`}
    }
  }

  &:disabled {
    ${tw`cursor-not-allowed`}
    opacity: 0.5;
    
    &:hover {
      transform: none;
      &:before {
        opacity: 0;
      }
    }
  }
`;

const Form = styled.form`
  ${tw`w-full flex flex-col gap-4`}

  input + input {
    ${tw`mt-4`}
  }

  ${SubmitButton} {
    ${tw`mt-8`}
  }
`;

const Input = styled.input`
  ${tw`w-full px-4 rounded-lg font-medium text-white text-sm focus:outline-none`}
  height: 42px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.1)
    );
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  transform: translateX(${props => props.$index % 2 === 0 ? '-100px' : '100px'}) rotate(${props => props.$index % 2 === 0 ? '10deg' : '-10deg'});
  opacity: 0;
  transition: all 0.8s ease-in-out;
`;

const SocialButtonsRow = styled.div`
  ${tw`flex justify-between items-center mb-6 gap-3`}
  &:hover > div {
    opacity: 0.6;
  }
`;

const SocialIconWrapper = styled.div`
  ${tw`relative flex flex-col items-center transition-all duration-300`}
  transform: scale(1);
  opacity: 1;

  &:hover {
    ${tw`z-10`}
    transform: scale(1.25);
    opacity: 1 !important;

    & + div {
      transform: scale(1.12);
      opacity: 0.9 !important;
    }

    & + div + div {
      transform: scale(0.95);
      opacity: 0.6 !important;
    }

    & + div + div + div {
      transform: scale(0.95);
      opacity: 0.6 !important;
    }
  }

  &:has(+ div:hover) {
    transform: scale(1.12);
    opacity: 0.9 !important;
  }

  &:has(+ div + div:hover) {
    transform: scale(0.95);
    opacity: 0.6 !important;
  }

  &:has(+ div + div + div:hover) {
    transform: scale(0.95);
    opacity: 0.6 !important;
  }

  &:hover .text {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
`;

const SocialIconContainer = styled.a`
  ${tw`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 backdrop-blur-sm`}
  transform: translateY(${props => props.$index * 10}px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: ${props => props.$bgGradient};

  &:hover {
    .icon {
      transform: scale(1.2);
    }
  }
  
  .icon {
    ${tw`text-base transition-transform duration-300`}
    color: ${props => props.$iconColor};
  }
`;

const SocialText = styled.span`
  ${tw`text-xs font-medium text-center text-white/75 mt-2 absolute transition-all duration-300`}
  opacity: 0;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  bottom: -20px;
`;

const DividerTextContainer = styled.div`
  ${tw`my-6 relative flex items-center`}
  &:before, &:after {
    content: '';
    ${tw`flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`}
  }
`;

const DividerText = styled.div`
  ${tw`px-4 text-sm text-gray-400 font-medium whitespace-nowrap`}
`;

const IllustrationContainer = styled.div`
  ${tw`sm:rounded-r-2xl flex-1 backdrop-blur-lg bg-white bg-opacity-5 text-center hidden lg:flex items-center justify-center`}
  transform: translateX(100px);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const IllustrationImage = styled.div`
  ${props => `background-image: url("${props.imageSrc}");`}
  ${tw`w-full max-w-sm bg-contain bg-center bg-no-repeat`}
  height: 70%;
`;

const BackToHome = tw(Link)`
  absolute top-0 left-0 m-6 text-gray-200 hover:text-white flex items-center transition-colors duration-300
`;

const InputWrapper = styled.div`
  ${tw`relative w-full`}
`;

const EmailSuffixButton = styled.button`
  ${tw`absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 flex items-center`}
  right: 12px;
  transform: translateY(${props => props.$index * 10}px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const EmailSuffixDropdown = styled.div`
  ${tw`absolute right-0 mt-1 w-40 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-xl z-10`}
  top: calc(100% + 5px);
  transform-origin: top;
  transform: scaleY(0);
  opacity: 0;
  transition: all 0.2s ease-in-out;
  
  &.show {
    transform: scaleY(1);
    opacity: 1;
  }
`;

const EmailSuffixOption = styled.button`
  ${tw`w-full px-4 py-2 text-left text-sm text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200`}
`;

const PasswordToggle = styled.button`
  ${tw`absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200`}
  right: 12px;
  transform: translateY(${props => props.$index * 10}px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

// 首先定义基础按钮样式
const BaseButton = styled.button`
  ${tw`tracking-wide font-semibold text-gray-100 w-full rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative overflow-hidden`}
  height: 42px;
  background: linear-gradient(92.88deg, rgb(55, 126, 248) 9.16%, rgb(132, 59, 255) 43.89%, rgb(159, 48, 255) 64.72%);

  &:before {
    content: '';
    ${tw`absolute inset-0 opacity-0 transition-opacity duration-300`}
    background: linear-gradient(92.88deg, rgb(132, 59, 255) 9.16%, rgb(159, 48, 255) 43.89%, rgb(55, 126, 248) 64.72%);
  }

  &:hover {
    ${tw`transform scale-105 shadow-lg`}
    &:before {
      ${tw`opacity-25`}
    }
  }
`;

// 然后定义依赖于 BaseButton 的组件
const ApiConfigButtonContainer = styled.div`
  ${tw`flex justify-end mt-6`}
  gap: 1rem; // 或者使用具体的像素值 gap: 16px;
`;

// 修改按钮样式，确保有合适的内边距
const ApiConfigButton = styled(BaseButton)`
  ${tw`px-6 py-2 text-sm font-medium transition-all duration-300`}
  min-width: 120px; // 确保按钮有最小宽度
  background: ${props => props.$variant === 'reset' 
    ? 'linear-gradient(135deg, #64748b, #475569)'
    : 'linear-gradient(135deg, #3b82f6, #6366f1)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }

  // 添加图标和文字的间距
  i {
    ${tw`mr-2`}
  }
`;

// 添加新的样式组件
const ApiConfigModal = styled.div`
  ${tw`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300`}
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
`;

const ApiConfigContent = styled.div`
  ${tw`bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300`}
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: scale(${props => props.$show ? 1 : 0.9}) translateY(${props => props.$show ? 0 : '20px'});
`;

const ApiConfigTitle = styled.h3`
  ${tw`text-2xl font-bold text-white mb-6 flex items-center`}
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  
  i {
    ${tw`mr-3 text-2xl`}
  }
`;

const ApiConfigInput = styled(Input)`
  ${tw`mb-4`}
  transform: none !important;
  opacity: 1 !important;
`;

// 修改提示样式组件
const TooltipWrapper = styled.div`
  ${tw`relative inline-block w-full`}
`;

const Tooltip = styled.div`
  ${tw`absolute left-1/2 px-3 py-2 text-sm text-white rounded-lg opacity-0 invisible transition-all duration-200`}
  top: -40px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;

  &:after {
    content: '';
    ${tw`absolute left-1/2`}
    bottom: -6px;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.8);
  }

  ${({ $show }) => $show && tw`opacity-100 visible`}
`;

// 添加错误提示组件样式
const ErrorMessage = styled.div`
  ${tw`fixed top-0 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white text-sm transition-all duration-500`}
  background: rgba(220, 38, 38, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  /* 控制显示和隐藏的动画 */
  opacity: ${props => props.$show ? 1 : 0};
  transform: translate(-50%, ${props => props.$show ? '20px' : '-100%'});
  
  /* 添加图标和文字布局 */
  display: flex;
  align-items: center;
  gap: 8px;

  /* 添加动画效果 */
  &:hover {
    background: rgba(220, 38, 38, 1);
  }
`;

// 添加加载状态样式组件
const LoadingOverlay = styled.div`
  ${tw`absolute inset-0 flex items-center justify-center backdrop-blur-sm transition-all duration-300`}
  background: rgba(0, 0, 0, 0.2);
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  z-index: 100;
`;

const LoadingSpinner = styled.div`
  ${tw`relative w-12 h-12`}
  
  &:before, &:after {
    content: '';
    ${tw`absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300`}
    border-top-color: white;
    animation: spin 1s cubic-bezier(0.76, 0.35, 0.2, 0.7) infinite;
  }

  &:before {
    opacity: 0.4;
    animation-delay: -0.5s;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  ${tw`absolute mt-16 text-white text-sm font-medium`}
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.6s ease forwards 0.3s;

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ApiConfigTip = styled.div`
  ${tw`mt-4 text-sm text-gray-400`}
`;

export default ({
  logoLinkUrl = "/",
  illustrationImageSrc = illustration,
  headingText = "登录账户",
  socialButtons = [
    {
      icon: "bi bi-google",
      text: "Google",
      url: "https://google.com",
      iconColor: "transparent",
      bgGradient: "linear-gradient(45deg, #ffffff 0%, #ffffff 100%)",
      customIcon: (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
          <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
          <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
          <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
        </svg>
      ),
    },
    {
      icon: "bi bi-github",
      text: "GitHub",
      url: "https://github.com",
      iconColor: "#ffffff",
      bgGradient: "linear-gradient(45deg, #24292e 0%, #040d21 100%)"
    },
    {
      icon: "bi bi-twitter-x",
      text: "Twitter",
      url: "https://twitter.com",
      iconColor: "#ffffff",
      bgGradient: "linear-gradient(45deg, #15202B 0%, #1A1A1A 100%)"
    },
    {
      icon: "bi bi-apple",
      text: "Apple",
      url: "https://apple.com",
      iconColor: "#ffffff",
      bgGradient: "linear-gradient(45deg, #000000 0%, #2A2A2A 100%)"
    },
    {
      icon: "bi bi-facebook",
      text: "Facebook",
      url: "https://facebook.com",
      iconColor: "#ffffff",
      bgGradient: "linear-gradient(45deg, #1877F2 0%, #0C5DC7 100%)"
    },
    {
      icon: "bi bi-linkedin",
      text: "LinkedIn",
      url: "https://linkedin.com",
      iconColor: "#ffffff",
      bgGradient: "linear-gradient(45deg, #0077B5 0%, #005885 100%)"
    }
  ],
  submitButtonText = "登录",
  SubmitButtonIcon = LoginIcon,
  forgotPasswordUrl = "#",
  signupUrl = "/signup",

}) => {
  const containerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const mainContainerRef = React.useRef(null);
  const illustrationRef = React.useRef(null);
  const logoRef = React.useRef(null);
  const headingRef = React.useRef(null);
  const socialButtonRefs = React.useRef([]);
  const inputRefs = React.useRef([]);
  const submitButtonRef = React.useRef(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [showSuffixDropdown, setShowSuffixDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const dropdownTimeoutRef = React.useRef(null);
  const emailSuffixButtonRef = React.useRef(null);
  const passwordToggleRef = React.useRef(null);
  const [isInitialAnimation, setIsInitialAnimation] = React.useState(true);
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showApiConfig, setShowApiConfig] = React.useState(false);
  const [apiBaseUrl, setApiBaseUrl] = React.useState(
    localStorage.getItem('apiBaseUrl') || API_CONFIG.baseURL
  );
  const [keySequence, setKeySequence] = React.useState([]);
  const secretCode = useMemo(() => ['ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight'], []);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [showError, setShowError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const emailSuffixes = [
    "@qq.com",      // 中国最流行的邮箱服务
    "@gmail.com",   // 全球最流行的邮箱服务
    "@163.com",     // 网易邮箱，中国第二流行
    "@126.com",     // 网易邮箱的另一个常用域名
    "@outlook.com", // 微软邮箱服务
    "@hotmail.com", // 微软旧邮箱服务，仍然广泛使用
    "@yahoo.com",   // 雅虎邮箱
    "@foxmail.com", // Foxmail邮箱
    "@sina.com",    // 新浪邮箱
    "@sohu.com"     // 搜狐邮箱
  ];

  const validateForm = () => {
    // 检查邮箱/用户名是否已输入
    const isEmailValid = email.trim().length > 0;
    
    // 检查密码是否已输入且长度符合要求（最少6位）
    const isPasswordValid = password.trim().length >= 6;

    // 更新表单有效状态
    const isValid = isEmailValid && isPasswordValid;
    
    if (isFormValid !== isValid) {
      setIsFormValid(isValid);
    }
  };

  // 在相关状态变化时进行验证
  useEffect(() => {
    validateForm();
  }, [email, password, validateForm]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // 现有的邮箱后缀处理逻辑保持不变
    if (value.includes('@') && !value.split('@')[1]) {
      setShowSuffixDropdown(true);
    } else {
      setShowSuffixDropdown(false);
    }
  };

  const handleSuffixClick = (suffix) => {
    const baseEmail = email.split("@")[0]; // 获取@前的部分
    setEmail(baseEmail + suffix);
    setShowSuffixDropdown(false);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
  };

  // 修复 dropdownTimeoutRef 的清理函数
  useEffect(() => {
    const timeoutId = dropdownTimeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuffixDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 添加进场动画
  useEffect(() => {
    // 背景淡入
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
      }
    }, 100);

    // 内容区域显示
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.style.transform = 'scale(1) translateY(0)';
        contentRef.current.style.opacity = '1';
      }
    }, 300);

    // 左右两侧内容显示
    setTimeout(() => {
      if (mainContainerRef.current && illustrationRef.current) {
        mainContainerRef.current.style.transform = 'translateX(0)';
        mainContainerRef.current.style.opacity = '1';
        illustrationRef.current.style.transform = 'translateX(0)';
        illustrationRef.current.style.opacity = '1';
      }
    }, 500);

    // Logo旋转显示
    setTimeout(() => {
      if (logoRef.current) {
        logoRef.current.style.transform = 'translateY(0) rotate(0)';
        logoRef.current.style.opacity = '1';
      }
    }, 700);

    // 标题显示
    setTimeout(() => {
      if (headingRef.current) {
        headingRef.current.style.transform = 'scale(1) translateY(0)';
        headingRef.current.style.opacity = '1';
      }
    }, 800);

    // 社交按钮依次显示
    setTimeout(() => {
      socialButtonRefs.current.forEach((ref, index) => {
        if (ref) {
          setTimeout(() => {
            ref.style.transform = 'translateY(0)';
            ref.style.opacity = '1';
          }, index * 100);
        }
      });
    }, 900);

    // 输入框依次显示
    setTimeout(() => {
      inputRefs.current.forEach((ref, index) => {
        if (ref) {
          setTimeout(() => {
            ref.style.transform = 'translateX(0) rotate(0)';
            ref.style.opacity = '1';
          }, index * 100);
        }
      });
    }, 1000);

    // 提交按钮显示
    setTimeout(() => {
      if (submitButtonRef.current) {
        submitButtonRef.current.style.transform = 'translateY(0) rotate(0)';
        submitButtonRef.current.style.opacity = '1';
      }
    }, 1200);

    setTimeout(() => {
      inputRefs.current.forEach((ref) => {
        if (ref) {
          ref.style.transform = 'translateX(0) rotate(0)';
          ref.style.opacity = '1';
        }
      });
      
      // 添加输入框内组件的动画
      if (emailSuffixButtonRef.current) {
        emailSuffixButtonRef.current.style.transform = 'translateY(-50%)';
        emailSuffixButtonRef.current.style.opacity = '1';
      }
      if (passwordToggleRef.current) {
        passwordToggleRef.current.style.transform = 'translateY(-50%)';
        passwordToggleRef.current.style.opacity = '1';
      }
    }, 2000);
  }, []);

  // 添加初始动画效果
  useEffect(() => {
    // 延迟移除初始动画类
    setTimeout(() => {
      setIsInitialAnimation(false);
    }, 2200); // 与其他动画时间保持一致
  }, []);

  // 显示错误信息的函数
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    
    // 3秒后自动隐藏
    setTimeout(() => {
      setShowError(false);
      // 等动画结束后清空消息
      setTimeout(() => setErrorMessage(''), 500);
    }, 3000);
  };

  // 添加退出动画函数
  const playExitAnimation = () => {
    return new Promise(resolve => {
      // 提交按钮消失
      if (submitButtonRef.current) {
        submitButtonRef.current.style.transform = 'translateY(30px) rotate(-5deg)';
        submitButtonRef.current.style.opacity = '0';
      }

      // 输入框依次消失
      inputRefs.current.forEach((ref, index) => {
        if (ref) {
          setTimeout(() => {
            ref.style.transform = `translateX(${index % 2 === 0 ? '-100px' : '100px'}) rotate(${index % 2 === 0 ? '10deg' : '-10deg'})`;
            ref.style.opacity = '0';
          }, index * 100);
        }
      });

      // 输入框内组件消失
      if (emailSuffixButtonRef.current) {
        emailSuffixButtonRef.current.style.transform = 'translateY(10px)';
        emailSuffixButtonRef.current.style.opacity = '0';
      }
      if (passwordToggleRef.current) {
        passwordToggleRef.current.style.transform = 'translateY(10px)';
        passwordToggleRef.current.style.opacity = '0';
      }

      // 社交按钮依次消失
      setTimeout(() => {
        socialButtonRefs.current.forEach((ref, index) => {
          if (ref) {
            setTimeout(() => {
              ref.style.transform = `translateY(${index * 10}px)`;
              ref.style.opacity = '0';
            }, index * 100);
          }
        });
      }, 200);

      // 标题消失
      setTimeout(() => {
        if (headingRef.current) {
          headingRef.current.style.transform = 'scale(0.8) translateY(30px)';
          headingRef.current.style.opacity = '0';
        }
      }, 400);

      // Logo旋转消失
      setTimeout(() => {
        if (logoRef.current) {
          logoRef.current.style.transform = 'translateY(20px) rotate(-180deg)';
          logoRef.current.style.opacity = '0';
        }
      }, 600);

      // 左右两侧内容消失
      setTimeout(() => {
        if (mainContainerRef.current && illustrationRef.current) {
          mainContainerRef.current.style.transform = 'translateX(-100px)';
          mainContainerRef.current.style.opacity = '0';
          illustrationRef.current.style.transform = 'translateX(100px)';
          illustrationRef.current.style.opacity = '0';
        }
      }, 800);

      // 内容区域消失
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'scale(0.95) translateY(20px)';
          contentRef.current.style.opacity = '0';
        }
      }, 1000);

      // 背景淡出
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0';
        }
        // 动画完成后解析 Promise
        setTimeout(resolve, 300);
      }, 1200);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    try {
      setIsLoading(true); // 开始加载
      
      // 添加一个最小加载时间，确保动画效果明显
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800));
      
      const [loginResult] = await Promise.all([
        auth.login({
          email,
          password
        }),
        minLoadingTime
      ]);
      
      if (!loginResult.success) {
        showErrorMessage(loginResult.message);
        setIsLoading(false); // 结束加载
        return;
      }
      
      const userInfoResult = await auth.getUserInfo();
      
      if (!userInfoResult.success) {
        showErrorMessage(userInfoResult.message);
        setIsLoading(false); // 结束加载
        return;
      }
      
      await playExitAnimation();
      navigate('/');
      
    } catch (error) {
      showErrorMessage('登录失败，请稍后重试');
      setIsLoading(false); // 结束加载
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      // 添加加载状态
      const button = socialButtonRefs.current[socialButtons.findIndex(b => b.text.toLowerCase() === provider)];
      if (button) {
        button.style.opacity = '0.7';
        button.style.pointerEvents = 'none';
      }

      // 这里添加实际的社交登录逻辑
      // await socialLogin(provider);

      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 登录成功后的动画
      handleSubmit();
    } catch (error) {
      console.error('Social login failed:', error);
      // 恢复按钮状态
      const button = socialButtonRefs.current[socialButtons.findIndex(b => b.text.toLowerCase() === provider)];
      if (button) {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
      }
    }
  };

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      const newSequence = [...keySequence, e.key].slice(-secretCode.length);
      setKeySequence(newSequence);
      
      if (JSON.stringify(newSequence) === JSON.stringify(secretCode)) {
        setShowApiConfig(true);
        setKeySequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secretCode, keySequence]);

  // 保存 API 配置
  const handleSaveApiConfig = () => {
    localStorage.setItem('apiBaseUrl', apiBaseUrl);
    // 更新 axios 实例的 baseURL
    axios.defaults.baseURL = apiBaseUrl;
    setShowApiConfig(false);
  };

  // 重置 API 配置
  const handleResetApiConfig = () => {
    setApiBaseUrl(API_CONFIG.baseURL);
    localStorage.setItem('apiBaseUrl', API_CONFIG.baseURL);
    axios.defaults.baseURL = API_CONFIG.baseURL;
    setShowApiConfig(false);
  };

  // 获取禁用提示文本
  const getDisabledMessage = () => {
    if (!email.trim()) {
      return "请输入用户名或邮箱";
    }
    if (!password.trim()) {
      return "请输入密码";
    }
    if (password.trim().length < 6) {
      return "密码长度至少为6位";
    }
    return "请填写所有必填项";
  };

  // 检查并自动填充测试账号
  useEffect(() => {
    const currentApiUrl = localStorage.getItem('apiBaseUrl') || process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
    
    // 检查是否为回环地址
    const isLocalhost = currentApiUrl.includes('localhost') || 
                       currentApiUrl.includes('127.0.0.1') ||
                       currentApiUrl.includes('::1');
    
    if (isLocalhost) {
      setEmail('TestAdmin');
      setPassword('123456');
    }
  }, []);

  const handleBackToHome = async (e) => {
    e.preventDefault();
    await playExitAnimation();
    navigate('/');
  };

  // 添加处理函数
  const handleSignupClick = async (e) => {
    e.preventDefault();
    await playExitAnimation();
    navigate('/signup');
  };

  return (
    <AnimationRevealPage>
      {/* 添加错误提示组件 */}
      <ErrorMessage $show={showError}>
        <i className="bi bi-exclamation-circle"></i>
        {errorMessage}
      </ErrorMessage>
      
      <Container ref={containerRef}>
        <BackToHome to="/" onClick={handleBackToHome}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span tw="ml-2">返回首页</span>
        </BackToHome>
        <Content ref={contentRef}>
          <MainContainer ref={mainContainerRef}>
            <LogoLink to={logoLinkUrl}>
              <LogoImage ref={logoRef} src={logo} />
            </LogoLink>
            <MainContent>
              <Heading ref={headingRef}>{headingText}</Heading>
              <FormContainer>
                <SocialButtonsRow>
                  {socialButtons.map((socialButton, index) => (
                    <SocialIconWrapper 
                      key={index} 
                      $index={index}
                    >
                      <SocialIconContainer
                        href={socialButton.url}
                        ref={el => socialButtonRefs.current[index] = el}
                        $index={index}
                        $iconColor={socialButton.iconColor}
                        $bgGradient={socialButton.bgGradient}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSocialLogin(socialButton.text.toLowerCase());
                        }}
                      >
                        {socialButton.customIcon || <i className={`icon ${socialButton.icon}`}></i>}
                      </SocialIconContainer>
                      <SocialText className="text">
                        {socialButton.text}
                      </SocialText>
                    </SocialIconWrapper>
                  ))}
                </SocialButtonsRow>
                <DividerTextContainer>
                  <DividerText>其他登录方式</DividerText>
                </DividerTextContainer>
                <Form onSubmit={handleSubmit}>
                  <LoadingOverlay $show={isLoading}>
                    <LoadingSpinner />
                    <LoadingText>登录中...</LoadingText>
                  </LoadingOverlay>
                  <InputWrapper>
                    <Input
                      type="text"
                      placeholder="用户名或邮箱"
                      value={email}
                      onChange={handleEmailChange}
                      ref={el => inputRefs.current[0] = el}
                      $index={0}
                    />
                    {email.includes('@') && !(email.includes("@") && email.split("@")[1].length > 0) && (
                      <EmailSuffixButton
                        type="button"
                        onClick={() => setShowSuffixDropdown(!showSuffixDropdown)}
                        tabIndex="-1"
                        ref={emailSuffixButtonRef}
                        $index={0}
                      >
                        <i className="bi bi-chevron-down"></i>
                      </EmailSuffixButton>
                    )}
                    <EmailSuffixDropdown 
                      ref={dropdownRef}
                      className={showSuffixDropdown && !(email.includes("@") && email.split("@")[1].length > 0) ? "show" : ""}
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
                  <InputWrapper>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="密码"
                      value={password}
                      onChange={handlePasswordChange}
                      ref={el => inputRefs.current[1] = el}
                      $index={1}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      ref={passwordToggleRef}
                      $index={1}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash text-lg"></i>
                      ) : (
                        <i className="bi bi-eye text-lg"></i>
                      )}
                    </PasswordToggle>
                  </InputWrapper>
                  <TooltipWrapper
                    onMouseEnter={() => !isFormValid && setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Tooltip $show={showTooltip && !isFormValid}>
                      {getDisabledMessage()}
                    </Tooltip>
                    <SubmitButton 
                      ref={submitButtonRef} 
                      type="submit" 
                      disabled={!isFormValid}
                      className={isInitialAnimation ? 'initial' : ''}
                    >
                      <SubmitButtonIcon className="icon" />
                      <span className="text">{submitButtonText}</span>
                    </SubmitButton>
                  </TooltipWrapper>
                  <p tw="mt-8 text-sm text-gray-300 text-center">
                    <Link to={forgotPasswordUrl} tw="text-white border-b border-gray-200 hover:border-white transition-colors">
                      忘记密码？
                    </Link>
                  </p>
                  <p tw="mt-8 text-sm text-gray-300 text-center">
                    还没有账户？{" "}
                    <Link 
                      to={signupUrl} 
                      onClick={handleSignupClick}
                      tw="text-white border-b border-gray-200 hover:border-white transition-colors"
                    >
                      立即注册
                    </Link>
                  </p>
                </Form>
              </FormContainer>
            </MainContent>
          </MainContainer>
          <IllustrationContainer ref={illustrationRef}>
            <IllustrationImage imageSrc={illustrationImageSrc} />
          </IllustrationContainer>
        </Content>
        
        {/* 添加 API 配置模态框 */}
        <ApiConfigModal $show={showApiConfig} onClick={() => setShowApiConfig(false)}>
          <ApiConfigContent 
            $show={showApiConfig} 
            onClick={e => e.stopPropagation()}
          >
            <ApiConfigTitle>
              <i className="bi bi-gear-fill"></i>
              API 配置
            </ApiConfigTitle>
            <ApiConfigInput
              type="text"
              placeholder="请输入 API 基地址"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
            />
            <ApiConfigButtonContainer>
              <ApiConfigButton 
                $variant="reset" 
                onClick={handleResetApiConfig}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                重置默认
              </ApiConfigButton>
              <ApiConfigButton 
                onClick={handleSaveApiConfig}
              >
                <i className="bi bi-check2-circle"></i>
                保存配置
              </ApiConfigButton>
            </ApiConfigButtonContainer>
            <ApiConfigTip>
              <i className="bi bi-info-circle mr-2"></i>
              此配置将保存在本地存储中，刷新页面后依然有效
            </ApiConfigTip>
          </ApiConfigContent>
        </ApiConfigModal>
      </Container>
    </AnimationRevealPage>
  );
};
