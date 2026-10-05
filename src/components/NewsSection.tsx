import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Newspaper } from "lucide-react";
import { apiUrls, buildStorageUrl } from "@/config/api";

interface News {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  image?: string;
  author?: string;
  status: string;
  featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

const resolveNewsImageUrl = (imagePath?: string) => {
  return buildStorageUrl(imagePath);
};

const NewsSection = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrls.news()}?status=published`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const sortedNews = data.data
              .filter((item: News) => item.status === "published")
              .sort((a: News, b: News) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return (
                  new Date(b.published_at || b.created_at).getTime() -
                  new Date(a.published_at || a.created_at).getTime()
                );
              })
              .slice(0, 3);
            setNews(sortedNews);
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="news"
      className="py-16 lg:py-20 bg-white border-t border-church-cream/90 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 pb-6 border-b border-church-cream/80 gap-4 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-church-gold font-bold">
              Diocesan Updates
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-church-navy tracking-tight mt-1.5">
              Latest News & Stories
            </h2>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-church-navy hover:text-church-gold transition-colors group"
          >
            <span>View All News Articles</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-church-gold" />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-church-cream p-4 space-y-4 animate-pulse"
              >
                <div className="h-48 bg-church-cream/60 rounded-lg" />
                <div className="h-4 bg-church-cream/80 rounded w-1/3" />
                <div className="h-6 bg-church-cream rounded w-4/5" />
                <div className="h-14 bg-church-cream/50 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && news.length === 0 && (
          <div className="text-center py-16 bg-church-cream/20 rounded-2xl border border-dashed border-church-cream">
            <Newspaper className="h-10 w-10 text-church-navy/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-church-navy">No News Published Yet</h3>
            <p className="text-xs text-church-charcoal/70 mt-1">
              Check back soon for new announcements and updates.
            </p>
          </div>
        )}

        {/* Responsive News Grid */}
        {!loading && news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {news.map((item, index) => (
              <article
                key={item.id}
                style={{ transitionDelay: `${index * 120}ms` }}
                className={`bg-white rounded-xl overflow-hidden border border-church-cream shadow-xs hover:shadow-lg hover:border-church-gold/40 transition-all duration-500 ease-out flex flex-col group hover:-translate-y-1 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {/* News Image Container */}
                <Link
                  to={`/news/${item.slug}`}
                  className="relative aspect-[16/10] overflow-hidden bg-church-cream/60 block"
                >
                  <img
                    src={resolveNewsImageUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.triedProduction && item.image) {
                        img.dataset.triedProduction = "true";
                        const clean = item.image.replace(/^\/+/, "").replace(/^storage\//, "");
                        img.src = `https://earshyogwe.com/api/storage/${clean}`;
                      } else {
                        img.src = "/placeholder.svg";
                      }
                    }}
                  />
                  {item.featured && (
                    <span className="absolute top-3 left-3 bg-church-navy/90 text-church-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-xs shadow-xs border border-church-gold/30">
                      Featured
                    </span>
                  )}
                </Link>

                {/* News Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta line: Date & Author */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-church-charcoal/65 mb-2.5 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-church-gold flex-shrink-0" />
                        <span>
                          {new Date(item.published_at || item.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </span>
                      {item.author && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-church-gold flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{item.author}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-church-navy leading-snug tracking-tight group-hover:text-church-gold transition-colors line-clamp-2 mb-2">
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-church-charcoal/75 leading-relaxed line-clamp-3 mb-4">
                      {item.summary ||
                        (item.content.length > 130
                          ? `${item.content.substring(0, 130)}...`
                          : item.content)}
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div className="pt-3 border-t border-church-cream/70 flex items-center justify-between">
                    <Link
                      to={`/news/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-church-navy group-hover:text-church-gold transition-colors"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;












