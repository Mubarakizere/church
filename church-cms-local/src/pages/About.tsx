import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* title removed to let AboutSection handle headings */}
            <AboutSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;