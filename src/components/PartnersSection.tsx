import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Loader2 } from "lucide-react";
import { apiUrls } from "@/config/api";

interface Partner {
  id: number;
  name: string;
  website?: string;
  logo?: string;
}

export const PartnersSection: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Fallback partners
  const fallbackPartners: Partner[] = [
    {
      id: 1,
      name: "Brot für die Welt (Germany)",
      website: "https://www.brot-fuer-die-welt.de/en/",
      logo: "Vkewez8hNH4J9RrLD4J69oiN8PLGzgST0qnHbOkR.jpg"
    },
    {
      id: 2,
      name: "Government of Rwanda",
      website: "https://www.gov.rw",
      logo: "lg2DNHRM55oagwK3MNNM4f7Z4HTDBPoTp5vjeJTY.jpg"
    },
    {
      id: 3,
      name: "HOPE International",
      website: "https://www.hopeinternational.org",
      logo: "DYX9kXgI4a5jVOtyGFidX6d9B1AQdpaBtHTOc1Vt.jpg"
    },
    {
      id: 4,
      name: "Five Talents",
      website: "https://www.fivetalents.org.uk",
      logo: "fpawHgNJiF0XQWV4BQ8BgrKPSbpzbazpF8FqMxkO.jpg"
    },
    {
      id: 5,
      name: "Compassion International",
      website: "https://www.compassion.com",
      logo: "cimQbJGOllHhHOdy4rUuJrs0vGY5Dw12jC3ptiXn.jpg"
    },
    {
      id: 6,
      name: "Tearfund",
      website: "https://www.tearfund.org",
      logo: "59vufOz1YrBusZ2KqrXKzsu7ufxBNShigGXch34G.jpg"
    },
    {
      id: 7,
      name: "United Evangelical Mission (VEM)",
      website: "https://www.vemission.org/en",
      logo: "bq0ywW1wTpZa5hnVVjSHbLiz4etDCPGMNOOpts9w.jpg"
    },
    {
      id: 8,
      name: "Grassroots Rwanda",
      website: "https://grassrootsrwanda.org.uk",
      logo: "9nfLmRHbeOqa1G4u8SAh5kBwIDKvk2aY3mapESXp.jpg"
    },
    {
      id: 10,
      name: "Church of the Apostles (Raleigh)",
      website: "https://apostlesraleigh.net",
      logo: "qCkbCoq1ITdGNrhJrW57iGLlK2uLXLpOF17khEzT.jpg"
    },
    {
      id: 11,
      name: "CMS Ireland",
      website: "https://www.cmsireland.org",
      logo: "LkNaRsRbLqIwXMgniKfJwCsxSByEpsJ39a1uhzGB.jpg"
    },
    {
      id: 12,
      name: "Christ Church Amsterdam",
      website: "https://christchurch.nl",
      logo: "K1ES4AHqNW8QA2YbiP5tIchXjqcEu9KHz1MVY6Jn.jpg"
    }
  ];

  // Helper function to resolve logo path
  const resolveLogoUrl = (rawLogo?: string): string => {
    if (!rawLogo) return "";
    const filename = rawLogo.split("/").pop() || rawLogo;
    return apiUrls.storage(`partner-logos/${filename}`);
  };

  // Fetch partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrls.partners());
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setPartners(data.data);
          } else {
            setPartners(fallbackPartners);
          }
        } else {
          setPartners(fallbackPartners);
        }
      } catch (err) {
        console.warn("Using fallback partners:", err);
        setPartners(fallbackPartners);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Continuous smooth auto-scroll moving from left to right (natural forward flow)
  useEffect(() => {
    if (loading || partners.length === 0) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let speed = 0.8; // pixels per frame

    const step = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += speed;

        // When half of the duplicated list is scrolled, wrap back seamlessly
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId.current = requestAnimationFrame(step);
    };

    animationFrameId.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [loading, partners, isPaused]);

  // User controls: scroll left or right
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth"
    });
  };

  const handleImageError = (partnerId: number, filename?: string) => {
    if (filename) {
      const cleanName = filename.split("/").pop();
      const backupUrl = `https://earshyogwe.com/api/storage/partner-logos/${cleanName}`;
      const imgElement = document.getElementById(`partner-img-${partnerId}`) as HTMLImageElement;
      if (imgElement && imgElement.src !== backupUrl) {
        imgElement.src = backupUrl;
        return;
      }
    }
    setFailedImages((prev) => ({ ...prev, [partnerId]: true }));
  };

  const getPartnerInitials = (name: string): string => {
    const parts = name.replace(/[()]/g, "").trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // We duplicate the list to achieve an infinite seamless continuous scroll
  const displayPartners = [...partners, ...partners];

  return (
    <section className="py-14 bg-white border-t border-slate-200/70 relative overflow-hidden select-none">
      <div className="container mx-auto px-4">
        {/* Header with user controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy tracking-tight">
              Our Partners
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Collaborating with international mission agencies, government bodies, and sister churches
            </p>
          </div>

          {/* User Controls: Prev, Pause/Play, Next */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Previous partners"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-700 hover:text-church-navy hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
              className={`px-3 h-9 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPaused
                  ? "bg-church-navy text-white border-church-navy shadow-xs"
                  : "bg-white text-slate-600 border-slate-200/90 hover:bg-slate-100"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleScroll("right")}
              aria-label="Next partners"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-700 hover:text-church-navy hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Moving Track with Left & Right Gradient Shadows */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge fade gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {loading ? (
            <div className="h-28 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-church-navy" />
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex items-center gap-5 overflow-x-auto scrollbar-none py-2 px-4 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              {displayPartners.map((partner, index) => {
                const logoSrc = resolveLogoUrl(partner.logo);
                const isFailed = failedImages[partner.id] || !logoSrc;

                return (
                  <div
                    key={`${partner.id}-${index}`}
                    onClick={() => {
                      if (partner.website) {
                        window.open(partner.website, "_blank", "noopener,noreferrer");
                      }
                    }}
                    title={partner.website ? `${partner.name} - Click to visit website` : partner.name}
                    className="shrink-0 w-44 sm:w-52 h-24 sm:h-28 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-church-gold/70 transition-all duration-300 flex items-center justify-center p-3 cursor-pointer group hover:-translate-y-1"
                  >
                    {!isFailed ? (
                      <img
                        id={`partner-img-${partner.id}`}
                        src={logoSrc}
                        alt={partner.name}
                        className="max-h-16 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={() => handleImageError(partner.id, partner.logo)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 rounded-lg bg-church-navy text-church-gold font-bold text-xs flex items-center justify-center shrink-0">
                          {getPartnerInitials(partner.name)}
                        </div>
                        <span className="text-xs font-semibold text-church-navy line-clamp-1">
                          {partner.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
