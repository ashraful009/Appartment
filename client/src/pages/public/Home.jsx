import React from "react";
import { useAuth } from "../../context/AuthContext";
import HeroSection from "../../components/home/HeroSection";
import StatsSection from "../../components/home/StatsSection";
import PropertySection from "../../components/home/PropertySection";
import ProjectCategories from "../../components/home/ProjectCategories";
import InvestmentSection from "../../components/home/InvestmentSection";
import VideoGallery from "../../components/home/VideoGallery";
import LocationSection from "../../components/home/LocationSection";
import HomeFooter from "../../components/home/HomeFooter";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#faf7f0] font-sans">
      
      <HeroSection />

      
      {isAuthenticated && (
        <div className="animate-fade-in bg-gradient-to-r from-[rgba(201,148,42,0.06)] via-[#faf7f0] to-[rgba(201,148,42,0.06)] border-b border-[rgba(201,148,42,0.18)] py-3 px-4 text-center">
          <p className="text-sm text-[#0A1628]">
            Welcome back, <strong className="text-[#C9942A]">{user?.name}</strong>! Your premium portfolio awaits below.
          </p>
        </div>
      )}

      
      <StatsSection />

      
      <PropertySection />

      
      <ProjectCategories />

      
      <InvestmentSection />

      
      <VideoGallery />

      
      <LocationSection />

      
      <HomeFooter />
    </div>
  );
};

export default Home;
