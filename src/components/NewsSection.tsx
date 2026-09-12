import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import { apiUrls } from '@/config/api';

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

const NewsSection = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrls.news()}?status=published`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // Get latest 3 published news articles, prioritizing featured ones
            const sortedNews = data.data
              .filter((item: News) => item.status === 'published')
              .sort((a: News, b: News) => {
                // Featured articles first
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                // Then by published date
                return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
              })
              .slice(0, 3); // Only show latest 3
            setNews(sortedNews);
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
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
              Latest News
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest announcements and community updates from our church.
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-red"></div>
              <span className="text-lg text-muted-foreground">Loading latest news...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
              Latest News
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest announcements and community updates from our church.
            </p>
          </div>
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No News Articles Yet</h3>
            <p className="text-muted-foreground">Check back soon for updates!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
            Latest News
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest announcements and community updates from our church.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {news.map((newsItem, index) => (
            <Card key={newsItem.id} className="shadow-soft hover:shadow-medium transition-shadow group">
              {/* Featured badge for the first item if it's featured */}
              {index === 0 && newsItem.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-church-red text-white">Featured</Badge>
                </div>
              )}
              
              {/* News Image */}
              {newsItem.image ? (
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={newsItem.image} 
                    alt={newsItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-church-red/10 to-church-red/5 flex items-center justify-center rounded-t-lg">
                  <Newspaper className="h-12 w-12 text-church-red/50" />
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {newsItem.published_at 
                        ? new Date(newsItem.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : new Date(newsItem.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                      }
                    </span>
                  </div>
                </div>
                
                <CardTitle className="text-lg text-foreground group-hover:text-church-red transition-colors line-clamp-2">
                  <Link to={`/news/${newsItem.slug}`}>{newsItem.title}</Link>
                </CardTitle>
                
                {newsItem.author && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>By {newsItem.author}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {newsItem.summary ? (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {newsItem.summary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {newsItem.content.length > 150 
                      ? `${newsItem.content.substring(0, 150)}...` 
                      : newsItem.content
                    }
                  </p>
                )}
                
                <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-church-red group-hover:text-white group-hover:border-church-red transition-colors">
                  <Link to={`/news/${newsItem.slug}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All News Button */}
        <div className="text-center mt-12">
          <Button asChild variant="elegant" size="lg">
            <Link to="/news">
              View All News Articles
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;












