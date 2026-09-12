import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { apiUrls } from '@/config/api';

interface HeroImage {
  id: number;
  src: string;
  title: string;
  subtitle: string;
  display_order: number;
  is_active: boolean;
}

const HeroSection = () => {
  const [carouselImages, setCarouselImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  const services = [
    {
      title: "English Service",
      time: "6:30 AM - 8:30 AM",
      type: "Holy Communion in English"
    },
    {
      title: "Kinyarwanda Service",
      time: "9:00 AM - 12:00 PM",
      type: "Holy Communion in Kinyarwanda"
    },
    {
      title: "Mixed Service",
      time: "3:30 PM - 5:30 PM",
      type: "Bilingual Worship"
    }
  ];

  // Fetch hero images from database
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch(apiUrls.heroImages());
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Filter only active images and sort by display order
            const activeImagesRaw = result.data
              .filter((image: HeroImage) => image.is_active)
              .sort((a: HeroImage, b: HeroImage) => a.display_order - b.display_order);

            // Normalize image src values to route storage through backend
            const activeImages = activeImagesRaw.map((img: HeroImage) => {
              let src = img.src || '/placeholder.svg';
              if (src.startsWith('http')) {
                return { ...img, src };
              }
              if (src === '/placeholder.svg' || src === 'placeholder.svg') {
                return { ...img, src: '/placeholder.svg' };
              }
              let cleanPath = src.replace(/^\/+/, '').replace(/\\/g, '/');
              if (cleanPath.startsWith('storage/')) {
                cleanPath = cleanPath.substring(8);
              }
              const normalizedSrc = cleanPath.match(/^(hero-images|team-images|partner-logos)\//)
                ? apiUrls.storage(cleanPath)
                : src;
              return { ...img, src: normalizedSrc };
            });
            setCarouselImages(activeImages);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hero images:', error);
        // Fallback to static images if API fails
        setCarouselImages([
          {
            id: 1,
            src: "/1.jpg",
            title: "Welcome to Our Church",
            subtitle: "A place of worship and community",
            display_order: 1,
            is_active: true
          },
          {
            id: 2,
            src: "/01.jpg",
            title: "Join Our Congregation",
            subtitle: "Experience fellowship and spiritual growth",
            display_order: 2,
            is_active: true
          },
          {
            id: 3,
            src: "/02.jpg",
            title: "Sunday Services",
            subtitle: "Come worship with us every Sunday",
            display_order: 3,
            is_active: true
          },
          {
            id: 4,
            src: "/03.jpg",
            title: "Community Gathering",
            subtitle: "Building relationships in faith",
            display_order: 4,
            is_active: true
          },
          {
            id: 5,
            src: "/001.jpg",
            title: "Anglican Tradition",
            subtitle: "Rooted in faith, growing in love",
            display_order: 5,
            is_active: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  if (loading) {
    return (
      <section id="home" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-church-red to-red-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center">
      {/* Carousel Background */}
      <div className="absolute inset-0">
        <Carousel
          className="w-full h-full"
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-screen">
            {carouselImages.map((image, index) => (
              <CarouselItem key={index} className="h-screen">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat relative"
                  style={{
                    backgroundImage: `url(${image.src})`,
                    backgroundColor: '#FF0000'
                  }}
                >


                  {/* Text overlay for each image */}
                  <div className="absolute inset-0 flex items-center justify-center px-4 pb-32 md:pb-0">
                    <div className="text-center max-w-4xl">
                      <h2 className="text-3xl md:text-6xl font-bold text-white mb-4 leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {image.title}
                      </h2>
                      <p className="text-lg md:text-2xl text-white leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                        {image.subtitle}
                      </p>
                    </div>
            </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
          <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
        </Carousel>
      </div>

      {/* Action Buttons and Service Info - Positioned at bottom */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <Button variant="hero" size="lg" className="text-base md:text-lg px-6 py-3 md:px-8 md:py-4">
              <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Join Us Sunday
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base md:text-lg px-6 py-3 md:px-8 md:py-4 border-white text-black hover:bg-white hover:text-church-red"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <MapPin className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Find Us
            </Button>
          </div>


          </div>
        </div>

        {/* Sunday Services Section */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[500px] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg py-1">
          <div className="px-2">
            <h3 className="text-base font-bold text-church-red mb-1 text-center">
              Sunday Services
            </h3>
            <div className="grid grid-cols-3 gap-0">
              {services.map((service, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-semibold text-foreground text-sm mb-1">{service.title}</h4>
                  <div className="flex items-center justify-center text-church-red">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-sm font-medium">{service.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;