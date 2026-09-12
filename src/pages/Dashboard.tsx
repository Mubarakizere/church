import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PageEditor from "@/components/admin/PageEditor";
import EventEditor from "@/components/admin/EventEditor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import {
  Users,
  Calendar,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  LogOut,
  User,
  ExternalLink,
  Save,
  Loader2
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [isPageEditorOpen, setIsPageEditorOpen] = useState(false);
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // State for API data
  const [pages, setPages] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState({
    pages: true,
    events: true
  });
  const [error, setError] = useState({
    pages: null,
    events: null
  });

  // Stats with dynamic values from API data
  const stats = [
    { title: "Total Members", value: "0", change: "--", icon: Users, path: "/admin/members" },
    { title: "This Week's Events", value: events.filter(e => e.status === 'published').length.toString(), change: "--", icon: Calendar, path: "/admin/events" },
    { title: "Active Pages", value: pages.filter(p => p.status === 'published').length.toString(), change: "--", icon: FileText, path: "/admin/pages" },
    { title: "Website Views", value: "0", change: "--", icon: TrendingUp, path: "/admin/analytics" },
  ];
  
  // Fetch pages from API
  useEffect(() => {
    const fetchPages = async () => {
      if (!token) return;
      
      try {
        setIsLoading(prev => ({ ...prev, pages: true }));
        const response = await fetch(apiUrls.pages(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pages: ${response.status}`);
        }
        
        const data = await response.json();
        // Transform data to match our component's expected format
        const formattedPages = data.map(page => ({
          id: page.id.toString(),
          title: page.title,
          status: page.status || 'published',
          lastModified: page.updated_at ? format(new Date(page.updated_at), 'MMM d, yyyy') : 'Unknown',
          content: page.content || ''
        }));
        
        setPages(formattedPages);
        setError(prev => ({ ...prev, pages: null }));
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError(prev => ({ ...prev, pages: err.message }));
        toast({ 
          title: "Error fetching pages", 
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(prev => ({ ...prev, pages: false }));
      }
    };
    
    fetchPages();
  }, [token, toast]);
  
  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return;
      
      try {
        setIsLoading(prev => ({ ...prev, events: true }));
        const response = await fetch(apiUrls.events(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }
        
        const data = await response.json();
        // Transform data to match our component's expected format
        const formattedEvents = data.map(event => ({
          id: event.id.toString(),
          title: event.title,
          date: event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBD',
          status: event.status || 'published',
          description: event.description || ''
        }));
        
        setEvents(formattedEvents);
        setError(prev => ({ ...prev, events: null }));
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(prev => ({ ...prev, events: err.message }));
        toast({ 
          title: "Error fetching events", 
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(prev => ({ ...prev, events: false }));
      }
    };
    
    fetchEvents();
  }, [token, toast]);

  const handleSavePage = async (pageData: any) => {
    if (!token) {
      toast({ 
        title: "Authentication error", 
        description: "You must be logged in to perform this action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Format the data for the API
      const apiData = {
        title: pageData.title,
        content: pageData.content,
        status: pageData.status.toLowerCase()
      };
      
      let response;
      let method;
      let url = apiUrls.pages();
      
      if (editingPage) {
        // Update existing page
        method = 'PUT';
        url = `${url}/${pageData.id}`;
      } else {
        // Create new page
        method = 'POST';
      }
      
      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingPage ? 'update' : 'create'} page: ${response.status}`);
      }
      
      const savedPage = await response.json();
      
      // Update local state
      if (editingPage) {
        setPages(pages.map(p => p.id === pageData.id ? {
          ...p,
          title: savedPage.title,
          content: savedPage.content,
          status: savedPage.status,
          lastModified: savedPage.updated_at ? format(new Date(savedPage.updated_at), 'MMM d, yyyy') : 'Just now'
        } : p));
        toast({ title: "Page updated successfully!" });
      } else {
        const newPage = {
          id: savedPage.id.toString(),
          title: savedPage.title,
          content: savedPage.content,
          status: savedPage.status,
          lastModified: savedPage.created_at ? format(new Date(savedPage.created_at), 'MMM d, yyyy') : 'Just now'
        };
        setPages([...pages, newPage]);
        toast({ title: "Page created successfully!" });
      }
    } catch (err) {
      console.error('Error saving page:', err);
      toast({ 
        title: `Error ${editingPage ? 'updating' : 'creating'} page`, 
        description: err.message,
        variant: "destructive"
      });
    }
    
    setIsPageEditorOpen(false);
    setEditingPage(null);
  };

  const handleSaveEvent = async (eventData: any) => {
    if (!token) {
      toast({ 
        title: "Authentication error", 
        description: "You must be logged in to perform this action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Format the data for the API
      const apiData = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date, // Make sure this is in YYYY-MM-DD format for the API
        status: eventData.status.toLowerCase()
      };
      
      let response;
      let method;
      let url = apiUrls.events();
      
      if (editingEvent) {
        // Update existing event
        method = 'PUT';
        url = `${url}/${eventData.id}`;
      } else {
        // Create new event
        method = 'POST';
      }
      
      response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingEvent ? 'update' : 'create'} event: ${response.status}`);
      }
      
      const savedEvent = await response.json();
      
      // Update local state
      if (editingEvent) {
        setEvents(events.map(e => e.id === eventData.id ? {
          ...e,
          title: savedEvent.title,
          description: savedEvent.description,
          date: savedEvent.date ? format(new Date(savedEvent.date), 'MMM d, yyyy') : 'TBD',
          status: savedEvent.status
        } : e));
        toast({ title: "Event updated successfully!" });
      } else {
        const newEvent = {
          id: savedEvent.id.toString(),
          title: savedEvent.title,
          description: savedEvent.description,
          date: savedEvent.date ? format(new Date(savedEvent.date), 'MMM d, yyyy') : 'TBD',
          status: savedEvent.status
        };
        setEvents([...events, newEvent]);
        toast({ title: "Event created successfully!" });
      }
    } catch (err) {
      console.error('Error saving event:', err);
      toast({ 
        title: `Error ${editingEvent ? 'updating' : 'creating'} event`, 
        description: err.message,
        variant: "destructive"
      });
    }
    
    setIsEventEditorOpen(false);
    setEditingEvent(null);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!token) {
      toast({ 
        title: "Authentication error", 
        description: "You must be logged in to perform this action",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }
    
    try {
      const response = await fetch(`${apiUrls.pages()}/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete page: ${response.status}`);
      }
      
      // Update local state
      setPages(pages.filter(p => p.id !== pageId));
      toast({ title: "Page deleted successfully!" });
    } catch (err) {
      console.error('Error deleting page:', err);
      toast({ 
        title: "Error deleting page", 
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) {
      toast({ 
        title: "Authentication error", 
        description: "You must be logged in to perform this action",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      const response = await fetch(`${apiUrls.events()}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.status}`);
      }
      
      // Update local state
      setEvents(events.filter(e => e.id !== eventId));
      toast({ title: "Event deleted successfully!" });
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({ 
        title: "Error deleting event", 
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleEditPage = (page: any) => {
    setEditingPage(page);
    setIsPageEditorOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEventEditorOpen(true);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Signed out',
      description: 'You have been logged out successfully.'
    });
    navigate('/login');
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
      
      <EventEditor 
        event={editingEvent}
        isOpen={isEventEditorOpen}
        onClose={() => {
          setIsEventEditorOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Church Admin Dashboard</h1>
              <p className="text-muted-foreground">St. Matthew's Anglican Church</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => window.open('/', '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                View Website
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="flex items-center space-x-3 border border-border rounded-full px-3 py-1">
                <Avatar className="h-8 w-8">
                  <User className="h-5 w-5 text-church-navy" />
                </Avatar>
                <div className="hidden sm:block text-sm">
                  <div className="font-medium">{user?.name || 'Administrator'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || 'admin@church.com'}</div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link to={stat.path} key={index} className="block">
              <Card className="shadow-soft hover:shadow-medium transform hover:-translate-y-1 transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-church-red">
                        {stat.change} this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-church-cream/20 rounded-lg p-1">
            <TabsTrigger value="content" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Content</TabsTrigger>
            <TabsTrigger value="events" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Events</TabsTrigger>
            <TabsTrigger value="members" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Members</TabsTrigger>
            <TabsTrigger value="settings" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Settings</TabsTrigger>
          </TabsList>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Website Content</h2>
              <div className="flex gap-2">
                <Button variant="elegant" onClick={() => setIsPageEditorOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/pages')} className="text-church-navy">
                  <ExternalLink className="h-4 w-4 mr-2" /> Manage All Pages
                </Button>
              </div>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Pages & Content</CardTitle>
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
          </TabsContent>

          {/* Events Management */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Events Management</h2>
              <div className="flex gap-2">
                <Button variant="elegant" onClick={() => setIsEventEditorOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/events')} className="text-church-navy">
                  <ExternalLink className="h-4 w-4 mr-2" /> Manage All Events
                </Button>
              </div>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.date && /^\d{4}-\d{2}-\d{2}/.test(event.date) 
                            ? format(new Date(event.date), 'MMM d, yyyy')
                            : event.date}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Management */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Members Management</h2>
              <div className="flex gap-2">
                <Button variant="elegant">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/members')} className="text-church-navy">
                  <ExternalLink className="h-4 w-4 mr-2" /> Manage All Members
                </Button>
              </div>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Member Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Member management coming soon</p>
                  <p className="text-sm">This feature will be available when connected to Supabase</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Church Settings</h2>
              <div className="flex gap-2">
                <Button className="bg-church-gold hover:bg-church-gold/90 text-white">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/analytics')} className="text-church-navy">
                  <TrendingUp className="h-4 w-4 mr-2" /> View Analytics
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Church Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="churchName">Church Name</Label>
                    <Input id="churchName" defaultValue="Grace Community Church" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Faith Street, Cityville" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="info@gracechurch.org" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sundayService">Sunday Service</Label>
                    <Input id="sundayService" defaultValue="9:00 AM & 11:00 AM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wednesdayService">Wednesday Bible Study</Label>
                    <Input id="wednesdayService" defaultValue="7:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youthService">Youth Service</Label>
                    <Input id="youthService" defaultValue="Fridays at 6:30 PM" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;