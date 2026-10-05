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
  MoveUp,
  MoveDown,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  MonitorPlay
} from "lucide-react";
import { toast } from "sonner";

export interface HeroImage {
  id: number;
  src: string;
  title: string;
  subtitle: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Preset authentic diocesan hero banners available for quick selection
const DIOCESAN_PRESETS = [
  { label: "Cathedral & Diocesan Seat", path: "/1.jpg" },
  { label: "Worship & Parish Fellowship", path: "/01.jpg" },
  { label: "Community Transformation & Health", path: "/02.jpg" },
  { label: "Youth Ministry & Brigade", path: "/03.jpg" },
  { label: "Heritage of Faith & Synod", path: "/001.jpg" }
];

export const HeroImagesManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"order-asc" | "order-desc" | "title" | "date-desc">("order-asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<HeroImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [simulatorItem, setSimulatorItem] = useState<HeroImage | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState("1");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImageSourceType, setFormImageSourceType] = useState<"preset" | "upload" | "custom">("preset");
  const [formSelectedPreset, setFormSelectedPreset] = useState("/1.jpg");
  const [formCustomUrl, setFormCustomUrl] = useState("");
  const [formUploadedFile, setFormUploadedFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>("/1.jpg");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reorder loading states
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [togglingActiveId, setTogglingActiveId] = useState<number | null>(null);

  // Fetch Hero Images
  const loadHeroImages = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(apiUrls.admin.heroImages(), {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const result = await response.json();
        const list = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        setHeroImages(list);
      } else {
        toast.error("Failed to load hero carousel banners from server");
      }
    } catch (error) {
      console.error("Error loading hero images:", error);
      toast.error("Network error while connecting to hero image service");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHeroImages();
  }, [token]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = heroImages.length;
    const active = heroImages.filter((img) => img.is_active).length;
    const inactive = total - active;
    const maxOrder = heroImages.reduce((max, img) => Math.max(max, img.display_order ?? 0), 0);
    return { total, active, inactive, maxOrder };
  }, [heroImages]);

