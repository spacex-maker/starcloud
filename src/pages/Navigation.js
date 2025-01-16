import React, { useState, useEffect } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import NavigationCard from "components/navigation/NavigationCard";
import SearchBar from "components/navigation/SearchBar";
import AppDownloadModal from "components/modals/AppDownloadModal";
import SocialLinksModal from "components/modals/SocialLinksModal";

// 基础容器样式
const Container = tw.div`relative`;
const Content = styled.div`
  ${tw`min-h-screen`}
  background-color: #252525;
  color: #fff;
`;

// Hero 区域样式
const HeroSection = styled.div`
  ${tw`relative min-h-[400px] flex items-center overflow-hidden`}
  background: #252525;
  background-image: url("assets/img/pexels-apasaric-3629227.jpg");
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
`;

const HeroContent = tw.div`container mx-auto text-center px-4`;
const HeroTitle = styled.h1`
  ${tw`text-[3.5rem] font-bold mb-4 leading-tight`}
  
  .hero-text-dubai {
    background: linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FF4500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    padding: 0 0.2em;
  }
  
  .hero-text-nav {
    background: linear-gradient(45deg, #66BB6A, #4CAF50, #43A047, #388E3C);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    padding: 0 0.2em;
  }
`;

const HeroSubtitle = styled.p`
  ${tw`text-xl mb-8 font-light text-gray-100`}
  opacity: 0.75;
`;

// 搜索和收藏按钮容器
const SearchBookmarkContainer = tw.div`flex flex-col md:flex-row items-center justify-center gap-4`;

// 搜索框样式
const SearchContainer = styled.div`
  ${tw`w-full max-w-xl relative`}
  
  .search-box {
    ${tw`relative flex items-center`}
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }
`;

// 导航网格样式
const NavGrid = tw.div`py-10`;
const NavContainer = tw.div`container mx-auto px-4`;

const Navigation = () => {
  const [navigationData, setNavigationData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [appModalData, setAppModalData] = useState({ isOpen: false, urls: {} });
  const [socialModalData, setSocialModalData] = useState({ isOpen: false, websiteName: '', links: {} });

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async (search = "") => {
    try {
      const countryCode = getCountryCodeFromUrl();
      const response = await fetch(
        `https://protx.cn/manage/base/website-list/list?countryCode=${countryCode}${
          search ? `&name=${search}` : ""
        }`
      );
      const result = await response.json();
      
      if (result.success) {
        const groupedData = groupNavigationData(result.data);
        setNavigationData(groupedData);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    }
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

  const getCountryCodeFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("countryCode") || "CN";
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchNavigationData(value);
  };

  // 处理 APP 下载
  const handleAppDownload = (androidUrl, iosUrl, harmonyUrl) => {
    setAppModalData({
      isOpen: true,
      urls: { androidUrl, iosUrl, harmonyUrl }
    });
  };

  // 处理社交链接
  const handleSocialLinks = (websiteName, socialLinks) => {
    setSocialModalData({
      isOpen: true,
      websiteName,
      links: socialLinks
    });
  };

  return (
    <Container>
      <Header />
      <Content>
        <HeroSection>
          <HeroContent>
            <HeroTitle>
              <span className="hero-text-dubai">迪拜</span>
              <span className="hero-text-nav">综合导航</span>
            </HeroTitle>
            <HeroSubtitle>
              政府服务 · 商务信息 · 生活指南
            </HeroSubtitle>
            <SearchBookmarkContainer>
              <SearchBar 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onClear={() => handleSearch("")}
              />
              {/* BookmarkButton Component */}
            </SearchBookmarkContainer>
          </HeroContent>
        </HeroSection>

        <NavGrid>
          <NavContainer>
            {Object.entries(navigationData).map(([category, subCategories]) => (
              <NavigationCard 
                key={category}
                category={category}
                subCategories={subCategories}
              />
            ))}
          </NavContainer>
        </NavGrid>
      </Content>
      <Footer />
      
      {/* 添加模态框组件 */}
      <AppDownloadModal
        isOpen={appModalData.isOpen}
        onClose={() => setAppModalData({ isOpen: false, urls: {} })}
        {...appModalData.urls}
      />
      
      <SocialLinksModal
        isOpen={socialModalData.isOpen}
        onClose={() => setSocialModalData({ isOpen: false, websiteName: '', links: {} })}
        websiteName={socialModalData.websiteName}
        socialLinks={socialModalData.links}
      />
    </Container>
  );
};

export default Navigation; 