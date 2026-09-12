import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Calendar, User, Share2, ArrowLeft } from "lucide-react";
import { apiUrls } from "@/config/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface News {
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

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!slug) {
          setError('Invalid news article');
          return;
        }

        const response = await fetch(apiUrls.newsItem(slug));
        
        if (response.ok) {
          const data = await response.json();
          console.log('News article data:', data); // Debug log
          if (data.success && data.data) {
            console.log('News images:', data.data.images); // Debug log
            console.log('News image:', data.data.image); // Debug log
            setNews(data.data);
          } else {
            setError('News article not found');
          }
        } else if (response.status === 404) {
          setError('News article not found');
        } else {
          setError('Failed to load news article');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('An error occurred while loading the news article');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-church-red/5 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-red"></div>
          <span className="text-lg text-muted-foreground">Loading news article...</span>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 min-h-screen bg-gradient-to-br from-background to-church-red/5 flex items-center justify-center">
          <div className="text-center">
            <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">News Article Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/news')} variant="elegant">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Split content into paragraphs for better image interleaving
  const paragraphs = news ? news.content.split('\n').filter(p => p.trim()) : [];
  const additionalImages = news?.images || [];
  
  console.log('Rendering with paragraphs:', paragraphs.length);
  console.log('Additional images:', additionalImages.length, additionalImages);
  
  // Helper function to interleave images with text (news website style)
  const renderContentWithImages = () => {
    const elements = [];
    const totalParagraphs = paragraphs.length;
    const totalImages = additionalImages.length;
    
    // Calculate where to insert images (evenly distributed)
    const imagePositions = totalImages > 0 
      ? Array.from({ length: totalImages }, (_, i) => 
          Math.floor((totalParagraphs / (totalImages + 1)) * (i + 1))
        )
      : [];
    
    let imageIndex = 0;
    
    paragraphs.forEach((paragraph, index) => {
      // Add paragraph
      elements.push(
        <p key={`p-${index}`} className="text-gray-800 text-lg leading-relaxed mb-6">
          {paragraph}
        </p>
      );
      
      // Check if we should insert an image after this paragraph
      if (imagePositions.includes(index + 1) && imageIndex < totalImages) {
        const imageUrl = additionalImages[imageIndex];
        const imageNum = imageIndex;
        elements.push(
          <figure key={`img-${imageNum}`} className="my-8">
            <div 
              className="relative w-full overflow-hidden rounded-lg shadow-lg cursor-pointer group"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              <img 
                src={imageUrl} 
                alt={`${news.title} - Image ${imageNum + 1}`}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
              Click image to view full size
            </figcaption>
          </figure>
        );
        imageIndex++;
      }
    });
    
    // Add any remaining images at the end
    while (imageIndex < totalImages) {
      const imageUrl = additionalImages[imageIndex];
      const imageNum = imageIndex;
      elements.push(
        <figure key={`img-${imageNum}`} className="my-8">
          <div 
            className="relative w-full overflow-hidden rounded-lg shadow-lg cursor-pointer group"
            onClick={() => window.open(imageUrl, '_blank')}
          >
            <img 
              src={imageUrl} 
              alt={`${news.title} - Image ${imageNum + 1}`}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
          <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
            Click image to view full size
          </figcaption>
        </figure>
      );
      imageIndex++;
    }
    
    return elements;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Image (Full Width) */}
      {news.image && (
        <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden mt-16">
          <img 
            src={news.image} 
            alt={news.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Title Overlay on Hero Image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                {news.featured && (
                  <Badge className="bg-church-red text-white text-sm px-3 py-1">Featured Story</Badge>
                )}
                <span className="text-white/90 text-sm">
                  {news.published_at && new Date(news.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                {news.title}
              </h1>
              {news.author && (
                <div className="flex items-center text-white/90">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">By {news.author}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Link to="/" className="hover:text-church-red transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/news" className="hover:text-church-red transition-colors">News</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 truncate">{news.title}</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* If no hero image, show title here */}
            {!news.image && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  {news.featured && (
                    <Badge className="bg-church-red text-white">Featured Story</Badge>
                  )}
                  {news.published_at && (
                    <span className="text-gray-500 text-sm">
                      {new Date(news.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {news.title}
                </h1>
                {news.author && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">By {news.author}</span>
                  </div>
                )}
              </div>
            )}

            {/* Lead/Summary */}
            {news.summary && (
              <div className="bg-gray-50 border-l-4 border-church-red p-6 mb-8 rounded-r">
                <p className="text-xl text-gray-700 leading-relaxed font-serif italic">
                  {news.summary}
                </p>
              </div>
            )}

            {/* Article Body with Interleaved Images */}
            <div className="prose prose-lg max-w-none">
              {renderContentWithImages()}
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              {/* Tags or Categories could go here */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Share2 className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">Share this article</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied to clipboard!');
                    }}
                    size="sm"
                  >
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.print()}
                    size="sm"
                  >
                    Print
                  </Button>
                </div>
              </div>
            </div>

            {/* Back to News CTA */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-church-red/5 to-church-red/10 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Stay Informed</h3>
                <p className="text-gray-600 mb-6">Read more inspiring stories from Shyogwe Diocese</p>
                <Button 
                  variant="elegant"
                  onClick={() => navigate('/news')}
                  size="lg"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  View All News Articles
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default NewsDetail;
