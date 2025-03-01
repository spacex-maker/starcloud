import React, { useState } from "react";
import GlobalStyles from './styles/GlobalStyles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, message } from 'antd';
import { ThemeProvider } from 'styled-components';
import 'antd/dist/reset.css'; // 只需要这一个样式文件即可
import SaaSProductLandingPage from "./demos/SaaSProductLandingPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ResetPasswordPage from "./pages/ResetPassword";
import JoinUs from "pages/JoinUs";
import Navigation from "pages/Navigation";
import ProfilePage from "pages/Profile";
import About from "pages/About";
import PartnerSurvey from "pages/PartnerSurvey";
import CloudDrivePage from "./pages/CloudDrive"; // 新增云盘页面组件
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';
import { LocaleProvider } from './contexts/LocaleContext';
import { Helmet } from 'react-helmet';
import FileDecryptPage from './pages/FileDecrypt';
import TestCrypto from './pages/TestCrypto';

// 语言配置映射
const localeMap = {
  zh_CN: zhCN,
  en_US: enUS,
  ja_JP: jaJP,
  ko_KR: koKR,
};

export default function App() {
  const [isDark, setIsDark] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  const [locale, setLocale] = useState('zh_CN');

  // 设置 message 全局配置
  message.config({
    top: 60,
    duration: 2,
    maxCount: 3,
  });

  const themeConfig = React.useMemo(() => ({
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#3b82f6',
      borderRadius: 4,
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeXL: 20,
      lineHeight: 1.5715,
      // 暗色模式颜色系统
      colorBgBase: isDark ? '#141414' : '#ffffff',
      colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
      colorBgLayout: isDark ? '#141414' : '#f0f2f5',
      colorBgSpotlight: isDark ? '#1f1f1f' : '#ffffff',
      colorBgMask: 'rgba(0, 0, 0, 0.45)',
      colorText: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      colorBorder: isDark ? '#303030' : '#d9d9d9',
      colorSplit: isDark ? '#303030' : '#f0f0f0',
    },
    components: {
      Button: {
        borderRadius: 20,
        controlHeight: 36,
        paddingContentHorizontal: 20,
      },
      Input: {
        borderRadius: 20,
        controlHeight: 36,
      },
      Select: {
        borderRadius: 4,
      },
      Pagination: {
        borderRadius: 4,
      },
      Checkbox: {
        borderRadius: 4,
      },
      Modal: {
        borderRadius: 20,
        contentBorderRadius: 20,
        headerBg: 'var(--ant-color-bg-container)',
      },
      Drawer: {
        borderRadius: 20,
      },
      Dropdown: {
        borderRadius: 20,
      },
      Popover: {
        borderRadius: 20,
      },
      Tooltip: {
        borderRadius: 20,
      },
      Message: {
        zIndex: 1050,
      },
      Card: {
        borderRadius: 8,
      },
    },
  }), [isDark]);

  // 主题切换处理函数
  const handleThemeChange = React.useCallback((dark) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  React.useEffect(() => {
    handleThemeChange(isDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        handleThemeChange(e.matches);
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [handleThemeChange, isDark]);

  return (
    <LocaleProvider>
      <Helmet>
        <meta name="application-name" content="MyStorageX" />
        <meta name="apple-mobile-web-app-title" content="MyStorageX" />
      </Helmet>
      <ThemeProvider theme={{ 
        mode: isDark ? 'dark' : 'light',
        setTheme: handleThemeChange 
      }}>
        <ConfigProvider
          locale={localeMap[locale]}
          theme={themeConfig}
        >
          <GlobalStyles />
          <Router>
            <Routes>
              <Route path="/" element={<CloudDrivePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/decrypt" element={<FileDecryptPage />} />
              <Route path="/test-crypto" element={<TestCrypto />} />
            </Routes>
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
