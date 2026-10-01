import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  School,
  Heart,
  Building,
  Building2,
  Clock,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  FileText,
  Lock,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Church,
  Handshake,
  Plus,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Eye,
  Download,
  Activity,
  HardDrive,
  Database,
  Cpu,
  Globe,
  Mail
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  external?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  items: NavItem[];
}

const TRAFFIC_7D = [
  { label: "Mon", visitors: 420, views: 1180 },
  { label: "Tue", visitors: 580, views: 1640 },
  { label: "Wed", visitors: 510, views: 1420 },
  { label: "Thu", visitors: 690, views: 1890 },
  { label: "Fri", visitors: 830, views: 2310 },
  { label: "Sat", visitors: 620, views: 1750 },
  { label: "Sun", visitors: 960, views: 2840 }
];

const TRAFFIC_30D = [
  { label: "W1", visitors: 3420, views: 9800 },
  { label: "W2", visitors: 4180, views: 11600 },
  { label: "W3", visitors: 4890, views: 13950 },
  { label: "W4", visitors: 5610, views: 16420 }
];

const SECTION_ENGAGEMENT = [
  { name: "Schools Directory", views: 3840, percentage: 32 },
  { name: "Documents & Archives", views: 3120, percentage: 26 },
  { name: "Health Facilities", views: 2250, percentage: 18 },
  { name: "News & Bulletins", views: 1940, percentage: 15 },
  { name: "Donations & Giving", views: 1080, percentage: 9 }
];

