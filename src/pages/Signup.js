import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import illustration from "images/signup-illustration.svg";
import logo from "images/logo.svg";
import googleIconImageSrc from "images/google-icon.png";
import twitterIconImageSrc from "images/twitter-icon.png";
import { ReactComponent as SignUpIcon } from "feather-icons/dist/icons/user-plus.svg";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

const Container = styled(ContainerBase)`
  ${tw`min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 text-white font-medium flex items-center justify-center -m-8`}
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
`;
const Content = styled.div`
  ${tw`max-w-4xl m-0 sm:mx-8 text-gray-100 shadow-2xl sm:rounded-2xl flex justify-center flex-1`}
  height: calc(100vh - 8rem);
  min-height: 700px;
  max-height: 900px;
  transform: scale(0.95) translateY(20px);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform, opacity;
`;
const MainContainer = styled.div`
  ${tw`lg:w-1/2 xl:w-5/12 p-8 backdrop-blur-sm flex flex-col justify-center overflow-hidden`}
  transform: translateX(-100px);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    ${tw`bg-transparent`}
  }

  &::-webkit-scrollbar-thumb {
    ${tw`bg-white bg-opacity-25 rounded-full`}
  }

  &::-webkit-scrollbar-thumb:hover {
    ${tw`bg-opacity-15`}
  }
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
  ${tw`text-[10px] font-medium text-center text-white/75 mt-1 absolute transition-all duration-300`}
  opacity: 0;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  bottom: -18px;
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

// 首先定义基础按钮样式
const BaseButton = styled.button`
  ${tw`tracking-wide font-semibold text-gray-100 w-full rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative overflow-hidden`}
  height: 42px;
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
`;

// 然后定义表单样式
const Form = styled.form`
  ${tw`w-full flex flex-col gap-4`}
  margin-bottom: 2rem;
