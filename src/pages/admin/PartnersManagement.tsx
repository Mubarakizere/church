import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls, buildStorageUrl } from "@/config/api";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Handshake,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Search,
  Edit2,
  ExternalLink,
  Menu,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building,
  Globe,
  Mail,
  Users,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  MapPin,
  Tag
} from "lucide-react";
import { toast } from "sonner";

export interface Partner {
  id: number;
  name: string;
  country?: string | null;
  type?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  logo?: string | null;
  category?: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export const PartnersManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "development" | "mission" | "diocese">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"order-asc" | "name-asc" | "name-desc" | "country-asc" | "date-desc">("order-asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modals
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formType, setFormType] = useState("");
  const [formCategory, setFormCategory] = useState("development");
  const [formWebsite, setFormWebsite] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState("0");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLogoFile, setFormLogoFile] = useState<File | null>(null);
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formLogoPreview, setFormLogoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Partners
  const loadPartners = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${apiUrls.partners()}?all=true`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const result = await response.json();
        const list = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        setPartners(list);
      } else {
        toast.error("Failed to load strategic partners from server");
      }
    } catch (error) {
      console.error("Error loading partners:", error);
      toast.error("Network error while connecting to partner records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [token]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((p) => p.is_active).length;
    const inactive = total - active;
    const international = partners.filter(
      (p) => p.country && p.country.toLowerCase().trim() !== "rwanda" && p.country.trim() !== ""
    ).length;
    const development = partners.filter(
      (p) => (p.category && p.category.toLowerCase().includes("development")) || (p.type && p.type.toLowerCase().includes("development"))
    ).length;
    return { total, active, inactive, international, development };
  }, [partners]);

  // Filtered & Sorted Partners
  const filteredPartners = useMemo(() => {
    let result = [...partners];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((p) => p.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((p) => !p.is_active);
    } else if (statusFilter === "development") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === "development" || p.type?.toLowerCase().includes("development")
      );
    } else if (statusFilter === "mission") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === "mission" || p.type?.toLowerCase().includes("mission")
      );
    } else if (statusFilter === "diocese") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === "diocese" || p.type?.toLowerCase().includes("diocese")
      );
    }

    // Category dropdown filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search term
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const countryMatch = p.country?.toLowerCase().includes(q);
        const typeMatch = p.type?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const webMatch = p.website?.toLowerCase().includes(q);
        return nameMatch || countryMatch || typeMatch || descMatch || webMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "order-asc") {
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "country-asc") {
        const ca = a.country || "";
        const cb = b.country || "";
        return ca.localeCompare(cb);
      }
      if (sortBy === "date-desc") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      }
      return 0;
    });

    return result;
  }, [partners, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / pageSize));
  const paginatedPartners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, sortBy, pageSize]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingPartner(null);
    setFormName("");
    setFormCountry("");
    setFormType("Development Partner");
    setFormCategory("development");
    setFormWebsite("");
    setFormEmail("");
    setFormDescription("");
    setFormDisplayOrder((partners.length + 1).toString());
    setFormIsActive(true);
    setFormLogoFile(null);
    setFormLogoUrl("");
    setFormLogoPreview("");
    setEditorModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormName(partner.name || "");
    setFormCountry(partner.country || "");
    setFormType(partner.type || "Development Partner");
    setFormCategory(partner.category || "development");
    setFormWebsite(partner.website || "");
    setFormEmail(partner.email || "");
    setFormDescription(partner.description || "");
    setFormDisplayOrder((partner.display_order ?? 0).toString());
    setFormIsActive(partner.is_active);
    setFormLogoFile(null);
    setFormLogoUrl(partner.logo || "");
    setFormLogoPreview(partner.logo ? buildStorageUrl(partner.logo) : "");
    setEditorModalOpen(true);
  };

  // Handle Logo Upload File
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo file must be less than 5MB");
        return;
      }
      setFormLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Partner Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !token) return;

    if (!formName.trim()) {
      toast.error("Please provide the partner organization name");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingPartner ? apiUrls.partner(editingPartner.id) : apiUrls.partners();

      const formDataToSend = new FormData();
      formDataToSend.append("name", formName.trim());
      if (formCountry.trim()) formDataToSend.append("country", formCountry.trim());
      if (formType.trim()) formDataToSend.append("type", formType.trim());
      if (formCategory.trim()) formDataToSend.append("category", formCategory.trim());
      if (formWebsite.trim()) formDataToSend.append("website", formWebsite.trim());
      if (formEmail.trim()) formDataToSend.append("email", formEmail.trim());
      if (formDescription.trim()) formDataToSend.append("description", formDescription.trim());
      formDataToSend.append("is_active", formIsActive ? "1" : "0");
      formDataToSend.append("display_order", formDisplayOrder);

      if (formLogoFile) {
        formDataToSend.append("logo", formLogoFile);
      } else if (formLogoUrl.trim()) {
        formDataToSend.append("logo_url", formLogoUrl.trim());
      }

      if (editingPartner) {
        formDataToSend.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        body: formDataToSend
      });

      if (res.ok) {
        toast.success(editingPartner ? "Partner information updated successfully" : "Partner organization registered successfully");
        setEditorModalOpen(false);
        loadPartners();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to save partner record");
      }
    } catch (error) {
      console.error("Error submitting partner:", error);
      toast.error("Network error while submitting partner record");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Active
  const handleToggleActive = async (partner: Partner) => {
    if (!token) return;
    setTogglingActiveId(partner.id);

    const newStatus = !partner.is_active;
    try {
      const res = await fetch(apiUrls.partner(partner.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (res.ok) {
        setPartners((prev) =>
          prev.map((item) => (item.id === partner.id ? { ...item, is_active: newStatus } : item))
        );
        toast.success(newStatus ? "Partner marked as active" : "Partner moved to drafts/inactive");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Network error while updating status");
    } finally {
      setTogglingActiveId(null);
    }
  };

  // Trigger Delete
  const handleConfirmDelete = (partner: Partner) => {
    setPartnerToDelete(partner);
    setDeleteModalOpen(true);
  };

  // Execute Delete
  const handleDeletePartner = async () => {
    if (!partnerToDelete || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(apiUrls.partner(partnerToDelete.id), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Partner removed successfully");
        setDeleteModalOpen(false);
        setPartnerToDelete(null);
        loadPartners();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to delete partner");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error while deleting partner");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      {/* Unified Diocesan Admin Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Administrative Portal Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Executive Header Banner */}
        <header className="sticky top-0 z-30 bg-[#0c1628]/95 backdrop-blur-md border-b border-slate-700/60 text-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                aria-label="Open Sidebar Navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-md bg-[#d4af37]/20 text-[#d4af37]">
                    <Handshake className="h-4 w-4" />
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                    Strategic Partners & Donors
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live System
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden md:block">
                  Anglican Church of Rwanda, Shyogwe Diocese - Curate institutional supporters, development partners, and mission alliances
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => loadPartners(true)}
                disabled={refreshing || loading}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                title="Refresh partners list"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#d4af37]" : ""}`} />
              </button>

              <Button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#d4af37] to-[#b39129] hover:from-[#c29f30] hover:to-[#9e7f22] text-[#0c1628] rounded-lg shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Partner</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Executive Workspace Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Executive KPI Statistics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Partners */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Alliances
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? "-" : stats.total}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cooperating organizations
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <Handshake className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 2: Active & Verified */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Active & Published
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {loading ? "-" : stats.active}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Featured on diocesan site
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 3: International Missions */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    International Partners
                  </p>
                  <p className="text-2xl font-bold text-[#0c1628] mt-1">
                    {loading ? "-" : stats.international}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Global missions & NGOs
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 4: Development Support */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Development Alliances
                  </p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {loading ? "-" : stats.development}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Schools, health & water
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <Building className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter, Sort & View Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
              {[
                { key: "all", label: "All Partners", count: stats.total },
                { key: "active", label: "Active & Live", count: stats.active },
                { key: "inactive", label: "Drafts / Hidden", count: stats.inactive },
                { key: "development", label: "Development", count: stats.development },
                { key: "mission", label: "Mission & Ministry", count: partners.filter((p) => p.category?.toLowerCase() === "mission").length },
                { key: "diocese", label: "Diocesan Links", count: partners.filter((p) => p.category?.toLowerCase() === "diocese").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === tab.key
                      ? "bg-[#0c1628] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      statusFilter === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input, Category Filter, Sort Order, Page Size & View Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search partner name, country, focus area, or website..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 text-xs sm:text-sm bg-slate-50/50 border-slate-200 rounded-lg focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Presentation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <div className="w-[160px]">
                  <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <Tag className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                      <SelectItem value="development" className="text-xs">Development</SelectItem>
                      <SelectItem value="mission" className="text-xs">Mission</SelectItem>
                      <SelectItem value="diocese" className="text-xs">Diocese</SelectItem>
                      <SelectItem value="government" className="text-xs">Government</SelectItem>
                      <SelectItem value="strategic" className="text-xs">Strategic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Selector */}
                <div className="w-[170px]">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order-asc" className="text-xs">Display Order</SelectItem>
                      <SelectItem value="name-asc" className="text-xs">Name (A to Z)</SelectItem>
                      <SelectItem value="name-desc" className="text-xs">Name (Z to A)</SelectItem>
                      <SelectItem value="country-asc" className="text-xs">Country (A to Z)</SelectItem>
                      <SelectItem value="date-desc" className="text-xs">Newest Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rows per page */}
                <div className="w-[105px]">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => setPageSize(parseInt(v, 10))}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <SelectValue placeholder="Page Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9" className="text-xs">9 per page</SelectItem>
                      <SelectItem value="12" className="text-xs">12 per page</SelectItem>
                      <SelectItem value="18" className="text-xs">18 per page</SelectItem>
                      <SelectItem value="24" className="text-xs">24 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grid / Table Toggle */}
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-[#0c1628] shadow-xs font-medium"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Visual Partner Dossier Grid"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      viewMode === "table"
                        ? "bg-white text-[#0c1628] shadow-xs font-medium"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Administrative Data Table"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Visual Display */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#d4af37] mb-3" />
              <p className="text-sm font-semibold text-slate-800">Loading Strategic Partner Records...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to diocesan partnership directory</p>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-3">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Partner Organizations Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                  ? "No partners match your current filters. Try resetting search query or category filters."
                  : "No partner records found in the database. Register your first partner organization to get started."}
              </p>
              {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="mt-4 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Visual Partner Dossier Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedPartners.map((partner) => {
                const logoUrl = partner.logo ? buildStorageUrl(partner.logo) : "";

                return (
                  <div
                    key={partner.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header with Logo and Badges */}
                      <div className="p-5 flex items-start gap-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                        {/* Logo Box */}
                        <div className="h-16 w-24 bg-white rounded-lg border border-slate-200 p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={partner.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Building className="h-6 w-6 text-slate-300" />
                          )}
                        </div>

                        {/* Title & Classification */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                              {partner.type || "Development Partner"}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                partner.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {partner.is_active ? "Active" : "Draft"}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                            {partner.name}
                          </h3>
                          {partner.country && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>{partner.country}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Body Description & Links */}
                      <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {partner.description || "Active diocesan cooperating partner supporting community and church programs."}
                        </p>

                        <div className="flex flex-col gap-1.5 text-xs text-slate-500 pt-1">
                          {partner.website && (
                            <a
                              href={partner.website.startsWith("http") ? partner.website : `https://${partner.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline truncate"
                            >
                              <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{partner.website.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          )}

                          {partner.email && (
                            <div className="inline-flex items-center gap-1.5 text-slate-500 truncate">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{partner.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                      {/* Order and Status */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Order #{partner.display_order ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(partner)}
                          disabled={togglingActiveId === partner.id}
                          className={`text-[11px] font-semibold transition-colors ${
                            partner.is_active
                              ? "text-emerald-700 hover:text-emerald-800"
                              : "text-amber-700 hover:text-amber-800"
                          }`}
                        >
                          {togglingActiveId === partner.id ? (
                            <Loader2 className="h-3 w-3 animate-spin inline" />
                          ) : partner.is_active ? (
                            "Live"
                          ) : (
                            "Draft"
                          )}
                        </button>
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(partner)}
                          className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-200/60 rounded transition-colors"
                          title="Edit partner"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(partner)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete partner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Dense Administrative Table View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-20">Logo</th>
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4 w-32">Country</th>
                      <th className="py-3 px-4 w-36">Category / Type</th>
                      <th className="py-3 px-4 w-44">Official Website</th>
                      <th className="py-3 px-4 w-24">Order</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPartners.map((partner) => {
                      const logoUrl = partner.logo ? buildStorageUrl(partner.logo) : "";

                      return (
                        <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Logo */}
                          <td className="py-2.5 px-4">
                            <div className="h-10 w-16 bg-white rounded border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt={partner.name}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Building className="h-4 w-4 text-slate-300" />
                              )}
                            </div>
                          </td>

                          {/* Organization Name */}
                          <td className="py-2.5 px-4 font-semibold text-slate-900 max-w-xs">
                            <div className="truncate">{partner.name}</div>
                            {partner.description && (
                              <div className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                                {partner.description}
                              </div>
                            )}
                          </td>

                          {/* Country */}
                          <td className="py-2.5 px-4 text-slate-600">
                            {partner.country || "-"}
                          </td>

                          {/* Category / Type */}
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                              {partner.category || partner.type || "Development"}
                            </span>
                          </td>

                          {/* Official Website */}
                          <td className="py-2.5 px-4 max-w-xs">
                            {partner.website ? (
                              <a
                                href={partner.website.startsWith("http") ? partner.website : `https://${partner.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline truncate"
                              >
                                <span className="truncate">{partner.website.replace(/^https?:\/\//, "")}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Order */}
                          <td className="py-2.5 px-4 font-semibold text-slate-700">
                            #{partner.display_order ?? 0}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(partner)}
                              disabled={togglingActiveId === partner.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                partner.is_active
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              {togglingActiveId === partner.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    partner.is_active ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                />
                              )}
                              {partner.is_active ? "Published" : "Draft"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(partner)}
                                className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-100 rounded transition-colors"
                                title="Edit partner"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(partner)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete partner"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Navigation Footer */}
          {filteredPartners.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredPartners.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredPartners.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{filteredPartners.length}</span> partners
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Create & Edit Partner Organization               */}
      {/* ======================================================== */}
      <Dialog open={editorModalOpen} onOpenChange={setEditorModalOpen}>
        <DialogContent className="max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <DialogHeader className="p-6 bg-[#0c1628] text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Handshake className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {editingPartner ? "Edit Partner Organization" : "Register Partner Organization"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-0.5">
                  Maintain official profile, insignia logo, partnership scope, and external links
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitForm}>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Logo Preview & Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="h-20 w-32 bg-white rounded-lg border border-slate-300 p-2 flex items-center justify-center flex-shrink-0 shadow-inner">
                  {formLogoPreview ? (
                    <img
                      src={formLogoPreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Organization Logo / Insignia</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileSelect}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Browse Logo File
                    </Button>
                    {formLogoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormLogoPreview("");
                          setFormLogoFile(null);
                          setFormLogoUrl("");
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder="Or enter logo web address / storage path..."
                    value={formLogoUrl}
                    onChange={(e) => {
                      setFormLogoUrl(e.target.value);
                      if (e.target.value) {
                        setFormLogoPreview(buildStorageUrl(e.target.value));
                      }
                    }}
                    className="text-xs bg-white border-slate-200"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Organization Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Brot für die Welt (Germany)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Country of Origin / HQ</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Germany, Rwanda, USA"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Partnership Category</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development" className="text-xs">Development Partner</SelectItem>
                      <SelectItem value="mission" className="text-xs">Mission Alliance</SelectItem>
                      <SelectItem value="diocese" className="text-xs">Diocesan Link</SelectItem>
                      <SelectItem value="government" className="text-xs">Government Institution</SelectItem>
                      <SelectItem value="strategic" className="text-xs">Strategic Ally</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Partnership Classification / Type</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Development Partner, Health Supporter, Youth Ministry"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              {/* Web & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Official Website URL</Label>
                  <Input
                    type="text"
                    placeholder="https://example.org"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Contact / Liaison Email</Label>
                  <Input
                    type="email"
                    placeholder="partner@example.org"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Partnership Scope / Description</Label>
                  <Textarea
                    placeholder="Summary of mutual cooperation, supported programs (e.g. clinics, schools, microfinance)..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Display Order</Label>
                  <Input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400">Position in list (0 appears first).</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Publication Status</Label>
                  <Select
                    value={formIsActive ? "active" : "inactive"}
                    onValueChange={(v) => setFormIsActive(v === "active")}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs">Active & Published</SelectItem>
                      <SelectItem value="inactive" className="text-xs">Draft / Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditorModalOpen(false)}
                disabled={isSaving}
                className="text-xs border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="text-xs font-semibold bg-[#0c1628] hover:bg-[#1a2b49] text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving Partner...
                  </>
                ) : editingPartner ? (
                  "Update Partner"
                ) : (
                  "Register Partner"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: Delete Confirmation Dialog                      */}
      {/* ======================================================== */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <div className="p-6 text-center space-y-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Partner Record?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this partner organization from the diocesan registry? This action cannot be undone.
              </p>
            </div>

            {partnerToDelete && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left">
                <div className="h-10 w-16 bg-white rounded border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                  {partnerToDelete.logo ? (
                    <img
                      src={buildStorageUrl(partnerToDelete.logo)}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Building className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-800 truncate">{partnerToDelete.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">
                    {partnerToDelete.country || "Rwanda"} &bull; {partnerToDelete.type || "Partner"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="text-xs border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDeletePartner}
                disabled={isDeleting}
                className="text-xs font-semibold bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManagement;
