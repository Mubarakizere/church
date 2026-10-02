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
  Heart,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  ExternalLink,
  Menu,
  Activity,
  MapPin,
  Clock,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Stethoscope,
  Building,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

interface HealthFacility {
  id: number;
  name: string;
  type: "health_center" | "health_post";
  description?: string;
  location: string;
  services_offered?: string[];
  services?: string[];
  contact_phone?: string;
  contact_email?: string;
  operating_hours?: string;
  image?: string;
  is_active?: boolean;
}

export const HealthManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
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
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadFacilities();
  }, [token, navigate]);

  const loadFacilities = async () => {
    try {
      setRefreshing(true);
      const [centersRes, postsRes] = await Promise.all([
        fetch(apiUrls.healthCenters(), { headers: { Accept: "application/json" } }).catch(() => null),
        fetch(apiUrls.healthPosts(), { headers: { Accept: "application/json" } }).catch(() => null)
      ]);

      let normalizedCenters: HealthFacility[] = [];
      let normalizedPosts: HealthFacility[] = [];

      if (centersRes && centersRes.ok) {
        const centersData = await centersRes.json();
        const rawCenters = centersData.data || centersData;
        if (Array.isArray(rawCenters)) {
          normalizedCenters = rawCenters.map((c: any) => ({
            ...c,
            id: Number(c.id),
            type: "health_center",
            services_offered: Array.isArray(c.services)
              ? c.services
              : Array.isArray(c.services_offered)
              ? c.services_offered
              : typeof c.services === "string"
              ? c.services.split(",").map((s: string) => s.trim())
              : [],
            is_active: c.is_active === 1 || c.is_active === true || c.is_active === "1"
          }));
        }
      }

      if (postsRes && postsRes.ok) {
        const postsData = await postsRes.json();
        const rawPosts = postsData.data || postsData;
        if (Array.isArray(rawPosts)) {
          normalizedPosts = rawPosts.map((p: any) => ({
            ...p,
            id: Number(p.id),
            type: "health_post",
            services_offered: Array.isArray(p.services)
              ? p.services
              : Array.isArray(p.services_offered)
              ? p.services_offered
              : typeof p.services === "string"
              ? p.services.split(",").map((s: string) => s.trim())
              : [],
            is_active: p.is_active === 1 || p.is_active === true || p.is_active === "1"
          }));
        }
      }

      setFacilities([...normalizedCenters, ...normalizedPosts]);
    } catch (error) {
      console.error("Failed to load health facilities:", error);
      toast.error("Network error while loading health facilities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateFacility = () => {
    setSelectedFacility({
      id: 0,
      name: "",
      type: "health_center",
      description: "",
      location: "",
      services_offered: [],
      contact_phone: "",
      contact_email: "",
      operating_hours: "Monday - Friday: 7:00 AM - 5:00 PM",
      is_active: true
    });
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleEditFacility = (facility: HealthFacility) => {
    setSelectedFacility(facility);
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const handleDeleteFacility = (facility: HealthFacility) => {
    setSelectedFacility(facility);
    setDeleteModalOpen(true);
  };

  const handleSaveFacility = async (facilityData: any) => {
    setActionLoading(true);
    try {
      const isCenter = facilityData.type === "health_center";
      const baseUrl = isCenter ? apiUrls.healthCenters() : apiUrls.healthPosts();
      const url = isCreating ? baseUrl : `${baseUrl}/${facilityData.id}`;
      const method = isCreating ? "POST" : "PUT";

      let servicesArray: string[] = [];
      if (Array.isArray(facilityData.services_offered)) {
        servicesArray = facilityData.services_offered;
      } else if (typeof facilityData.services_offered === "string") {
        servicesArray = facilityData.services_offered.split(",").map((s: string) => s.trim()).filter(Boolean);
      } else if (Array.isArray(facilityData.services)) {
        servicesArray = facilityData.services;
      }

      const payload = {
        name: facilityData.name || "",
        description: facilityData.description || "",
        location: facilityData.location || "",
        contact_phone: facilityData.contact_phone || "",
        contact_email: facilityData.contact_email || "",
        services: servicesArray,
        operating_hours: facilityData.operating_hours || "Monday - Friday: 7:00 AM - 5:00 PM",
        is_active: facilityData.is_active !== false
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
        toast.success(isCreating ? "Health facility registered successfully" : "Facility updated successfully");
        setEditModalOpen(false);
        await loadFacilities();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to save facility details");
      }
    } catch (error) {
      console.error("Error saving health facility:", error);
      toast.error("An error occurred while saving the health facility");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFacility) return;

    setActionLoading(true);
    try {
      const isCenter = selectedFacility.type === "health_center";
      const baseUrl = isCenter ? apiUrls.healthCenters() : apiUrls.healthPosts();
      const response = await fetch(`${baseUrl}/${selectedFacility.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (response.ok) {
        toast.success("Health facility record deleted successfully");
        setDeleteModalOpen(false);
        setFacilities((prev) => prev.filter((f) => !(f.id === selectedFacility.id && f.type === selectedFacility.type)));
      } else {
        toast.error("Failed to delete health facility record");
      }
    } catch (error) {
      console.error("Error deleting health facility:", error);
      toast.error("An error occurred while deleting the facility");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const totalCount = facilities.length;
  const centerCount = facilities.filter((f) => f.type === "health_center").length;
  const postCount = facilities.filter((f) => f.type === "health_post").length;
  const activeCount = facilities.filter((f) => f.is_active).length;

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      // Type filter
      if (selectedType !== "all" && facility.type !== selectedType) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !facility.is_active) return false;
      if (statusFilter === "inactive" && facility.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = facility.name?.toLowerCase().includes(query);
        const matchesLoc = facility.location?.toLowerCase().includes(query);
        const matchesPhone = facility.contact_phone?.toLowerCase().includes(query);
        const matchesEmail = facility.contact_email?.toLowerCase().includes(query);
        const matchesServices = facility.services_offered?.some((s) => s.toLowerCase().includes(query));
        return matchesName || matchesLoc || matchesPhone || matchesEmail || matchesServices;
      }

      return true;
    });
  }, [facilities, selectedType, statusFilter, searchQuery]);

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
                Health Facilities & Medical Centers
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Diocesan Control Center • Accredited Health Centers & Community Health Posts
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
              <a href="/projects/health" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5 text-church-navy" />
                Public Medical Directory
              </a>
            </Button>

            <Button
              size="sm"
              onClick={handleCreateFacility}
              className="h-8 text-xs bg-church-navy hover:bg-church-navy/90 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-church-gold" />
              <span>Add Facility</span>
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
                  Total Facilities
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeCount} Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {totalCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-500" />
                <span>Diocesan healthcare centers</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Health Centers
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Accredited
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {centerCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-600" />
                <span>Full inpatient, maternity & lab</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Health Posts
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                  Community
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {postCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Stethoscope className="h-3 w-3 text-cyan-600" />
                <span>Primary outpatient & triage</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Clinical Coverage
                </span>
                <ShieldCheck className="h-4 w-4 text-church-gold" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                100%
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>RBC & MoH Ministry compliance</span>
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
                  placeholder="Search by facility name, location, phone, services..."
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
                  onClick={loadFacilities}
                  disabled={refreshing}
                  className="h-9 text-xs border-slate-200 text-slate-600 hover:text-church-navy"
                  title="Refresh records"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Type Segment Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {[
                { id: "all", label: "All Facilities", count: totalCount },
                { id: "health_center", label: "Health Centers", count: centerCount },
                { id: "health_post", label: "Health Posts", count: postCount }
              ].map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
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

          {/* Listings: Cards Grid or High-Density Table */}
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
          ) : filteredFacilities.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-church-navy">
                No Health Facilities Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No healthcare centers match your search query or filter selection. Try resetting your filters.
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
              {filteredFacilities.map((facility, index) => {
                const isCenter = facility.type === "health_center";

                return (
                  <div
                    key={`${facility.type}-${facility.id}-${index}`}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border ${
                            isCenter
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                              : "bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold"
                          }`}
                        >
                          {isCenter ? (
                            <>
                              <Activity className="h-3 w-3 text-emerald-600" />
                              <span>Health Center</span>
                            </>
                          ) : (
                            <>
                              <Stethoscope className="h-3 w-3 text-cyan-600" />
                              <span>Health Post</span>
                            </>
                          )}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            facility.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {facility.is_active ? (
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
                          {facility.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{facility.location || "Diocese of Shyogwe"}</span>
                        </p>
                      </div>

                      {/* Description */}
                      {facility.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {facility.description}
                        </p>
                      )}

                      {/* Operating Hours */}
                      {facility.operating_hours && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{facility.operating_hours}</span>
                        </div>
                      )}

                      {/* Clinical Services Tag Cloud */}
                      {facility.services_offered && facility.services_offered.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Clinical Services
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {facility.services_offered.slice(0, 3).map((service, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                              >
                                {service}
                              </span>
                            ))}
                            {facility.services_offered.length > 3 && (
                              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                                +{facility.services_offered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Contact Shortcuts */}
                      <div className="space-y-1 pt-1 text-xs">
                        {facility.contact_email ? (
                          <a
                            href={`mailto:${facility.contact_email}`}
                            className="flex items-center gap-2 text-slate-600 hover:text-church-navy transition-colors truncate"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{facility.contact_email}</span>
                          </a>
                        ) : null}
                        {facility.contact_phone ? (
                          <a
                            href={`tel:${facility.contact_phone}`}
                            className="flex items-center gap-2 text-slate-600 hover:text-church-navy transition-colors truncate"
                          >
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{facility.contact_phone}</span>
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{facility.id}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFacility(facility)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-church-navy hover:bg-white"
                          title="Edit facility"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFacility(facility)}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete facility"
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
                      <th className="py-3 px-4">Facility Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Operating Hours</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFacilities.map((facility, index) => {
                      const isCenter = facility.type === "health_center";
                      return (
                        <tr key={`${facility.type}-${facility.id}-${index}`} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-church-navy">
                            {facility.name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${
                                isCenter
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                                  : "bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold"
                              }`}
                            >
                              {isCenter ? "Health Center" : "Health Post"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {facility.location}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {facility.operating_hours || "Standard Hours"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {facility.contact_phone || facility.contact_email || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                facility.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${facility.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                              <span>{facility.is_active ? "Active" : "Inactive"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFacility(facility)}
                              className="h-7 px-2 text-xs text-slate-700 hover:text-church-navy"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFacility(facility)}
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
        onSave={handleSaveFacility}
        title={isCreating ? "Add Health Facility" : "Edit Health Facility"}
        data={selectedFacility}
        type="health"
        loading={actionLoading}
        isCreating={isCreating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Health Facility"
        message="Are you sure you want to delete this health facility record? This will remove the facility from clinical listings and diocesan healthcare directories."
        itemName={selectedFacility?.name || ""}
        loading={actionLoading}
      />
    </div>
  );
};

export default HealthManagement;
