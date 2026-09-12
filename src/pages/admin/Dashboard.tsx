import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { apiUrls } from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  School,
  Heart,
  Building,
  Crown,
  Menu,
  X,
  Handshake,
  Image,
  Edit,
  Newspaper,
  Lock
} from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();

  useEffect(() => {
    // If no token, redirect to login
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Populate user from auth context
    if (authUser) {
      setUser(authUser);
    }
  }, [navigate, token, authUser]);

  const handleLogout = () => {
    // Use the application's logout flow if available. Fallback: clear stored auth keys.
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate("/admin/login");
  };

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin/dashboard", active: true },
    { icon: Crown, label: "Church Leadership", path: "/admin/team", description: "Bishop, Archdeacons & Departments" },
    { icon: Clock, label: "Service Times", path: "/admin/services", description: "Worship schedule management" },
    { icon: School, label: "Educational Institutions", path: "/admin/schools", description: "32 Schools & Universities" },
    { icon: Heart, label: "Health Facilities", path: "/admin/health", description: "Health Centers & Posts" },
    { icon: Building, label: "Projects", path: "/admin/projects", description: "Development initiatives" },
    // Removed "Website Content" - this link was non-functional and confusing to admins
    { icon: Calendar, label: "Events", path: "/admin/events", description: "Church events management" },
    { icon: Newspaper, label: "News", path: "/admin/news", description: "News articles management" },
    { icon: Image, label: "Gallery", path: "/admin/gallery", description: "Photo gallery management" },
    { icon: Image, label: "Hero Images", path: "/admin/hero-images", description: "Homepage carousel management" },
    { icon: FileText, label: "Documents", path: "/admin/documents", description: "PDF documents management" },
    { icon: Lock, label: "Secure Documents", path: "/admin/secure-documents", description: "Password-protected documents" },
    { icon: Settings, label: "System Settings", path: "/admin/settings", description: "Website configuration" },
  ];

  const stats = [
    {
      title: "Church Leadership",
      value: "32",
      icon: Crown,
      color: "bg-purple-500",
      description: "Bishop, Archdeacons & Department Heads",
      details: "1 Bishop + 6 Archdeacons + 9 Departments"
    },
    {
      title: "Educational Institutions",
      value: "32",
      icon: School,
      color: "bg-blue-500",
      description: "Complete Educational System",
      details: "6 ECD + 9 Primary + 15 Day + 8 Boarding + 1 University"
    },
    {
      title: "Health Facilities",
      value: "7",
      icon: Heart,
      color: "bg-green-500",
      description: "Healthcare Services",
      details: "3 Health Centers + 4 Health Posts"
    },
    {
      title: "Service Times",
      value: "3",
      icon: Clock,
      color: "bg-red-500",
      description: "Weekly Worship Services",
      details: "English, Kinyarwanda & Mixed Services"
    },
  ];

  // Events state and fetch
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(apiUrls.events());
        if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
        const data = await res.json();
        const formatted = (data.data || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time || '',
          description: e.description || '',
          featured: !!e.featured,
        }));
        setEvents(formatted);
        setEventsError(null);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setEventsError(err.message || 'Failed to fetch events');
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (!user) {
    return <div className="min-h-screen bg-gradient-section flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h2 className="text-xl font-bold text-church-red">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        <nav className="flex-1 overflow-y-auto py-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-start px-4 py-2.5 text-gray-700 hover:bg-gray-100 hover:text-church-red transition-colors group ${item.active ? 'bg-red-50 text-church-red border-r-4 border-church-red' : ''
                }`}
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm leading-tight">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 group-hover:text-gray-600 mt-0.5 leading-tight">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </nav>


        <div className="absolute bottom-0 w-full p-3 border-t bg-white">
          <div className="flex items-center mb-2">
            <div className="w-9 h-9 bg-church-red rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">{(user?.username || user?.name || 'A').charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700 truncate">{user?.username || user?.name || user?.email || 'Administrator'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <Link
            to="/admin/change-password"
            className="flex items-center justify-center w-full mb-1.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 hover:text-church-red transition-colors rounded-md border border-gray-200"
          >
            <Lock className="h-3 w-3 mr-1.5" />
            Change Password
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full border-church-red text-church-red hover:bg-church-red hover:text-white text-xs py-1.5"
          >
            <LogOut className="h-3 w-3 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="text-sm text-gray-500">
              Welcome back, {user.username}
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full ${stat.color} flex-shrink-0`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 mb-1">{stat.description}</p>
                      <p className="text-xs text-gray-400">{stat.details}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Church Information & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-church-red">Anglican Church of Rwanda</CardTitle>
                <p className="text-sm text-gray-600">Shyogwe Diocese Administration</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Current Service Schedule</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• English Service: 6:30 AM - 8:30 AM</div>
                    <div>• Kinyarwanda Service: 9:00 AM - 12:00 PM</div>
                    <div>• Mixed Service: 3:30 PM - 5:30 PM</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Ministry Overview</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• 32 Educational Institutions</div>
                    <div>• 7 Health Facilities</div>
                    <div>• 16 Church Leadership Positions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Management Actions</CardTitle>
                <p className="text-sm text-gray-600">Updated: Partners management added</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-church-red hover:bg-church-red/90" asChild>
                  <a href="/admin/team">
                    <Crown className="h-4 w-4 mr-2" />
                    Manage Church Leadership
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/partners'}
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Partners & Logos
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/admin/services">
                    <Clock className="h-4 w-4 mr-2" />
                    Update Service Times
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/admin/schools">
                    <School className="h-4 w-4 mr-2" />
                    Manage Schools
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/admin/health">
                    <Heart className="h-4 w-4 mr-2" />
                    Health Facilities
                  </a>
                </Button>

              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Featured Events</CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <p className="text-sm text-gray-600">Loading featured events...</p>
                ) : (
                  <div className="space-y-3">
                    {events.filter(e => e.featured).length === 0 ? (
                      <p className="text-sm text-gray-600">No featured events at the moment.</p>
                    ) : (
                      events.filter(e => e.featured).slice(0, 2).map((evt) => (
                        <div key={evt.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-gray-800">{evt.title}</div>
                          <div className="text-sm text-gray-600">{evt.date}{evt.time ? ` • ${evt.time}` : ''}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
