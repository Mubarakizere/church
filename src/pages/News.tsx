import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper } from "lucide-react";
import { apiUrls } from "@/config/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const News = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrls.news()}?status=published`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setNews(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-church-red/5 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-red"></div>
          <span className="text-lg text-muted-foreground">Loading news...</span>
        </div>
      </div>
    );
  }

  const featuredNews = news.filter(item => item.featured);
  const regularNews = news.filter(item => !item.featured);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gradient-to-br from-background to-church-red/5 pt-20">
      {/* Header Section */}
      <section className="relative py-20 bg-gradient-to-r from-church-red to-church-red/80 text-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Latest News
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Stay updated with the latest news and announcements from the Anglican Church of Rwanda, Shyogwe Diocese
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </section>

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-church-red mb-4">Featured News</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {featuredNews.map((newsItem) => (
                <Card key={newsItem.id} className="shadow-medium border-church-red/20 bg-gradient-to-br from-background to-church-red/5 overflow-hidden">
                  {newsItem.image ? (
                    <div className="relative h-64 w-full overflow-hidden">
                      <img 
                        src={newsItem.image} 
                        alt={newsItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement!.innerHTML = `
                            <div class="h-64 bg-gradient-to-br from-church-red/10 to-church-red/5 flex items-center justify-center">
                              <svg class="h-12 w-12 text-church-red/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-church-red/10 to-church-red/5 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-church-red/50" />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-church-red text-white">Featured</Badge>
                      <span className="text-sm text-muted-foreground">
                        {newsItem.published_at ? new Date(newsItem.published_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <CardTitle className="text-2xl text-foreground hover:text-church-red transition-colors">
                      <Link to={`/news/${newsItem.slug}`}>{newsItem.title}</Link>
                    </CardTitle>
                    {newsItem.author && (
                      <p className="text-sm text-muted-foreground">By {newsItem.author}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {newsItem.summary && (
                      <p className="text-muted-foreground mb-4 line-clamp-3">{newsItem.summary}</p>
                    )}
                    <Button 
                      asChild 
                      variant="elegant" 
                      className="w-full"
                    >
                      <Link to={`/news/${newsItem.slug}`}>Read More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular News Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-church-red mb-4">All News</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Read all our latest news articles and stay informed about church activities and community initiatives.
            </p>
          </div>
          
          {regularNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No news articles available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {regularNews.map((newsItem) => (
                <Card key={newsItem.id} className="shadow-soft hover:shadow-medium transition-shadow group">
                  {newsItem.image ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={newsItem.image} 
                        alt={newsItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.parentElement!.innerHTML = `
                            <div class="h-48 bg-gradient-to-br from-church-red/10 to-church-red/5 flex items-center justify-center rounded-t-lg">
                              <svg class="h-8 w-8 text-church-red/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-church-red/10 to-church-red/5 flex items-center justify-center rounded-t-lg">
                      <Newspaper className="h-8 w-8 text-church-red/50" />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {newsItem.published_at ? new Date(newsItem.published_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-foreground hover:text-church-red transition-colors">
                      <Link to={`/news/${newsItem.slug}`}>{newsItem.title}</Link>
                    </CardTitle>
                    {newsItem.author && (
                      <p className="text-sm text-muted-foreground">By {newsItem.author}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {newsItem.summary && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{newsItem.summary}</p>
                    )}
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/news/${newsItem.slug}`}>Read More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
};

export default News;
