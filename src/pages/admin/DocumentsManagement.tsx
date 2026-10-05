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
  FileText,
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
  Download,
  FileCheck,
  FileSpreadsheet,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  Tag
} from "lucide-react";
import { toast } from "sonner";

export interface DocumentItem {
  id: number;
  title: string;
  category?: string | null;
  description?: string | null;
  file: string;
  file_size?: string | null;
  download_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Recent";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateString;
  }
};

const getCategoryLabel = (category?: string | null): string => {
  switch (category?.toLowerCase()) {
    case "pastoral":
      return "Pastoral & Synod";
    case "governance":
      return "Governance & Canons";
    case "liturgical":
      return "Liturgical Guides";
    case "reports":
      return "Reports & Education";
    case "health":
      return "Community Health";
    case "forms":
      return "Forms & Admin";
    default:
      return "Official Document";
  }
};

export const DocumentsManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title" | "downloads" | "category">("date-desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Modals
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("pastoral");
  const [formDescription, setFormDescription] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDownloadCount, setFormDownloadCount] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [togglingActiveId, setTogglingActiveId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Documents
  const loadDocuments = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(apiUrls.admin.documents(), {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const result = await response.json();
        const list = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        setDocuments(list);
      } else {
        toast.error("Failed to load documents repository from server");
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Network error while loading documents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) loadDocuments();
  }, [token]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = documents.length;
    const active = documents.filter((d) => d.is_active).length;
    const inactive = total - active;
    const downloads = documents.reduce((sum, d) => sum + (d.download_count ?? 0), 0);
    const pastoral = documents.filter((d) => d.category?.toLowerCase() === "pastoral").length;
    return { total, active, inactive, downloads, pastoral };
  }, [documents]);

  // Filtered & Sorted Documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((d) => d.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((d) => !d.is_active);
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((d) => d.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((d) => {
        const titleMatch = d.title.toLowerCase().includes(q);
        const descMatch = d.description?.toLowerCase().includes(q);
        const catMatch = d.category?.toLowerCase().includes(q);
        const fileMatch = d.file.toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch || fileMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      }
      if (sortBy === "date-asc") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return da - db;
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "downloads") {
        return (b.download_count ?? 0) - (a.download_count ?? 0);
      }
      if (sortBy === "category") {
        const ca = a.category || "";
        const cb = b.category || "";
        return ca.localeCompare(cb);
      }
      return 0;
    });

    return result;
  }, [documents, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, sortBy, pageSize]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormTitle("");
    setFormCategory("pastoral");
    setFormDescription("");
    setFormFile(null);
    setFormFileUrl("");
    setFormFileSize("1.5 MB");
    setFormIsActive(true);
    setFormDownloadCount("0");
    setEditorModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormCategory(doc.category || "pastoral");
    setFormDescription(doc.description || "");
    setFormFile(null);
    setFormFileUrl(doc.file);
    setFormFileSize(doc.file_size || "1.5 MB");
    setFormIsActive(doc.is_active);
    setFormDownloadCount((doc.download_count ?? 0).toString());
    setEditorModalOpen(true);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Document file size must be less than 50MB");
        return;
      }
      setFormFile(file);

      // Auto compute human file size
      if (file.size >= 1048576) {
        setFormFileSize(`${(file.size / 1048576).toFixed(1)} MB`);
      } else {
        setFormFileSize(`${Math.round(file.size / 1024)} KB`);
      }
    }
  };

  // Submit Create / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !token) return;

    if (!formTitle.trim()) {
      toast.error("Please provide the document title");
      return;
    }

    if (!formFile && !formFileUrl.trim() && !editingDoc) {
      toast.error("Please upload a document file or provide a storage path");
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", formTitle.trim());
      fd.append("category", formCategory);
      if (formDescription.trim()) fd.append("description", formDescription.trim());
      fd.append("is_active", formIsActive ? "1" : "0");
      if (formFileSize.trim()) fd.append("file_size", formFileSize.trim());

      if (formFile) {
        fd.append("file", formFile);
      } else if (formFileUrl.trim()) {
        fd.append("file_url", formFileUrl.trim());
      }

      const url = editingDoc
        ? `${apiUrls.admin.documents()}/${editingDoc.id}`
        : apiUrls.admin.documents();

      if (editingDoc) {
        fd.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        body: fd
      });

      if (res.ok) {
        toast.success(editingDoc ? "Document details updated successfully" : "Official document registered successfully");
        setEditorModalOpen(false);
        loadDocuments();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to save document record");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Network error while submitting document");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Active
  const handleToggleActive = async (doc: DocumentItem) => {
    if (!token) return;
    setTogglingActiveId(doc.id);

    const newStatus = !doc.is_active;
    try {
      const res = await fetch(`${apiUrls.admin.documents()}/${doc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (res.ok) {
        setDocuments((prev) =>
          prev.map((item) => (item.id === doc.id ? { ...item, is_active: newStatus } : item))
        );
        toast.success(newStatus ? "Document published to diocesan portal" : "Document moved to drafts/hidden");
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

  // Trigger Delete Modal
  const handleConfirmDelete = (doc: DocumentItem) => {
    setDocToDelete(doc);
    setDeleteModalOpen(true);
  };

  // Execute Delete
  const handleDeleteDoc = async () => {
    if (!docToDelete || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${apiUrls.admin.documents()}/${docToDelete.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Document removed from diocesan archive");
        setDeleteModalOpen(false);
        setDocToDelete(null);
        loadDocuments();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error while deleting document");
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
                    <FileText className="h-4 w-4" />
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                    Official Documents & Archives
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live System
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden md:block">
                  Anglican Church of Rwanda, Shyogwe Diocese - Curate public pastoral letters, synod resolutions, canonical constitutions, and reports
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/documents"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#d4af37]" />
                Public Repository
              </Link>

              <button
                type="button"
                onClick={() => loadDocuments(true)}
                disabled={refreshing || loading}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                title="Refresh documents list"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#d4af37]" : ""}`} />
              </button>

              <Button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#d4af37] to-[#b39129] hover:from-[#c29f30] hover:to-[#9e7f22] text-[#0c1628] rounded-lg shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Document</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Executive Workspace Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Executive KPI Statistics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Publications */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Publications
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? "-" : stats.total}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Catalogued diocesan archives
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 2: Active & Public */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Active & Public
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {loading ? "-" : stats.active}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Available for download
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 3: Total Downloads */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Public Downloads
                  </p>
                  <p className="text-2xl font-bold text-[#0c1628] mt-1">
                    {loading ? "-" : stats.downloads}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Total access requests
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Download className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 4: Pastoral & Synod Archives */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pastoral & Synod
                  </p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {loading ? "-" : stats.pastoral}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Canons, letters & resolutions
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter, Sort & View Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
            {/* Status & Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
              {[
                { key: "all", label: "All Documents", count: stats.total },
                { key: "pastoral", label: "Pastoral & Synod", count: stats.pastoral },
                { key: "governance", label: "Governance & Canons", count: documents.filter((d) => d.category?.toLowerCase() === "governance").length },
                { key: "liturgical", label: "Liturgical Guides", count: documents.filter((d) => d.category?.toLowerCase() === "liturgical").length },
                { key: "reports", label: "Reports & Strategic", count: documents.filter((d) => d.category?.toLowerCase() === "reports").length },
                { key: "health", label: "Community Health", count: documents.filter((d) => d.category?.toLowerCase() === "health").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategoryFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    categoryFilter === tab.key
                      ? "bg-[#0c1628] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      categoryFilter === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input, Status Filter, Sort Order, Page Size & View Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search document title, narrative, category, or file..."
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
                {/* Status Filter */}
                <div className="w-[145px]">
                  <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                      <SelectItem value="active" className="text-xs">Active & Public</SelectItem>
                      <SelectItem value="inactive" className="text-xs">Drafts / Hidden</SelectItem>
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
                      <SelectItem value="date-desc" className="text-xs">Newest Published</SelectItem>
                      <SelectItem value="date-asc" className="text-xs">Oldest Published</SelectItem>
                      <SelectItem value="title" className="text-xs">Title (Alphabetical)</SelectItem>
                      <SelectItem value="downloads" className="text-xs">Most Downloaded</SelectItem>
                      <SelectItem value="category" className="text-xs">Category</SelectItem>
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
                      <SelectItem value="6" className="text-xs">6 per page</SelectItem>
                      <SelectItem value="9" className="text-xs">9 per page</SelectItem>
                      <SelectItem value="12" className="text-xs">12 per page</SelectItem>
                      <SelectItem value="18" className="text-xs">18 per page</SelectItem>
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
                    title="Visual Document Card Grid"
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
              <p className="text-sm font-semibold text-slate-800">Loading Official Documents Archive...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to diocesan repository</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-3">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Documents Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No documents match your current filter settings. Try clearing your filters or search query."
                  : "No official documents currently in the archive. Upload your first publication to begin."}
              </p>
              {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Visual Document Dossier Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedDocuments.map((doc) => {
                const fileDownloadUrl = buildStorageUrl(doc.file);

                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="p-5 flex items-start gap-3.5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-700 flex-shrink-0">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                              {getCategoryLabel(doc.category)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                doc.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {doc.is_active ? "Public" : "Draft"}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5" title={doc.title}>
                            {doc.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Published: {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Description & Technical Meta */}
                      <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {doc.description || "Official diocesan publication and canonical record issued for clergy and lay faithful."}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                            <Download className="h-3.5 w-3.5 text-slate-400" />
                            {doc.download_count ?? 0} downloads
                          </span>
                          <span>&bull;</span>
                          <span className="font-mono text-slate-600">
                            {doc.file_size || "1.5 MB"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                      {/* Left: Open/Download file */}
                      <a
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-[#0c1628] hover:text-blue-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 text-[#d4af37]" />
                        <span>Download PDF</span>
                      </a>

                      {/* Right: Quick actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(doc)}
                          disabled={togglingActiveId === doc.id}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors mr-1 ${
                            doc.is_active
                              ? "text-emerald-700 hover:text-emerald-800"
                              : "text-amber-700 hover:text-amber-800"
                          }`}
                        >
                          {togglingActiveId === doc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin inline" />
                          ) : doc.is_active ? (
                            "Live"
                          ) : (
                            "Draft"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-200/60 rounded transition-colors"
                          title="Edit document"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(doc)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete document"
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
                      <th className="py-3 px-4 w-12">Type</th>
                      <th className="py-3 px-4">Publication Title & Abstract</th>
                      <th className="py-3 px-4 w-40">Category</th>
                      <th className="py-3 px-4 w-28">File Size</th>
                      <th className="py-3 px-4 w-28">Downloads</th>
                      <th className="py-3 px-4 w-32">Published</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDocuments.map((doc) => {
                      const fileDownloadUrl = buildStorageUrl(doc.file);

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* File Type Icon */}
                          <td className="py-3 px-4">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 w-fit">
                              <FileText className="h-4 w-4" />
                            </div>
                          </td>

                          {/* Title & Description */}
                          <td className="py-3 px-4 max-w-sm">
                            <div className="font-semibold text-slate-900 truncate">
                              {doc.title}
                            </div>
                            {doc.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {doc.description}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                              {getCategoryLabel(doc.category)}
                            </span>
                          </td>

                          {/* File Size */}
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {doc.file_size || "1.5 MB"}
                          </td>

                          {/* Download Count */}
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {doc.download_count ?? 0}
                          </td>

                          {/* Published Date */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {formatDate(doc.created_at)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(doc)}
                              disabled={togglingActiveId === doc.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                doc.is_active
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              {togglingActiveId === doc.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    doc.is_active ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                />
                              )}
                              {doc.is_active ? "Public" : "Draft"}
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={fileDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(doc)}
                                className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-100 rounded transition-colors"
                                title="Edit document details"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(doc)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete document"
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
          {filteredDocuments.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredDocuments.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredDocuments.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{filteredDocuments.length}</span> documents
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
      {/* MODAL 1: Upload & Edit Official Document Dialog           */}
      {/* ======================================================== */}
      <Dialog open={editorModalOpen} onOpenChange={setEditorModalOpen}>
        <DialogContent className="max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <DialogHeader className="p-6 bg-[#0c1628] text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {editingDoc ? "Edit Official Document" : "Publish Official Document"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-0.5">
                  Upload canonical documents, resolutions, reports, and liturgical lectionaries
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitForm}>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Document Title */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Document Title *</Label>
                <Input
                  type="text"
                  placeholder="e.g., Diocesan Strategic Plan (2024–2029)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="text-xs bg-slate-50 border-slate-200"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Archival Category</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pastoral" className="text-xs">Pastoral & Synod</SelectItem>
                      <SelectItem value="governance" className="text-xs">Governance & Canons</SelectItem>
                      <SelectItem value="liturgical" className="text-xs">Liturgical Guides</SelectItem>
                      <SelectItem value="reports" className="text-xs">Reports & Strategic</SelectItem>
                      <SelectItem value="health" className="text-xs">Community Health</SelectItem>
                      <SelectItem value="forms" className="text-xs">Forms & Administration</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="active" className="text-xs">Active & Public</SelectItem>
                      <SelectItem value="inactive" className="text-xs">Draft / Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description Abstract */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Document Abstract / Description</Label>
                <Textarea
                  placeholder="Summary of document purpose, canonical authority, target audiences, and key resolutions..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="text-xs bg-slate-50 border-slate-200"
                />
              </div>

              {/* File Upload / Storage Path */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700">Document File (PDF / DOCX)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#d4af37] bg-slate-50/70 p-5 rounded-xl text-center cursor-pointer transition-colors"
                >
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-800">
                    {formFile ? formFile.name : "Click to browse document file"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PDF, DOCX, XLSX up to 50MB.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">Storage Path / Direct URL</Label>
                    <Input
                      type="text"
                      placeholder="e.g., /storage/documents/... or https://..."
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600">File Size Tag</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 2.4 MB"
                      value={formFileSize}
                      onChange={(e) => setFormFileSize(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
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
                    Saving Document...
                  </>
                ) : editingDoc ? (
                  "Update Document"
                ) : (
                  "Publish Document"
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
                Delete Official Document?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this publication from the diocesan archives? This action cannot be undone.
              </p>
            </div>

            {docToDelete && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left">
                <div className="p-2 rounded bg-blue-50 text-blue-700 flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-800 truncate">{docToDelete.title}</p>
                  <p className="text-slate-500 text-[11px] truncate">
                    {getCategoryLabel(docToDelete.category)} &bull; {docToDelete.file_size || "1.5 MB"}
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
                onClick={handleDeleteDoc}
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

export default DocumentsManagement;
