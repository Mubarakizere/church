import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import EventsSection from "@/components/EventsSection";
import ContactSection from "@/components/ContactSection";
import PartnersSection from "@/components/PartnersSection";
import Footer from "@/components/Footer";
import LoadingStats from "@/components/LoadingStats";

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    // Add a small delay before showing content for smooth transition
    setTimeout(() => {
      setShowContent(true);
    }, 300);
  };

  // Skip loading on subsequent visits (optional)
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowLoading(false);
      setShowContent(true);
    } else {
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  if (showLoading) {
    return <LoadingStats onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`min-h-screen transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <EventsSection />
        <ContactSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
