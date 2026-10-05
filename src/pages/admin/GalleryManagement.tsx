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
  Image as ImageIcon,
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
  Copy,
  Check,
  ZoomIn,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";

export interface GalleryItem {
  id: number;
  title?: string | null;
  description?: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
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

export const GalleryManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "captioned" | "uncaptioned">("all");
  const [sortBy, setSortBy] = useState<"order-desc" | "order-asc" | "date-desc" | "date-asc" | "title">("order-desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(18);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Multi-upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadDefaultTitle, setUploadDefaultTitle] = useState("");
  const [uploadDefaultDescription, setUploadDefaultDescription] = useState("");
  const [uploadDisplayOrderStart, setUploadDisplayOrderStart] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isManualUrlMode, setIsManualUrlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState("0");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Quick action state
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [togglingActiveId, setTogglingActiveId] = useState<number | null>(null);

  // Fetch gallery photos
  const fetchGalleryData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${apiUrls.gallery()}?all=true`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setImages(list);
      } else {
        toast.error("Failed to fetch gallery archive from server");
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      toast.error("Network error while loading gallery data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [token]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = images.length;
    const active = images.filter((img) => img.is_active).length;
    const inactive = total - active;
    const captioned = images.filter((img) => (img.title && img.title.trim()) || (img.description && img.description.trim())).length;
    return { total, active, inactive, captioned };
  }, [images]);

  // Filtered & Sorted Images
  const filteredImages = useMemo(() => {
    let result = [...images];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((img) => img.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((img) => !img.is_active);
    } else if (statusFilter === "captioned") {
      result = result.filter((img) => (img.title && img.title.trim()) || (img.description && img.description.trim()));
    } else if (statusFilter === "uncaptioned") {
      result = result.filter((img) => (!img.title || !img.title.trim()) && (!img.description || !img.description.trim()));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((img) => {
        const titleMatch = img.title?.toLowerCase().includes(q);
        const descMatch = img.description?.toLowerCase().includes(q);
        const urlMatch = img.image_url?.toLowerCase().includes(q);
        return titleMatch || descMatch || urlMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "order-desc") {
        return (b.display_order ?? 0) - (a.display_order ?? 0);
      }
      if (sortBy === "order-asc") {
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      }
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
        const ta = (a.title || "").toLowerCase();
        const tb = (b.title || "").toLowerCase();
        return ta.localeCompare(tb);
      }
      return 0;
    });

    return result;
  }, [images, statusFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredImages.length / pageSize));
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredImages.slice(start, start + pageSize);
  }, [filteredImages, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, pageSize]);

  // Quick toggle is_active
  const handleToggleActive = async (image: GalleryItem) => {
    if (!token) {
      toast.error("Authentication required to modify gallery status");
      return;
    }

    setTogglingActiveId(image.id);
    const newStatus = !image.is_active;

    try {
      const response = await fetch(apiUrls.galleryItem(image.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_active: newStatus
        })
      });

      if (response.ok) {
        setImages((prev) =>
          prev.map((item) => (item.id === image.id ? { ...item, is_active: newStatus } : item))
        );
        toast.success(newStatus ? "Photo activated for public viewing" : "Photo moved to drafts/inactive");
      } else {
        toast.error("Failed to update photo status");
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Network error while updating status");
    } finally {
      setTogglingActiveId(null);
    }
  };

  // Open edit modal
  const handleOpenEdit = (image: GalleryItem) => {
    setEditingImage(image);
    setEditTitle(image.title || "");
    setEditDescription(image.description || "");
    setEditDisplayOrder((image.display_order ?? 0).toString());
    setEditIsActive(image.is_active);
    setEditModalOpen(true);
  };

  // Submit edit modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage || !token) return;

    setIsUpdating(true);
    try {
      const payload = {
        title: editTitle.trim() || null,
        description: editDescription.trim() || null,
        display_order: parseInt(editDisplayOrder, 10) || 0,
        is_active: editIsActive
      };

      const response = await fetch(apiUrls.galleryItem(editingImage.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const resData = await response.json();
        const updatedItem = resData?.data || { ...editingImage, ...payload };
        setImages((prev) =>
          prev.map((item) => (item.id === editingImage.id ? { ...item, ...updatedItem } : item))
        );
        toast.success("Gallery photograph metadata updated successfully");
        setEditModalOpen(false);
        setEditingImage(null);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to update photograph details");
      }
    } catch (error) {
      console.error("Error saving image details:", error);
      toast.error("Network error while saving modifications");
    } finally {
      setIsUpdating(false);
    }
  };

  // Trigger delete modal
  const handleConfirmDelete = (image: GalleryItem) => {
    setImageToDelete(image);
    setDeleteModalOpen(true);
  };

  // Execute delete
  const handleDeleteImage = async () => {
    if (!imageToDelete || !token) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrls.galleryItem(imageToDelete.id), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setImages((prev) => prev.filter((item) => item.id !== imageToDelete.id));
        toast.success("Photograph removed from diocesan gallery");
        setDeleteModalOpen(false);
        setImageToDelete(null);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to delete photograph");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error while deleting image");
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Image Link to Clipboard
  const handleCopyLink = (image: GalleryItem) => {
    const fullUrl = buildStorageUrl(image.image_url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(image.id);
    toast.success("Image URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Multi File Selection
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const array = Array.from(files);
    setUploadFiles((prev) => [...prev, ...array]);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Execute Batch Upload
  const handleExecuteUpload = async () => {
    if (!token) {
      toast.error("You must be logged in as an administrator to upload photos");
      return;
    }

    if (isManualUrlMode) {
      if (!manualImageUrl.trim()) {
        toast.error("Please enter a valid image URL");
        return;
      }

      setUploading(true);
      try {
        const payload = {
          image_url: manualImageUrl.trim(),
          title: uploadDefaultTitle.trim() || null,
          description: uploadDefaultDescription.trim() || null,
          display_order: parseInt(uploadDisplayOrderStart, 10) || 0,
          is_active: true
        };

        const res = await fetch(apiUrls.gallery(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          toast.success("Photograph added to diocesan archive successfully");
          setUploadModalOpen(false);
          setManualImageUrl("");
          setUploadDefaultTitle("");
          setUploadDefaultDescription("");
          fetchGalleryData();
        } else {
          const err = await res.json().catch(() => null);
          toast.error(err?.message || "Failed to register photograph");
        }
      } catch (err) {
        console.error("Manual URL registration error:", err);
        toast.error("Network error while adding photo");
      } finally {
        setUploading(false);
      }
      return;
    }

    if (uploadFiles.length === 0) {
      toast.error("Please select at least one photograph to upload");
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: uploadFiles.length });

    let successCount = 0;
    let failCount = 0;
    const baseOrder = parseInt(uploadDisplayOrderStart, 10) || 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      setUploadProgress({ current: i + 1, total: uploadFiles.length });

      try {
        // Step 1: Upload binary file to Laravel storage
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "gallery");

        const uploadRes = await fetch(apiUrls.uploadImage(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          failCount++;
          continue;
        }

        const uploadData = await uploadRes.json();
        const storedUrl = uploadData?.data?.url || uploadData?.url;

        if (!storedUrl) {
          failCount++;
          continue;
        }

        // Step 2: Save metadata to gallery record
        const titleText = uploadDefaultTitle.trim()
          ? (uploadFiles.length > 1 ? `${uploadDefaultTitle.trim()} (${i + 1})` : uploadDefaultTitle.trim())
          : file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        const recordPayload = {
          image_url: storedUrl,
          title: titleText,
          description: uploadDefaultDescription.trim() || null,
          display_order: baseOrder + (uploadFiles.length - i),
          is_active: true
        };

        const saveRes = await fetch(apiUrls.gallery(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(recordPayload)
        });

        if (saveRes.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Upload error for ${file.name}:`, err);
        failCount++;
      }
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    if (successCount > 0) {
      toast.success(`${successCount} photograph${successCount > 1 ? "s" : ""} added to diocesan archive successfully`);
      setUploadModalOpen(false);
      setUploadFiles([]);
      setUploadDefaultTitle("");
      setUploadDefaultDescription("");
      fetchGalleryData();
    }
    if (failCount > 0) {
      toast.error(`${failCount} file${failCount > 1 ? "s" : ""} failed to upload`);
    }
  };

  // Lightbox Navigation
  const openLightbox = (indexInFiltered: number) => {
    setLightboxIndex(indexInFiltered);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightboxImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const prevLightboxImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  // Keybindings for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightboxImage();
      if (e.key === "ArrowLeft") prevLightboxImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  const activeLightboxItem = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      {/* Diocesan Unified Admin Sidebar */}
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
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                    Media Gallery & Visual Archive
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live System
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden md:block">
                  Anglican Church of Rwanda, Shyogwe Diocese - Curate high-resolution photography, episcopal assemblies, and parish ministry life
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/gallery"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#d4af37]" />
                Public Gallery
              </Link>

              <button
                type="button"
                onClick={() => fetchGalleryData(true)}
                disabled={refreshing || loading}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                title="Refresh gallery archive"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#d4af37]" : ""}`} />
              </button>

              <Button
                onClick={() => {
                  setUploadFiles([]);
                  setManualImageUrl("");
                  setIsManualUrlMode(false);
                  setUploadModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#d4af37] to-[#b39129] hover:from-[#c29f30] hover:to-[#9e7f22] text-[#0c1628] rounded-lg shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Photos</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Executive Workspace Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Executive KPI Statistics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Archive Photos */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Photographs
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? "-" : stats.total}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Archived diocesan assets
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <ImageIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 2: Active / Published */}
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
                    Visible to web visitors
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 3: Inactive / Drafts */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Archived & Hidden
                  </p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {loading ? "-" : stats.inactive}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Internal storage only
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 4: Captioned Items */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Editorial Captions
                  </p>
                  <p className="text-2xl font-bold text-[#0c1628] mt-1">
                    {loading ? "-" : stats.captioned}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Catalogued with descriptions
                  </p>
                </div>
                <div className="p-3 bg-[#d4af37]/15 text-[#a88924] rounded-xl">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter, Sort & View Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
            {/* Row 1: Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
              {[
                { key: "all", label: "All Photographs", count: stats.total },
                { key: "active", label: "Active & Published", count: stats.active },
                { key: "inactive", label: "Hidden / Drafts", count: stats.inactive },
                { key: "captioned", label: "Captioned", count: stats.captioned },
                { key: "uncaptioned", label: "Uncaptioned", count: stats.total - stats.captioned }
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

            {/* Row 2: Search Input, Sorting, Page Size, and Grid/Table Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by caption, description, or image path..."
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

              {/* Sorting & Presentation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort selector */}
                <div className="w-[185px]">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order-desc" className="text-xs">
                        Display Order (High to Low)
                      </SelectItem>
                      <SelectItem value="order-asc" className="text-xs">
                        Display Order (Low to High)
                      </SelectItem>
                      <SelectItem value="date-desc" className="text-xs">
                        Newest Uploaded First
                      </SelectItem>
                      <SelectItem value="date-asc" className="text-xs">
                        Oldest Uploaded First
                      </SelectItem>
                      <SelectItem value="title" className="text-xs">
                        Title (Alphabetical)
                      </SelectItem>
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
                      <SelectItem value="12" className="text-xs">12 per page</SelectItem>
                      <SelectItem value="18" className="text-xs">18 per page</SelectItem>
                      <SelectItem value="24" className="text-xs">24 per page</SelectItem>
                      <SelectItem value="36" className="text-xs">36 per page</SelectItem>
                      <SelectItem value="48" className="text-xs">48 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dual View Mode: Grid vs Table */}
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md text-xs transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-[#0c1628] shadow-xs font-medium"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Visual Card Grid"
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

          {/* Main Visual Display Container */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#d4af37] mb-3" />
              <p className="text-sm font-semibold text-slate-800">Loading Visual Media Repository...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to diocesan media storage</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-3">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Gallery Photographs Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "No images match your current filter parameters. Try clearing your search query or reset the filter tab."
                  : "The diocesan photo gallery archive is currently empty. Upload your first photography collection to begin."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Visual Card Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginatedImages.map((image, idx) => {
                const actualIndexInFiltered = (currentPage - 1) * pageSize + idx;
                const storageUrl = buildStorageUrl(image.image_url);

                return (
                  <div
                    key={image.id}
                    className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
                  >
                    {/* Image Thumbnail Container */}
                    <div
                      className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => openLightbox(actualIndexInFiltered)}
                    >
                      <img
                        src={storageUrl}
                        alt={image.title || "Diocesan photograph"}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />

                      {/* Display Order Badge */}
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0c1628]/80 text-[#d4af37] backdrop-blur-xs">
                        #{image.display_order ?? 0}
                      </span>

                      {/* Active Status Badge */}
                      <span
                        className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold backdrop-blur-xs ${
                          image.is_active
                            ? "bg-emerald-600/90 text-white"
                            : "bg-amber-600/90 text-white"
                        }`}
                      >
                        {image.is_active ? "Live" : "Draft"}
                      </span>

                      {/* Hover Overlay with Zoom Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white transition-transform hover:scale-110 shadow-sm">
                          <ZoomIn className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                      <div>
                        <h4
                          className="text-xs font-semibold text-slate-900 truncate"
                          title={image.title || "Untitled photograph"}
                        >
                          {image.title || "Untitled photograph"}
                        </h4>
                        <p
                          className="text-[11px] text-slate-500 line-clamp-1 mt-0.5"
                          title={image.description || "No caption added"}
                        >
                          {image.description || "No description"}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(image)}
                          disabled={togglingActiveId === image.id}
                          className={`text-[11px] font-medium transition-colors ${
                            image.is_active
                              ? "text-emerald-600 hover:text-emerald-700"
                              : "text-amber-600 hover:text-amber-700"
                          }`}
                          title={image.is_active ? "Click to deactivate" : "Click to publish"}
                        >
                          {togglingActiveId === image.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : image.is_active ? (
                            "Published"
                          ) : (
                            "Draft"
                          )}
                        </button>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(image)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Copy image URL"
                          >
                            {copiedId === image.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(image)}
                            className="p-1 text-slate-400 hover:text-[#0c1628] rounded transition-colors"
                            title="Edit metadata"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(image)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Delete photograph"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
                      <th className="py-3 px-4 w-16">Preview</th>
                      <th className="py-3 px-4">Title & Description</th>
                      <th className="py-3 px-4 w-32">Display Order</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-32">Uploaded Date</th>
                      <th className="py-3 px-4 w-36 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedImages.map((image, idx) => {
                      const actualIndex = (currentPage - 1) * pageSize + idx;
                      const storageUrl = buildStorageUrl(image.image_url);

                      return (
                        <tr
                          key={image.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="py-2.5 px-4">
                            <div
                              className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden cursor-pointer border border-slate-200 relative group flex-shrink-0"
                              onClick={() => openLightbox(actualIndex)}
                            >
                              <img
                                src={storageUrl}
                                alt={image.title || "Gallery thumbnail"}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </td>

                          {/* Title & Description */}
                          <td className="py-2.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 truncate">
                              {image.title || "Untitled photograph"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {image.description || image.image_url}
                            </div>
                          </td>

                          {/* Display Order */}
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                              Order #{image.display_order ?? 0}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(image)}
                              disabled={togglingActiveId === image.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                image.is_active
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              {togglingActiveId === image.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    image.is_active ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                />
                              )}
                              {image.is_active ? "Published" : "Draft / Hidden"}
                            </button>
                          </td>

                          {/* Upload Date */}
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {formatDate(image.created_at) || "Recent"}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openLightbox(actualIndex)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                                title="Preview photograph"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(image)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                                title="Copy asset URL"
                              >
                                {copiedId === image.id ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(image)}
                                className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-100 rounded-md transition-colors"
                                title="Edit metadata"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(image)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete photograph"
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
          {filteredImages.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredImages.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredImages.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-800">{filteredImages.length}</span> photographs
              </div>

              <div className="flex items-center gap-1.5">
                {/* First page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Previous page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page indicator pill */}
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold">
                  Page {currentPage} of {totalPages}
                </div>

                {/* Next page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last page */}
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
      {/* MODAL 1: Batch & Single Upload Dialog                     */}
      {/* ======================================================== */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-xl bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <DialogHeader className="p-6 bg-[#0c1628] text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Upload className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Upload Gallery Photographs
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-0.5">
                  Select high-resolution files from your computer or provide a direct web image URL
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Mode Switcher: Local Files vs Web URL */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setIsManualUrlMode(false)}
                className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                  !isManualUrlMode ? "bg-white text-[#0c1628] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload Files from Computer
              </button>
              <button
                type="button"
                onClick={() => setIsManualUrlMode(true)}
                className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
                  isManualUrlMode ? "bg-white text-[#0c1628] shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Add via Image URL
              </button>
            </div>

            {!isManualUrlMode ? (
              /* Dropzone Container */
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  disabled={uploading}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#d4af37] bg-slate-50/70 hover:bg-amber-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="p-3 bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-xs text-slate-500 mb-3">
                    <Upload className="h-6 w-6 text-[#0c1628]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse files or drag and drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP, and GIF up to 20MB per photograph
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-[#0c1628] shadow-2xs">
                    Select Multiple Files
                  </span>
                </div>

                {/* Staged files preview list */}
                {uploadFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Selected Photographs ({uploadFiles.length})</span>
                      <button
                        type="button"
                        onClick={() => setUploadFiles([])}
                        className="text-red-600 hover:underline"
                        disabled={uploading}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                      {uploadFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ImageIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate font-medium text-slate-800">{file.name}</span>
                            <span className="text-slate-400 text-[10px]">
                              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          {!uploading && (
                            <button
                              type="button"
                              onClick={() => removeUploadFile(idx)}
                              className="text-slate-400 hover:text-red-600 p-0.5 ml-2"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Direct Image URL Input */
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Direct Image URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/photo.jpg or /storage/images/..."
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200"
                  disabled={uploading}
                />
                <p className="text-[11px] text-slate-400">
                  Provide an absolute web address or relative storage path for this photograph.
                </p>
              </div>
            )}

            {/* Optional Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-medium text-slate-700">Default Title / Subject</Label>
                <Input
                  type="text"
                  placeholder="e.g., Diocesan Youth Assembly 2026"
                  value={uploadDefaultTitle}
                  onChange={(e) => setUploadDefaultTitle(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-medium text-slate-700">Description / Context</Label>
                <Textarea
                  placeholder="Brief narrative or biblical theme for the photograph..."
                  value={uploadDefaultDescription}
                  onChange={(e) => setUploadDefaultDescription(e.target.value)}
                  rows={2}
                  className="text-xs bg-slate-50 border-slate-200"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">Starting Display Order</Label>
                <Input
                  type="number"
                  value={uploadDisplayOrderStart}
                  onChange={(e) => setUploadDisplayOrderStart(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200"
                  disabled={uploading}
                />
                <p className="text-[10px] text-slate-400">Higher numbers appear first in the gallery.</p>
              </div>
            </div>

            {/* Upload Progress Indicator */}
            {uploading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d4af37]" />
                    Uploading photographs...
                  </span>
                  <span>
                    {uploadProgress.current} of {uploadProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0c1628] to-[#d4af37] transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.current / Math.max(1, uploadProgress.total)) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUploadModalOpen(false)}
              disabled={uploading}
              className="text-xs border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExecuteUpload}
              disabled={uploading || (!isManualUrlMode && uploadFiles.length === 0) || (isManualUrlMode && !manualImageUrl.trim())}
              className="text-xs font-semibold bg-[#0c1628] hover:bg-[#1a2b49] text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {isManualUrlMode ? "Save Photograph" : `Upload ${uploadFiles.length} Photograph${uploadFiles.length > 1 ? "s" : ""}`}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: Edit Metadata Dialog                             */}
      {/* ======================================================== */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <DialogHeader className="p-6 bg-[#0c1628] text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <Edit2 className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Edit Photograph Metadata
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-0.5">
                  Update caption title, description narrative, and display ordering
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEdit}>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Image Preview & URL */}
              {editingImage && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="h-14 w-14 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={buildStorageUrl(editingImage.image_url)}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-semibold text-slate-800 truncate">Asset ID #{editingImage.id}</p>
                    <p className="text-slate-500 truncate mt-0.5">{editingImage.image_url}</p>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Photograph Title / Caption</Label>
                <Input
                  type="text"
                  placeholder="e.g., St. Peter's Cathedral Shyogwe"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Narrative Description</Label>
                <Textarea
                  placeholder="Brief archival summary or historical context..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="text-xs bg-slate-50 border-slate-200"
                />
              </div>

              {/* Display Order & Active Status */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Display Order</Label>
                  <Input
                    type="number"
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(e.target.value)}
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400">Higher numbers appear earlier in gallery.</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Publication Status</Label>
                  <Select
                    value={editIsActive ? "active" : "inactive"}
                    onValueChange={(v) => setEditIsActive(v === "active")}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs">
                        Active & Published
                      </SelectItem>
                      <SelectItem value="inactive" className="text-xs">
                        Draft / Hidden
                      </SelectItem>
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
                onClick={() => setEditModalOpen(false)}
                disabled={isUpdating}
                className="text-xs border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdating}
                className="text-xs font-semibold bg-[#0c1628] hover:bg-[#1a2b49] text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 3: Delete Confirmation Dialog                      */}
      {/* ======================================================== */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <div className="p-6 text-center space-y-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Photograph Permanently?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this photograph from the diocesan repository? This action cannot be undone.
              </p>
            </div>

            {imageToDelete && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left">
                <div className="h-12 w-12 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                  <img
                    src={buildStorageUrl(imageToDelete.image_url)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-800 truncate">
                    {imageToDelete.title || "Untitled photograph"}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">
                    ID #{imageToDelete.id} - Order #{imageToDelete.display_order ?? 0}
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
                onClick={handleDeleteImage}
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

      {/* ======================================================== */}
      {/* MODAL 4: Full-Screen Lightbox Preview                    */}
      {/* ======================================================== */}
      {activeLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold bg-white/10 px-2.5 py-1 rounded">
                {(lightboxIndex ?? 0) + 1} / {filteredImages.length}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {activeLightboxItem.title || "Diocesan Photograph"}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Display Order #{activeLightboxItem.display_order ?? 0} &bull; {activeLightboxItem.is_active ? "Published" : "Draft"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(activeLightboxItem)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copy asset URL"
              >
                {copiedId === activeLightboxItem.id ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  closeLightbox();
                  handleOpenEdit(activeLightboxItem);
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Edit photograph"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-600 text-white transition-colors"
                title="Close Lightbox (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with Nav Buttons */}
          <div className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-4 overflow-hidden">
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevLightboxImage}
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-transform hover:scale-110 border border-white/20"
              title="Previous Photograph (Left Arrow)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Display Image */}
            <img
              src={buildStorageUrl(activeLightboxItem.image_url)}
              alt={activeLightboxItem.title || "Diocesan Photograph Preview"}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
            />

            {/* Next Button */}
            <button
              type="button"
              onClick={nextLightboxImage}
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-transform hover:scale-110 border border-white/20"
              title="Next Photograph (Right Arrow)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Caption Bar */}
          <div className="w-full max-w-2xl text-center text-xs text-slate-300">
            {activeLightboxItem.description && (
              <p className="line-clamp-2 italic mb-1">{activeLightboxItem.description}</p>
            )}
            <p className="text-[10px] text-slate-400">
              Direct Storage URL: {activeLightboxItem.image_url}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
