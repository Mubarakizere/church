import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import DocumentsSection from "@/components/DocumentsSection";
import { ChevronRight } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Clean Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          {/* Background image with clean dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="About Shyogwe Diocese"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/80 backdrop-blur-[0.5px]" />
          </div>

          {/* Banner Content */}
          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">About Us</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              About Us
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Core About Content */}
        <AboutSection />

        {/* Diocesan Documents Section */}
        <div className="py-12 bg-church-cream/30 border-t border-church-cream">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <DocumentsSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;