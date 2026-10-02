import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Newspaper, 
  Calendar, 
  User, 
  Search, 
  ChevronRight, 
  ArrowRight, 
  X, 
  Share2, 
  Church, 
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  image?: string;
  images?: string[];
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

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "";
  }
};

// Authentic diocesan fallback news articles
const fallbackNews: NewsItem[] = [
  {
    id: 25,
    title: "Shyogwe Diocese Leaders Unite to Strengthen Education Quality Across Schools",
    slug: "shyogwe-diocese-leaders-unite-to-strengthen-education-quality-across-schools",
    summary: "Leaders from schools and parishes in the Anglican Church of Rwanda, Shyogwe Diocese, met on Friday for an extended education session chaired by the Rt. Rev. Louis Pasteur Kabayiza to review academic performance and spiritual mentorship.",
    content: "Leaders from schools and parishes within the Anglican Church of Rwanda, Shyogwe Diocese, convened for an extended education meeting dedicated to enhancing the quality of learning across all diocesan schools. Chaired by the Rt. Rev. Louis Pasteur Kabayiza, the session brought together headteachers, school managers, parish leaders, and education officials.",
    image: "/01.jpg",
    author: "Communications Office",
    status: "published",
    featured: true,
    published_at: "2025-11-25T11:34:56.000000Z",
    created_at: "2025-11-18T14:36:13.000000Z",
    updated_at: "2025-11-25T11:34:57.000000Z"
  },
  {
    id: 24,
    title: "Diocesan Synod Focuses on Evangelism, Youth Mentorship & Community Healthcare",
    slug: "diocesan-synod-focuses-on-evangelism-youth-mentorship-community-healthcare",
    summary: "Clergy and lay delegates gathered at St. Peter's Cathedral Shyogwe for the annual diocesan synod assembly, assessing strategic pastoral objectives and community outreach initiatives.",
    content: "The annual Diocesan Synod was held with delegates representing all archdeaconries of Shyogwe Diocese. The Bishop commended parishes for faithful stewardship and renewed dedication to gospel outreach, education, and community healthcare development.",
    image: "/02.jpg",
    author: "Diocesan Secretariat",
    status: "published",
    featured: true,
    published_at: "2025-11-20T10:15:00.000000Z",
    created_at: "2025-11-15T09:00:00.000000Z",
    updated_at: "2025-11-20T10:15:00.000000Z"
  },
  {
    id: 23,
    title: "Mothers' Union Celebrates Community Empowerment and Vocational Milestones",
    slug: "mothers-union-celebrates-community-empowerment-and-vocational-milestones",
    summary: "Over four hundred Mothers' Union members converged in Muhanga to celebrate literacy training, community savings initiatives, and maternal health support programs.",
    content: "The Mothers' Union in Shyogwe Diocese hosted a diocesan-wide conference highlighting the vital role of Christian women in community development, early childhood education, and home economic resilience.",
    image: "/03.jpg",
    author: "Mothers' Union Desk",
    status: "published",
    featured: false,
    published_at: "2025-11-10T14:20:00.000000Z",
    created_at: "2025-11-08T11:00:00.000000Z",
    updated_at: "2025-11-10T14:20:00.000000Z"
  },
  {
    id: 22,
    title: "Healthcare Expansion: Clean Water and Solar Initiatives in Rural Health Posts",
    slug: "healthcare-expansion-clean-water-and-solar-initiatives-in-rural-health-posts",
    summary: "The Diocesan Health Department completes infrastructure improvements across rural health clinics, ensuring reliable water supply and maternity ward solar electrification.",
    content: "Diocesan healthcare facilities in remote sectors have received dedicated clean water supply points and solar backup systems to improve emergency maternal triage and patient care.",
    image: "/01.jpg",
    author: "Health & Development Department",
    status: "published",
    featured: false,
    published_at: "2025-10-28T08:30:00.000000Z",
    created_at: "2025-10-25T16:00:00.000000Z",
    updated_at: "2025-10-28T08:30:00.000000Z"
  }
];

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "featured" | "recent">("all");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrls.news()}?status=published`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (!cancelled) {
            setNews(list.length > 0 ? list : fallbackNews);
          }
        } else {
          if (!cancelled) setNews(fallbackNews);
        }
      } catch (err) {
        console.warn("Using fallback news data:", err);
        if (!cancelled) setNews(fallbackNews);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered news
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Type/tag filter
      if (activeFilter === "featured" && !item.featured) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSummary = item.summary?.toLowerCase().includes(q);
      const matchAuthor = item.author?.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);

      return matchTitle || matchSummary || matchAuthor || matchContent;
    });
  }, [news, activeFilter, searchQuery]);

  // Lead featured article
  const leadArticle = useMemo(() => {
    const featured = news.find((item) => item.featured);
    return featured || news[0] || null;
  }, [news]);

  // Articles excluding the lead when displaying all without search
  const gridArticles = useMemo(() => {
    if (searchQuery.trim() || activeFilter !== "all") {
      return filteredNews;
    }
    // In default view, if lead is highlighted above, show the remaining articles in the grid
    return filteredNews.filter((item) => item.id !== leadArticle?.id);
  }, [filteredNews, leadArticle, searchQuery, activeFilter]);

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
              alt="Anglican Church of Rwanda Shyogwe Diocese News"
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
              <span className="text-church-gold">Diocesan News</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              News & Official Communiqués
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Lead Headline Story (When Not Filtering by Search) */}
        {!searchQuery.trim() && activeFilter === "all" && leadArticle && (
          <section className="py-10 bg-white border-b border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block">
                  Top Headline
                </span>
              </div>

              <div className="bg-slate-50 rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden bg-slate-900">
                  <img
                    src={resolveNewsImageUrl(leadArticle.image)}
                    alt={leadArticle.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/01.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <span className="text-[11px] font-bold text-church-navy bg-church-cream px-3 py-1 rounded-full border border-church-gold/20">
                        Featured Story
                      </span>
                      {leadArticle.published_at && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-church-gold" />
                          {formatDate(leadArticle.published_at)}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-church-navy group-hover:text-church-gold transition-colors leading-snug mb-3">
                      <Link to={`/news/${leadArticle.slug}`}>
                        {leadArticle.title}
                      </Link>
                    </h2>

                    {leadArticle.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 line-clamp-4">
                        {leadArticle.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    {leadArticle.author ? (
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>By {leadArticle.author}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Shyogwe Diocese</span>
                    )}

                    <Link
                      to={`/news/${leadArticle.slug}`}
                      className="px-4 py-2 rounded-xl bg-church-navy text-white text-xs font-bold hover:bg-church-navy/90 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Directory & News Grid Section */}
        <section className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            {/* Filter and Live Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                  Articles & Archives
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                  Browse Diocesan Reports
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search news, topics, authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "all"
                    ? "bg-church-navy text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-church-navy"
                }`}
              >
                All Articles ({news.length})
              </button>

              <button
                onClick={() => setActiveFilter("featured")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "featured"
                    ? "bg-church-navy text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-church-navy"
                }`}
              >
                Featured Stories ({news.filter((n) => n.featured).length})
              </button>
            </div>

            {/* News Cards Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-3 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading articles...</p>
              </div>
            ) : gridArticles.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-xl mx-auto">
                <Newspaper className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-church-navy mb-1">No articles match your search</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Try checking different keywords or clearing your active search filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className="text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <Link to={`/news/${article.slug}`} className="block relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={resolveNewsImageUrl(article.image)}
                          alt={article.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/01.jpg";
                          }}
                        />
                        {article.featured && (
                          <span className="absolute top-3 left-3 text-[10px] font-bold text-church-navy bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs border border-church-gold/30">
                            Featured
                          </span>
                        )}
                      </Link>

                      {/* Content Body */}
                      <div className="p-5 sm:p-6">
                        {/* Date & Author */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
                          <span className="flex items-center gap-1 font-medium text-slate-500">
                            <Calendar className="h-3 w-3 text-church-gold" />
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                          {article.author && (
                            <span className="truncate max-w-[130px]">By {article.author}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-serif font-bold text-church-navy group-hover:text-church-gold transition-colors leading-snug mb-2.5 line-clamp-2">
                          <Link to={`/news/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>

                        {/* Summary */}
                        {article.summary && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                            {article.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/news/${article.slug}`}
                        className="text-xs font-bold text-church-navy hover:text-church-gold flex items-center gap-1.5 transition-colors group/link"
                      >
                        <span>Read Full Story</span>
                        <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* Media & Communications Office Callout */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-r from-church-navy via-slate-900 to-church-navy rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                  Diocesan Communications
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                  Media Inquiries & Official Statements
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  For press inquiries, interview requests with diocesan leadership, or permission to republish pastoral letters and reports, reach out to the Shyogwe Diocese Communications Secretariat.
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
                  to="/documents"
                  className="px-6 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors text-center"
                >
                  Public Documents
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
