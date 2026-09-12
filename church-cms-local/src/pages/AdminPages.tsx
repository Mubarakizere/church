import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageEditor from "@/components/admin/PageEditor";
import { useToast } from "@/hooks/use-toast";

const AdminPages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPageEditorOpen, setIsPageEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  
  // Mock data for demonstration
  const [pages, setPages] = useState([
    { id: "1", title: "About Us", status: "published", lastModified: "2 days ago", content: "Welcome to our church..." },
    { id: "2", title: "Service Times", status: "published", lastModified: "1 week ago", content: "Our services are..." },
    { id: "3", title: "Contact Information", status: "published", lastModified: "3 days ago", content: "Reach out to us..." },
    { id: "4", title: "Pastor's Message", status: "draft", lastModified: "1 day ago", content: "This month's message..." },
  ]);

  const handleSavePage = (pageData) => {
    if (editingPage) {
      setPages(pages.map(p => p.id === pageData.id ? pageData : p));
      toast({ title: "Page updated successfully!" });
    } else {
      setPages([...pages, pageData]);
      toast({ title: "Page created successfully!" });
    }
    setEditingPage(null);
    setIsPageEditorOpen(false);
  };

  const handleDeletePage = (pageId) => {
    setPages(pages.filter(p => p.id !== pageId));
    toast({ title: "Page deleted successfully!" });
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setIsPageEditorOpen(true);
  };

  const handleViewPage = (pageId) => {
    // In a real app, this would navigate to the public view of the page
    toast({ title: "Viewing page", description: `Page ID: ${pageId}` });
  };

  return (
    <div className="min-h-screen bg-gradient-section">
      <PageEditor 
        page={editingPage}
        isOpen={isPageEditorOpen}
        onClose={() => {
          setIsPageEditorOpen(false);
          setEditingPage(null);
        }}
        onSave={handleSavePage}
      />
      
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pages & Content</h1>
            <p className="text-sm text-muted-foreground">Create, edit, and manage site pages</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="elegant" onClick={() => setIsPageEditorOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Page</th>
                    <th className="py-2 hidden md:table-cell">Last modified</th>
                    <th className="py-2 text-right">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3 align-top">
                        <div className="font-medium text-foreground">{page.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 max-w-xl line-clamp-2">{page.content}</div>
                      </td>

                      <td className="py-3 hidden md:table-cell text-muted-foreground align-top">{page.lastModified}</td>

                      <td className="py-3 text-right align-top">
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                          {page.status}
                        </Badge>
                      </td>

                      <td className="py-3 text-right align-top">
                        <div className="inline-flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewPage(page.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditPage(page)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPages;
