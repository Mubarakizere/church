import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { apiUrls } from "@/config/api";

interface HeroImage {
  id: number;
  src: string;
  title: string;
  subtitle: string;
  display_order: number;
  is_active: boolean;
}

const FALLBACK_HERO_IMAGES: HeroImage[] = [
  {
    id: 1,
    src: "/1.jpg",
    title: "Welcome to Shyogwe Diocese",
    subtitle: "Serving God and His people across Rwanda through preaching the Gospel and compassionate community action.",
    display_order: 1,
    is_active: true
  },
  {
    id: 2,
    src: "/01.jpg",
    title: "Worship & Parish Life",
    subtitle: "Join our parish congregations across the archdeaconries for prayer, Holy Communion, and fellowship.",
    display_order: 2,
    is_active: true
  },
  {
    id: 3,
    src: "/02.jpg",
    title: "Transforming Lives & Communities",
    subtitle: "Partnering in education, healthcare facilities, clean water, and rural development.",
    display_order: 3,
    is_active: true
  },
  {
    id: 4,
    src: "/03.jpg",
    title: "Nurturing the Next Generation",
    subtitle: "Guiding youth and families through Christian discipleship, education, and vocational training.",
    display_order: 4,
    is_active: true
  },
  {
    id: 5,
    src: "/001.jpg",
    title: "A Living Heritage of Faith",
    subtitle: "Rooted in Anglican tradition, growing together in Christ's love and service.",
    display_order: 5,
    is_active: true
  }
];

const HeroSection = () => {
  const [carouselImages, setCarouselImages] = useState<HeroImage[]>(FALLBACK_HERO_IMAGES);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Fetch hero images from database
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch(apiUrls.heroImages());
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            const activeImagesRaw = result.data
              .filter((image: HeroImage) => image.is_active)
              .sort((a: HeroImage, b: HeroImage) => a.display_order - b.display_order);

            if (activeImagesRaw.length > 0) {
              const activeImages = activeImagesRaw.map((img: HeroImage) => {
                let src = img.src || "/placeholder.svg";
                if (src.startsWith("http")) return { ...img, src };
                if (src === "/placeholder.svg" || src === "placeholder.svg") return { ...img, src: "/placeholder.svg" };
                
                let cleanPath = src.replace(/^\/+/, "").replace(/\\/g, "/");
                if (cleanPath.startsWith("storage/")) {
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
        }
      } catch (error) {
        console.error("Failed to fetch hero images, using local defaults:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  if (loading && carouselImages.length === 0) {
    return (
      <section id="home" className="relative min-h-[85vh] flex items-center bg-church-navy">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-church-gold border-t-transparent mx-auto mb-3"></div>
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative min-h-[88vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-church-navy">
      {/* Carousel Background */}
      <div className="absolute inset-0">
        <Carousel
          setApi={setApi}
          className="w-full h-full"
          plugins={[
            Autoplay({
              delay: 6500,
              stopOnInteraction: false,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-[88vh] lg:h-[92vh]">
            {carouselImages.map((image, index) => (
              <CarouselItem key={image.id || index} className="h-full">
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat relative"
                  style={{
                    backgroundImage: `url(${image.src})`,
                  }}
                >
                  {/* Natural cinematic gradient: darker on left and bottom for seamless reading */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

                  {/* Authentic Editorial Content (Left-Aligned) */}
                  <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-center">
                    <div className="max-w-2xl text-left pt-6 pb-20">
                      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                        {image.title}
                      </h1>
                      <p className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed mt-4 font-normal max-w-xl">
                        {image.subtitle}
                      </p>

                      {/* Genuine Action Links */}
                      <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                        <Link
                          to="/about"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-church-gold hover:bg-church-gold-hover text-church-navy font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                        >
                          <span>About the Diocese</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          to="/projects"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-white/40 hover:border-white bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs transition-colors"
                        >
                          <span>Our Impact & Projects</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Bottom Bar: Slide Progress & Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-20 pointer-events-none">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between pointer-events-auto">
          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => api?.scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  current === idx
                    ? "w-8 h-2 bg-church-gold"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          {/* Slide Counter & Arrow Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/70 mr-2 tracking-wider">
              {String(current + 1).padStart(2, "0")} / {String(count || carouselImages.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous slide"
              className="p-2 rounded-full border border-white/25 bg-black/30 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              aria-label="Next slide"
              className="p-2 rounded-full border border-white/25 bg-black/30 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;