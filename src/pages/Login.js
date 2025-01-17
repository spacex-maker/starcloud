import React from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import illustration from "images/login-illustration.svg";
import logo from "images/logo.svg";
import { ReactComponent as LoginIcon } from "feather-icons/dist/icons/log-in.svg";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

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
  ${tw`w-full px-4 py-2 rounded-lg font-medium backdrop-blur-sm bg-white bg-opacity-10 border border-gray-200 placeholder-gray-400 text-white text-sm focus:outline-none focus:border-gray-400 focus:bg-opacity-15`}
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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // 清除任何现有的超时
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }

    // 只有当@后面有内容时才隐藏下拉框
    if (value.includes("@") && value.split("@")[1].length > 0) {
      setShowSuffixDropdown(false);
    } else if (value.length > 0) {
      // 当用户开始输入时，延迟200ms显示下拉框
      dropdownTimeoutRef.current = setTimeout(() => {
        setShowSuffixDropdown(true);
      }, 200);
    } else {
      // 当输入框为空时隐藏下拉框
      setShowSuffixDropdown(false);
    }
  };

  const handleSuffixClick = (suffix) => {
    const baseEmail = email.split("@")[0]; // 获取@前的部分
    setEmail(baseEmail + suffix);
    setShowSuffixDropdown(false);
  };

  // 清理超时
  React.useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuffixDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 添加进场动画
  React.useEffect(() => {
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Logo旋转消失
    if (logoRef.current) {
      logoRef.current.style.transform = 'translateY(20px) rotate(180deg)';
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
    }, 1100);

    // 跳转
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
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

  return (
    <AnimationRevealPage>
      <Container ref={containerRef}>
        <BackToHome to="/">
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
                  <DividerText>或使用邮箱登录</DividerText>
                </DividerTextContainer>
                <Form onSubmit={handleSubmit}>
                  <InputWrapper>
                    <Input
                      type="email"
                      placeholder="电子邮箱"
                      value={email}
                      onChange={handleEmailChange}
                      ref={el => inputRefs.current[0] = el}
                      $index={0}
                    />
                    {!(email.includes("@") && email.split("@")[1].length > 0) && (
                      <EmailSuffixButton
                        type="button"
                        onClick={() => setShowSuffixDropdown(!showSuffixDropdown)}
                        tabIndex="-1"
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
                      ref={el => inputRefs.current[1] = el}
                      $index={1}
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash text-lg"></i>
                      ) : (
                        <i className="bi bi-eye text-lg"></i>
                      )}
                    </PasswordToggle>
                  </InputWrapper>
                  <SubmitButton ref={submitButtonRef} type="submit">
                    <SubmitButtonIcon className="icon" />
                    <span className="text">{submitButtonText}</span>
                  </SubmitButton>
                  <p tw="mt-8 text-sm text-gray-300 text-center">
                    <Link to={forgotPasswordUrl} tw="text-white border-b border-gray-200 hover:border-white transition-colors">
                      忘记密码？
                    </Link>
                  </p>
                  <p tw="mt-8 text-sm text-gray-300 text-center">
                    还没有账户？{" "}
                    <Link to={signupUrl} tw="text-white border-b border-gray-200 hover:border-white transition-colors">
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
      </Container>
    </AnimationRevealPage>
  );
};
