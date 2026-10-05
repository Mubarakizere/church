import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  School,
  Heart,
  Building,
  Clock,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  FileText,
  Lock,
  Settings,
  LogOut,
  ExternalLink,
  X,
  ChevronDown,
  ArrowRight,
  Handshake
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  items: NavItem[];
}

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    ministries: true,
    media: false,
    documents: false,
    settings: false
  });

  const [stats, setStats] = useState({
    schools: 38,
    health: 7,
    news: 20,
    events: 9,
    gallery: 32,
    heroImages: 5
  });

  useEffect(() => {
    // Auto-expand group that contains current path
    const current = location.pathname;
    if (["/admin/team", "/admin/schools", "/admin/health", "/admin/projects", "/admin/services"].includes(current)) {
      setOpenGroups((prev) => ({ ...prev, ministries: true }));
    } else if (["/admin/news", "/admin/events", "/admin/gallery", "/admin/hero-images", "/admin/partners"].includes(current)) {
      setOpenGroups((prev) => ({ ...prev, media: true }));
    } else if (["/admin/documents", "/admin/secure-documents"].includes(current)) {
      setOpenGroups((prev) => ({ ...prev, documents: true }));
    } else if (["/admin/change-password", "/admin/users", "/admin/settings"].includes(current)) {
      setOpenGroups((prev) => ({ ...prev, settings: true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    // Quick load counts for badges
    Promise.all([
      fetch(apiUrls.schools()).then((r) => r.json()).catch(() => null),
      fetch(`${apiUrls.news()}?status=all`).then((r) => r.json()).catch(() => null),
      fetch(apiUrls.events()).then((r) => r.json()).catch(() => null),
      fetch(`${apiUrls.gallery()}?all=true`).then((r) => r.json()).catch(() => null),
      fetch(apiUrls.heroImages()).then((r) => r.json()).catch(() => null)
    ]).then(([sch, nws, evt, gal, her]) => {
      const schCount = Array.isArray(sch?.data || sch) ? (sch?.data || sch).length : 38;
      const newsCount = typeof nws?.total === "number" ? nws.total : (Array.isArray(nws?.data) ? nws.data.length : 33);
      const eventsCount = Array.isArray(evt?.data || evt) ? (evt?.data || evt).length : 9;
      const galleryCount = Array.isArray(gal?.data || gal) ? (gal?.data || gal).length : 32;
      const heroCount = Array.isArray(her?.data || her) ? (her?.data || her).length : 5;
      setStats((prev) => ({
        ...prev,
        schools: schCount,
        news: newsCount,
        events: eventsCount,
        gallery: galleryCount,
        heroImages: heroCount
      }));
    }).catch(() => {});
  }, []);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch {
      navigate("/admin/login");
    }
  };

  const groups: NavGroup[] = [
    {
      id: "ministries",
      title: "Ministries & Departments",
      icon: Users,
      items: [
        {
          label: "Clergy & Leadership",
          path: "/admin/team",
          icon: Users,
          badge: null
        },
        {
          label: "Schools & Colleges",
          path: "/admin/schools",
          icon: School,
          badge: stats.schools.toString()
        },
        {
          label: "Health Facilities",
          path: "/admin/health",
          icon: Heart,
          badge: stats.health.toString()
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
      badge: stats.news.toString(),
      items: [
        {
          label: "News Releases",
          path: "/admin/news",
          icon: Newspaper,
          badge: stats.news.toString()
        },
        {
          label: "Events Calendar",
          path: "/admin/events",
          icon: Calendar,
          badge: stats.events.toString()
        },
        {
          label: "Photo Gallery",
          path: "/admin/gallery",
          icon: ImageIcon,
          badge: stats.gallery.toString()
        },
        {
          label: "Hero Carousel Banners",
          path: "/admin/hero-images",
          icon: ImageIcon,
          badge: stats.heroImages.toString()
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

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Institutional Dark Navy Sidebar */}
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
          {/* Main Dashboard Link */}
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
          {groups.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = Boolean(openGroups[group.id]);
            const isGroupActive = group.items.some((item) => item.path === location.pathname);

            return (
              <div key={group.id} className="rounded-xl overflow-hidden">
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
                              ? "bg-church-gold text-church-navy font-bold shadow-xs"
                              : "text-slate-300 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ItemIcon
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? "text-church-navy" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1.5 ${
                                isActive
                                  ? "bg-church-navy text-church-gold"
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

          {/* Quick External Link */}
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
    </>
  );
};

export default AdminSidebar;
