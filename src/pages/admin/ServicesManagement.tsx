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
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Menu,
  Languages,
  BookOpen,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Church,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string | number;
  title: string;
  time: string;
  type: string;
  description?: string;
  features: string[];
  language: string;
  is_active?: boolean;
  display_order?: number;
}

export const ServicesManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & View Modes
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Service | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Service>>({
    title: "",
    time: "",
    type: "Holy Communion",
    description: "",
    features: [],
    language: "Kinyarwanda",
    is_active: true,
    display_order: 1
  });
  const [featuresInput, setFeaturesInput] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadServices();
  }, [token, navigate]);

  const loadServices = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(apiUrls.services(), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        const rawItems = json.data || json;
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const formatted = rawItems.map((s: any) => ({
            ...s,
            id: s.id.toString(),
            is_active: s.is_active === 1 || s.is_active === true || s.is_active === "1",
            features: Array.isArray(s.features)
              ? s.features
              : typeof s.features === "string"
              ? (() => {
                  try {
                    const parsed = JSON.parse(s.features);
                    return Array.isArray(parsed) ? parsed : [s.features];
                  } catch {
                    return s.features.split(",").map((f: string) => f.trim()).filter(Boolean);
                  }
                })()
              : []
          }));
          setServices(formatted);
        } else {
          // If empty, supply cathedral baseline services
          setServices(DEFAULT_SERVICES);
        }
      } else {
        setServices(DEFAULT_SERVICES);
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      toast.error("Network error while loading liturgical services");
      setServices(DEFAULT_SERVICES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      title: "",
      time: "",
      type: "Holy Communion",
      description: "",
      features: [],
      language: "Kinyarwanda",
      is_active: true,
      display_order: services.length + 1
    });
    setFeaturesInput("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({ ...service });
    setFeaturesInput(service.features?.join(", ") || "");
    setIsDialogOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.time?.trim()) {
      toast.error("Service title and time are required");
      return;
    }

    setActionLoading(true);
    try {
      const isEdit = Boolean(editingService);
      const url = isEdit ? `${apiUrls.services()}/${editingService?.id}` : apiUrls.services();
      const method = isEdit ? "PUT" : "POST";

      const features = featuresInput
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        time: formData.time.trim(),
        type: formData.type || "Holy Communion",
        description: formData.description || "",
        features: JSON.stringify(features),
        language: formData.language || "Kinyarwanda",
        is_active: formData.is_active !== false,
        display_order: Number(formData.display_order) || 1
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
        toast.success(isEdit ? "Liturgical service updated successfully" : "New service schedule created");
        setIsDialogOpen(false);
        await loadServices();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || "Failed to save service schedule");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Unexpected error saving service");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${apiUrls.services()}/${selectedToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (response.ok || response.status === 204) {
        toast.success("Service schedule deleted successfully");
        setDeleteModalOpen(false);
        setServices((prev) => prev.filter((s) => s.id !== selectedToDelete.id));
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("An error occurred during deletion");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const activeCount = services.filter((s) => s.is_active).length;
  const communionCount = services.filter((s) => s.type.toLowerCase().includes("communion")).length;

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Language filter
      if (selectedLanguage !== "all") {
        const sLang = (service.language || "").toLowerCase();
        if (selectedLanguage === "english" && !sLang.includes("english")) return false;
        if (selectedLanguage === "kinyarwanda" && !sLang.includes("kinyarwanda")) return false;
        if (selectedLanguage === "mixed" && !sLang.includes("mixed") && !sLang.includes("bilingual")) return false;
      }

      // Status filter
      if (statusFilter === "active" && !service.is_active) return false;
      if (statusFilter === "inactive" && service.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = service.title.toLowerCase().includes(q);
        const matchesType = service.type.toLowerCase().includes(q);
        const matchesTime = service.time.toLowerCase().includes(q);
        const matchesDesc = (service.description || "").toLowerCase().includes(q);
        const matchesFeature = service.features?.some((f) => f.toLowerCase().includes(q));
        return matchesTitle || matchesType || matchesTime || matchesDesc || matchesFeature;
      }

      return true;
    });
  }, [services, selectedLanguage, statusFilter, searchQuery]);

  const getLanguageBadge = (lang: string) => {
    const l = (lang || "").toLowerCase();
    if (l.includes("english")) {
      return {
        label: "English Service",
        className: "bg-blue-50 text-blue-800 border-blue-200 font-semibold"
      };
    }
    if (l.includes("kinyarwanda")) {
      return {
        label: "Kinyarwanda Service",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
      };
    }
    return {
      label: "Bilingual / Mixed Worship",
      className: "bg-purple-50 text-purple-800 border-purple-200 font-semibold"
    };
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
                Worship & Liturgical Services
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Diocesan Control Center • Cathedral & Parish Worship Schedules
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
              <a href="/services" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5 text-church-navy" />
                Public Schedule
              </a>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 text-xs bg-church-navy hover:bg-church-navy/90 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-church-gold" />
              <span>Add Service</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="p-6 sm:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Services
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeCount} Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {services.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Weekly Sunday worship sessions</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Holy Communion
                </span>
                <Church className="h-4 w-4 text-church-gold" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {communionCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>Eucharistic celebrations</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Languages Offered
                </span>
                <Languages className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                3
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>English, Kinyarwanda & Bilingual</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Location
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-church-navy bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Diocesan
                </span>
              </div>
              <p className="text-xl font-serif font-bold text-church-navy truncate">
                Cathedral
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>St. Peter & Paul Cathedral Parish</span>
              </p>
            </div>
          </div>

          {/* Interactive Search & Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by title, time, liturgy, or liturgical features..."
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
                  onClick={loadServices}
                  disabled={refreshing}
                  className="h-9 text-xs border-slate-200 text-slate-600 hover:text-church-navy"
                  title="Refresh records"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Language Segment Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {[
                { id: "all", label: "All Services", count: services.length },
                {
                  id: "kinyarwanda",
                  label: "Kinyarwanda",
                  count: services.filter((s) => (s.language || "").toLowerCase().includes("kinyarwanda")).length
                },
                {
                  id: "english",
                  label: "English",
                  count: services.filter((s) => (s.language || "").toLowerCase().includes("english")).length
                },
                {
                  id: "mixed",
                  label: "Bilingual / Mixed",
                  count: services.filter((s) => {
                    const l = (s.language || "").toLowerCase();
                    return l.includes("mixed") || l.includes("bilingual");
                  }).length
                }
              ].map((tab) => {
                const isActive = selectedLanguage === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLanguage(tab.id)}
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
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Listings */}
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
          ) : filteredServices.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-church-navy">
                No Service Schedules Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No worship services match your selected filter or search query. You can add a new service or reset the filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLanguage("all");
                  setStatusFilter("all");
                }}
                className="text-xs border-slate-200 text-church-navy"
              >
                Reset Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServices.map((service) => {
                const langBadge = getLanguageBadge(service.language);

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full border ${langBadge.className}`}
                        >
                          {langBadge.label}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            service.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {service.is_active ? (
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

                      {/* Title & Time */}
                      <div>
                        <h3 className="font-serif font-bold text-lg text-church-navy leading-snug group-hover:text-church-gold transition-colors">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <Clock className="h-3.5 w-3.5 text-church-gold" />
                            <span>{service.time}</span>
                          </span>
                        </div>
                      </div>

                      {/* Liturgical Type */}
                      <div className="text-xs">
                        <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-0.5">
                          Order of Service
                        </span>
                        <span className="font-semibold text-slate-800">
                          {service.type}
                        </span>
                      </div>

                      {/* Description */}
                      {service.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {service.description}
                        </p>
                      )}

                      {/* Liturgical Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Features & Liturgy
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {service.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Order #{service.display_order || 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(service)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-church-navy hover:bg-white"
                          title="Edit service"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedToDelete(service);
                            setDeleteModalOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete service"
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
                      <th className="py-3 px-4">Service Title</th>
                      <th className="py-3 px-4">Schedule Time</th>
                      <th className="py-3 px-4">Liturgy Type</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.map((service) => {
                      const langBadge = getLanguageBadge(service.language);
                      return (
                        <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-church-navy">
                            {service.title}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-800">
                            {service.time}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {service.type}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${langBadge.className}`}>
                              {service.language}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            #{service.display_order || 1}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                service.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${service.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                              <span>{service.is_active ? "Active" : "Inactive"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(service)}
                              className="h-7 px-2 text-xs text-slate-700 hover:text-church-navy"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedToDelete(service);
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

      {/* Create / Edit Service Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-church-navy">
              {editingService ? "Edit Liturgical Service" : "Add Worship Service"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure Sunday worship liturgy, timing, and congregation features.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Kinyarwanda Service"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="time" className="text-xs font-semibold text-slate-700">Service Schedule Time *</Label>
                <Input
                  id="time"
                  value={formData.time || ""}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g., 9:00 AM - 12:00 PM"
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-xs font-semibold text-slate-700">Liturgy / Service Type</Label>
                <Input
                  id="type"
                  value={formData.type || ""}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Holy Communion in Kinyarwanda"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="language" className="text-xs font-semibold text-slate-700">Language</Label>
                <select
                  id="language"
                  value={formData.language || "Kinyarwanda"}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-church-gold"
                >
                  <option value="Kinyarwanda">Kinyarwanda</option>
                  <option value="English">English</option>
                  <option value="Mixed">Mixed / Bilingual</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="features" className="text-xs font-semibold text-slate-700">
                Liturgical Features (comma-separated)
              </Label>
              <Input
                id="features"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="e.g., Kinyarwanda Liturgy, Holy Communion, Local Hymns, Community Fellowship"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the congregation, liturgy style, and fellowship..."
                className="text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-center pt-1">
              <div className="space-y-1">
                <Label htmlFor="display_order" className="text-xs font-semibold text-slate-700">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="1"
                  value={formData.display_order || 1}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-church-navy focus:ring-church-gold"
                  />
                  <span className="text-slate-700 font-medium">Active worship service</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
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
                {actionLoading ? "Saving..." : editingService ? "Update Schedule" : "Save Schedule"}
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
              Remove Worship Service
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to remove &quot;{selectedToDelete?.title}&quot;? This will remove the service from Sunday schedules and diocesan listings.
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

// Fallback baseline services if API is cold
const DEFAULT_SERVICES: Service[] = [
  {
    id: "1",
    title: "English Service",
    time: "6:30 AM - 8:30 AM",
    type: "Holy Communion in English",
    description: "Early morning Anglican service conducted entirely in English. Traditional liturgy with Holy Communion, perfect for English-speaking congregation members.",
    features: ["English Liturgy", "Holy Communion", "Traditional Hymns", "Morning Prayer"],
    language: "English",
    is_active: true,
    display_order: 1
  },
  {
    id: "2",
    title: "Kinyarwanda Service",
    time: "9:00 AM - 12:00 PM",
    type: "Holy Communion in Kinyarwanda",
    description: "Main morning service conducted in Kinyarwanda, our local language. Full Anglican liturgy with Holy Communion, designed for the local community.",
    features: ["Kinyarwanda Liturgy", "Holy Communion", "Local Hymns", "Community Fellowship"],
    language: "Kinyarwanda",
    is_active: true,
    display_order: 2
  },
  {
    id: "3",
    title: "Mixed Service",
    time: "3:30 PM - 5:30 PM",
    type: "Bilingual Worship",
    description: "Afternoon service combining both English and Kinyarwanda. A unique worship experience that brings together our diverse congregation in unity.",
    features: ["Bilingual Worship", "Mixed Congregation", "Contemporary & Traditional", "Unity in Diversity"],
    language: "Mixed",
    is_active: true,
    display_order: 3
  }
];

export default ServicesManagement;
