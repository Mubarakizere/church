import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, Download, RefreshCw, Users, FileText, Clock, MousePointer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d");
  
  // Mock data for demonstration
  const pageViews = [
    { page: "/", views: 1245, avgTime: "1:32" },
    { page: "/about", views: 867, avgTime: "2:15" },
    { page: "/events", views: 654, avgTime: "3:42" },
    { page: "/contact", views: 432, avgTime: "1:05" },
    { page: "/services", views: 321, avgTime: "2:38" },
  ];

  const visitorData = [
    { date: "Mon", visitors: 120 },
    { date: "Tue", visitors: 145 },
    { date: "Wed", visitors: 132 },
    { date: "Thu", visitors: 167 },
    { date: "Fri", visitors: 189 },
    { date: "Sat", visitors: 98 },
    { date: "Sun", visitors: 210 },
  ];

  const stats = [
    { title: "Total Visitors", value: "1,234", change: "+12%", icon: Users },
    { title: "Page Views", value: "5,678", change: "+8%", icon: FileText },
    { title: "Avg. Session", value: "2:45", change: "+15%", icon: Clock },
    { title: "Bounce Rate", value: "42%", change: "-3%", icon: MousePointer },
  ];

  const handleRefresh = () => {
    // In a real app, this would fetch fresh analytics data
    console.log("Refreshing analytics data...");
  };

  const handleExport = () => {
    // In a real app, this would export analytics data to CSV/PDF
    console.log("Exporting analytics data...");
  };

  // Simple bar chart component
  const BarChart = ({ data }) => (
    <div className="flex items-end h-40 gap-2 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div 
            className="w-full bg-church-gold/70 rounded-t" 
            style={{ height: `${(item.visitors / 210) * 100}%` }}
          ></div>
          <div className="text-xs mt-2 text-muted-foreground">{item.date}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-section">
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Site Analytics</h1>
            <p className="text-sm text-muted-foreground">Traffic and engagement overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-church-gold">
                      {stat.change} from previous period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-church-navy" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="visitors" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-church-cream/20 rounded-lg p-1">
            <TabsTrigger value="visitors" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Visitors</TabsTrigger>
            <TabsTrigger value="pages" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Pages</TabsTrigger>
            <TabsTrigger value="sources" className="py-2 rounded-md text-church-navy font-semibold hover:bg-church-gold/10 data-[state=active]:bg-church-gold/20 data-[state=active]:text-church-navy">Sources</TabsTrigger>
          </TabsList>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Visitor Traffic</CardTitle>
                <CardDescription>Daily visitor count for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={visitorData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most viewed pages during the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-2">Page</th>
                        <th className="py-2 text-right">Views</th>
                        <th className="py-2 text-right">Avg. Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageViews.map((page, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-3">
                            <div className="font-medium text-foreground">{page.page}</div>
                          </td>
                          <td className="py-3 text-right">{page.views}</td>
                          <td className="py-3 text-right">{page.avgTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Traffic source data will appear here.</p>
                  <p className="text-sm">Connect Google Analytics for detailed source information.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAnalytics;
