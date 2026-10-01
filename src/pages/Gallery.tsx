import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Image as ImageIcon, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ExternalLink, 
  Share2, 
  Camera, 
  Play, 
  Pause, 
  LayoutGrid, 
  Film,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";
import { toast } from "sonner";

interface GalleryImage {
  id: number | string;
  title?: string | null;
  description?: string | null;
  image_url: string;
  category?: string;
  created_at?: string;
}

const resolveImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/01.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  const clean = imagePath.replace(/^\/+/, "").replace(/^storage\//, "");
  return apiUrls.storage(clean);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short"
    });
  } catch {
    return "";
  }
};

// Curated authentic fallback images representing key diocesan ministries
const fallbackGallery: GalleryImage[] = [
  {
    id: "fb-1",
    title: "St. Peter's Cathedral Shyogwe",
    description: "Diocesan cathedral seat and main sanctuary in Shyogwe.",
    image_url: "/01.jpg",
    category: "worship",
    created_at: "2025-10-15"
  },
  {
    id: "fb-2",
    title: "Diocesan Synod & Pastoral Fellowship",
    description: "Clergy and lay delegates gathered during the annual diocesan assembly.",
    image_url: "/02.jpg",
    category: "assembly",
    created_at: "2025-11-20"
  },
  {
    id: "fb-3",
    title: "Community Outreach & Parish Celebration",
    description: "Parishioners and youth gathered in worship and thanksgiving.",
    image_url: "/03.jpg",
    category: "community",
    created_at: "2025-11-10"
  },
  {
    id: "fb-4",
    title: "Diocesan Educational Institutions",
    description: "Students and teachers at diocesan schools in Southern Province.",
    image_url: "/01.jpg",
    category: "education",
    created_at: "2025-10-28"
  },
  {
    id: "fb-5",
    title: "Community Health & Rural Clinics",
    description: "Health personnel serving mothers and families at Hanika and Gitarama health centers.",
    image_url: "/02.jpg",
    category: "community",
    created_at: "2025-10-25"
  },
  {
    id: "fb-6",
    title: "Mothers' Union & Family Ministry",
    description: "Christian women gathered for leadership and community savings development.",
    image_url: "/03.jpg",
    category: "community",
    created_at: "2025-09-18"
  }
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<"stream" | "grid">("stream");

  useEffect(() => {
    let cancelled = false;

    const fetchGallery = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrls.gallery());
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (!cancelled) {
            setImages(list.length > 0 ? list : fallbackGallery);
          }
        } else {
          if (!cancelled) setImages(fallbackGallery);
        }
      } catch (err) {
        console.warn("Using fallback gallery images:", err);
        if (!cancelled) setImages(fallbackGallery);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGallery();
    return () => {
      cancelled = true;
    };
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setCurrentIndex(null);
  };

  const nextImage = useCallback(() => {
    if (currentIndex === null || images.length === 0) return;
    setCurrentIndex((prev) => ((prev! + 1) % images.length));
  }, [currentIndex, images.length]);

  const prevImage = useCallback(() => {
    if (currentIndex === null || images.length === 0) return;
    setCurrentIndex((prev) => ((prev! - 1 + images.length) % images.length));
  }, [currentIndex, images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, nextImage, prevImage]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Gallery link copied to clipboard");
  };

  // Prepare double sets for infinite loop (split into 2 rows for richness)
  const row1Images = useMemo(() => {
    if (images.length === 0) return [];
    const half = Math.ceil(images.length / 2);
    const slice = images.slice(0, half);
    // Duplicate to ensure seamless continuous scroll
    return [...slice, ...slice];
  }, [images]);

  const row2Images = useMemo(() => {
    if (images.length === 0) return [];
    const half = Math.ceil(images.length / 2);
    const slice = images.slice(half);
    const pool = slice.length > 0 ? slice : images;
    // Duplicate to ensure seamless continuous scroll
    return [...pool, ...pool];
  }, [images]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          {/* Background image with clean dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Anglican Church of Rwanda Shyogwe Diocese Photo Gallery"
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
              <span className="text-church-gold">Photo Gallery</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Diocesan Ministry in Motion
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Gallery Interactive Showcase Controls */}
        <section className="py-8 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                  Interactive Photographic Stream
                </span>
                <h2 className="text-2xl font-serif font-bold text-church-navy">
                  Visual Moments of Faith & Service
                </h2>
              </div>

              {/* Action & Pause Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Pause / Resume Button */}
                {viewMode === "stream" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaused(!isPaused)}
                    className={`text-xs font-bold transition-all flex items-center gap-2 px-4 py-2 rounded-xl shadow-2xs ${
                      isPaused 
                        ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100" 
                        : "bg-church-navy text-white hover:bg-church-navy/90 border-transparent"
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Resume Motion</span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 ml-0.5" />
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause Motion</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                      </>
                    )}
                  </Button>
                )}

                {/* View Mode Toggle */}
                <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setViewMode("stream")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "stream"
                        ? "bg-white text-church-navy shadow-xs"
                        : "text-slate-500 hover:text-church-navy"
                    }`}
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Motion Stream</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-church-navy shadow-xs"
                        : "text-slate-500 hover:text-church-navy"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Grid View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Content Area */}
        <section className="py-12 bg-slate-50/60 overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-3 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-500">Loading photograph archives...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="container mx-auto px-4 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 max-w-xl">
              <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-church-navy mb-1">No photographs currently available</h4>
              <p className="text-xs text-slate-500">
                New ministry moments will be added following upcoming gatherings.
              </p>
            </div>
          ) : viewMode === "stream" ? (
            /* Animated Horizontal Motion Stream (Left to Right) */
            <div className="space-y-6 select-none">
              
              {/* Stream Row 1: Sliding Left to Right */}
              <div className="relative w-full overflow-hidden py-2 group/track">
                {/* Left/Right Edge Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

                <div 
                  className="flex gap-5 w-max animate-scroll-ltr group-hover/track:[animation-play-state:paused]"
                  style={{
                    animationPlayState: isPaused ? "paused" : "running"
                  }}
                >
                  {row1Images.map((item, idx) => {
                    const resolvedSrc = resolveImageUrl(item.image_url);
                    const originalIdx = images.findIndex((img) => img.id === item.id);
                    const targetIdx = originalIdx >= 0 ? originalIdx : 0;

                    return (
                      <div
                        key={`row1-${item.id}-${idx}`}
                        onClick={() => openLightbox(targetIdx)}
                        className="group w-72 sm:w-80 md:w-96 shrink-0 bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900">
                          <img
                            src={resolvedSrc}
                            alt={item.title || "Diocesan photograph"}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/01.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/95 text-church-navy flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                              <ZoomIn className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        {(item.title || item.description) && (
                          <div className="p-4 bg-white border-t border-slate-100">
                            {item.title && (
                              <h3 className="font-serif font-bold text-church-navy text-xs sm:text-sm line-clamp-1 group-hover:text-church-gold transition-colors mb-0.5">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stream Row 2: Sliding Left to Right (Slightly Faster for Rich Parallax) */}
              <div className="relative w-full overflow-hidden py-2 group/track2">
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

                <div 
                  className="flex gap-5 w-max animate-scroll-ltr-fast group-hover/track2:[animation-play-state:paused]"
                  style={{
                    animationPlayState: isPaused ? "paused" : "running"
                  }}
                >
                  {row2Images.map((item, idx) => {
                    const resolvedSrc = resolveImageUrl(item.image_url);
                    const originalIdx = images.findIndex((img) => img.id === item.id);
                    const targetIdx = originalIdx >= 0 ? originalIdx : 0;

                    return (
                      <div
                        key={`row2-${item.id}-${idx}`}
                        onClick={() => openLightbox(targetIdx)}
                        className="group w-72 sm:w-80 md:w-96 shrink-0 bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900">
                          <img
                            src={resolvedSrc}
                            alt={item.title || "Diocesan photograph"}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/02.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/95 text-church-navy flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                              <ZoomIn className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        {(item.title || item.description) && (
                          <div className="p-4 bg-white border-t border-slate-100">
                            {item.title && (
                              <h3 className="font-serif font-bold text-church-navy text-xs sm:text-sm line-clamp-1 group-hover:text-church-gold transition-colors mb-0.5">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stream Navigation Tips */}
              <div className="container mx-auto px-4 max-w-6xl text-center pt-4">
                <p className="text-xs text-slate-400">
                  Hover over any photo to pause movement instantly • Click on any photo to open full-screen inspection
                </p>
              </div>

            </div>
          ) : (
            /* Classic Grid View */
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {images.map((item, index) => {
                  const resolvedSrc = resolveImageUrl(item.image_url);

                  return (
                    <div
                      key={item.id || index}
                      onClick={() => openLightbox(index)}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
                        <img
                          src={resolvedSrc}
                          alt={item.title || "Shyogwe Diocese Ministry"}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/01.jpg";
                          }}
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-church-navy flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <ZoomIn className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      {(item.title || item.description) && (
                        <div className="p-4 bg-white border-t border-slate-100">
                          {item.title && (
                            <h3 className="font-serif font-bold text-church-navy text-xs sm:text-sm line-clamp-1 group-hover:text-church-gold transition-colors mb-1">
                              {item.title}
                            </h3>
                          )}
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Media Desk & Photo Inquiries Callout */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-r from-church-navy via-slate-900 to-church-navy rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                  Diocesan Media Desk
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                  Share Parish Photos or Request High-Res Archives
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  For press photography, high-resolution ceremony downloads, or to submit confirmed photos from your parish or archdeaconry gathering, contact the Diocesan Media Secretariat.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-church-gold text-church-navy font-bold text-xs uppercase tracking-wider hover:bg-church-gold-hover transition-colors shadow-md text-center"
                >
                  Contact Media Desk
                </Link>
                <Link
                  to="/news"
                  className="px-6 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors text-center"
                >
                  Read News Articles
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        {currentIndex !== null && images[currentIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                aria-label="Close photo preview"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Prev Button */}
              {images.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Previous photograph"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Next photograph"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Fullscreen Photo */}
              <div className="w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
                <img
                  src={resolveImageUrl(images[currentIndex].image_url)}
                  alt={images[currentIndex].title || "Diocesan photograph"}
                  className="max-h-[72vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/01.jpg";
                  }}
                />
              </div>

              {/* Caption & Controls Bar */}
              <div className="w-full mt-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/20 text-church-navy flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-church-gold uppercase tracking-wider">
                      Photo {currentIndex + 1} of {images.length}
                    </span>
                    {images[currentIndex].created_at && (
                      <span className="text-[11px] text-slate-400">
                        • {formatDate(images[currentIndex].created_at)}
                      </span>
                    )}
                  </div>
                  {images[currentIndex].title && (
                    <h3 className="font-serif font-bold text-sm sm:text-base text-church-navy">
                      {images[currentIndex].title}
                    </h3>
                  )}
                  {images[currentIndex].description && (
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {images[currentIndex].description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(resolveImageUrl(images[currentIndex].image_url), "_blank")}
                    className="bg-church-navy hover:bg-church-navy/90 text-white text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Original</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
