import React from "react";
import GlobalStyles from './styles/GlobalStyles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SaaSProductLandingPage from "./demos/SaaSProductLandingPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import JoinUs from "pages/JoinUs";
import Navigation from "pages/Navigation";
import ProfilePage from "pages/Profile";
import About from "pages/About";

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
};

export default function App() {
  React.useEffect(() => {
    initTheme();
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {  // 只有在用户没有手动设置主题时才跟随系统
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<SaaSProductLandingPage />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/join" element={<JoinUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </>
  );
}
