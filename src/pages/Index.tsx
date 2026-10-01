import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DioceseOverview from "@/components/DioceseOverview";
import AboutSection from "@/components/AboutSection";
import NewsSection from "@/components/NewsSection";
import PartnersSection from "@/components/PartnersSection";
import Footer from "@/components/Footer";
import SiteLoader from "@/components/SiteLoader";

const Index = () => {
  return (
    <div className="min-h-screen animate-fade-in">
      <SiteLoader />
      <Header />
      <main>
        <HeroSection />
        <DioceseOverview />
        <AboutSection />
        <NewsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
