import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Lock,
  Unlock,
  Key,
  Shield,
  FileText,
  Eye,
  EyeOff,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  BarChart3,
  Copy,
  Check,
  Globe,
  Users,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  AlertTriangle,
  FolderLock,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface SecureDocument {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_size_human: string;
  access_level: "public" | "password" | "role_based";
  allowed_roles: string[] | null;
  is_public: boolean;
  is_active: boolean;
  download_allowed: boolean;
  download_count: number;
  view_count: number;
  last_downloaded_at: string | null;
  uploaded_by: string | null;
  password?: string | null;
  created_at: string;
  updated_at?: string;
}

const DEFAULT_CATEGORIES = [
  "All Archives",
  "Synod & Councils",
  "Financial Audits",
  "Clergy & Personnel",
  "Legal & Assets",
  "Episcopal Decrees",
  "Health Facilities"
];

const SecureDocumentsManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Archives");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState<"newest" | "views" | "downloads" | "size" | "title">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Password visibility & clipboard state
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Upload & Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SecureDocument | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formAccessLevel, setFormAccessLevel] = useState<"public" | "password" | "role_based">("password");
  const [formPassword, setFormPassword] = useState("");
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formAllowedRoles, setFormAllowedRoles] = useState<string[]>(["admin"]);
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDownloadAllowed, setFormDownloadAllowed] = useState(true);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<SecureDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrls.admin.secureDocuments(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        setDocuments(result.data || []);
      } else {
        toast({
          title: "Failed to Fetch Vault",
          description: "Unable to retrieve secure archives. Please check administrative credentials.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to communicate with the diocesan vault service.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDocuments();
    }
  }, [token]);

  // Dynamic Categories list
  const categoriesList = useMemo(() => {
    const fromDocs = documents.map((d) => d.category).filter(Boolean) as string[];
    const combined = Array.from(new Set([...DEFAULT_CATEGORIES.slice(1), ...fromDocs]));
    return ["All Archives", ...combined];
  }, [documents]);

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      if (selectedCategory !== "All Archives" && doc.category !== selectedCategory) {
        return false;
      }

      // Access level filter
      if (selectedAccessLevel !== "all" && doc.access_level !== selectedAccessLevel) {
        return false;
      }

      // Status filter
      if (selectedStatus === "active" && !doc.is_active) return false;
      if (selectedStatus === "inactive" && doc.is_active) return false;
      if (selectedStatus === "public" && !doc.is_public) return false;
      if (selectedStatus === "private" && doc.is_public) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesDesc = doc.description?.toLowerCase().includes(q) || false;
        const matchesCat = doc.category?.toLowerCase().includes(q) || false;
        const matchesFile = doc.original_filename.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesFile) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortField === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortField === "views") {
        return (b.view_count || 0) - (a.view_count || 0);
      }
      if (sortField === "downloads") {
        return (b.download_count || 0) - (a.download_count || 0);
      }
      if (sortField === "size") {
        return (b.file_size || 0) - (a.file_size || 0);
      }
      if (sortField === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [documents, selectedCategory, selectedAccessLevel, selectedStatus, searchQuery, sortField]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDocuments.length / pageSize) || 1;
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Toggle Password Visibility
  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Copy Password to Clipboard
  const copyPassword = async (docId: number, pass: string) => {
    try {
      await navigator.clipboard.writeText(pass);
      setCopiedId(docId);
      toast({
        title: "Passcode Copied",
        description: "Document access passcode has been copied to your clipboard."
      });
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Unable to access clipboard. Please copy manually.",
        variant: "destructive"
      });
    }
  };

  // Toggle Public Visibility
  const togglePublic = async (id: number) => {
    try {
      const res = await fetch(apiUrls.admin.secureDocumentTogglePublic(id), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Visibility Updated",
          description: result.message || "Document public status has been updated."
        });
        loadDocuments();
      } else {
        toast({
          title: "Action Failed",
          description: "Could not toggle public visibility.",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to communicate with vault controller.",
        variant: "destructive"
      });
    }
  };

  // Toggle Download Allowed
  const toggleDownloadAllowed = async (id: number) => {
    try {
      const res = await fetch(apiUrls.admin.secureDocumentToggleDownload(id), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: "Permission Updated",
          description: result.message || "Document download permissions modified."
        });
        loadDocuments();
      } else {
        toast({
          title: "Action Failed",
          description: "Could not toggle download permission.",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to communicate with vault controller.",
        variant: "destructive"
      });
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingDoc(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategory(selectedCategory !== "All Archives" ? selectedCategory : "Synod & Councils");
    setFormFile(null);
    setFormAccessLevel("password");
    setFormPassword("");
    setFormShowPassword(false);
    setFormAllowedRoles(["admin"]);
    setFormIsPublic(true);
    setFormIsActive(true);
    setFormDownloadAllowed(true);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (doc: SecureDocument) => {
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormDescription(doc.description || "");
    setFormCategory(doc.category || "Synod & Councils");
    setFormFile(null);
    setFormAccessLevel(doc.access_level);
    setFormPassword("");
    setFormShowPassword(false);
    setFormAllowedRoles(doc.allowed_roles || ["admin"]);
    setFormIsPublic(doc.is_public);
    setFormIsActive(doc.is_active);
    setFormDownloadAllowed(doc.download_allowed);
    setIsModalOpen(true);
  };

  // Handle Role Checkbox Toggle
  const toggleRole = (role: string) => {
    setFormAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Generate Suggested Secure Passcode
  const generatePasscode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!#$@";
    let code = "EAR-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(code);
    setFormShowPassword(true);
  };

  // Form Submit
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast({
        title: "Required Information",
        description: "Please enter an official title for the document.",
        variant: "destructive"
      });
      return;
    }

    if (!editingDoc && !formFile) {
      toast({
        title: "File Required",
        description: "Please select an ecclesiastical file to upload.",
        variant: "destructive"
      });
      return;
    }

    if (formAccessLevel === "password" && !editingDoc && !formPassword) {
      toast({
        title: "Passcode Required",
        description: "Password-protected archives require an access passcode.",
        variant: "destructive"
      });
      return;
    }

    if (formAccessLevel === "role_based" && formAllowedRoles.length === 0) {
      toast({
        title: "Role Required",
        description: "Please select at least one authorized role.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", formTitle);
      if (formDescription) fd.append("description", formDescription);
      if (formCategory) fd.append("category", formCategory);
      if (formFile) fd.append("file", formFile);
      fd.append("access_level", formAccessLevel);

      if (formAccessLevel === "password" && formPassword) {
        fd.append("password", formPassword);
      }

      if (formAccessLevel === "role_based") {
        formAllowedRoles.forEach((role) => {
          fd.append("allowed_roles[]", role);
        });
      }

      fd.append("is_public", formIsPublic ? "1" : "0");
      fd.append("is_active", formIsActive ? "1" : "0");
      fd.append("download_allowed", formDownloadAllowed ? "1" : "0");

      let res: Response;
      if (editingDoc) {
        // Use POST with spoofing or PUT for update
        res = await fetch(`${apiUrls.admin.secureDocuments()}/${editingDoc.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: fd
        });
      } else {
        res = await fetch(apiUrls.admin.secureDocuments(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: fd
        });
      }

      if (res.ok) {
        toast({
          title: editingDoc ? "Document Updated" : "Vault Entry Added",
          description: editingDoc
            ? "The secure document metadata has been successfully updated."
            : "The document has been securely stored and indexed in the diocesan vault."
        });
        setIsModalOpen(false);
        loadDocuments();
      } else {
        const err = await res.json().catch(() => null);
        toast({
          title: "Operation Failed",
          description: err?.message || Object.values(err?.errors || {}).flat()[0] || "Unable to save document.",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the diocesan vault service.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Document
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(apiUrls.admin.secureDocument(deleteTarget.id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast({
          title: "Document Removed",
          description: `"${deleteTarget.title}" has been permanently purged from the secure vault.`
        });
        setDeleteTarget(null);
        loadDocuments();
      } else {
        toast({
          title: "Deletion Failed",
          description: "Unable to delete the document from vault storage.",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to connect to vault controller.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  // Helper for File Icon
  const getFileBadge = (fileType: string) => {
    const ext = fileType.toLowerCase();
    if (ext === "pdf") {
      return {
        icon: FileText,
        color: "text-red-700 bg-red-50 border-red-200",
        label: "PDF Document"
      };
    }
    if (["doc", "docx"].includes(ext)) {
      return {
        icon: FileText,
        color: "text-blue-700 bg-blue-50 border-blue-200",
        label: "Word Document"
      };
    }
    if (["xls", "xlsx"].includes(ext)) {
      return {
        icon: FileSpreadsheet,
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        label: "Spreadsheet"
      };
    }
    return {
      icon: FileCode,
      color: "text-slate-700 bg-slate-100 border-slate-200",
      label: ext.toUpperCase()
    };
  };

  // KPI Metrics Calculation
  const totalCount = documents.length;
  const passwordCount = documents.filter((d) => d.access_level === "password").length;
  const roleCount = documents.filter((d) => d.access_level === "role_based").length;
  const totalViews = documents.reduce((sum, d) => sum + (d.view_count || 0), 0);
  const totalDownloads = documents.reduce((sum, d) => sum + (d.download_count || 0), 0);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Diocesan Unified Admin Sidebar */}
      <AdminSidebar currentPath="/admin/secure-documents" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <span>Diocese of Shyogwe</span>
                <span>/</span>
                <span>Documents & Archives</span>
                <span>/</span>
                <span className="text-[#0c1628] font-semibold">Secure Vault</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0c1628] text-[#d4af37] flex items-center justify-center shadow-xs">
                  <FolderLock className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Secure Documents Vault
                  </h1>
                  <p className="text-xs text-slate-500">
                    Encrypted diocesan archives, access-restricted synod records, and legal repositories
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDocuments}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs inline-flex items-center gap-1.5"
                title="Refresh Vault Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0c1628] hover:bg-[#162744] rounded-lg transition-colors shadow-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>Upload Secure Document</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Executive KPI Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vault Archives
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
                <span className="text-xs text-slate-500">classified files</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Password Protected
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-900">{passwordCount}</span>
                <span className="text-xs text-slate-500">passcode access</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Role Restricted
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-900">{roleCount}</span>
                <span className="text-xs text-slate-500">clergy & executive</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Vault Engagement
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-900">{totalViews}</span>
                <span className="text-xs text-slate-500">views ({totalDownloads} downloads)</span>
              </div>
            </div>
          </div>

          {/* Multi-Axis Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#0c1628] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search vault archives..."
                  className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
                {/* Access Level Selector */}
                <select
                  value={selectedAccessLevel}
                  onChange={(e) => {
                    setSelectedAccessLevel(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <option value="all">All Access Levels</option>
                  <option value="password">Password Protected</option>
                  <option value="role_based">Role-Based</option>
                  <option value="public">Public</option>
                </select>

                {/* Status Selector */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="public">Public Listed</option>
                  <option value="private">Private Vault Only</option>
                </select>

                {/* Sort Field */}
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="views">Sort: Most Viewed</option>
                  <option value="downloads">Sort: Most Downloaded</option>
                  <option value="size">Sort: File Size</option>
                  <option value="title">Sort: Title (A-Z)</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-slate-50 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="Grid Dossier View"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                    title="Tabular Data View"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content View */}
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Accessing Diocesan Secure Vault...</p>
              <p className="text-xs text-slate-500 mt-1">Verifying administrative access permissions and catalog</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-slate-800">No vault documents found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No ecclesiastical archives matched your current filter criteria. Try adjusting the search term or category.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Archives");
                    setSelectedAccessLevel("all");
                    setSelectedStatus("all");
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Dossier Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedDocuments.map((doc) => {
                const badge = getFileBadge(doc.file_type);
                const IconComponent = badge.icon;
                const isPasswordShown = visiblePasswords.has(doc.id);
                const hasPassword = Boolean(doc.password);

                return (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Top Header Card Bar */}
                      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${badge.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                              {doc.category || "General Archive"}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {doc.file_type.toUpperCase()} • {doc.file_size_human}
                            </span>
                          </div>
                        </div>

                        {/* Access Level Badge */}
                        <div className="shrink-0">
                          {doc.access_level === "password" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Key className="w-3 h-3 text-amber-600" />
                              Passcode
                            </span>
                          )}
                          {doc.access_level === "role_based" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              <Shield className="w-3 h-3 text-blue-600" />
                              Role Restricted
                            </span>
                          )}
                          {doc.access_level === "public" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Globe className="w-3 h-3 text-emerald-600" />
                              Public
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {doc.description || "No specific dossier description provided for this classified ecclesiastical archive."}
                          </p>
                        </div>

                        {/* Password Section if Password Protected */}
                        {doc.access_level === "password" && (
                          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Key className="w-3.5 h-3.5 text-amber-700" />
                              <span className="text-[11px] text-amber-800 font-medium">Access Passcode:</span>
                              <span className="font-mono font-semibold text-slate-900">
                                {isPasswordShown
                                  ? doc.password
                                    ? doc.password.startsWith("$2y$")
                                      ? "Encrypted (Bcrypt)"
                                      : doc.password
                                    : "Default"
                                  : "••••••••"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {hasPassword && !doc.password?.startsWith("$2y$") && (
                                <button
                                  type="button"
                                  onClick={() => copyPassword(doc.id, doc.password!)}
                                  className="p-1 rounded text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition-colors"
                                  title="Copy Passcode"
                                >
                                  {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(doc.id)}
                                className="p-1 rounded text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition-colors"
                                title={isPasswordShown ? "Hide Passcode" : "Reveal Passcode"}
                              >
                                {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Allowed Roles Chip if role_based */}
                        {doc.access_level === "role_based" && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-500 font-medium">Authorized:</span>
                            {(doc.allowed_roles || ["admin"]).map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 uppercase"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Metric Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            {doc.view_count || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3 text-slate-400" />
                            {doc.download_count || 0} downloads
                          </span>
                          <span className="flex items-center gap-1">
                            {doc.download_allowed ? (
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Save Allowed
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> View Only
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePublic(doc.id)}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            doc.is_public
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title={doc.is_public ? "Public on website (Click to hide)" : "Hidden from public (Click to publish)"}
                        >
                          {doc.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDownloadAllowed(doc.id)}
                          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            doc.download_allowed
                              ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                          }`}
                          title={doc.download_allowed ? "Download enabled (Click to disable)" : "Download disabled (Click to enable)"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/admin/secure-documents/${doc.id}/analytics`)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                          title="View Security & Download Analytics"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Edit Document Parameters"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Purge Document from Vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tabular Data View */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Document Title & File</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Access Level</th>
                      <th className="py-3 px-4">Passcode / Roles</th>
                      <th className="py-3 px-4">Metrics</th>
                      <th className="py-3 px-4">Controls</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDocuments.map((doc) => {
                      const badge = getFileBadge(doc.file_type);
                      const IconComponent = badge.icon;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${badge.color}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <span className="font-bold text-slate-900 block truncate">{doc.title}</span>
                                <span className="text-[11px] text-slate-400 font-mono truncate block">
                                  {doc.original_filename} ({doc.file_size_human})
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                              {doc.category || "General"}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {doc.access_level === "password" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Key className="w-3 h-3 text-amber-600" />
                                Password
                              </span>
                            )}
                            {doc.access_level === "role_based" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                <Shield className="w-3 h-3 text-blue-600" />
                                Role-Based
                              </span>
                            )}
                            {doc.access_level === "public" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Globe className="w-3 h-3 text-emerald-600" />
                                Public
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {doc.access_level === "password" && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700 font-medium">
                                  {visiblePasswords.has(doc.id)
                                    ? doc.password?.startsWith("$2y$")
                                      ? "Encrypted"
                                      : doc.password || "Set"
                                    : "••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(doc.id)}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  {visiblePasswords.has(doc.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                            {doc.access_level === "role_based" && (
                              <span className="text-[11px] text-slate-600 font-mono">
                                {(doc.allowed_roles || ["admin"]).join(", ")}
                              </span>
                            )}
                            {doc.access_level === "public" && (
                              <span className="text-slate-400 text-[11px]">Unrestricted</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500">
                            <div>{doc.view_count || 0} views</div>
                            <div>{doc.download_count || 0} downloads</div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  doc.is_public ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {doc.is_public ? "Public" : "Private"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  doc.download_allowed ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {doc.download_allowed ? "DL On" : "DL Off"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/secure-documents/${doc.id}/analytics`)}
                                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                title="Analytics"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(doc)}
                                className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(doc)}
                                className="p-1 rounded text-slate-500 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
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

          {/* Pagination Controls */}
          {filteredDocuments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredDocuments.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{filteredDocuments.length}</span> classified files
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs px-2 py-1 rounded border border-slate-300 bg-white"
                  >
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-xs font-semibold text-slate-700 px-3 py-1 bg-white border border-slate-300 rounded-lg">
                    {currentPage} / {totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Upload & Edit Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0c1628] text-[#d4af37] flex items-center justify-center">
                  <FolderLock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingDoc ? "Edit Vault Entry" : "Upload Secure Ecclesiastical Document"}
                  </h2>
                  <p className="text-xs text-slate-500">Configure file classification and authentication requirements</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDocument} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Official Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Synod Executive Minutes 2025"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Classification Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Synod & Councils, Financial Audits"
                    required
                    list="vault-categories-list"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                  <datalist id="vault-categories-list">
                    {categoriesList.filter((c) => c !== "All Archives").map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Executive Description & Archival Notes
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summary of canonical resolutions, scope of audit, or intended recipients..."
                  rows={2}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Ecclesiastical File {editingDoc ? "(Leave blank to keep existing file)" : <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="vault-file-picker"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="vault-file-picker"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">
                      {formFile ? formFile.name : "Select or drag file from your workstation"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Supports PDF, Word (DOCX), Excel (XLSX), PPTX up to 20MB
                    </span>
                  </label>
                  {formFile && (
                    <div className="mt-2 text-xs font-medium text-emerald-700">
                      Selected: {(formFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                  {editingDoc && !formFile && (
                    <div className="mt-2 text-xs text-slate-500 font-mono">
                      Current: {editingDoc.original_filename} ({editingDoc.file_size_human})
                    </div>
                  )}
                </div>
              </div>

              {/* Access Control Level */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-700" />
                    Security & Access Protocol
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formAccessLevel === "password"
                        ? "bg-amber-50/70 border-amber-300 text-amber-950 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_level"
                      value="password"
                      checked={formAccessLevel === "password"}
                      onChange={() => setFormAccessLevel("password")}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-600" /> Password
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Requires passcode</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formAccessLevel === "role_based"
                        ? "bg-blue-50/70 border-blue-300 text-blue-950 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_level"
                      value="role_based"
                      checked={formAccessLevel === "role_based"}
                      onChange={() => setFormAccessLevel("role_based")}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-600" /> Role-Based
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Requires login role</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formAccessLevel === "public"
                        ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_level"
                      value="public"
                      checked={formAccessLevel === "public"}
                      onChange={() => setFormAccessLevel("public")}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-600" /> Public
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Unrestricted view</div>
                    </div>
                  </label>
                </div>

                {/* Conditional Password Input */}
                {formAccessLevel === "password" && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Access Passcode {editingDoc && <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}
                      </label>
                      <button
                        type="button"
                        onClick={generatePasscode}
                        className="text-[11px] font-semibold text-amber-700 hover:text-amber-900"
                      >
                        Generate Passcode
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={formShowPassword ? "text" : "password"}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Enter secure passcode"
                        className="w-full text-xs font-mono px-3.5 py-2 pr-10 rounded-lg border border-slate-300 focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setFormShowPassword(!formShowPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Conditional Role Checkboxes */}
                {formAccessLevel === "role_based" && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Authorized Diocesan Roles</label>
                    <div className="flex items-center gap-4 text-xs">
                      {["admin", "editor", "viewer"].map((role) => (
                        <label key={role} className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={formAllowedRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                            className="rounded text-blue-600"
                          />
                          <span className="capitalize">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublic}
                    onChange={(e) => setFormIsPublic(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="font-medium text-slate-800">Show on Public Vault</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="font-medium text-slate-800">Active & Accessible</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDownloadAllowed}
                    onChange={(e) => setFormDownloadAllowed(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="font-medium text-slate-800">Allow File Downloads</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0c1628] hover:bg-[#162744] rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Vault...</span>
                    </>
                  ) : (
                    <>
                      <FolderLock className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{editingDoc ? "Update Vault Entry" : "Save to Vault"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">Purge Document from Vault?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to permanently purge <span className="font-semibold text-slate-800">"{deleteTarget.title}"</span> from the diocesan secure repository. This will destroy all associated file attachments and download tracking logs.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Purge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureDocumentsManagement;
