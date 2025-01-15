import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro";
import { Link } from "react-router-dom";

import useAnimatedNavToggler from "../../helpers/useAnimatedNavToggler.js";
import logo from "../../images/logo.svg";
import { ReactComponent as MenuIcon } from "feather-icons/dist/icons/menu.svg";
import { ReactComponent as CloseIcon } from "feather-icons/dist/icons/x.svg";

const Header = styled.header`
  ${tw`
    fixed top-0 left-0 right-0
    w-full
    transition-all duration-200
    z-50
  `}
  background: ${props => props.isScrolled ? `rgba(255, 255, 255, 0.1)` : 'transparent'};
  backdrop-filter: ${props => props.isScrolled ? `blur(10px)` : 'none'};
  box-shadow: ${props => props.isScrolled ? `0 2px 10px rgba(0,0,0,0.1)` : 'none'};
`;

const HeaderContent = tw.div`
  flex justify-between items-center
  max-w-screen-xl mx-auto
  py-5 px-8
`;

export const NavLinks = tw.div`inline-block`;

export const NavLink = tw(Link)`
  text-lg my-2 lg:text-sm lg:mx-6 lg:my-0
  font-semibold tracking-wide transition duration-300
  text-white hover:text-primary-100
  pb-1 border-b-2 border-transparent hover:border-primary-100
`;

export const PrimaryLink = tw(Link)`
  lg:mx-0
  px-8 py-3 rounded-full
  bg-primary-500 text-gray-100
  hocus:bg-primary-700 hocus:text-gray-200
  border-2 border-primary-500
  transition duration-300
  shadow-lg hover:shadow-xl
`;

export const LogoLink = styled(Link)`
  ${tw`flex items-center font-black border-b-0 text-2xl! ml-0! text-white`};

  img {
    ${tw`w-12 mr-3 transition-transform duration-300 hover:scale-110`}
  }
`;

export const MobileNavLinksContainer = tw.nav`flex flex-1 items-center justify-between`;
export const NavToggle = tw.button`
  lg:hidden z-20 focus:outline-none text-white hover:text-primary-100 transition duration-300
`;

export const MobileNavLinks = motion(styled.div`
  ${tw`lg:hidden z-10 fixed top-0 inset-x-0 mx-4 my-6 p-8 border text-center rounded-lg text-gray-900 bg-white`}
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  ${NavLinks} {
    ${tw`flex flex-col items-center`}
  }
`);

export const DesktopNavLinks = tw.nav`
  hidden lg:flex flex-1 justify-between items-center
`;

const NavGroup = tw.div`
  flex items-center space-x-2
`;

export default ({ roundedHeaderButton = false, logoLink, links, className, collapseBreakpointClass = "lg" }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultLinks = [
    <NavLinks key={1}>
      <NavGroup>
        <NavLink to="/">首页</NavLink>
        <NavLink to="/navigation">综合导航</NavLink>
        <NavLink to="/about">关于我们</NavLink>
        <NavLink to="/join">入驻申请</NavLink>
        <NavLink to="/login">登录</NavLink>
        <PrimaryLink to="/signup">立即注册</PrimaryLink>
      </NavGroup>
    </NavLinks>
  ];

  const { showNavLinks, animation, toggleNavbar } = useAnimatedNavToggler();
  const collapseBreakpointCss = collapseBreakPointCssMap[collapseBreakpointClass];

  const defaultLogoLink = (
    <LogoLink to="/">
      <img src={logo} alt="logo" />
      <span>Treact</span>
    </LogoLink>
  );

  logoLink = logoLink || defaultLogoLink;
  links = links || defaultLinks;

  return (
    <Header className={className || "header-light"} isScrolled={isScrolled}>
      <HeaderContent>
        <DesktopNavLinks css={collapseBreakpointCss.desktopNavLinks}>
          {logoLink}
          {links}
        </DesktopNavLinks>

        <MobileNavLinksContainer css={collapseBreakpointCss.mobileNavLinksContainer}>
          {logoLink}
          <MobileNavLinks 
            initial={{ x: "150%", display: "none" }} 
            animate={animation} 
            css={collapseBreakpointCss.mobileNavLinks}
          >
            {links}
          </MobileNavLinks>
          <NavToggle 
            onClick={toggleNavbar} 
            className={showNavLinks ? "open" : "closed"}
          >
            {showNavLinks ? <CloseIcon tw="w-6 h-6" /> : <MenuIcon tw="w-6 h-6" />}
          </NavToggle>
        </MobileNavLinksContainer>
      </HeaderContent>
    </Header>
  );
};

const collapseBreakPointCssMap = {
  sm: {
    mobileNavLinks: tw`sm:hidden`,
    desktopNavLinks: tw`sm:flex`,
    mobileNavLinksContainer: tw`sm:hidden`
  },
  md: {
    mobileNavLinks: tw`md:hidden`,
    desktopNavLinks: tw`md:flex`,
    mobileNavLinksContainer: tw`md:hidden`
  },
  lg: {
    mobileNavLinks: tw`lg:hidden`,
    desktopNavLinks: tw`lg:flex`,
    mobileNavLinksContainer: tw`lg:hidden`
  },
  xl: {
    mobileNavLinks: tw`lg:hidden`,
    desktopNavLinks: tw`lg:flex`,
    mobileNavLinksContainer: tw`lg:hidden`
  }
};