  // Filtered & Sorted Images
  const filteredImages = useMemo(() => {
    let result = [...heroImages];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((img) => img.is_active);
    } else if (statusFilter === "inactive") {
      result = result.filter((img) => !img.is_active);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((img) => {
        const titleMatch = img.title?.toLowerCase().includes(q);
        const subMatch = img.subtitle?.toLowerCase().includes(q);
        const srcMatch = img.src?.toLowerCase().includes(q);
        return titleMatch || subMatch || srcMatch;
      });
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === "order-asc") {
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      }
      if (sortBy === "order-desc") {
        return (b.display_order ?? 0) - (a.display_order ?? 0);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "date-desc") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      }
      return 0;
    });

    return result;
  }, [heroImages, statusFilter, searchQuery, sortBy]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingImage(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormDisplayOrder((heroImages.length + 1).toString());
    setFormIsActive(true);
    setFormImageSourceType("preset");
    setFormSelectedPreset("/1.jpg");
    setFormCustomUrl("");
    setFormUploadedFile(null);
    setFormImagePreview("/1.jpg");
    setEditorModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (image: HeroImage) => {
    setEditingImage(image);
    setFormTitle(image.title || "");
    setFormSubtitle(image.subtitle || "");
    setFormDisplayOrder((image.display_order ?? 1).toString());
    setFormIsActive(image.is_active);
    setFormUploadedFile(null);

    // Determine source type
    const presetMatch = DIOCESAN_PRESETS.find((p) => p.path === image.src);
    if (presetMatch) {
      setFormImageSourceType("preset");
      setFormSelectedPreset(image.src);
      setFormCustomUrl("");
    } else {
      setFormImageSourceType("custom");
      setFormCustomUrl(image.src);
      setFormSelectedPreset("/1.jpg");
    }

    setFormImagePreview(buildStorageUrl(image.src));
    setEditorModalOpen(true);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormUploadedFile(file);
      setFormImageSourceType("upload");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset Selection
  const handleSelectPreset = (presetPath: string) => {
    setFormSelectedPreset(presetPath);
    setFormImageSourceType("preset");
    setFormUploadedFile(null);
    setFormImagePreview(presetPath);
  };

  // Custom URL change
  const handleCustomUrlChange = (url: string) => {
    setFormCustomUrl(url);
    setFormImageSourceType("custom");
    setFormUploadedFile(null);
    setFormImagePreview(buildStorageUrl(url));
  };

  // Submit Create / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !token) return;

    if (!formTitle.trim()) {
      toast.error("Please provide a banner headline title");
      return;
    }

    if (!formSubtitle.trim()) {
      toast.error("Please provide a subtitle narrative");
      return;
    }

    setIsSaving(true);
    try {
      let finalSrc = formImagePreview;
      if (formImageSourceType === "preset") {
        finalSrc = formSelectedPreset;
      } else if (formImageSourceType === "custom") {
        finalSrc = formCustomUrl.trim();
      }

      // If a new file is uploaded, use FormData with POST / POST+_method=PUT
      if (formUploadedFile) {
        const fd = new FormData();
        fd.append("title", formTitle.trim());
        fd.append("subtitle", formSubtitle.trim());
        fd.append("display_order", formDisplayOrder);
        fd.append("is_active", formIsActive ? "1" : "0");
        fd.append("image", formUploadedFile);

        const url = editingImage
          ? `${apiUrls.admin.heroImages()}/${editingImage.id}`
          : apiUrls.admin.heroImages();

        if (editingImage) {
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
          toast.success(editingImage ? "Hero carousel banner updated successfully" : "Hero carousel banner created successfully");
          setEditorModalOpen(false);
          loadHeroImages();
        } else {
          const err = await res.json().catch(() => null);
          toast.error(err?.message || "Failed to save hero banner");
        }
      } else {
        // Standard JSON payload
        const payload = {
          title: formTitle.trim(),
          subtitle: formSubtitle.trim(),
          display_order: parseInt(formDisplayOrder, 10) || 1,
          is_active: formIsActive,
          src: finalSrc
        };

        const url = editingImage
          ? `${apiUrls.admin.heroImages()}/${editingImage.id}`
          : apiUrls.admin.heroImages();

        const method = editingImage ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          toast.success(editingImage ? "Hero carousel banner updated successfully" : "Hero carousel banner created successfully");
          setEditorModalOpen(false);
          loadHeroImages();
        } else {
          const err = await res.json().catch(() => null);
          toast.error(err?.message || "Failed to save hero banner");
        }
      }
    } catch (error) {
      console.error("Error saving hero banner:", error);
      toast.error("Network error while submitting hero banner");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (image: HeroImage) => {
    if (!token) return;
    setTogglingActiveId(image.id);

    const newStatus = !image.is_active;
    try {
      const res = await fetch(`${apiUrls.admin.heroImages()}/${image.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus })
      });

      if (res.ok) {
        setHeroImages((prev) =>
          prev.map((item) => (item.id === image.id ? { ...item, is_active: newStatus } : item))
        );
        toast.success(newStatus ? "Banner activated for homepage carousel" : "Banner hidden from homepage");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("Network error while updating status");
    } finally {
      setTogglingActiveId(null);
    }
  };

  // Reorder: Move Up
  const handleMoveUp = async (image: HeroImage) => {
    if (!token) return;
    const sorted = [...heroImages].sort((a, b) => a.display_order - b.display_order);
    const index = sorted.findIndex((img) => img.id === image.id);
    if (index <= 0) return;

    const previousImage = sorted[index - 1];
    setReorderingId(image.id);

    try {
      const orderA = previousImage.display_order;
      const orderB = image.display_order;

      await Promise.all([
        fetch(`${apiUrls.admin.heroImages()}/${image.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ display_order: orderA })
        }),
        fetch(`${apiUrls.admin.heroImages()}/${previousImage.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ display_order: orderB })
        })
      ]);

      toast.success("Carousel rotation order updated");
      loadHeroImages();
    } catch (error) {
      console.error("Error moving banner up:", error);
      toast.error("Failed to reorder banners");
    } finally {
      setReorderingId(null);
    }
  };

  // Reorder: Move Down
  const handleMoveDown = async (image: HeroImage) => {
    if (!token) return;
    const sorted = [...heroImages].sort((a, b) => a.display_order - b.display_order);
    const index = sorted.findIndex((img) => img.id === image.id);
    if (index < 0 || index >= sorted.length - 1) return;

    const nextImage = sorted[index + 1];
    setReorderingId(image.id);

    try {
      const orderA = nextImage.display_order;
      const orderB = image.display_order;

      await Promise.all([
        fetch(`${apiUrls.admin.heroImages()}/${image.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ display_order: orderA })
        }),
        fetch(`${apiUrls.admin.heroImages()}/${nextImage.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ display_order: orderB })
        })
      ]);

      toast.success("Carousel rotation order updated");
      loadHeroImages();
    } catch (error) {
      console.error("Error moving banner down:", error);
      toast.error("Failed to reorder banners");
    } finally {
      setReorderingId(null);
    }
  };

  // Trigger Delete
  const handleConfirmDelete = (image: HeroImage) => {
    setImageToDelete(image);
    setDeleteModalOpen(true);
  };

  // Execute Delete
  const handleDeleteImage = async () => {
    if (!imageToDelete || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${apiUrls.admin.heroImages()}/${imageToDelete.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Hero carousel banner removed successfully");
        setDeleteModalOpen(false);
        setImageToDelete(null);
        loadHeroImages();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to delete hero banner");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Network error while deleting hero banner");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      {/* Unified Diocesan Admin Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
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
                    Hero Carousel Banners
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Homepage Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden md:block">
                  Anglican Church of Rwanda, Shyogwe Diocese - Manage primary visual banners, headlines, and call-to-actions
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#d4af37]" />
                View Homepage
              </Link>

              <button
                type="button"
                onClick={() => loadHeroImages(true)}
                disabled={refreshing || loading}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                title="Refresh banner list"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#d4af37]" : ""}`} />
              </button>

              <Button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#d4af37] to-[#b39129] hover:from-[#c29f30] hover:to-[#9e7f22] text-[#0c1628] rounded-lg shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Hero Slide</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Executive Content Workspace */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Executive KPI Statistics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Slides */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Hero Slides
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? "-" : stats.total}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Registered carousel assets
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 2: Active on Homepage */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Active & Live
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {loading ? "-" : stats.active}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    In homepage rotation
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
                    Withheld from rotation
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* KPI 4: Carousel Sequence */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sequence Order
                  </p>
                  <p className="text-2xl font-bold text-[#0c1628] mt-1">
                    1 to {stats.maxOrder || stats.total || 1}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Continuous autoplay rotation
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
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
              {[
                { key: "all", label: "All Hero Slides", count: stats.total },
                { key: "active", label: "Active & Live", count: stats.active },
                { key: "inactive", label: "Hidden / Drafts", count: stats.inactive }
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

            {/* Search Input, Sort Selector & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search headlines, subtitles, or image sources..."
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
              <div className="flex items-center gap-2">
                {/* Sort Selector */}
                <div className="w-[195px]">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order-asc" className="text-xs">
                        Sequence (Order 1, 2, 3...)
                      </SelectItem>
                      <SelectItem value="order-desc" className="text-xs">
                        Sequence (Reverse Order)
                      </SelectItem>
                      <SelectItem value="title" className="text-xs">
                        Headline Title (A-Z)
                      </SelectItem>
                      <SelectItem value="date-desc" className="text-xs">
                        Newest Created First
                      </SelectItem>
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
                    title="Visual 16:9 Banner Grid"
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
              <p className="text-sm font-semibold text-slate-800">Loading Hero Carousel Banners...</p>
              <p className="text-xs text-slate-400 mt-1">Connecting to diocesan banner service</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-3">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Hero Banners Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "No banners match your current search query or filter. Try clearing your filters."
                  : "No hero carousel banners exist currently. Create your first slide banner to showcase on the homepage."}
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
            /* Widescreen Banner Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => {
                const storageUrl = buildStorageUrl(image.src);

                return (
                  <div
                    key={image.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
                  >
                    {/* 16:9 Banner Mockup with Authentic Diocesan Typography */}
                    <div className="relative aspect-[16/9] w-full bg-[#0c1628] overflow-hidden group">
                      <img
                        src={storageUrl}
                        alt={image.title}
                        className="w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      {/* Gradient Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1628] via-[#0c1628]/50 to-transparent" />

                      {/* Display Sequence Badge */}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[11px] font-bold bg-[#0c1628]/90 text-[#d4af37] border border-[#d4af37]/30 backdrop-blur-xs shadow-xs">
                        Slide Sequence #{image.display_order}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-semibold backdrop-blur-xs ${
                          image.is_active
                            ? "bg-emerald-600/90 text-white"
                            : "bg-amber-600/90 text-white"
                        }`}
                      >
                        {image.is_active ? "Live Rotation" : "Draft / Hidden"}
                      </span>

                      {/* Slide Headline Preview overlay on image */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Homepage Carousel
                        </p>
                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                          {image.title}
                        </h3>
                      </div>

                      {/* Hover Full Preview Trigger */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setSimulatorItem(image)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-[#0c1628] text-xs font-semibold shadow-md hover:bg-white transition-transform hover:scale-105"
                        >
                          <MonitorPlay className="h-4 w-4 text-[#d4af37]" />
                          Preview in Fullscreen
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Actions Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {image.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                          {image.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-1.5 font-mono">
                          Source: {image.src}
                        </p>
                      </div>

                      {/* Reorder and Quick Action Toolbar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        {/* Move Up / Down Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(image)}
                            disabled={reorderingId === image.id}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors"
                            title="Move earlier in carousel sequence"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(image)}
                            disabled={reorderingId === image.id}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors"
                            title="Move later in carousel sequence"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(image)}
                            disabled={togglingActiveId === image.id}
                            className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                              image.is_active
                                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                            }`}
                          >
                            {togglingActiveId === image.id ? (
                              <Loader2 className="h-3 w-3 animate-spin inline" />
                            ) : image.is_active ? (
                              "Active"
                            ) : (
                              "Draft"
                            )}
                          </button>
                        </div>

                        {/* Edit & Delete Action Icons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSimulatorItem(image)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Fullscreen View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(image)}
                            className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-100 rounded transition-colors"
                            title="Edit banner"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(image)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete banner"
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
                      <th className="py-3 px-4 w-28">Sequence</th>
                      <th className="py-3 px-4 w-24">Thumbnail</th>
                      <th className="py-3 px-4">Headline & Narrative</th>
                      <th className="py-3 px-4 w-40">Asset Source</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredImages.map((image) => {
                      const storageUrl = buildStorageUrl(image.src);

                      return (
                        <tr key={image.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Sequence Reorder Column */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                #{image.display_order}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveUp(image)}
                                  className="p-0.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
                                  title="Move Up"
                                >
                                  <MoveUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveDown(image)}
                                  className="p-0.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
                                  title="Move Down"
                                >
                                  <MoveDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Thumbnail */}
                          <td className="py-3 px-4">
                            <div
                              className="h-12 w-20 rounded bg-slate-100 overflow-hidden cursor-pointer border border-slate-200 relative group flex-shrink-0"
                              onClick={() => setSimulatorItem(image)}
                            >
                              <img
                                src={storageUrl}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </td>

                          {/* Headline & Subtitle */}
                          <td className="py-3 px-4 max-w-md">
                            <div className="font-semibold text-slate-900 truncate">
                              {image.title}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {image.subtitle}
                            </div>
                          </td>

                          {/* Image Path */}
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                            {image.src}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
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
                              {image.is_active ? "Live" : "Draft"}
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSimulatorItem(image)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                title="Fullscreen Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(image)}
                                className="p-1.5 text-slate-500 hover:text-[#0c1628] hover:bg-slate-100 rounded transition-colors"
                                title="Edit slide"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(image)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete slide"
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
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Create & Edit Hero Slide Dialog                  */}
      {/* ======================================================== */}
      <Dialog open={editorModalOpen} onOpenChange={setEditorModalOpen}>
        <DialogContent className="max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-0 overflow-hidden border border-slate-200">
          <DialogHeader className="p-6 bg-[#0c1628] text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <ImageIcon className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {editingImage ? "Edit Hero Carousel Slide" : "Create Hero Carousel Slide"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 mt-0.5">
                  Configure visual banner photograph, bold headline, and carousel sequencing
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmitForm}>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Live Preview Box */}
              <div className="relative aspect-[16/7] w-full rounded-xl bg-[#0c1628] overflow-hidden border border-slate-300 shadow-inner">
                <img
                  src={formImagePreview}
                  alt="Slide preview"
                  className="w-full h-full object-cover opacity-85"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1628] via-[#0c1628]/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                    Live Carousel Preview
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 mt-0.5">
                    {formTitle || "Headline Title Goes Here"}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">
                    {formSubtitle || "Subtitle narrative explaining the diocesan mission and fellowship."}
                  </p>
                </div>
              </div>

              {/* Image Source Selection Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-700">
                  Select Banner Image Source
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormImageSourceType("preset")}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      formImageSourceType === "preset"
                        ? "bg-[#0c1628] text-white border-[#0c1628] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Diocesan Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormImageSourceType("upload");
                      fileInputRef.current?.click();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      formImageSourceType === "upload"
                        ? "bg-[#0c1628] text-white border-[#0c1628] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Upload New File
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImageSourceType("custom")}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      formImageSourceType === "custom"
                        ? "bg-[#0c1628] text-white border-[#0c1628] shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Custom URL / Path
                  </button>
                </div>

                {/* Preset Selector */}
                {formImageSourceType === "preset" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {DIOCESAN_PRESETS.map((preset) => (
                      <div
                        key={preset.path}
                        onClick={() => handleSelectPreset(preset.path)}
                        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          formSelectedPreset === preset.path
                            ? "border-[#d4af37] ring-2 ring-[#d4af37]/30"
                            : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <div className="aspect-[16/9] w-full bg-slate-200">
                          <img
                            src={preset.path}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="p-1.5 text-[10px] font-semibold text-slate-800 truncate bg-white">
                          {preset.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Upload Selector */}
                {formImageSourceType === "upload" && (
                  <div className="pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#d4af37] bg-slate-50/70 p-4 rounded-xl text-center cursor-pointer transition-colors"
                    >
                      <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-800">
                        {formUploadedFile ? formUploadedFile.name : "Click to browse image file"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        High resolution recommended (1920x1080px). JPG, PNG, WEBP.
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom URL Selector */}
                {formImageSourceType === "custom" && (
                  <div className="pt-1 space-y-1">
                    <Input
                      type="text"
                      placeholder="e.g. /storage/hero-images/... or https://..."
                      value={formCustomUrl}
                      onChange={(e) => handleCustomUrlChange(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                    <p className="text-[11px] text-slate-400">
                      Provide a relative storage path or direct CDN web link.
                    </p>
                  </div>
                )}
              </div>

              {/* Title & Subtitle Inputs */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Headline Title</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Welcome to Shyogwe Diocese"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Subtitle / Narrative</Label>
                  <Textarea
                    placeholder="Serving God and His people across Rwanda through preaching the Gospel and compassionate community action."
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    rows={3}
                    required
                    className="text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Display Order & Active Status */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Display Order</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(e.target.value)}
                      required
                      className="text-xs bg-slate-50 border-slate-200"
                    />
                    <p className="text-[10px] text-slate-400">Position in carousel (1 = First Slide).</p>
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
                        <SelectItem value="active" className="text-xs">
                          Active & Live in Carousel
                        </SelectItem>
                        <SelectItem value="inactive" className="text-xs">
                          Draft / Withhold from Homepage
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                    Saving Banner...
                  </>
                ) : editingImage ? (
                  "Update Slide Banner"
                ) : (
                  "Create Slide Banner"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: Fullscreen Homepage Banner Simulator            */}
      {/* ======================================================== */}
      {simulatorItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-[#d4af37]/20 text-[#d4af37]">
                <MonitorPlay className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Homepage Hero Banner Simulation</h3>
                <p className="text-[11px] text-slate-400">
                  Slide Sequence #{simulatorItem.display_order} &bull; {simulatorItem.is_active ? "Live" : "Draft"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSimulatorItem(null)}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-600 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Centered Hero Viewport Simulator */}
          <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-[16/8] sm:aspect-[16/7] my-auto">
            {/* Background Image */}
            <img
              src={buildStorageUrl(simulatorItem.src)}
              alt={simulatorItem.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1628]/95 via-[#0c1628]/75 to-transparent" />

            {/* Simulated Hero Banner Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 max-w-2xl text-white space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Anglican Church of Rwanda &bull; Shyogwe Diocese</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {simulatorItem.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                {simulatorItem.subtitle}
              </p>

              {/* Action Buttons Mockup */}
              <div className="flex items-center gap-3 pt-2">
                <div className="px-4 py-2 rounded-lg bg-[#d4af37] text-[#0c1628] font-bold text-xs shadow-md">
                  Explore Ministries
                </div>
                <div className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 font-semibold text-xs backdrop-blur-xs">
                  Contact Diocese
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="w-full max-w-6xl text-center text-xs text-slate-400 pt-2">
            Asset Path: <code className="text-slate-300 font-mono">{simulatorItem.src}</code>
          </div>
        </div>
      )}

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
                Delete Hero Carousel Banner?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this slide from the homepage rotation? This will permanently delete the record.
              </p>
            </div>

            {imageToDelete && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left">
                <div className="h-12 w-20 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                  <img
                    src={buildStorageUrl(imageToDelete.src)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-800 truncate">
                    {imageToDelete.title}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">
                    Sequence #{imageToDelete.display_order} &bull; ID #{imageToDelete.id}
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
    </div>
  );
};

export default HeroImagesManagement;
