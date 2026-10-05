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
  Calendar,
  Clock,
  MapPin,
  Users,
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
  Star,
  Eye,
  Upload,
  CheckCircle2,
  Repeat,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export interface ChurchEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  attendees?: string;
  featured: boolean;
  is_recurring: boolean;
  recurrence_pattern?: string;
  image?: string;
  status: "upcoming" | "ongoing" | "completed" | "published" | "draft" | string;
  created_at?: string;
  updated_at?: string;
}

const resolveEventImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;
  return buildStorageUrl(imagePath);
};

const formatEventDate = (dateString?: string): string => {
  if (!dateString) return "Date TBD";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateString;
  }
};

const formatEventTime = (timeString?: string): string => {
  if (!timeString) return "Time TBD";
  // Handle HH:mm:ss format
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  }
  return timeString;
};

export const EventsManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "featured" | "recurring" | "completed" | "draft">("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "title">("date-asc");

  // Modals
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<ChurchEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<number | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAttendees, setFormAttendees] = useState("All Welcome");
  const [formStatus, setFormStatus] = useState<"upcoming" | "ongoing" | "completed" | "draft">("upcoming");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formRecurrencePattern, setFormRecurrencePattern] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Fetch events from API
  const fetchEvents = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(apiUrls.events(), {
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
        setEvents(resData.data);
      } else if (Array.isArray(resData)) {
        setEvents(resData);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error("Could not load events from server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Extract unique locations
  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    events.forEach((e) => {
      if (e.location && e.location.trim()) {
        locSet.add(e.location.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [events]);

  // Executive KPI statistics
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter((e) => e.status === "upcoming" || e.status === "ongoing").length;
    const featured = events.filter((e) => e.featured).length;
    const recurring = events.filter((e) => e.is_recurring).length;
    const completed = events.filter((e) => e.status === "completed").length;
    const drafts = events.filter((e) => e.status === "draft").length;
    return { total, upcoming, featured, recurring, completed, drafts };
  }, [events]);

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Status filter
        if (statusFilter === "upcoming" && ev.status !== "upcoming" && ev.status !== "ongoing") return false;
        if (statusFilter === "featured" && !ev.featured) return false;
        if (statusFilter === "recurring" && !ev.is_recurring) return false;
        if (statusFilter === "completed" && ev.status !== "completed") return false;
        if (statusFilter === "draft" && ev.status !== "draft") return false;

        // Location filter
        if (selectedLocation !== "all" && ev.location !== selectedLocation) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = ev.title.toLowerCase().includes(q);
          const matchDesc = ev.description?.toLowerCase().includes(q) || false;
          const matchLoc = ev.location?.toLowerCase().includes(q) || false;
          const matchAtt = ev.attendees?.toLowerCase().includes(q) || false;
          return matchTitle || matchDesc || matchLoc || matchAtt;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return sortBy === "date-asc" ? timeA - timeB : timeB - timeA;
      });
  }, [events, statusFilter, selectedLocation, searchQuery, sortBy]);

  // Pagination Calculations
  const totalItems = filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice(startIndex, startIndex + pageSize);
  }, [filteredEvents, startIndex, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedLocation, sortBy, pageSize]);

  // Clamp current page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormTitle("");
    const today = new Date().toISOString().slice(0, 10);
    setFormDate(today);
    setFormTime("09:00");
    setFormLocation("St. Peter's Cathedral, Shyogwe");
    setFormAttendees("All Welcome");
    setFormStatus("upcoming");
    setFormFeatured(false);
    setFormIsRecurring(false);
    setFormRecurrencePattern("");
    setFormImage("/01.jpg");
    setFormDescription("");
    setEditorOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (ev: ChurchEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title || "");
    // Extract YYYY-MM-DD
    const rawDate = ev.date ? ev.date.slice(0, 10) : "";
    setFormDate(rawDate);
    setFormTime(ev.time ? ev.time.slice(0, 5) : "");
    setFormLocation(ev.location || "");
    setFormAttendees(ev.attendees || "All Welcome");
    setFormStatus((ev.status as any) || "upcoming");
    setFormFeatured(!!ev.featured);
    setFormIsRecurring(!!ev.is_recurring);
    setFormRecurrencePattern(ev.recurrence_pattern || "");
    setFormImage(ev.image || "");
    setFormDescription(ev.description || "");
    setEditorOpen(true);
  };

  // Upload image handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      toast.error("Authentication required for image upload");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "events");

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
        toast.success("Event poster uploaded successfully");
      } else {
        toast.error(resData.message || "Failed to process image");
      }
    } catch (err) {
      console.error("Event image upload error:", err);
      toast.error("Image upload encountered an error");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error("Event title is required");
      return;
    }
    if (!formDate) {
      toast.error("Event date is required");
      return;
    }

    try {
      setSubmitting(true);
      const isEditing = !!editingEvent;
      const url = isEditing ? `${apiUrls.events()}/${editingEvent.id}` : apiUrls.events();
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        title: formTitle.trim(),
        date: formDate,
        time: formTime ? `${formTime}:00` : null,
        location: formLocation.trim() || undefined,
        attendees: formAttendees.trim() || "All Welcome",
        status: formStatus,
        featured: formFeatured,
        is_recurring: formIsRecurring,
        recurrence_pattern: formIsRecurring ? formRecurrencePattern.trim() || "Weekly" : null,
        image: formImage.trim() || undefined,
        description: formDescription.trim() || undefined
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
        throw new Error(resData.message || "Failed to save event");
      }

      toast.success(isEditing ? "Event updated successfully" : "Event created successfully");
      setEditorOpen(false);
      await fetchEvents();
    } catch (err: any) {
      console.error("Save event error:", err);
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  // Instant toggle for featured status
  const handleToggleFeatured = async (ev: ChurchEvent) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const nextState = !ev.featured;
    setTogglingFeaturedId(ev.id);

    // Optimistic local update
    setEvents((prev) =>
      prev.map((item) => (item.id === ev.id ? { ...item, featured: nextState } : item))
    );

    try {
      const response = await fetch(`${apiUrls.events()}/${ev.id}`, {
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
          ? `Event "${ev.title.slice(0, 30)}..." marked as Featured`
          : `Event removed from Featured highlights`
      );
    } catch (err) {
      // Revert optimistic update
      setEvents((prev) =>
        prev.map((item) => (item.id === ev.id ? { ...item, featured: !nextState } : item))
      );
      toast.error("Failed to update featured flag on server");
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  // Open Delete confirmation
  const handlePromptDelete = (ev: ChurchEvent) => {
    setSelectedToDelete(ev);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${apiUrls.events()}/${selectedToDelete.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete event");
      }

      toast.success("Event deleted permanently");
      setEvents((prev) => prev.filter((item) => item.id !== selectedToDelete.id));
      setDeleteModalOpen(false);
      setSelectedToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Could not delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Upcoming
          </span>
        );
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Ongoing
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Completed
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Draft
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
        activeItem="/admin/events"
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
                  <span className="text-church-navy font-semibold">Events Calendar</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-church-navy tracking-tight mt-0.5">
                  Liturgical & Diocesan Events
                </h1>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEvents(true)}
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
                <Link to="/events" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Public Calendar</span>
                </Link>
              </Button>

              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="bg-church-navy hover:bg-church-navy/90 text-white font-medium shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>New Event</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Executive KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Total Events */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Gatherings
                </span>
                <div className="w-9 h-9 rounded-lg bg-church-navy/10 flex items-center justify-center text-church-navy">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-church-navy">
                  {stats.total}
                </span>
                <span className="text-xs text-slate-500 font-medium">Scheduled</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Synods, celebrations & ministries</p>
            </div>

            {/* Upcoming & Live */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Upcoming & Active
                </span>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {stats.upcoming}
                </span>
                <span className="text-xs text-emerald-600 font-medium">Ahead</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Open for parish attendance</p>
            </div>

            {/* Featured Highlights */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Featured Events
                </span>
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Star className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                  {stats.featured}
                </span>
                <span className="text-xs text-amber-600 font-medium">Spotlight</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Highlighted on diocesan homepage</p>
            </div>

            {/* Recurring Fellowships */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recurring Ministries
                </span>
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Repeat className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                  {stats.recurring}
                </span>
                <span className="text-xs text-purple-600 font-medium">Ongoing</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">Youth, Mothers' Union, Brigades</p>
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
                All Gatherings ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("upcoming")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "upcoming"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Upcoming ({stats.upcoming})
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
                onClick={() => setStatusFilter("recurring")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "recurring"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Recurring ({stats.recurring})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === "completed"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>

            {/* Search, Location Filter & View Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search events, venues, or target attendees..."
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
                {/* Location Dropdown */}
                {uniqueLocations.length > 0 && (
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[170px] border-slate-200">
                      <SelectValue placeholder="All Venues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Venues</SelectItem>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
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
                    <SelectItem value="date-asc">Date (Earliest First)</SelectItem>
                    <SelectItem value="date-desc">Date (Latest First)</SelectItem>
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
              <p className="text-sm font-semibold text-church-navy">Loading Events Calendar...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving scheduled gatherings from EAR Shyogwe database</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-slate-200 py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-church-navy">No Events Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                {searchQuery || statusFilter !== "all" || selectedLocation !== "all"
                  ? "No events matched your current filter criteria. Try clearing your search or filters."
                  : "No events are currently scheduled. Plan and publish your first diocesan gathering below."}
              </p>
              {searchQuery || statusFilter !== "all" || selectedLocation !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSelectedLocation("all");
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
                  Create First Event
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Editorial Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedEvents.map((event) => {
                const coverUrl = resolveEventImageUrl(event.image);

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={coverUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                        <div className="pointer-events-auto">{getStatusBadge(event.status)}</div>

                        <div className="flex items-center gap-1.5 pointer-events-auto">
                          {event.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </span>
                          )}

                          {event.is_recurring && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white shadow-xs">
                              <Repeat className="w-3 h-3" />
                              {event.recurrence_pattern || "Recurring"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      {/* Date & Time Header Pill */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-church-navy">
                          <Calendar className="w-3.5 h-3.5 text-church-gold" />
                          {formatEventDate(event.date)}
                        </span>
                        {event.time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatEventTime(event.time)}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-bold text-church-navy leading-snug line-clamp-2 group-hover:text-church-gold transition-colors mb-2">
                        {event.title}
                      </h2>

                      {/* Location & Audience */}
                      <div className="space-y-1 mb-3">
                        {event.location && (
                          <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </p>
                        )}
                        {event.attendees && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                            <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{event.attendees}</span>
                          </p>
                        )}
                      </div>

                      {/* Excerpt Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
                        {event.description || "Diocesan gathering with liturgical prayers and fellowship."}
                      </p>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Instant Quick-Toggle Featured */}
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(event)}
                          disabled={togglingFeaturedId === event.id}
                          className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                            event.featured
                              ? "text-amber-600 hover:bg-amber-50 font-medium"
                              : "text-slate-400 hover:text-amber-600 hover:bg-slate-50"
                          }`}
                          title={event.featured ? "Remove from Featured" : "Mark as Featured"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              event.featured ? "fill-amber-500 text-amber-500" : ""
                            }`}
                          />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* View Live Event */}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-slate-500 hover:text-church-navy hover:bg-slate-100"
                            title="View Public Event"
                          >
                            <Link to={`/events/${event.id}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>

                          {/* Edit Event */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(event)}
                            className="h-8 w-8 text-slate-500 hover:text-church-navy hover:bg-slate-100"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          {/* Delete Event */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePromptDelete(event)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Event"
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
                      <th className="py-3 px-4 min-w-[220px]">Event Title & Venue</th>
                      <th className="py-3 px-4 w-36">Date & Time</th>
                      <th className="py-3 px-4 w-36">Audience</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4 w-24 text-center">Featured</th>
                      <th className="py-3 px-4 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedEvents.map((event) => {
                      const coverUrl = resolveEventImageUrl(event.image);

                      return (
                        <tr
                          key={event.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="w-12 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                              <img
                                src={coverUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </td>

                          {/* Headline & Location */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-church-navy line-clamp-1 group-hover:text-church-gold transition-colors">
                              {event.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {event.location || "Diocese"}
                            </p>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-semibold text-slate-800">{formatEventDate(event.date)}</p>
                            {event.time && (
                              <p className="text-[11px] text-slate-500">{formatEventTime(event.time)}</p>
                            )}
                          </td>

                          {/* Attendees */}
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                            {event.attendees || "All Welcome"}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">{getStatusBadge(event.status)}</td>

                          {/* Featured Switch */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(event)}
                              disabled={togglingFeaturedId === event.id}
                              className={`p-1 rounded-md transition-colors ${
                                event.featured
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-slate-300 hover:text-amber-500 hover:bg-slate-50"
                              }`}
                              title={event.featured ? "Featured on Home" : "Not featured"}
                            >
                              <Star
                                className={`w-4 h-4 mx-auto ${
                                  event.featured ? "fill-amber-500 text-amber-500" : ""
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-7 w-7 text-slate-500 hover:text-church-navy"
                                title="View Public Event"
                              >
                                <Link to={`/events/${event.id}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(event)}
                                className="h-7 w-7 text-slate-500 hover:text-church-navy"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePromptDelete(event)}
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

          {/* Pagination Controls Bar */}
          {totalItems > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              {/* Record count indicator */}
              <div className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-church-navy">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
                <span className="font-bold text-church-navy">{endIndex}</span> of{" "}
                <span className="font-bold text-church-navy">{totalItems}</span> events
              </div>

              {/* Rows per page selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(val) => setPageSize(Number(val))}
                >
                  <SelectTrigger className="h-8 w-18 text-xs border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 events</SelectItem>
                    <SelectItem value="9">9 events</SelectItem>
                    <SelectItem value="12">12 events</SelectItem>
                    <SelectItem value="18">18 events</SelectItem>
                    <SelectItem value="24">24 events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page navigation controls */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 text-slate-600 hover:text-church-navy border-slate-200 disabled:opacity-40"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 text-slate-600 hover:text-church-navy border-slate-200 disabled:opacity-40"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const hasGap = prev && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {hasGap && <span className="px-1 text-slate-400 text-xs">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 min-w-[32px] px-2 rounded-md text-xs font-semibold transition-colors ${
                              currentPage === page
                                ? "bg-church-navy text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100 hover:text-church-navy border border-transparent"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 text-slate-600 hover:text-church-navy border-slate-200 disabled:opacity-40"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 text-slate-600 hover:text-church-navy border-slate-200 disabled:opacity-40"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Event Create / Edit Modal Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border-slate-200">
          <DialogHeader className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-church-navy/10 flex items-center justify-center text-church-navy">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-church-navy">
                  {editingEvent ? "Edit Diocesan Event" : "Schedule New Diocesan Event"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Plan special services, synods, youth summits, fellowships, and episcopal visits.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEvent} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Event Title */}
              <div className="space-y-1.5">
                <Label htmlFor="event-title" className="text-xs font-bold text-slate-700">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Diocesan Synod & Clergy Assembly"
                  className="h-10 text-sm border-slate-200 focus-visible:ring-church-navy"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="event-date" className="text-xs font-bold text-slate-700">
                    Event Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-9 text-xs border-slate-200 focus-visible:ring-church-navy"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="event-time" className="text-xs font-bold text-slate-700">
                    Service / Start Time
                  </Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="h-9 text-xs border-slate-200 focus-visible:ring-church-navy"
                  />
                </div>
              </div>

              {/* Location & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="event-location" className="text-xs font-bold text-slate-700">
                    Venue / Location
                  </Label>
                  <Input
                    id="event-location"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. St. Peter's Cathedral, Shyogwe"
                    className="h-9 text-xs border-slate-200 focus-visible:ring-church-navy"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="event-attendees" className="text-xs font-bold text-slate-700">
                    Target Attendees / Audience
                  </Label>
                  <Input
                    id="event-attendees"
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    placeholder="e.g. All Welcome, Youth (14-30), Clergy"
                    className="h-9 text-xs border-slate-200 focus-visible:ring-church-navy"
                  />
                </div>
              </div>

              {/* Status & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="event-status" className="text-xs font-bold text-slate-700">
                    Status
                  </Label>
                  <Select
                    value={formStatus}
                    onValueChange={(val: any) => setFormStatus(val)}
                  >
                    <SelectTrigger id="event-status" className="h-9 text-xs border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming (Scheduled)</SelectItem>
                      <SelectItem value="ongoing">Ongoing (Active Now)</SelectItem>
                      <SelectItem value="completed">Completed (Past Event)</SelectItem>
                      <SelectItem value="draft">Draft (Private)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Switch */}
                <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg">
                  <input
                    type="checkbox"
                    id="event-featured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <Label htmlFor="event-featured" className="text-xs text-amber-900 cursor-pointer flex-1">
                    <span className="font-bold">Feature on Homepage Banner</span>
                    <span className="block text-[11px] text-amber-700 font-normal">
                      Prominently showcases this event on the diocesan main page.
                    </span>
                  </Label>
                </div>
              </div>

              {/* Recurring Fellowship Options */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="event-recurring"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-church-navy focus:ring-church-navy cursor-pointer"
                  />
                  <Label htmlFor="event-recurring" className="text-xs font-bold text-church-navy cursor-pointer">
                    This is a recurring program / fellowship gathering
                  </Label>
                </div>

                {formIsRecurring && (
                  <div className="space-y-1.5 pl-6 pt-1">
                    <Label htmlFor="event-recurrence" className="text-xs font-medium text-slate-600">
                      Recurrence Frequency
                    </Label>
                    <Select
                      value={formRecurrencePattern || "Weekly"}
                      onValueChange={setFormRecurrencePattern}
                    >
                      <SelectTrigger id="event-recurrence" className="h-8 text-xs border-slate-200 max-w-xs">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly (Every Week)</SelectItem>
                        <SelectItem value="Bi-Weekly">Bi-Weekly (Every Two Weeks)</SelectItem>
                        <SelectItem value="Monthly">Monthly (Once a Month)</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annual">Annual (Yearly Celebration)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Cover Image Upload / Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-700 block">
                  Event Cover Photo
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-church-navy rounded-xl p-4 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center min-h-[130px]">
                    <Input
                      id="event-img-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="event-img-upload"
                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-church-navy mb-1.5" />
                          <p className="text-xs font-medium text-slate-600">Uploading event photo...</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                          <p className="text-xs font-bold text-slate-700">Upload Poster / Banner</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WEBP</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Image Preview & URL Input */}
                  <div className="space-y-2">
                    {formImage ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-[90px] w-full">
                        <img
                          src={resolveEventImageUrl(formImage)}
                          alt="Event preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormImage("")}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 h-[90px] flex items-center justify-center text-xs text-slate-400">
                        No cover selected
                      </div>
                    )}

                    <Input
                      type="text"
                      placeholder="Or enter image URL (e.g. /01.jpg)..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="h-8 text-xs border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label htmlFor="event-description" className="text-xs font-bold text-slate-700">
                  Event Program Description
                </Label>
                <Textarea
                  id="event-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide comprehensive details about the celebration, order of worship, presiding clergy, and instructions for attendees..."
                  className="min-h-[110px] text-xs border-slate-200 focus-visible:ring-church-navy"
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
                ) : editingEvent ? (
                  "Update Event"
                ) : (
                  "Schedule Event"
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
                Delete Scheduled Event
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete this gathering from the diocesan calendar? This action cannot be undone.
              </DialogDescription>
              {selectedToDelete && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-church-navy line-clamp-1">
                    {selectedToDelete.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatEventDate(selectedToDelete.date)} • {selectedToDelete.location || "Venue TBD"}
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

export default EventsManagement;
