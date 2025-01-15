import React from "react";
import GlobalStyles from './styles/GlobalStyles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SaaSProductLandingPage from "./demos/SaaSProductLandingPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import JoinUs from "pages/JoinUs";
import Navigation from "pages/Navigation";

export default function App() {
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
        </Routes>
      </Router>
    </>
  );
}