`;

const InputWrapper = styled.div`
  ${tw`relative w-full`}
  
  & + & {
    ${tw`mt-3`}
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
  
  ${props => props.$isPassword && css`
    border-bottom-color: ${props => {
      if (props.$strength === 0) return 'rgba(239, 68, 68, 0.8)';
      if (props.$strength === 1) return 'rgba(234, 179, 8, 0.8)';
      if (props.$strength === 2) return 'rgba(34, 197, 94, 0.8)';
      return 'rgba(255, 255, 255, 0.2)';
    }};
  `}
`;

// 最后定义提交按钮，继承基础按钮样式
const SubmitButton = styled(BaseButton)`
  ${tw`mt-4`}
`;

const IllustrationContainer = styled.div`
  ${tw`sm:rounded-r-2xl flex-1 backdrop-blur-lg bg-white bg-opacity-5 text-center hidden lg:flex items-center justify-center overflow-hidden`}
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

const VerificationCodeWrapper = styled(InputWrapper)`
  ${tw`flex gap-2 items-center`}
`;

const VerificationCodeInput = styled(Input)`
  ${tw`flex-1`}
`;

const SendCodeButton = styled.button`
  ${tw`px-6 rounded-lg font-medium text-sm text-white flex-shrink-0 relative overflow-hidden`}
  background: linear-gradient(92.88deg, rgb(55, 126, 248) 9.16%, rgb(132, 59, 255) 43.89%, rgb(159, 48, 255) 64.72%);
  min-width: 120px;
  height: 42px;
  
  transform: translateX(100px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform, opacity;

  &:before {
    content: '';
    ${tw`absolute inset-0 opacity-0 transition-opacity duration-300`}
    background: linear-gradient(92.88deg, rgb(132, 59, 255) 9.16%, rgb(159, 48, 255) 43.89%, rgb(55, 126, 248) 64.72%);
  }

  &:after {
    content: '';
    ${tw`absolute bottom-0 left-0 h-1 bg-white bg-opacity-25`}
    width: ${props => props.$progress}%;
    transition: width 1s linear;
  }

  &:disabled {
    ${tw`cursor-not-allowed`}
    &:hover:before {
      ${tw`opacity-0`}
    }
  }

  &:not(:disabled):hover {
    ${tw`shadow-lg`}
    transform: translateX(0) scale(1.05);
    &:before {
      ${tw`opacity-25`}
    }
  }
`;

const PasswordStrengthIndicator = styled.div`
  ${tw`absolute left-0 w-full overflow-hidden transition-all duration-300`}
  bottom: -2px;
  height: ${props => props.$show ? '3px' : '0'};
  opacity: ${props => props.$show ? '1' : '0'};
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  width: calc(100% - 24px);
  left: 12px;
`;

const StrengthBar = styled.div`
  ${tw`h-full transition-all duration-300 relative`}
  border-radius: 1.5px;
  background: ${props => {
    if (props.$strength === 0) return `
      linear-gradient(90deg, 
        rgb(239, 68, 68) 0%, 
        rgb(239, 68, 68) 33.33%, 
        rgba(255, 255, 255, 0.05) 33.33%,
        rgba(255, 255, 255, 0.05) 100%
      )
    `;
    if (props.$strength === 1) return `
      linear-gradient(90deg, 
        rgb(234, 179, 8) 0%, 
        rgb(234, 179, 8) 66.66%, 
        rgba(255, 255, 255, 0.05) 66.66%,
        rgba(255, 255, 255, 0.05) 100%
      )
    `;
    if (props.$strength === 2) return `
      linear-gradient(90deg, 
        rgb(34, 197, 94) 0%, 
        rgb(34, 197, 94) 100%
      )
    `;
    return 'rgba(255, 255, 255, 0.05)';
  }};
`;

const StrengthText = styled.div`
  ${tw`text-xs absolute left-0 w-full text-center transition-all duration-300`}
  bottom: -20px;
  color: ${props => {
    if (props.$strength === 0) return 'rgb(239, 68, 68)';
    if (props.$strength === 1) return 'rgb(234, 179, 8)';
    if (props.$strength === 2) return 'rgb(34, 197, 94)';
    return 'rgb(209, 213, 219)';
  }};
  transform: translateY(${props => props.$show ? '0' : '10px'});
  opacity: ${props => props.$show ? '1' : '0'};
`;

const PasswordRequirements = styled.div`
  ${tw`absolute left-0 w-full rounded-lg p-3 space-y-2 transition-all duration-300`}
  top: calc(100% + 16px);
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.95),
    rgba(30, 41, 59, 0.85)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2),
              0 2px 4px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(${props => props.$show ? '0' : '-10px'});
  opacity: ${props => props.$show ? '1' : '0'};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  z-index: 10;
`;

const RequirementItem = styled.div`
  ${tw`flex items-center text-xs space-x-2 transition-all duration-300`}
  color: ${props => props.$met ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.7)'};
  opacity: ${props => props.$met ? '1' : '0.8'};

  i {
    ${tw`text-base`}
    color: ${props => props.$met ? 'rgb(34, 197, 94)' : 'rgba(255, 255, 255, 0.5)'};
    text-shadow: ${props => props.$met ? '0 0 8px rgba(34, 197, 94, 0.3)' : 'none'};
  }
`;

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

// 添加模态框相关样式组件
const Modal = styled.div`
  ${tw`fixed inset-0 z-50 flex items-center justify-center p-4`}
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease-in-out;
  
  &.show {
    opacity: 1;
    visibility: visible;
  }
`;

const ModalContent = styled.div`
  ${tw`relative bg-white bg-opacity-10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto`}
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: scale(0.95) translateY(20px);
  opacity: 0;
  transition: all 0.3s ease-in-out;
  
  &.show {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    ${tw`bg-transparent rounded-full`}
  }

  &::-webkit-scrollbar-thumb {
    ${tw`bg-white bg-opacity-25 rounded-full`}
  }
`;

const ModalHeader = styled.div`
  ${tw`flex items-center justify-between mb-4 pb-4 border-b border-white border-opacity-10`}
`;

const ModalTitle = styled.h2`
  ${tw`text-xl font-bold text-white`}
`;

const CloseButton = styled.button`
  ${tw`text-gray-400 hover:text-white transition-colors duration-200`}
`;

const ModalBody = styled.div`
  ${tw`text-gray-300 space-y-4`}
  
  h3 {
    ${tw`text-lg font-semibold text-white mt-6 mb-3`}
  }
  
  p {
    ${tw`leading-relaxed`}
  }
  
  ul {
    ${tw`list-disc list-inside space-y-2 ml-4`}
  }
`;

export default ({
  logoLinkUrl = "/",
  illustrationImageSrc = illustration,
  headingText = "创建您的账户",
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
  submitButtonText = "立即注册",
  SubmitButtonIcon = SignUpIcon,
  tosUrl = "#",
  privacyPolicyUrl = "#",
  signInUrl = "/login"
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
  const [email, setEmail] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showSuffixDropdown, setShowSuffixDropdown] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const dropdownRef = React.useRef(null);
  const dropdownTimeoutRef = React.useRef(null);
  const countdownIntervalRef = React.useRef(null);
  const [progress, setProgress] = React.useState(100);
  const emailSuffixButtonRef = React.useRef(null);
  const passwordToggleRef = React.useRef(null);
  const sendCodeButtonRef = React.useRef(null);
  const [password, setPassword] = React.useState("");
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState(-1);
  const [requirements, setRequirements] = React.useState({
    length: false,
    number: false,
    letter: false,
    special: false
  });
  const [modalContent, setModalContent] = React.useState(null);
  const modalRef = React.useRef(null);
  const modalContentRef = React.useRef(null);

  // 将按钮分组为每行两个
  const socialButtonRows = [];
  for (let i = 0; i < socialButtons.length; i += 2) {
    socialButtonRows.push(socialButtons.slice(i, i + 2));
  }

  // 添加进场动画
  React.useEffect(() => {
    // 预先强制布局计算，使用void运算符避免ESLint警告
    void mainContainerRef.current?.offsetHeight;
    void illustrationRef.current?.offsetHeight;

    requestAnimationFrame(() => {
      // 开始动画序列
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '1';
        }
      }, 200);

      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'scale(1) translateY(0)';
          contentRef.current.style.opacity = '1';
        }
      }, 600);

      setTimeout(() => {
        if (mainContainerRef.current && illustrationRef.current) {
          mainContainerRef.current.style.transform = 'translateX(0)';
          mainContainerRef.current.style.opacity = '1';
          illustrationRef.current.style.transform = 'translateX(0)';
          illustrationRef.current.style.opacity = '1';
        }
      }, 1000);

      setTimeout(() => {
        if (logoRef.current) {
          logoRef.current.style.transform = 'translateY(0) rotate(0)';
          logoRef.current.style.opacity = '1';
        }
      }, 1400);

      setTimeout(() => {
        if (headingRef.current) {
          headingRef.current.style.transform = 'scale(1) translateY(0)';
          headingRef.current.style.opacity = '1';
        }
      }, 1600);

      setTimeout(() => {
        socialButtonRefs.current.forEach((ref) => {
          if (ref) {
            ref.style.transform = 'translateX(0)';
            ref.style.opacity = '1';
          }
        });
      }, 1800);

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
        if (sendCodeButtonRef.current) {
          sendCodeButtonRef.current.style.transform = 'translateY(0)';
          sendCodeButtonRef.current.style.opacity = '1';
        }
      }, 2000);

      setTimeout(() => {
        if (submitButtonRef.current) {
          submitButtonRef.current.style.transform = 'translateY(0) rotate(0)';
          submitButtonRef.current.style.opacity = '1';
        }
      }, 2200);
    });
  }, []);

  // 在组件内添加 playExitAnimation 函数
  const playExitAnimation = () => {
    return new Promise(resolve => {
      // Logo旋转消失
      if (logoRef.current) {
        logoRef.current.style.transform = 'translateY(-20px) rotate(180deg)';
        logoRef.current.style.opacity = '0';
      }

      // 标题缩小上浮
      setTimeout(() => {
        if (headingRef.current) {
          headingRef.current.style.transform = 'scale(0.8) translateY(-30px)';
          headingRef.current.style.opacity = '0';
        }
      }, 100);

      // 社交按钮向两侧散开
      setTimeout(() => {
        socialButtonRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.style.transform = `translateX(${index % 2 === 0 ? '-50px' : '50px'})`;
            ref.style.opacity = '0';
          }
        });
      }, 200);

      // 输入框向两侧旋转消失
      setTimeout(() => {
        inputRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.style.transform = `translateX(${index % 2 === 0 ? '-100px' : '100px'}) rotate(${index % 2 === 0 ? '-10deg' : '10deg'})`;
            ref.style.opacity = '0';
          }
        });

        // 添加发送验证码按钮的退出动画
        if (sendCodeButtonRef.current) {
          sendCodeButtonRef.current.style.transform = 'translateX(100px)';
          sendCodeButtonRef.current.style.opacity = '0';
        }
      }, 300);

      // 提交按钮上浮旋转消失
      setTimeout(() => {
        if (submitButtonRef.current) {
          submitButtonRef.current.style.transform = 'translateY(-30px) rotate(5deg)';
          submitButtonRef.current.style.opacity = '0';
        }
      }, 400);

      // 左右两侧内容消失
      setTimeout(() => {
        if (mainContainerRef.current && illustrationRef.current) {
          mainContainerRef.current.style.transform = 'translateX(-100px)';
          mainContainerRef.current.style.opacity = '0';
          illustrationRef.current.style.transform = 'translateX(100px)';
          illustrationRef.current.style.opacity = '0';
        }
      }, 600);

      // 整体内容区域消失
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'scale(0.95) translateY(-20px)';
          contentRef.current.style.opacity = '0';
        }
      }, 900);

      // 背景消失
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0';
        }
        setTimeout(() => {
          resolve();
        }, 300);
      }, 1100);
    });
  };

  // 修改 handleBackToHome 函数
  const handleBackToHome = async (e) => {
    e.preventDefault();
    await playExitAnimation();
    navigate('/');
  };

  // 修改 handleSubmit 函数
  const handleSubmit = async (e) => {
    e.preventDefault();
    await playExitAnimation();
    navigate('/dashboard');
  };

  // 修改 handleSigninClick 函数
  const handleSigninClick = async (e) => {
    e.preventDefault();
    await playExitAnimation();
    navigate('/login');
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
      // 显示错误提示
      // showError(error.message);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }

    if (value.includes("@") && value.split("@")[1].length > 0) {
      setShowSuffixDropdown(false);
    } else if (value.length > 0) {
      dropdownTimeoutRef.current = setTimeout(() => {
        setShowSuffixDropdown(true);
      }, 200);
    } else {
      setShowSuffixDropdown(false);
    }
  };

  const handleSendCode = async () => {
    try {
      // 这里添加发送验证码的API调用
      // await sendVerificationCode(email);
      
      // 开始倒计时
      setCountdown(60);
      setProgress(100);
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            setProgress(100);
            return 0;
          }
          // 更新进度条
          setProgress((prev - 1) * (100/60));
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to send verification code:', error);
    }
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleSuffixClick = (suffix) => {
    const baseEmail = email.split("@")[0]; // 获取@前的部分
    setEmail(baseEmail + suffix);
    setShowSuffixDropdown(false);
  };

  const checkPasswordStrength = (value) => {
    if (!value) return -1;
    
    let strength = 0;
    // 检查长度
    if (value.length >= 8) strength++;
    // 检查是否包含数字和字母
    if (/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) strength++;
    // 检查是否包含特殊字符
    if (/[^A-Za-z0-9]/.test(value)) strength++;
    
    return Math.min(2, strength);
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "密码强度：弱";
    if (strength === 1) return "密码强度：中";
    if (strength === 2) return "密码强度：强";
    return "请输入密码";
  };

  const checkRequirements = (value) => {
    setRequirements({
      length: value.length >= 8,
      number: /[0-9]/.test(value),
      letter: /[a-zA-Z]/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
    checkRequirements(value);
  };

  const openModal = (type) => {
    setModalContent(type);
    requestAnimationFrame(() => {
      if (modalRef.current) {
        modalRef.current.classList.add('show');
      }
      if (modalContentRef.current) {
        modalContentRef.current.classList.add('show');
      }
    });
  };

  const closeModal = () => {
    if (modalContentRef.current) {
      modalContentRef.current.classList.remove('show');
    }
    if (modalRef.current) {
      modalRef.current.classList.remove('show');
    }
    setTimeout(() => {
      setModalContent(null);
    }, 300);
  };

  return (
    <AnimationRevealPage>
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
                  <DividerText>或使用邮箱注册</DividerText>
                </DividerTextContainer>
                <Form 
                  onSubmit={handleSubmit} 
                  autoComplete="off"
                >
                  <InputWrapper>
                    <Input
                      type="email"
                      placeholder="电子邮箱"
                      value={email}
                      onChange={handleEmailChange}
                      ref={el => inputRefs.current[0] = el}
                      $index={0}
                      autoComplete="off"
                      name={`email_${Math.random()}`}
                    />
                    {!(email.includes("@") && email.split("@")[1].length > 0) && (
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
                  
                  <VerificationCodeWrapper>
                    <VerificationCodeInput
                      type="text"
                      placeholder="验证码"
                      maxLength={6}
                      ref={el => inputRefs.current[1] = el}
                      $index={1}
                    />
                    <SendCodeButton
                      type="button"
                      onClick={handleSendCode}
                      disabled={!email.includes("@") || countdown > 0}
                      $showCountdown={countdown > 0}
                      $progress={progress}
                      ref={sendCodeButtonRef}
                      $index={1}
                    >
                      <div className="button-content">
                        <span className="send-text">
                          发送验证码
                        </span>
                        <span className="countdown-text">
                          {countdown > 0 && (
                            <>
                              <i className="bi bi-clock me-1"></i>
                              {countdown}s
                            </>
                          )}
                        </span>
                      </div>
                    </SendCodeButton>
                  </VerificationCodeWrapper>

                  <InputWrapper>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="设置密码"
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      ref={el => inputRefs.current[2] = el}
                      $index={2}
                      $isPassword={true}
                      $strength={passwordStrength}
                      autoComplete="new-password"
                      name={`password_${Math.random()}`}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      ref={passwordToggleRef}
                      $index={2}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash text-lg"></i>
                      ) : (
                        <i className="bi bi-eye text-lg"></i>
                      )}
                    </PasswordToggle>
                    <PasswordStrengthIndicator $show={isPasswordFocused || passwordStrength >= 0}>
                      <StrengthBar $strength={passwordStrength} />
                    </PasswordStrengthIndicator>
                    <PasswordRequirements $show={isPasswordFocused}>
                      <RequirementItem $met={requirements.length}>
                        <i className={`bi bi-${requirements.length ? 'check-circle-fill' : 'circle'}`} />
                        <span>至少 8 个字符</span>
                      </RequirementItem>
                      <RequirementItem $met={requirements.letter}>
                        <i className={`bi bi-${requirements.letter ? 'check-circle-fill' : 'circle'}`} />
                        <span>包含字母</span>
                      </RequirementItem>
                      <RequirementItem $met={requirements.number}>
                        <i className={`bi bi-${requirements.number ? 'check-circle-fill' : 'circle'}`} />
                        <span>包含数字</span>
                      </RequirementItem>
                      <RequirementItem $met={requirements.special}>
                        <i className={`bi bi-${requirements.special ? 'check-circle-fill' : 'circle'}`} />
                        <span>包含特殊字符</span>
                      </RequirementItem>
                    </PasswordRequirements>
                  </InputWrapper>
                  
                  <SubmitButton ref={submitButtonRef} type="submit">
                    <SubmitButtonIcon className="icon" />
                    <span className="text">{submitButtonText}</span>
                  </SubmitButton>
                  <p tw="mt-8 text-sm text-gray-300 text-center">
                    注册即表示您同意我们的{" "}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        openModal('tos');
                      }}
                      tw="border-b border-gray-200 hover:text-white transition-colors"
                    >
                      服务条款
                    </button>{" "}
                    和{" "}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        openModal('privacy');
                      }}
                      tw="border-b border-gray-200 hover:text-white transition-colors"
                    >
                      隐私政策
                    </button>
                  </p>

                  <p tw="mt-8 text-sm text-gray-300 text-center">
                    已有账户？{" "}
                    <Link 
                      to="/login" 
                      onClick={handleSigninClick}
                      tw="text-white border-b border-gray-200 hover:border-white transition-colors"
                    >
                      立即登录
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
      </Container>
      {modalContent && (
        <Modal ref={modalRef} onClick={(e) => e.target === modalRef.current && closeModal()}>
          <ModalContent ref={modalContentRef}>
            <ModalHeader>
              <ModalTitle>
                {modalContent === 'tos' ? '服务条款' : '隐私政策'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {modalContent === 'tos' ? (
                <>
                  <p>欢迎使用我们的服务。请仔细阅读以下条款，这些条款将影响您的合法权益。</p>
                  
                  <h3>1. 服务说明</h3>
                  <p>我们提供的服务包括但不限于：用户注册、内容浏览、信息发布等功能。我们保留随时修改或中断服务而不需通知您的权利。</p>
                  
                  <h3>2. 用户责任</h3>
                  <ul>
                    <li>您必须遵守所有适用的法律法规</li>
                    <li>不得利用我们的服务进行任何非法活动</li>
                    <li>不得干扰或破坏服务的正常运行</li>
                    <li>保护账户安全，对账户活动负责</li>
                  </ul>
                  
                  <h3>3. 知识产权</h3>
                  <p>服务中的所有内容均受著作权法和其他知识产权法律法规的保护。未经授权，您不得复制、修改、传播或使用这些内容。</p>
                  
                  <h3>4. 免责声明</h3>
                  <p>我们不对服务的及时性、安全性、准确性作出任何承诺。在法律允许的最大范围内，我们对服务导致的任何直接或间接损失不承担责任。</p>
                </>
              ) : (
                <>
                  <p>我们重视您的隐私保护。本隐私政策说明我们如何收集、使用和保护您的个人信息。</p>
                  
                  <h3>1. 信息收集</h3>
                  <p>我们收集的信息包括：</p>
                  <ul>
                    <li>注册信息（如：电子邮件、密码）</li>
                    <li>使用记录（如：登录时间、操作记录）</li>
                    <li>设备信息（如：IP地址、浏览器类型）</li>
                  </ul>
                  
                  <h3>2. 信息使用</h3>
                  <p>我们使用收集的信息用于：</p>
                  <ul>
                    <li>提供、维护和改进服务</li>
                    <li>发送服务通知和更新</li>
                    <li>防范安全风险</li>
                    <li>进行数据分析</li>
                  </ul>
                  
                  <h3>3. 信息保护</h3>
                  <p>我们采取适当的技术和组织措施保护您的个人信息，防止未经授权的访问、使用或泄露。</p>
                  
                  <h3>4. 信息共享</h3>
                  <p>除非经过您的同意或法律要求，我们不会与第三方分享您的个人信息。</p>
                </>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </AnimationRevealPage>
  );
};

