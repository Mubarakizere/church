import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Newspaper, 
  Calendar, 
  User, 
  Share2, 
  ArrowLeft, 
  ChevronRight, 
  Printer,
  Check,
  Building2,
  Clock
} from "lucide-react";
import { apiUrls, buildStorageUrl } from "@/config/api";
import { toast } from "sonner";

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
      month: "long",
      day: "numeric"
    });
  } catch {
    return "";
  }
};

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) {
          setError("Invalid news article");
          return;
        }

        const response = await fetch(apiUrls.newsItem(slug));

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setNews(data.data);
          } else {
            setError("News article not found");
          }
        } else {
          setError("News article not found");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("An error occurred while loading the news article");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Article link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-500">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Newspaper className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-church-navy mb-2">
              Article Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              The article you are looking for may have been moved or is no longer accessible.
            </p>
            <Button
              onClick={() => navigate("/news")}
              className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-bold px-6 py-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to News Directory
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Interleaved paragraphs and images
  const paragraphs = news.content ? news.content.split("\n").filter((p) => p.trim()) : [];
  const additionalImages = news.images || [];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner */}
        <section className="relative h-44 sm:h-52 md:h-60 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt={news.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/85 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link to="/news" className="hover:text-church-gold transition-colors">
                News
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Article</span>
            </nav>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-white mb-1 line-clamp-1 max-w-3xl mx-auto">
              {news.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Article Reading Area */}
        <article className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-church-navy transition-colors py-1 px-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to All Articles</span>
              </Link>
            </div>

            {/* Article Header Metadata */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {news.featured && (
                  <span className="text-xs font-bold text-church-navy bg-church-cream px-3 py-1 rounded-full border border-church-gold/20">
                    Featured Story
                  </span>
                )}
                {news.published_at && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-church-gold" />
                    {formatDate(news.published_at)}
                  </span>
                )}
                {news.author && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>By {news.author}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-church-navy leading-tight mb-4">
                {news.title}
              </h1>
            </div>

            {/* Lead Summary Callout */}
            {news.summary && (
              <div className="p-6 rounded-2xl bg-slate-50 border-l-4 border-church-gold border-slate-200/80 mb-8 shadow-2xs">
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-serif italic">
                  {news.summary}
                </p>
              </div>
            )}

            {/* Main Featured Image */}
            {news.image && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100">
                <img
                  src={resolveNewsImageUrl(news.image)}
                  alt={news.title}
                  className="w-full h-auto max-h-[500px] object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/01.jpg";
                  }}
                />
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-slate max-w-none text-slate-800 space-y-5 leading-relaxed text-sm sm:text-base font-sans">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
            </div>

            {/* Additional Photo Gallery if Present */}
            {additionalImages.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200/80">
                <h3 className="text-lg font-serif font-bold text-church-navy mb-4">
                  Event Photo Gallery
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {additionalImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs group cursor-pointer"
                      onClick={() => window.open(resolveNewsImageUrl(imgUrl), "_blank")}
                    >
                      <img
                        src={resolveNewsImageUrl(imgUrl)}
                        alt={`${news.title} photo ${i + 1}`}
                        className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sharing and Action Controls */}
            <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Share2 className="h-4 w-4 text-church-gold" />
                <span>Share this article</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Article</span>
                </Button>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-12 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/90 text-center">
              <h3 className="text-xl font-serif font-bold text-church-navy mb-2">
                Stay Connected with Shyogwe Diocese
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-5 max-w-lg mx-auto leading-relaxed">
                Explore more announcements, diocesan pastoral letters, community developments, and upcoming ecclesiastical events.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => navigate("/news")}
                  className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-bold px-5 py-2 rounded-xl"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Browse All Articles
                </Button>
              </div>
            </div>

          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
