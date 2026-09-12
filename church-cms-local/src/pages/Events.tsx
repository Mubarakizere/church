import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventsSection from "@/components/EventsSection";

const Events = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* title removed to let EventsSection handle headings */}
            <EventsSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;