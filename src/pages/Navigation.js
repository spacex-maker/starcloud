import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import tw from "twin.macro";
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import AppDownloadModal from "components/modals/AppDownloadModal.js";
import SocialLinksModal from "components/modals/SocialLinksModal.js";
import SearchBar from "../components/navigation/SearchBar.js";
import NavigationCard from "../components/navigation/NavigationCard.js";

// 工具函数
const getCountryCodeFromUrl = () => {
  const url = window.location.pathname;
  const matches = url.match(/\/([^\/]+)\/navigation/);
  return matches ? matches[1] : 'ae';
};

const groupNavigationData = (data) => {
  return data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {};
    }
    if (!acc[item.category][item.subCategory]) {
      acc[item.category][item.subCategory] = [];
    }
    acc[item.category][item.subCategory].push(item);
    return acc;
  }, {});
};

// 动画定义
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 样式定义
const Container = styled.div`
  ${tw`min-h-screen bg-[#252525]`}
  background-image: url("assets/img/pexels-apasaric-3629227.jpg");
  background-position: center;
  background-size: cover;
  background-attachment: fixed;

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const HeroSection = styled.div`
  position: relative;
  padding: 100px 0 60px;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  
  .hero-text-dubai {
    background: linear-gradient(45deg, 
      #FFD700, #FFA500, #FF8C00, #FF4500
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding: 0 0.2em;
  }

  .hero-text-nav {
    background: linear-gradient(45deg, 
      #66BB6A, #4CAF50, #43A047, #388E3C
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding: 0 0.2em;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  .subtitle-dot {
    opacity: 0.5;
  }
`;

const SearchBookmarkContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const BookmarkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

// 组件定义
const Navigation = () => {
  const [navigationData, setNavigationData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const countryCode = getCountryCodeFromUrl();
        const response = await fetch(
          `https://protx.cn/manage/base/website-list/list?countryCode=${countryCode}`
        );
        const result = await response.json();
        
        if (result.success) {
          console.log('获取到的数据:', result.data);
          const groupedData = groupNavigationData(result.data);
          console.log('分组后的数据:', groupedData);
          setNavigationData(groupedData);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    const fetchSearchResults = async () => {
      try {
        const countryCode = getCountryCodeFromUrl();
        const response = await fetch(
          `https://protx.cn/manage/base/website-list/list?countryCode=${countryCode}${value ? `&name=${value}` : ''}`
        );
        const result = await response.json();
        
        if (result.success) {
          const groupedData = groupNavigationData(result.data);
          setNavigationData(groupedData);
        }
      } catch (error) {
        console.error('搜索失败:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi bi-info-circle"></i>
        <span>请按 ${isMac ? '⌘ + D' : 'Ctrl + D'} 键添加到收藏夹</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    setIsBookmarked(true);
    
    setTimeout(() => {
      toast.remove();
      setIsBookmarked(false);
    }, 3000);
  };

  return (
    <Container>
      <Header />
      
      <HeroSection>
        <div className="container">
          <HeroTitle>
            <span className="hero-text-dubai">迪拜</span>
            <span className="hero-text-nav">综合导航</span>
          </HeroTitle>
          <HeroSubtitle>
            <span>政府服务</span>
            <span className="subtitle-dot">·</span>
            <span>商务信息</span>
            <span className="subtitle-dot">·</span>
            <span>生活指南</span>
          </HeroSubtitle>
          
          <SearchBookmarkContainer>
            <SearchBar 
              value={searchTerm}
              onChange={handleSearch}
              onClear={() => setSearchTerm("")}
            />
            <BookmarkButton onClick={handleBookmark}>
              <i className="bi bi-bookmark-plus"></i>
              <span>收藏本站</span>
            </BookmarkButton>
          </SearchBookmarkContainer>
        </div>
      </HeroSection>

      <main>
        <div className="nav-grid">
          <div className="container">
            {isLoading ? (
              <div className="text-center text-white py-5">
                <i className="bi bi-arrow-repeat spin me-2"></i>
                加载中...
              </div>
            ) : Object.keys(navigationData).length === 0 ? (
              <div className="text-center text-white py-5">
                暂无数据
              </div>
            ) : (
              <div className="row">
                {Object.entries(navigationData).map(([category, subCategories]) => (
                  <NavigationCard 
                    key={category}
                    category={category}
                    subCategories={subCategories}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AppDownloadModal />
      <SocialLinksModal />
    </Container>
  );
};

export default Navigation; 