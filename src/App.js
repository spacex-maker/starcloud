import React, { useState } from "react";
import GlobalStyles from './styles/GlobalStyles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, message } from 'antd';
import { ThemeProvider } from 'styled-components';
import 'antd/dist/reset.css'; // 只需要这一个样式文件即可
import SaaSProductLandingPage from "./demos/SaaSProductLandingPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
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
      fontSize: 13,
    },
    components: {
      Button: {
        borderRadius: 4,
      },
      Card: {
        borderRadius: 8,
      },
      Message: {
        zIndex: 1050,
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
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Router>
        </ConfigProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
