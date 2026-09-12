import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* title removed to let ContactSection handle headings */}
            <ContactSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;