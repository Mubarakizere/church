import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Menu,
  MapPin,
  Calendar,
  Users,
  Target,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Heart,
  School,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface Program {
  id: number;
  title: string;
  category: string;
  description?: string;
  location?: string;
  attendees?: string;
  featured?: boolean;
  is_active?: boolean;
  start_date?: string;
  recurrence_pattern?: string;
  metadata?: any;
}

interface InstitutionalCounts {
  healthCenters: number;
  healthPosts: number;
  schoolsTotal: number;
}

export const ProjectsOverview: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [counts, setCounts] = useState<InstitutionalCounts>({
    healthCenters: 3,
    healthPosts: 4,
    schoolsTotal: 38
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Views
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Program | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Program>>({
    title: "",
    category: "community_development",
    description: "",
    location: "",
    attendees: "",
    start_date: new Date().toISOString().slice(0, 10),
    recurrence_pattern: "ongoing",
    featured: false,
    is_active: true
  });

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [programsRes, hcRes, hpRes, schoolsRes] = await Promise.all([
        fetch(apiUrls.programs(), { headers: { Accept: "application/json" } }).catch(() => null),
        fetch(apiUrls.healthCenters(), { headers: { Accept: "application/json" } }).catch(() => null),
        fetch(apiUrls.healthPosts(), { headers: { Accept: "application/json" } }).catch(() => null),
        fetch(apiUrls.schools(), { headers: { Accept: "application/json" } }).catch(() => null)
      ]);

      if (programsRes && programsRes.ok) {
        const pJson = await programsRes.json();
        const rawPrograms = pJson.data || pJson;
        if (Array.isArray(rawPrograms)) {
          setPrograms(
            rawPrograms.map((p: any) => ({
              ...p,
              id: Number(p.id),
              is_active: p.is_active === 1 || p.is_active === true || p.is_active === "1",
              featured: p.featured === 1 || p.featured === true || p.featured === "1"
            }))
          );
        }
      }

      let hCenterCount = 3;
      let hPostCount = 4;
      let sCount = 38;

      if (hcRes && hcRes.ok) {
        const hcData = await hcRes.json();
        const items = hcData.data || hcData;
        if (Array.isArray(items)) hCenterCount = items.length;
      }
      if (hpRes && hpRes.ok) {
        const hpData = await hpRes.json();
        const items = hpData.data || hpData;
        if (Array.isArray(items)) hPostCount = items.length;
      }
      if (schoolsRes && schoolsRes.ok) {
        const sData = await schoolsRes.json();
        const items = sData.data || sData;
        if (Array.isArray(items)) sCount = items.length;
      }

      setCounts({
        healthCenters: hCenterCount,
        healthPosts: hPostCount,
        schoolsTotal: sCount
      });
    } catch (error) {
      console.error("Failed to load development projects:", error);
      toast.error("Failed to load development projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      category: "community_development",
      description: "",
      location: "",
      attendees: "Local Communities & Parishes",
      start_date: new Date().toISOString().slice(0, 10),
      recurrence_pattern: "ongoing",
      featured: false,
      is_active: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      category: program.category || "community_development",
      description: program.description || "",
      location: program.location || "",
      attendees: program.attendees || "",
      start_date: program.start_date ? program.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      recurrence_pattern: program.recurrence_pattern || "ongoing",
      featured: Boolean(program.featured),
      is_active: program.is_active !== false
    });
    setIsFormOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Project title is required");
      return;
    }

    setActionLoading(true);
    try {
      const isEdit = Boolean(editingProgram);
      const url = isEdit ? `${apiUrls.programs()}/${editingProgram?.id}` : apiUrls.programs();
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: formData.title.trim(),
        category: formData.category || "community_development",
        description: formData.description || "",
        location: formData.location || "",
        attendees: formData.attendees || "",
        start_date: formData.start_date || new Date().toISOString().slice(0, 10),
        recurrence_pattern: formData.recurrence_pattern || "ongoing",
        featured: Boolean(formData.featured),
        is_active: formData.is_active !== false
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(isEdit ? "Project initiative updated successfully" : "Project registered successfully");
        setIsFormOpen(false);
        await loadData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || "Failed to save development project");
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Unexpected error saving project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${apiUrls.programs()}/${selectedToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (response.ok || response.status === 204) {
        toast.success("Project removed successfully");
        setDeleteModalOpen(false);
        setPrograms((prev) => prev.filter((p) => p.id !== selectedToDelete.id));
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An error occurred during deletion");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const activeCount = programs.filter((p) => p.is_active).length;
  const featuredCount = programs.filter((p) => p.featured).length;

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      // Category filter
      if (selectedCategory !== "all" && program.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !program.is_active) return false;
      if (statusFilter === "inactive" && program.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = program.title?.toLowerCase().includes(query);
        const matchesDesc = program.description?.toLowerCase().includes(query);
        const matchesLoc = program.location?.toLowerCase().includes(query);
        const matchesAttendees = program.attendees?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesLoc || matchesAttendees;
      }

      return true;
    });
  }, [programs, selectedCategory, statusFilter, searchQuery]);

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case "family_life":
      case "social_development":
        return {
          label: "Family & Social Life",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-200 font-semibold"
        };
      case "agriculture":
      case "food_security":
        return {
          label: "Agriculture & Food Security",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
        };
      case "wash":
      case "clean_water":
        return {
          label: "Clean Water & WASH",
          badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold"
        };
      case "youth":
      case "vocational":
        return {
          label: "Youth & Vocational Training",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
        };
      case "infrastructure":
      case "construction":
        return {
          label: "Infrastructure & Building",
          badgeClass: "bg-purple-50 text-purple-800 border-purple-200 font-semibold"
        };
      default:
        return {
          label: "Community Development",
          badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold"
        };
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden font-sans selection:bg-church-gold selection:text-church-navy">
      {/* Institutional Admin Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Workspace */}
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
                Development Projects & Initiatives
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Diocesan Control Center • Socio-Economic Impact, Healthcare & Education Works
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs border-slate-200 hover:border-church-gold hover:text-church-navy hidden sm:inline-flex"
            >
              <a href="/projects" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5 text-church-navy" />
                Public Projects View
              </a>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 text-xs bg-church-navy hover:bg-church-navy/90 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-church-gold" />
              <span>New Project</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Development Programs
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeCount} Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {programs.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                <span>Strategic diocesan initiatives</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Schools & Academies
                </span>
                <Link
                  to="/admin/schools"
                  className="text-[11px] text-church-gold hover:underline flex items-center gap-0.5 font-semibold"
                >
                  Manage <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {counts.schoolsTotal}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <School className="h-3 w-3 text-slate-400" />
                <span>Primary, secondary & technical</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Health Facilities
                </span>
                <Link
                  to="/admin/health"
                  className="text-[11px] text-church-gold hover:underline flex items-center gap-0.5 font-semibold"
                >
                  Manage <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {counts.healthCenters + counts.healthPosts}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-500" />
                <span>{counts.healthCenters} Centers • {counts.healthPosts} Posts</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Featured Projects
                </span>
                <Sparkles className="h-4 w-4 text-church-gold" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {featuredCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>Showcased on website portal</span>
              </p>
            </div>
          </div>

          {/* Quick Institutional Jump Strip */}
          <div className="bg-church-navy text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-serif font-bold text-base text-white">
                Institutional Development Directory
              </h3>
              <p className="text-xs text-slate-300">
                Manage infrastructure, staff, and facilities for educational and clinical institutions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/schools")}
                className="h-8 text-xs border-white/20 text-white hover:bg-white/10 hover:text-church-gold"
              >
                <School className="h-3.5 w-3.5 mr-1 text-church-gold" />
                <span>38 Schools</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/health")}
                className="h-8 text-xs border-white/20 text-white hover:bg-white/10 hover:text-rose-300"
              >
                <Heart className="h-3.5 w-3.5 mr-1 text-rose-400" />
                <span>7 Health Centers</span>
              </Button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search projects by title, location, attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8 h-9 text-xs border-slate-200 focus-visible:ring-church-gold"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status, View Switcher & Refresh */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-church-gold"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-church-navy shadow-xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === "table"
                        ? "bg-white text-church-navy shadow-xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Table view"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={refreshing}
                  className="h-9 text-xs border-slate-200 text-slate-600 hover:text-church-navy"
                  title="Refresh records"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Category Segment Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {[
                { id: "all", label: "All Initiatives" },
                { id: "family_life", label: "Family & Social" },
                { id: "community_development", label: "Community Development" },
                { id: "agriculture", label: "Agriculture & Food" },
                { id: "wash", label: "WASH & Water" },
                { id: "youth", label: "Youth & Vocational" }
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                const count =
                  tab.id === "all"
                    ? programs.length
                    : programs.filter((p) => p.category === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-church-navy text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-church-gold text-church-navy"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Program Listings */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4"
                >
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-church-navy">
                No Development Projects Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No initiatives match your query. You can add a new project or reset your active filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setStatusFilter("all");
                }}
                className="text-xs border-slate-200 text-church-navy"
              >
                Reset Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPrograms.map((prog) => {
                const meta = getCategoryMeta(prog.category);

                return (
                  <div
                    key={prog.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {prog.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Sparkles className="h-2.5 w-2.5 text-church-gold" />
                              <span>Featured</span>
                            </span>
                          )}

                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              prog.is_active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {prog.is_active ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 className="font-serif font-bold text-lg text-church-navy leading-snug group-hover:text-church-gold transition-colors">
                          {prog.title}
                        </h3>
                        {prog.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{prog.location}</span>
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      {prog.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {prog.description}
                        </p>
                      )}

                      {/* Meta Tags: Attendees & Schedule */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        {prog.attendees && (
                          <div className="flex items-center gap-2 text-slate-600 truncate">
                            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">Beneficiaries: {prog.attendees}</span>
                          </div>
                        )}
                        {prog.start_date && (
                          <div className="flex items-center gap-2 text-slate-500 text-[11px] truncate">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              Started: {new Date(prog.start_date).toLocaleDateString()}
                              {prog.recurrence_pattern ? ` (${prog.recurrence_pattern})` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{prog.id}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(prog)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-church-navy hover:bg-white"
                          title="Edit project"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedToDelete(prog);
                            setDeleteModalOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Project Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Beneficiaries</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrograms.map((prog) => {
                      const meta = getCategoryMeta(prog.category);
                      return (
                        <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-church-navy">
                            {prog.title}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${meta.badgeClass}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {prog.location || "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {prog.attendees || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                prog.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${prog.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                              <span>{prog.is_active ? "Active" : "Inactive"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(prog)}
                              className="h-7 px-2 text-xs text-slate-700 hover:text-church-navy"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedToDelete(prog);
                                setDeleteModalOpen(true);
                              }}
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Project Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-church-navy">
              {editingProgram ? "Edit Development Project" : "Register Development Project"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide the project scope, target community, and execution schedule.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProgram} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Project Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Clean Water & Community Sanitation Project"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs font-semibold text-slate-700">Category</Label>
                <select
                  id="category"
                  value={formData.category || "community_development"}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-church-gold"
                >
                  <option value="community_development">Community Development</option>
                  <option value="family_life">Family & Social Life</option>
                  <option value="agriculture">Agriculture & Food Security</option>
                  <option value="wash">Clean Water & WASH</option>
                  <option value="youth">Youth & Vocational Training</option>
                  <option value="infrastructure">Infrastructure & Building</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-semibold text-slate-700">Location / Region</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Hanika Archdeaconry"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="attendees" className="text-xs font-semibold text-slate-700">Target Beneficiaries</Label>
                <Input
                  id="attendees"
                  value={formData.attendees || ""}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="e.g., 2,500 Parish Households"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="start_date" className="text-xs font-semibold text-slate-700">Commencement Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description & Goals</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe the initiative scope, objectives, and community partners..."
                className="text-xs resize-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-church-navy focus:ring-church-gold"
                />
                <span className="text-slate-700 font-medium">Feature on public website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-church-navy focus:ring-church-gold"
                />
                <span className="text-slate-700 font-medium">Active initiative</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={actionLoading}
                className="bg-church-navy hover:bg-church-navy/90 text-white font-semibold text-xs"
              >
                {actionLoading ? "Saving..." : editingProgram ? "Update Project" : "Save Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-church-navy">
              Remove Development Project
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to remove &quot;{selectedToDelete?.title}&quot;? This action will permanently remove it from the diocesan development records.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={actionLoading}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              {actionLoading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsOverview;
