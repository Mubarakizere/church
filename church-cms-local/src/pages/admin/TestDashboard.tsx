import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Settings,
  BarChart3,
  School,
  Heart,
  Building,
  Crown,
  Handshake,
  Image,
  Edit
} from "lucide-react";

const TestDashboard = () => {
  const [stats, setStats] = useState({
    team_members: 0,
    schools: 0,
    health_centers: 0,
    events: 0
  });

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-church-red text-white transform -translate-x-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
        <div className="flex items-center justify-between h-16 px-4 border-b border-red-600">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link to="/admin/team" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Users className="h-5 w-5 mr-3" />
              Team Management
            </Link>
            <Link to="/admin/services" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Clock className="h-5 w-5 mr-3" />
              Services
            </Link>
            <Link to="/admin/hero-images" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Image className="h-5 w-5 mr-3" />
              Hero Images
            </Link>
            <Link to="/admin/schools" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <School className="h-5 w-5 mr-3" />
              Schools
            </Link>
            <Link to="/admin/health" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Heart className="h-5 w-5 mr-3" />
              Health Centers
            </Link>
            <Link to="/admin/partners" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Handshake className="h-5 w-5 mr-3" />
              Partners
            </Link>
            <Link to="/admin/projects" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Building className="h-5 w-5 mr-3" />
              Projects
            </Link>
            <Link to="/admin/events" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Calendar className="h-5 w-5 mr-3" />
              Events
            </Link>
            <Link to="/admin/content" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <FileText className="h-5 w-5 mr-3" />
              Content
            </Link>
            <Link to="/admin/settings" className="flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-church-red mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Anglican Church of Rwanda, Shyogwe Diocese</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Church Leadership</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.team_members}</div>
                <p className="text-xs text-muted-foreground">Team members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Educational Institutions</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.schools}</div>
                <p className="text-xs text-muted-foreground">Schools and colleges</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Facilities</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.health_centers}</div>
                <p className="text-xs text-muted-foreground">Health centers and posts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events}</div>
                <p className="text-xs text-muted-foreground">Scheduled events</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage church leadership, bishops, archdeacons, and department heads.
                </p>
                <Link to="/admin/team">
                  <Button className="w-full">Manage Team</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Update service times, descriptions, and worship schedules.
                </p>
                <Link to="/admin/services">
                  <Button className="w-full">Manage Services</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Edit page content, announcements, and church information.
                </p>
                <Link to="/admin/content">
                  <Button className="w-full">Manage Content</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