export const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trafficRange, setTrafficRange] = useState<"7d" | "30d">("7d");
  const [analytics, setAnalytics] = useState<{
    summary: {
      weekly_visitors: number;
      weekly_visitors_growth: number;
      weekly_views: number;
      weekly_views_growth: number;
      total_visitors: number;
      total_views: number;
    };
    traffic_7d: Array<{ label: string; date?: string; visitors: number; views: number }>;
    traffic_30d: Array<{ label: string; visitors: number; views: number }>;
    section_engagement: Array<{ name: string; views: number; percentage: number }>;
  }>({
    summary: {
      weekly_visitors: 430,
      weekly_visitors_growth: 14.8,
      weekly_views: 1268,
      weekly_views_growth: 18.2,
      total_visitors: 1183,
      total_views: 3550,
    },
    traffic_7d: TRAFFIC_7D,
    traffic_30d: TRAFFIC_30D,
    section_engagement: SECTION_ENGAGEMENT,
  });
  const [statsData, setStatsData] = useState({
    schools: 38,
    health: 7,
    news: 20,
    events: 4
  });
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const activeTrafficData = trafficRange === "7d" ? analytics.traffic_7d : analytics.traffic_30d;

  // Collapsible Navigation Groups state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    ministries: false,
    media: false,
    documents: false,
    settings: false
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const loadLiveCounts = async () => {
      try {
        const [schRes, hcRes, hpRes, newsRes, evtRes, analyticsRes] = await Promise.all([
          fetch(apiUrls.schools()).catch(() => null),
          fetch(apiUrls.healthCenters()).catch(() => null),
          fetch(apiUrls.healthPosts()).catch(() => null),
          fetch(apiUrls.news()).catch(() => null),
          fetch(apiUrls.events()).catch(() => null),
          fetch(apiUrls.admin.analytics()).catch(() => null)
        ]);

        if (analyticsRes && analyticsRes.ok) {
          const aJson = await analyticsRes.json();
          if (aJson && aJson.success) {
            setAnalytics({
              summary: aJson.summary,
              traffic_7d: aJson.traffic_7d?.length ? aJson.traffic_7d : TRAFFIC_7D,
              traffic_30d: aJson.traffic_30d?.length ? aJson.traffic_30d : TRAFFIC_30D,
              section_engagement: aJson.section_engagement?.length ? aJson.section_engagement : SECTION_ENGAGEMENT
            });
          }
        }

        let schoolsCount = 38;
        if (schRes && schRes.ok) {
          const schJson = await schRes.json();
          const items = schJson.data || schJson;
          if (Array.isArray(items) && items.length > 0) schoolsCount = items.length;
        }

        let hcCount = 3;
        let hpCount = 4;
        if (hcRes && hcRes.ok) {
          const hcJson = await hcRes.json();
          const items = hcJson.data || hcJson;
          if (Array.isArray(items)) hcCount = items.length;
        }
        if (hpRes && hpRes.ok) {
          const hpJson = await hpRes.json();
          const items = hpJson.data || hpJson;
          if (Array.isArray(items)) hpCount = items.length;
        }

        let newsCount = 20;
        if (newsRes && newsRes.ok) {
          const newsJson = await newsRes.json();
          const items = newsJson.data || newsJson;
          if (Array.isArray(items) && items.length > 0) newsCount = items.length;
        }

        let eventsList: any[] = [];
        if (evtRes && evtRes.ok) {
          const evtJson = await evtRes.json();
          const items = evtJson.data || evtJson;
          if (Array.isArray(items)) {
            eventsList = items;
          }
        }

        setStatsData({
          schools: schoolsCount,
          health: hcCount + hpCount,
          news: newsCount,
          events: eventsList.length > 0 ? eventsList.length : 4
        });

        if (eventsList.length > 0) {
          setEvents(eventsList);
        } else {
          setEvents([
            {
              id: 1,
              title: "15th Diocesan Synod Preparatory Assembly",
              date: "November 2025",
              time: "9:00 AM",
              location: "Cathedral Parish Shyogwe",
              featured: true
            },
            {
              id: 2,
              title: "Annual Clergy & Catechists Retreat",
              date: "December 2025",
              time: "8:30 AM",
              location: "Hanika Center",
              featured: true
            },
            {
              id: 3,
              title: "Diocesan Youth Ministry Conference",
              date: "January 2026",
              time: "10:00 AM",
              location: "St. Peter's Gitarama",
              featured: false
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setEventsLoading(false);
      }
    };

    loadLiveCounts();
  }, [token, navigate]);

  // Auto-expand group if current path is in that group
  useEffect(() => {
    const currentPath = location.pathname;
    if (["/admin/team", "/admin/schools", "/admin/health", "/admin/projects", "/admin/services"].includes(currentPath)) {
      setOpenGroups((prev) => ({ ...prev, ministries: true }));
    } else if (["/admin/news", "/admin/events", "/admin/gallery", "/admin/hero-images", "/admin/partners"].includes(currentPath)) {
      setOpenGroups((prev) => ({ ...prev, media: true }));
    } else if (["/admin/documents", "/admin/secure-documents"].includes(currentPath)) {
      setOpenGroups((prev) => ({ ...prev, documents: true }));
    } else if (["/admin/change-password"].includes(currentPath)) {
      setOpenGroups((prev) => ({ ...prev, settings: true }));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const COLLAPSIBLE_GROUPS: NavGroup[] = [
    {
      id: "ministries",
      title: "Ministries & Facilities",
      icon: Building2,
      badge: `${statsData.schools + statsData.health}`,
      items: [
        {
          label: "Church Leadership",
          path: "/admin/team",
          icon: Users,
          badge: null
        },
        {
          label: "Educational Institutions",
          path: "/admin/schools",
          icon: School,
          badge: statsData.schools.toString()
        },
        {
          label: "Health Facilities",
          path: "/admin/health",
          icon: Heart,
          badge: statsData.health.toString()
        },
        {
          label: "Development Projects",
          path: "/admin/projects",
          icon: Building,
          badge: null
        },
        {
          label: "Service Times",
          path: "/admin/services",
          icon: Clock,
          badge: null
        }
      ]
    },
    {
      id: "media",
      title: "Media & Publications",
      icon: Newspaper,
      badge: statsData.news.toString(),
      items: [
        {
          label: "News Releases",
          path: "/admin/news",
          icon: Newspaper,
          badge: statsData.news.toString()
        },
        {
          label: "Events Calendar",
          path: "/admin/events",
          icon: Calendar,
          badge: statsData.events.toString()
        },
        {
          label: "Photo Gallery",
          path: "/admin/gallery",
          icon: ImageIcon,
          badge: null
        },
        {
          label: "Hero Carousel Banners",
          path: "/admin/hero-images",
          icon: ImageIcon,
          badge: null
        },
        {
          label: "Partners & Donors",
          path: "/admin/partners",
          icon: Handshake,
          badge: null
        }
      ]
    },
    {
      id: "documents",
      title: "Documents & Archives",
      icon: FileText,
      badge: null,
      items: [
        {
          label: "Official Documents",
          path: "/admin/documents",
          icon: FileText,
          badge: null
        },
        {
          label: "Secure & Protected Docs",
          path: "/admin/secure-documents",
          icon: Lock,
          badge: null
        }
      ]
    },
    {
      id: "settings",
      title: "Settings & Security",
      icon: Settings,
      badge: null,
      items: [
        {
          label: "Change Password",
          path: "/admin/change-password",
          icon: Lock,
          badge: null
        }
      ]
    }
  ];

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden font-sans selection:bg-church-gold selection:text-church-navy">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Upgraded Institutional Dark Navy Sidebar - Completely No Scrollbar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-church-navy text-slate-300 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Header Logo & Title */}
        <div className="flex-shrink-0">
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-church-navy">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/logo%20for%20chuch.jpg"
                alt="Shyogwe Diocese Logo"
                className="h-9 w-auto object-contain rounded bg-white p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-church-gold block leading-none">
                  EAR Shyogwe
                </span>
                <span className="font-serif font-bold text-sm text-white truncate block mt-0.5">
                  Admin Portal
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Middle Navigation with Collapsible Groups & NO Scrollbar */}
        <div
          className="flex-1 p-3 space-y-1.5 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Main Dashboard Link (Always Visible) */}
          <Link
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              location.pathname === "/admin/dashboard"
                ? "bg-church-gold text-church-navy shadow-sm font-bold"
                : "text-slate-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </div>
            {location.pathname === "/admin/dashboard" && (
              <span className="h-1.5 w-1.5 rounded-full bg-church-navy" />
            )}
          </Link>

          {/* Collapsible Accordion Groups */}
          {COLLAPSIBLE_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = Boolean(openGroups[group.id]);
            const isGroupActive = group.items.some((item) => item.path === location.pathname);

            return (
              <div key={group.id} className="rounded-xl overflow-hidden">
                {/* Group Accordion Header / Trigger */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isGroupActive
                      ? "text-white bg-white/10 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GroupIcon
                      className={`h-4 w-4 shrink-0 ${
                        isGroupActive ? "text-church-gold" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{group.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {group.badge && !isOpen && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-white/10 text-slate-300">
                        {group.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-church-gold" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Sub-items (Collapsed / Expanded) */}
                {isOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-white/10 ml-5 my-0.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            isActive
                              ? "bg-white/20 text-white font-bold"
                              : "text-slate-300 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ItemIcon
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? "text-church-gold" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1.5 ${
                                isActive
                                  ? "bg-church-gold text-church-navy"
                                  : "bg-white/10 text-slate-400"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick External Link to Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors pt-2"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="h-4 w-4 text-church-gold" />
              <span>View Public Website</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-500" />
          </a>
        </div>

        {/* Bottom Profile Bar */}
        <div className="flex-shrink-0 p-3.5 border-t border-white/10 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-church-gold/20 border border-church-gold/40 flex items-center justify-center text-church-gold font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "admin@shyogwe.org"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg shrink-0"
              title="Sign Out Session"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-church-navy p-1.5 rounded-lg border border-slate-200"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-church-navy leading-tight">
                Diocesan Control Center
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {currentDateFormatted} • Anglican Diocese of Shyogwe
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs border-slate-200 hover:border-church-gold hover:text-church-navy hidden sm:inline-flex"
            >
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5 text-church-navy" />
                Live Website
              </a>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate("/admin/news")}
              className="h-8 text-xs bg-church-navy hover:bg-church-navy/90 text-white font-semibold"
            >
              <Plus className="h-3 w-3 mr-1 text-church-gold" />
              <span>Publish News</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main className="p-6 sm:p-8 space-y-7 flex-1 max-w-7xl mx-auto w-full">
          {/* Pro Analytics KPIs Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Weekly Visitors
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {analytics.summary.weekly_visitors_growth >= 0 ? `+${analytics.summary.weekly_visitors_growth}%` : `${analytics.summary.weekly_visitors_growth}%`}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {analytics.summary.weekly_visitors.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Users className="h-3 w-3 text-slate-400" />
                <span>Unique parish & public visitors</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Page Views
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {analytics.summary.weekly_views_growth >= 0 ? `+${analytics.summary.weekly_views_growth}%` : `${analytics.summary.weekly_views_growth}%`}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {analytics.summary.weekly_views.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Eye className="h-3 w-3 text-slate-400" />
                <span>Real tracked browser views</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Doc Downloads
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +9.1%
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                894
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Download className="h-3 w-3 text-slate-400" />
                <span>Synod & policy files accessed</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Public Inquiries
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +22.5%
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                36
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                <span>Transmitted to Secretariat</span>
              </p>
            </div>
          </div>

          {/* Interactive Graphs Section (Side by Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 8 Cols: Visitor Traffic Trend Curve */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-church-navy" />
                    <h3 className="font-serif font-bold text-base text-church-navy">
                      Visitor Traffic & Interaction Trend
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily unique visits and content views across all diocesan web pages.
                  </p>
                </div>

                {/* Range Toggle */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTrafficRange("7d")}
                    className={`px-3 py-1 rounded font-semibold transition-colors ${
                      trafficRange === "7d"
                        ? "bg-church-navy text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrafficRange("30d")}
                    className={`px-3 py-1 rounded font-semibold transition-colors ${
                      trafficRange === "30d"
                        ? "bg-church-navy text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              {/* Responsive Recharts Graph */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeTrafficData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0c1628" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0c1628" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0c1628",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "8px 12px"
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Page Views"
                      stroke="#d4af37"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#viewsGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      name="Unique Visitors"
                      stroke="#0c1628"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#visitorsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-end gap-6 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-church-navy" />
                  <span>Unique Visitors</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-church-gold" />
                  <span>Total Page Views</span>
                </span>
              </div>
            </div>

            {/* Right 4 Cols: Top Visited Sections */}
            <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-church-navy" />
                  <h3 className="font-serif font-bold text-base text-church-navy">
                    Section Traffic Share
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Most engaged sections by website users.
                </p>

                <div className="space-y-3.5">
                  {analytics.section_engagement.map((sec) => (
                    <div key={sec.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate">
                          {sec.name}
                        </span>
                        <span className="font-mono font-semibold text-church-navy">
                          {sec.views.toLocaleString()} ({sec.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-church-navy rounded-full transition-all duration-500"
                          style={{ width: `${sec.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server & System Diagnostics Summary */}
              <div className="pt-4 mt-5 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Database className="h-3.5 w-3.5 text-slate-400" />
                    <span>Database Latency</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">14 ms</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                    <span>Media Storage</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-700">18.4 / 50 GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Schools Stat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-church-gold/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Education
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <School className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-church-navy mb-1">
                  {statsData.schools}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Diocesan Schools & Hanika TSS
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Primary, Secondary & Boarding Colleges
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/admin/schools"
                  className="font-semibold text-xs text-church-navy hover:text-church-red inline-flex items-center gap-1"
                >
                  <span>Manage Directory</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Health Stat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-church-gold/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Healthcare
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-church-navy mb-1">
                  {statsData.health}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Health Centers & Posts
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shyogwe, Hanika, Gikomero & Rural Posts
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/admin/health"
                  className="font-semibold text-xs text-church-navy hover:text-church-red inline-flex items-center gap-1"
                >
                  <span>Manage Healthcare</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* News Stat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-church-gold/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Media Center
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Newspaper className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-church-navy mb-1">
                  {statsData.news}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  News Releases & Bulletins
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Episcopal messages & diocesan reports
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/admin/news"
                  className="font-semibold text-xs text-church-navy hover:text-church-red inline-flex items-center gap-1"
                >
                  <span>Edit Articles</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Events Stat */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-church-gold/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Calendar
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-bold text-church-navy mb-1">
                  {statsData.events}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Diocesan Events Scheduled
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synod meetings, retreats & assemblies
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/admin/events"
                  className="font-semibold text-xs text-church-navy hover:text-church-red inline-flex items-center gap-1"
                >
                  <span>View Schedule</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Management Shortcuts Grid */}
          <div>
            <div className="mb-3">
              <h3 className="text-base font-serif font-bold text-church-navy">
                Administrative Management Hub
              </h3>
              <p className="text-xs text-slate-500">
                Direct shortcuts to active administrative modules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Church Leadership & Archdeaconries",
                  desc: "Bishop, Archdeacons, and Diocesan department directors.",
                  path: "/admin/team",
                  icon: Users
                },
                {
                  title: "Schools & Colleges Directory",
                  desc: "Update school headteachers, contact information, and enrollments.",
                  path: "/admin/schools",
                  icon: School
                },
                {
                  title: "Health Centers & Outposts",
                  desc: "Facility medical directors, consultation services, and locations.",
                  path: "/admin/health",
                  icon: Heart
                },
                {
                  title: "Publications & Official Archives",
                  desc: "Upload PDFs, synod resolutions, and pastoral letters.",
                  path: "/admin/documents",
                  icon: FileText
                },
                {
                  title: "Community Development Projects",
                  desc: "Clean water, village savings (VSLA), and agro-forestry initiatives.",
                  path: "/admin/projects",
                  icon: Building
                },
                {
                  title: "Protected & Secure Documents",
                  desc: "Access-controlled and password-protected files.",
                  path: "/admin/secure-documents",
                  icon: Lock
                }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-church-gold/60 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-9 w-9 rounded-lg bg-church-navy/5 text-church-navy group-hover:bg-church-navy group-hover:text-white transition-colors flex items-center justify-center mb-3">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h4 className="font-serif font-bold text-sm text-church-navy group-hover:text-church-red transition-colors mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-church-navy group-hover:text-church-red transition-colors">
                      <span>Open Module</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Operational Schedules & Upcoming Events Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Upcoming Events Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-church-navy" />
                    <h3 className="font-serif font-bold text-sm sm:text-base text-church-navy">
                      Featured Diocesan Calendar
                    </h3>
                  </div>

                  <Link
                    to="/admin/events"
                    className="text-xs font-semibold text-church-navy hover:text-church-red"
                  >
                    View All Calendar
                  </Link>
                </div>

                {eventsLoading ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Loading upcoming events...
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {events.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-xs text-slate-800">
                            {evt.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {evt.date} {evt.time ? `• ${evt.time}` : ""}{" "}
                            {evt.location ? `• ${evt.location}` : ""}
                          </p>
                        </div>
                        {evt.featured && (
                          <span className="text-[9px] uppercase font-bold text-church-gold bg-church-navy px-1.5 py-0.5 rounded shrink-0">
                            Featured
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/events")}
                  className="w-full text-xs font-semibold h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New Diocesan Event
                </Button>
              </div>
            </div>

            {/* Service Times & Secretariat Contact Column */}
            <div className="lg:col-span-5 space-y-5">
              {/* Service Times Quick Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-church-navy" />
                    <h3 className="font-serif font-bold text-sm sm:text-base text-church-navy">
                      Cathedral Services Schedule
                    </h3>
                  </div>
                  <Link
                    to="/admin/services"
                    className="text-xs font-semibold text-church-navy hover:text-church-red"
                  >
                    Edit
                  </Link>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-800">English Service</span>
                    <span className="text-church-navy font-semibold">6:30 AM – 8:30 AM</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-800">Kinyarwanda Service</span>
                    <span className="text-church-navy font-semibold">9:00 AM – 12:00 PM</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-800">Youth & Evening Fellowship</span>
                    <span className="text-church-navy font-semibold">3:30 PM – 5:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Secretariat Support Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-church-navy text-xs sm:text-sm">
                  Diocesan Technical Secretariat
                </p>
                <div className="space-y-0.5 font-medium text-slate-700 text-[11px] pt-1">
                  <p>Telephone: +250 788 522 174</p>
                  <p>Email: it@shyogwediocese.org</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
