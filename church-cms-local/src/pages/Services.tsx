import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";

const Services = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* title removed to let ServicesSection handle headings */}
            <ServicesSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;