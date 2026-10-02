import React, { useState, useEffect, useMemo } from "react";
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
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Menu,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Calendar,
  User,
  Star,
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  Archive,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  image?: string;
  images?: string[];
  author?: string;
  status: "published" | "draft" | "archived" | string;
  featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

const resolveNewsImageUrl = (imagePath?: string): string => {
  return buildStorageUrl(imagePath);
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, originalPath?: string) => {
  const img = e.currentTarget;
  if (!img.dataset.triedLocal && originalPath && !originalPath.startsWith("http") && !originalPath.startsWith("blob:")) {
    img.dataset.triedLocal = "true";
    const clean = originalPath.replace(/^\/+/, "").replace(/^storage\//, "");
    img.src = `http://localhost:8000/api/storage/${clean}`;
  } else {
    img.src = "/placeholder.svg";
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Unscheduled";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "Invalid date";
  }
};

export const NewsManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "featured" | "draft" | "archived">("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title">("date-desc");

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<NewsArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<number | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formStatus, setFormStatus] = useState<"published" | "draft" | "archived">("published");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublishedAt, setFormPublishedAt] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch news articles from backend
  const fetchArticles = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch all articles without restriction on status
      const response = await fetch(`${apiUrls.news()}?status=all&limit=200`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && Array.isArray(resData.data)) {
        setArticles(resData.data);
      } else if (Array.isArray(resData)) {
        setArticles(resData);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error("Failed to fetch news articles:", err);
      toast.error("Could not load news articles from server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Extract unique authors
  const uniqueAuthors = useMemo(() => {
    const authorsSet = new Set<string>();
    articles.forEach((a) => {
      if (a.author && a.author.trim()) {
        authorsSet.add(a.author.trim());
      }
    });
    return Array.from(authorsSet).sort();
  }, [articles]);

  // Executive KPI metrics
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === "published").length;
    const featured = articles.filter((a) => a.featured).length;
    const drafts = articles.filter((a) => a.status === "draft").length;
    const archived = articles.filter((a) => a.status === "archived").length;
    return { total, published, featured, drafts, archived };
  }, [articles]);

  // Filtered and sorted articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        // Status tab filter
        if (statusFilter === "published" && article.status !== "published") return false;
        if (statusFilter === "featured" && !article.featured) return false;
        if (statusFilter === "draft" && article.status !== "draft") return false;
        if (statusFilter === "archived" && article.status !== "archived") return false;

        // Author filter
        if (selectedAuthor !== "all" && article.author !== selectedAuthor) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = article.title.toLowerCase().includes(q);
          const matchSummary = article.summary?.toLowerCase().includes(q) || false;
          const matchAuthor = article.author?.toLowerCase().includes(q) || false;
          const matchContent = article.content?.toLowerCase().includes(q) || false;
          return matchTitle || matchSummary || matchAuthor || matchContent;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        const timeA = new Date(a.published_at || a.created_at).getTime() || 0;
        const timeB = new Date(b.published_at || b.created_at).getTime() || 0;
        return sortBy === "date-desc" ? timeB - timeA : timeA - timeB;
      });
  }, [articles, statusFilter, selectedAuthor, searchQuery, sortBy]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormTitle("");
    setFormAuthor("EAR Shyogwe Diocese");
    setFormStatus("published");
    setFormFeatured(false);
    setFormPublishedAt(new Date().toISOString().slice(0, 16));
    setFormSummary("");
    setFormContent("");
    setFormImage("");
    setFormImages([]);
    setEditorOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormTitle(article.title || "");
    setFormAuthor(article.author || "");
    setFormStatus((article.status as "published" | "draft" | "archived") || "published");
    setFormFeatured(!!article.featured);
    if (article.published_at) {
      try {
        setFormPublishedAt(new Date(article.published_at).toISOString().slice(0, 16));
      } catch {
        setFormPublishedAt("");
      }
    } else {
      setFormPublishedAt("");
    }
    setFormSummary(article.summary || "");
    setFormContent(article.content || "");
    setFormImage(article.image || "");
    setFormImages(Array.isArray(article.images) ? article.images : []);
    setEditorOpen(true);
  };

  // Upload main image
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      toast.error("Authentication required for image upload");
      return;
    }

    try {
      setUploadingMainImage(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "news");

      const response = await fetch(apiUrls.uploadImage(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload request failed");
      }

      const resData = await response.json();
      if (resData.success && resData.data?.url) {
        setFormImage(resData.data.url);
        toast.success("Main cover image uploaded successfully");
      } else {
        toast.error(resData.message || "Failed to process image");
      }
    } catch (err) {
      console.error("Main image upload failed:", err);
      toast.error("Image upload encountered an error");
    } finally {
      setUploadingMainImage(false);
      e.target.value = "";
    }
  };

  // Upload gallery image
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      toast.error("Authentication required for image upload");
      return;
    }

    try {
      setUploadingGalleryImage(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "news");

      const response = await fetch(apiUrls.uploadImage(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload request failed");
      }

      const resData = await response.json();
      if (resData.success && resData.data?.url) {
        setFormImages((prev) => [...prev, resData.data.url]);
        toast.success("Gallery image added");
      } else {
        toast.error(resData.message || "Failed to process image");
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.error("Could not upload gallery photo");
    } finally {
      setUploadingGalleryImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
    toast.info("Image removed from gallery");
  };

  // Save (Create or Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error("Article title is required");
      return;
    }
    if (!formContent.trim()) {
      toast.error("Article content is required");
      return;
    }

    try {
      setSubmitting(true);
      const isEditing = !!editingArticle;
      const url = isEditing ? apiUrls.newsItem(editingArticle.id) : apiUrls.news();
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        title: formTitle.trim(),
        author: formAuthor.trim() || undefined,
        status: formStatus,
        featured: formFeatured,
        published_at: formPublishedAt ? new Date(formPublishedAt).toISOString() : undefined,
        summary: formSummary.trim() || undefined,
        content: formContent.trim(),
        image: formImage.trim() || undefined,
        images: formImages.length > 0 ? formImages : []
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to save article");
      }

      toast.success(isEditing ? "News article updated successfully" : "News article created successfully");
      setEditorOpen(false);
      await fetchArticles();
    } catch (err: any) {
      console.error("Save article error:", err);
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  // Instant toggle for featured status
  const handleToggleFeatured = async (article: NewsArticle) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const nextState = !article.featured;
    setTogglingFeaturedId(article.id);

    // Optimistic local update
    setArticles((prev) =>
      prev.map((item) => (item.id === article.id ? { ...item, featured: nextState } : item))
    );

    try {
      const response = await fetch(apiUrls.newsItem(article.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ featured: nextState })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(
        nextState
          ? `Article "${article.title.slice(0, 30)}..." marked as Featured`
          : `Article removed from Featured highlights`
      );
    } catch (err) {
      // Revert optimistic update
      setArticles((prev) =>
        prev.map((item) => (item.id === article.id ? { ...item, featured: !nextState } : item))
      );
      toast.error("Failed to update featured flag on server");
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  // Open Delete confirmation
  const handlePromptDelete = (article: NewsArticle) => {
    setSelectedToDelete(article);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(apiUrls.newsItem(selectedToDelete.id), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete article");
      }

      toast.success("News article deleted permanently");
      setArticles((prev) => prev.filter((item) => item.id !== selectedToDelete.id));
      setDeleteModalOpen(false);
      setSelectedToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Could not delete article");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Draft
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Archive className="w-3 h-3 text-slate-500" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Institutional Collapsible Admin Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="/admin/news"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Institutional Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-church-navy"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>Diocese Portal</span>
                  <span>/</span>
                  <span>Media & Publications</span>
                  <span>/</span>
                  <span className="text-church-navy font-semibold">News Releases</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-church-navy tracking-tight mt-0.5">
                  Press & News Bureau
                </h1>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchArticles(true)}
                disabled={refreshing}
                className="text-xs text-slate-600 hover:text-church-navy border-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs text-slate-700 hover:text-church-navy border-slate-300"
              >
                <Link to="/news" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Public Newsroom</span>
                </Link>
              </Button>

              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="bg-church-navy hover:bg-church-navy/90 text-white font-medium shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>New Article</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Executive KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Total Publications */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Stories
                </span>
                <div className="w-9 h-9 rounded-lg bg-church-navy/10 flex items-center justify-center text-church-navy">
                  <Newspaper className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-church-navy">
                  {stats.total}
                </span>
                <span className="text-xs text-slate-500 font-medium">Recorded</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Archival Diocesan documentation</p>
            </div>

            {/* Published & Live */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Live & Published
                </span>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {stats.published}
                </span>
                <span className="text-xs text-emerald-600 font-medium">Public</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Visible across main website</p>
            </div>

            {/* Featured Highlights */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Featured Highlights
                </span>
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Star className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {stats.featured}
                </span>
                <span className="text-xs text-amber-600 font-medium">Top Tier</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Pinned to homepage & carousels</p>
            </div>

            {/* Drafts & In-Review */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Drafts & Archived
                </span>
                <div className="w-9 h-9 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-700">
                  {stats.drafts + stats.archived}
                </span>
                <span className="text-xs text-slate-500 font-medium">Internal</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                {stats.drafts} drafts, {stats.archived} archived
              </p>
            </div>
          </div>

          {/* Interactive Filtering & View Mode Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "all"
                    ? "bg-church-navy text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Stories ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "published"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Published ({stats.published})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("featured")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "featured"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Featured ({stats.featured})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "draft"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Drafts ({stats.drafts})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("archived")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "archived"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Archived ({stats.archived})
              </button>
            </div>

            {/* Search, Author Filter & View Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search articles, excerpts, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-9 text-xs border-slate-200 focus-visible:ring-church-navy bg-slate-50/50"
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

              {/* Secondary Controls */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Author Dropdown */}
                {uniqueAuthors.length > 0 && (
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[170px] border-slate-200">
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {uniqueAuthors.map((author) => (
                        <SelectItem key={author} value={author}>
                          {author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                  <SelectTrigger className="h-9 text-xs w-[130px] sm:w-[150px] border-slate-200">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="title">Alphabetical (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-church-navy shadow-xs font-semibold"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === "table"
                        ? "bg-white text-church-navy shadow-xs font-semibold"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-9 h-9 text-church-navy animate-spin mb-3" />
              <p className="text-sm font-semibold text-church-navy">Loading News Archive...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving stories from EAR Shyogwe Diocese database</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Newspaper className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-church-navy">No News Articles Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                {searchQuery || statusFilter !== "all" || selectedAuthor !== "all"
                  ? "No releases matched your current filter criteria. Try resetting your search or tabs."
                  : "No press releases are currently stored in the system. Create your first diocesan story below."}
              </p>
              {searchQuery || statusFilter !== "all" || selectedAuthor !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSelectedAuthor("all");
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={handleOpenCreate}
                  size="sm"
                  className="bg-church-navy hover:bg-church-navy/90 text-white text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Publish First Article
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Editorial Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => {
                const coverUrl = resolveNewsImageUrl(article.image);
                const hasGallery = Array.isArray(article.images) && article.images.length > 0;

                return (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={coverUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, article.image)}
                      />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                        <div className="pointer-events-auto">{getStatusBadge(article.status)}</div>

                        <div className="flex items-center gap-1.5 pointer-events-auto">
                          {article.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          )}

                          {hasGallery && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-xs text-white">
                              <ImageIcon className="w-3 h-3" />
                              +{article.images?.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      {/* Meta: Date & Author */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                        {article.author && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{article.author}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-bold text-church-navy leading-snug line-clamp-2 group-hover:text-church-gold transition-colors mb-2">
                        {article.title}
                      </h2>

                      {/* Excerpt Summary */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed flex-1">
                        {article.summary || article.content.replace(/<[^>]*>?/gm, "").slice(0, 160)}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Instant Quick-Toggle Featured */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(article)}
                          disabled={togglingFeaturedId === article.id}
                          className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                            article.featured
                              ? "text-amber-600 hover:bg-amber-50 font-medium"
                              : "text-slate-400 hover:text-amber-600 hover:bg-slate-50"
                          }`}
                          title={article.featured ? "Remove from Featured" : "Mark as Featured"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              article.featured ? "fill-amber-500 text-amber-500" : ""
                            }`}
                          />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* View Live Article */}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-slate-500 hover:text-church-navy hover:bg-slate-100"
                            title="View Public Article"
                          >
                            <Link to={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>

                          {/* Edit Article */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(article)}
                            className="h-8 w-8 text-slate-500 hover:text-church-navy hover:bg-slate-100"
                            title="Edit Article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          {/* Delete Article */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePromptDelete(article)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* High-Density Data Table View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-16">Cover</th>
                      <th className="py-3 px-4 min-w-[240px]">Headline & Summary</th>
                      <th className="py-3 px-4 w-36">Author</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-28 text-center">Featured</th>
                      <th className="py-3 px-4 w-32">Date</th>
                      <th className="py-3 px-4 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredArticles.map((article) => {
                      const coverUrl = resolveNewsImageUrl(article.image);

                      return (
                        <tr
                          key={article.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="w-12 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                              <img
                                src={coverUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e, article.image)}
                              />
                            </div>
                          </td>

                          {/* Headline & Excerpt */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-church-navy line-clamp-1 group-hover:text-church-gold transition-colors">
                              {article.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {article.summary || article.content.replace(/<[^>]*>?/gm, "").slice(0, 100)}
                            </p>
                          </td>

                          {/* Author */}
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                            {article.author || "Diocese"}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">{getStatusBadge(article.status)}</td>

                          {/* Featured Switch */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(article)}
                              disabled={togglingFeaturedId === article.id}
                              className={`p-1 rounded-md transition-colors ${
                                article.featured
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-slate-300 hover:text-amber-500 hover:bg-slate-50"
                              }`}
                              title={article.featured ? "Featured on Home" : "Not featured"}
                            >
                              <Star
                                className={`w-4 h-4 mx-auto ${
                                  article.featured ? "fill-amber-500 text-amber-500" : ""
                                }`}
                              />
                            </button>
                          </td>

                          {/* Published Date */}
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {formatDate(article.published_at || article.created_at)}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-7 w-7 text-slate-500 hover:text-church-navy"
                                title="View Public Article"
                              >
                                <Link to={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(article)}
                                className="h-7 w-7 text-slate-500 hover:text-church-navy"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePromptDelete(article)}
                                className="h-7 w-7 text-slate-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
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
        </main>
      </div>

      {/* Article Create / Edit Modal Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border-slate-200">
          <DialogHeader className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-church-navy/10 flex items-center justify-center text-church-navy">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-church-navy">
                  {editingArticle ? "Edit Press Release" : "Compose New Press Release"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Publish diocesan stories, event recaps, announcements, and bishop communiqués.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveArticle} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Primary Metadata */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="article-title" className="text-xs font-bold text-slate-700">
                    Article Title / Headline <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="article-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Bishop Louis Pasteur Kabayiza Presides Over Diocesan Synod"
                    className="h-10 text-sm border-slate-200 focus-visible:ring-church-navy"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Author */}
                  <div className="space-y-1.5">
                    <Label htmlFor="article-author" className="text-xs font-bold text-slate-700">
                      Author / Department
                    </Label>
                    <Input
                      id="article-author"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="e.g. Diocesan Communications"
                      className="h-9 text-xs border-slate-200 focus-visible:ring-church-navy"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <Label htmlFor="article-status" className="text-xs font-bold text-slate-700">
                      Editorial Status
                    </Label>
                    <Select
                      value={formStatus}
                      onValueChange={(val: any) => setFormStatus(val)}
                    >
                      <SelectTrigger id="article-status" className="h-9 text-xs border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published (Live)</SelectItem>
                        <SelectItem value="draft">Draft (Private)</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Publication Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="article-pubdate" className="text-xs font-bold text-slate-700">
                      Publication Timestamp
                    </Label>
                    <Input
                      id="article-pubdate"
                      type="datetime-local"
                      value={formPublishedAt}
                      onChange={(e) => setFormPublishedAt(e.target.value)}
                      className="h-9 text-xs border-slate-200 focus-visible:ring-church-navy"
                    />
                  </div>
                </div>

                {/* Featured Switch */}
                <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg">
                  <input
                    type="checkbox"
                    id="article-featured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <Label htmlFor="article-featured" className="text-xs text-amber-900 cursor-pointer flex-1">
                    <span className="font-bold">Feature on Homepage Banner</span>
                    <span className="block text-[11px] text-amber-700 font-normal">
                      Prominently showcases this article in hero feeds and top news carousel highlights.
                    </span>
                  </Label>
                </div>
              </div>

              {/* Cover Image Upload Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-700 block">
                  Main Cover Image
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-church-navy rounded-xl p-4 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center min-h-[140px]">
                    <Input
                      id="main-img-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                      disabled={uploadingMainImage}
                    />
                    <label
                      htmlFor="main-img-upload"
                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                    >
                      {uploadingMainImage ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-church-navy mb-1.5" />
                          <p className="text-xs font-medium text-slate-600">Uploading cover image...</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                          <p className="text-xs font-bold text-slate-700">Upload Cover Image</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WEBP up to 20MB</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Image Preview / Direct URL */}
                  <div className="space-y-2">
                    {formImage ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-[100px] w-full">
                        <img
                          src={resolveNewsImageUrl(formImage)}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, formImage)}
                        />
                        <button
                          type="button"
                          onClick={() => setFormImage("")}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-colors"
                          title="Remove cover"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 h-[100px] flex items-center justify-center text-xs text-slate-400">
                        No cover selected
                      </div>
                    )}

                    <Input
                      type="text"
                      placeholder="Or enter image URL directly..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="h-8 text-xs border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery Images (Additional Photos) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">
                      Additional Gallery Images ({formImages.length})
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Supporting photo gallery displayed inside the article page.
                    </p>
                  </div>

                  <div>
                    <Input
                      id="gallery-img-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="hidden"
                      disabled={uploadingGalleryImage}
                    />
                    <label htmlFor="gallery-img-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingGalleryImage}
                        asChild
                        className="cursor-pointer text-xs border-slate-300 text-slate-700"
                      >
                        <span>
                          {uploadingGalleryImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 mr-1.5" />
                              Add Photo
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {formImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {formImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100"
                      >
                        <img
                          src={resolveNewsImageUrl(imgUrl)}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, imgUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary / Excerpt */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label htmlFor="article-summary" className="text-xs font-bold text-slate-700">
                  Executive Brief / Summary
                </Label>
                <Textarea
                  id="article-summary"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Concise overview snippet displayed on news cards, search results, and social previews..."
                  className="h-20 text-xs border-slate-200 focus-visible:ring-church-navy resize-none"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <Label htmlFor="article-content" className="text-xs font-bold text-slate-700">
                  Full Article Body <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="article-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the complete article body here. Paragraph breaks are supported..."
                  className="min-h-[220px] text-xs font-mono border-slate-200 focus-visible:ring-church-navy"
                  required
                />
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditorOpen(false)}
                disabled={submitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-medium px-5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingArticle ? (
                  "Update Release"
                ) : (
                  "Publish Release"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-church-navy">
                Delete News Release
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete this news article? This will remove the article, its slug, and associated media associations from the diocesan record.
              </DialogDescription>
              {selectedToDelete && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-church-navy line-clamp-1">
                    {selectedToDelete.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(selectedToDelete.published_at || selectedToDelete.created_at)} • Status: {selectedToDelete.status}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManagement;
