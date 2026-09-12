import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Newspaper, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NewsEditor from "@/components/admin/NewsEditor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";

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

const AdminNews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isNewsEditorOpen, setIsNewsEditorOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch news from database
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        console.log('Fetching news from API...');
        const response = await fetch(apiUrls.news());
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          if (data.success && Array.isArray(data.data)) {
            console.log('Setting news:', data.data);
            setNews(data.data);
          } else {
            console.error('Invalid response format:', data);
            setNews([]);
          }
        } else {
          console.error('Failed to fetch news:', response.status);
          setNews([]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleCreateNews = () => {
    setEditingNews(null);
    setIsNewsEditorOpen(true);
  };

  const handleEditNews = (newsItem: News) => {
    setEditingNews(newsItem);
    setIsNewsEditorOpen(true);
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    try {
      const response = await fetch(apiUrls.newsItem(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "News article deleted successfully",
        });
        // Refresh the news list
        setNews(news.filter(item => item.id !== id));
      } else {
        toast({
          title: "Error",
          description: "Failed to delete news article",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the news article",
        variant: "destructive",
      });
    }
  };

  const handleSaveNews = async (newsData: News) => {
    try {
      const isEditing = !!editingNews;
      const url = isEditing ? apiUrls.newsItem(newsData.id) : apiUrls.news();
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: isEditing 
            ? "News article updated successfully" 
            : "News article created successfully",
        });
        
        setIsNewsEditorOpen(false);
        
        // Refresh the news list
        const newsResponse = await fetch(apiUrls.news());
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.success && Array.isArray(newsData.data)) {
            setNews(newsData.data);
          }
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to save news article",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the news article",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">News Management</h1>
            <p className="text-sm text-muted-foreground">Create and manage news articles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="elegant" onClick={handleCreateNews}>
              <Plus className="h-4 w-4 mr-2" />
              New News Article
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>News Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-church-red mr-3" />
                <span className="text-muted-foreground">Loading news...</span>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-8">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No news articles found</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first news article.</p>
                <Button onClick={handleCreateNews} className="bg-church-red hover:bg-church-red/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create News Article
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((newsItem) => (
                  <div key={newsItem.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      {newsItem.image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={newsItem.image} 
                            alt={newsItem.title}
                            className="w-16 h-16 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{newsItem.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {newsItem.published_at ? new Date(newsItem.published_at).toLocaleDateString() : 'Not published'}
                        </p>
                        {newsItem.author && <p className="text-sm text-muted-foreground">By {newsItem.author}</p>}
                        {newsItem.summary && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-xl line-clamp-2">{newsItem.summary}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusBadgeVariant(newsItem.status)}>
                        {newsItem.status}
                      </Badge>
                      {newsItem.featured && (
                        <Badge variant="outline" className="text-church-red border-church-red">
                          Featured
                        </Badge>
                      )}
                      <div className="inline-flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/news/${newsItem.slug}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditNews(newsItem)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteNews(newsItem.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* News Editor Modal */}
      <NewsEditor
        news={editingNews}
        isOpen={isNewsEditorOpen}
        onClose={() => setIsNewsEditorOpen(false)}
        onSave={handleSaveNews}
      />
    </div>
  );
};

export default AdminNews;












