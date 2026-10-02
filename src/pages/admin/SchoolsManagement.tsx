import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import EditModal from "@/components/admin/EditModal";
import DeleteModal from "@/components/admin/DeleteModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  School as SchoolIcon,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  ExternalLink,
  Menu,
  GraduationCap,
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  UserCheck,
  Building2
} from "lucide-react";
import { toast } from "sonner";

interface School {
  id: number;
  name: string;
  type: string;
  description?: string;
  location: string;
  head_teacher?: string;
  contact_phone?: string;
  contact_email?: string;
  programs_offered?: string[];
  founded_year?: number;
  is_active?: boolean;
}

export const SchoolsManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Views
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadSchools();
  }, [token, navigate]);

  const loadSchools = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${apiUrls.schools()}?admin=1`, {
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        const rawItems = result.data || result;
        if (Array.isArray(rawItems)) {
          const formatted = rawItems.map((s: any) => ({
            ...s,
            id: Number(s.id),
            is_active: s.is_active === 1 || s.is_active === true || s.is_active === "1",
            programs_offered: Array.isArray(s.programs_offered)
              ? s.programs_offered
              : typeof s.programs_offered === "string"
              ? s.programs_offered.split(",").map((p: string) => p.trim())
              : []
          }));
          setSchools(formatted);
        } else {
          setSchools([]);
        }
      } else {
        toast.error("Failed to load schools records");
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error);
      toast.error("Network error while loading schools");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateSchool = () => {
    setSelectedSchool({
      id: 0,
      name: "",
      type: "secondary_basic",
      description: "",
      location: "",
      head_teacher: "",
      contact_phone: "",
      contact_email: "",
      programs_offered: [],
      founded_year: new Date().getFullYear(),
      is_active: true
    });
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const handleDeleteSchool = (school: School) => {
    setSelectedSchool(school);
    setDeleteModalOpen(true);
  };

  const handleSaveSchool = async (schoolData: any) => {
    setActionLoading(true);
    try {
      const url = isCreating ? apiUrls.schools() : `${apiUrls.schools()}/${schoolData.id}`;
      const method = isCreating ? "POST" : "PUT";

      const payload = {
        name: schoolData.name || "",
        type: schoolData.type || "secondary_basic",
        description: schoolData.description || "",
        location: schoolData.location || "",
        head_teacher: schoolData.head_teacher || "",
        contact_phone: schoolData.contact_phone || "",
        contact_email: schoolData.contact_email || "",
        founded_year: schoolData.founded_year ? parseInt(schoolData.founded_year, 10) : new Date().getFullYear(),
        programs_offered: Array.isArray(schoolData.programs_offered)
          ? schoolData.programs_offered
          : typeof schoolData.programs_offered === "string"
          ? schoolData.programs_offered.split(",").map((p: string) => p.trim()).filter(Boolean)
          : [],
        is_active: schoolData.is_active !== false
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
        toast.success(isCreating ? "School created successfully" : "School updated successfully");
        setEditModalOpen(false);
        await loadSchools();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to save school details");
      }
    } catch (error) {
      console.error("Error saving school:", error);
      toast.error("An error occurred while saving the institution");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSchool) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${apiUrls.schools()}/${selectedSchool.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (response.ok) {
        toast.success("School record removed successfully");
        setDeleteModalOpen(false);
        setSchools((prev) => prev.filter((s) => s.id !== selectedSchool.id));
      } else {
        toast.error("Failed to delete school record");
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      toast.error("An error occurred while deleting the school");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const activeCount = schools.filter((s) => s.is_active).length;
  const universityCount = schools.filter((s) => s.type === "university").length;
  const tssCount = schools.filter((s) => s.type === "tss_boarding").length;
  const secBoardingCount = schools.filter((s) => s.type === "secondary_boarding").length;
  const secBasicCount = schools.filter((s) => s.type === "secondary_basic").length;
  const primaryCount = schools.filter((s) => s.type === "primary").length;
  const ecdCount = schools.filter((s) => s.type === "ecd").length;

  const foundationalCount = ecdCount + primaryCount;
  const secondaryTotalCount = secBasicCount + secBoardingCount + tssCount;

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Type filter
      if (selectedType !== "all" && school.type !== selectedType) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !school.is_active) return false;
      if (statusFilter === "inactive" && school.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = school.name?.toLowerCase().includes(query);
        const matchesLoc = school.location?.toLowerCase().includes(query);
        const matchesHead = school.head_teacher?.toLowerCase().includes(query);
        const matchesEmail = school.contact_email?.toLowerCase().includes(query);
        return matchesName || matchesLoc || matchesHead || matchesEmail;
      }

      return true;
    });
  }, [schools, selectedType, statusFilter, searchQuery]);

  const getTypeMeta = (type: string) => {
    switch (type) {
      case "university":
        return {
          label: "Higher Education / University",
          shortLabel: "University",
          badgeClass: "bg-purple-50 text-purple-800 border-purple-200 font-bold",
          icon: GraduationCap
        };
      case "tss_boarding":
        return {
          label: "Technical Secondary (TSS Boarding)",
          shortLabel: "TSS Boarding",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
          icon: Building2
        };
      case "secondary_boarding":
        return {
          label: "Secondary Boarding School",
          shortLabel: "Sec. Boarding",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200 font-semibold",
          icon: BookOpen
        };
      case "secondary_basic":
        return {
          label: "Basic Secondary (9/12 Years)",
          shortLabel: "Secondary (9/12Y)",
          badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200 font-medium",
          icon: BookOpen
        };
      case "primary":
        return {
          label: "Primary School",
          shortLabel: "Primary",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium",
          icon: SchoolIcon
        };
      case "ecd":
        return {
          label: "Early Childhood (ECD)",
          shortLabel: "ECD Center",
          badgeClass: "bg-teal-50 text-teal-800 border-teal-200 font-medium",
          icon: SchoolIcon
        };
      default:
        return {
          label: "Educational Institution",
          shortLabel: "School",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
          icon: SchoolIcon
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
                Educational Institutions & Schools
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Diocesan Control Center • 38 Schools, Technical Colleges & Academies
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
              <a href="/schools" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5 text-church-navy" />
                Public Directory
              </a>
            </Button>

            <Button
              size="sm"
              onClick={handleCreateSchool}
              className="h-8 text-xs bg-church-navy hover:bg-church-navy/90 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-church-gold" />
              <span>Add School</span>
            </Button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Pro KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Institutions
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeCount} Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {schools.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <SchoolIcon className="h-3 w-3 text-slate-400" />
                <span>Diocesan educational centers</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Higher Learning
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  University
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {universityCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-purple-500" />
                <span>Institut Supérieur & Colleges</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Secondary & Technical
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-church-navy bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {tssCount} TSS
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {secondaryTotalCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-slate-400" />
                <span>Basic, Boarding & Vocational</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Foundational
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {primaryCount} Primary
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {foundationalCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <SchoolIcon className="h-3 w-3 text-slate-400" />
                <span>Primary schools & ECD centers</span>
              </p>
            </div>
          </div>

          {/* Interactive Search & Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Field */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by school name, location, head teacher, email..."
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

              {/* Status, View Mode & Refresh */}
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

                {/* View Switcher */}
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
                  onClick={loadSchools}
                  disabled={refreshing}
                  className="h-9 text-xs border-slate-200 text-slate-600 hover:text-church-navy"
                  title="Refresh records"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Educational Type Segment Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {[
                { id: "all", label: "All Schools", count: schools.length },
                { id: "university", label: "University & Colleges", count: universityCount },
                { id: "tss_boarding", label: "Technical (TSS)", count: tssCount },
                { id: "secondary_boarding", label: "Sec. Boarding", count: secBoardingCount },
                { id: "secondary_basic", label: "Sec. Basic (9/12Y)", count: secBasicCount },
                { id: "primary", label: "Primary", count: primaryCount },
                { id: "ecd", label: "ECD Centers", count: ecdCount }
              ].map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* School Listings: Grid or Table View */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : filteredSchools.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <SchoolIcon className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-church-navy">
                No Schools Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No educational institutions match your search query or filter selection. Try resetting your filters or adjust the search query.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setStatusFilter("all");
                }}
                className="text-xs border-slate-200 text-church-navy"
              >
                Reset All Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            /* Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSchools.map((school) => {
                const meta = getTypeMeta(school.type);
                const TypeIcon = meta.icon;

                return (
                  <div
                    key={school.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                          <span>{meta.shortLabel}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            school.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {school.is_active ? (
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

                      {/* Title & Location */}
                      <div>
                        <h3 className="font-serif font-bold text-lg text-church-navy leading-snug group-hover:text-church-gold transition-colors">
                          {school.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{school.location || "Diocese of Shyogwe"}</span>
                        </p>
                      </div>

                      {/* Head Teacher & Year */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <UserCheck className="h-3 w-3 text-slate-400" />
                            <span>Head Teacher:</span>
                          </span>
                          <span className="font-semibold text-slate-800 truncate ml-2">
                            {school.head_teacher || "Appointed by Diocese"}
                          </span>
                        </div>

                        {school.founded_year ? (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>Established:</span>
                            </span>
                            <span className="font-medium text-slate-700">
                              {school.founded_year}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Programs Offered Pills */}
                      {school.programs_offered && school.programs_offered.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Programs & Curriculum
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {school.programs_offered.slice(0, 3).map((prog, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                              >
                                {prog}
                              </span>
                            ))}
                            {school.programs_offered.length > 3 && (
                              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                                +{school.programs_offered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Contact Shortcuts */}
                      <div className="space-y-1 pt-1 text-xs">
                        {school.contact_email ? (
                          <a
                            href={`mailto:${school.contact_email}`}
                            className="flex items-center gap-2 text-slate-600 hover:text-church-navy transition-colors truncate"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{school.contact_email}</span>
                          </a>
                        ) : null}
                        {school.contact_phone ? (
                          <a
                            href={`tel:${school.contact_phone}`}
                            className="flex items-center gap-2 text-slate-600 hover:text-church-navy transition-colors truncate"
                          >
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{school.contact_phone}</span>
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{school.id}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSchool(school)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-church-navy hover:bg-white"
                          title="Edit school"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchool(school)}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete school"
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
            /* High-Density Table View */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Institution Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Head Teacher</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.map((school) => {
                      const meta = getTypeMeta(school.type);
                      return (
                        <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-church-navy">
                            {school.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${meta.badgeClass}`}>
                              {meta.shortLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {school.location}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {school.head_teacher || "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {school.contact_phone || school.contact_email || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                school.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${school.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                              <span>{school.is_active ? "Active" : "Inactive"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSchool(school)}
                              className="h-7 px-2 text-xs text-slate-700 hover:text-church-navy"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSchool(school)}
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

      {/* Edit and Create Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveSchool}
        title={isCreating ? "Add Educational Institution" : "Edit School Details"}
        data={selectedSchool}
        type="school"
        loading={actionLoading}
        isCreating={isCreating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove School Record"
        message="Are you sure you want to delete this educational institution? This will remove the school from the directory and public archives."
        itemName={selectedSchool?.name || ""}
        loading={actionLoading}
      />
    </div>
  );
};

export default SchoolsManagement;
