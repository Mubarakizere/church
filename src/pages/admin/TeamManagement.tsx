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
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  ExternalLink,
  Menu,
  Crown,
  Building,
  CheckCircle2,
  XCircle,
  MapPin,
  RefreshCw,
  X
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  category: "bishop" | "archdeacon" | "department";
  description?: string;
  email: string;
  phone?: string;
  image: string;
  region?: string;
  display_order?: number;
  is_active?: boolean;
}

export const TeamManagement: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadTeamMembers();
  }, [token, navigate]);

  const loadTeamMembers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(apiUrls.admin.teams(), {
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        const rawItems = result.data || result;
        if (Array.isArray(rawItems)) {
          const membersWithFixedImages = rawItems.map((member: any) => {
            let image = member.image;
            if (!image || image === "/placeholder.svg" || image === "placeholder.svg") {
              image = "/placeholder.svg";
            } else if (!image.startsWith("http")) {
              let clean = image.replace(/^\/+/, "");
              if (clean.startsWith("storage/")) {
                clean = clean.substring(8);
              }
              image = apiUrls.storage(clean);
            }

            return {
              ...member,
              id: member.id?.toString(),
              image,
              is_active: member.is_active === 1 || member.is_active === true || member.is_active === "1"
            };
          });
          setTeamMembers(membersWithFixedImages);
        } else {
          setTeamMembers([]);
        }
      } else {
        toast.error("Failed to load clergy and leadership records");
      }
    } catch (error) {
      console.error("Failed to load team members:", error);
      toast.error("Network error while loading team members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateMember = () => {
    setSelectedMember({
      id: "",
      name: "",
      title: "",
      category: "department",
      description: "",
      email: "",
      phone: "",
      image: "/placeholder.svg",
      region: "",
      display_order: 0,
      is_active: true
    });
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
  };

  const handleSaveMemberNew = async (memberData: any) => {
    setActionLoading(true);
    try {
      const url = isCreating ? apiUrls.admin.teams() : `${apiUrls.admin.teams()}/${memberData.id}`;

      if (memberData.imageFile && memberData.imageFile instanceof File) {
        const formData = new FormData();
        formData.append("name", memberData.name || "");
        formData.append("title", memberData.title || "");
        formData.append("category", memberData.category || "department");
        formData.append("email", memberData.email || "");

        if (memberData.phone) formData.append("phone", memberData.phone);
        if (memberData.description) formData.append("description", memberData.description);
        if (memberData.region) formData.append("region", memberData.region);
        formData.append("is_active", memberData.is_active ? "1" : "0");
        formData.append("image", memberData.imageFile);

        if (memberData.id && !isCreating) {
          formData.append("_method", "PUT");
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: formData,
          credentials: "include"
        });

        if (response.ok) {
          toast.success(isCreating ? "Leader profile registered successfully" : "Profile updated successfully");
          setEditModalOpen(false);
          await loadTeamMembers();
        } else {
          const err = await response.json().catch(() => ({}));
          toast.error(err.message || "Failed to save team member profile");
        }
      } else {
        const method = isCreating ? "POST" : "PUT";
        const requestData = {
          name: memberData.name || "",
          title: memberData.title || memberData.position || "",
          category: memberData.category || "department",
          description: memberData.description || "",
          email: memberData.email || "",
          phone: memberData.phone || "",
          region: memberData.region || "",
          is_active: memberData.is_active !== false
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(requestData)
        });

        if (response.ok) {
          toast.success(isCreating ? "Leader profile registered successfully" : "Profile updated successfully");
          setEditModalOpen(false);
          await loadTeamMembers();
        } else {
          const err = await response.json().catch(() => ({}));
          toast.error(err.message || "Failed to save profile changes");
        }
      }
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("An unexpected error occurred while saving profile");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${apiUrls.admin.teams()}/${selectedMember.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        toast.success("Profile record deleted successfully");
        setDeleteModalOpen(false);
        setTeamMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      } else {
        toast.error("Failed to delete record. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Error occurred while deleting profile");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics counts
  const bishopCount = teamMembers.filter((m) => m.category === "bishop").length;
  const archdeaconCount = teamMembers.filter((m) => m.category === "archdeacon").length;
  const departmentCount = teamMembers.filter((m) => m.category === "department").length;
  const activeCount = teamMembers.filter((m) => m.is_active).length;

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      // Category filter
      if (selectedCategory !== "all" && member.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !member.is_active) return false;
      if (statusFilter === "inactive" && member.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = member.name?.toLowerCase().includes(query);
        const matchesTitle = member.title?.toLowerCase().includes(query);
        const matchesEmail = member.email?.toLowerCase().includes(query);
        const matchesRegion = member.region?.toLowerCase().includes(query);
        return matchesName || matchesTitle || matchesEmail || matchesRegion;
      }

      return true;
    });
  }, [teamMembers, selectedCategory, statusFilter, searchQuery]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "bishop":
        return {
          label: "The Episcopate",
          className: "bg-church-gold/20 text-church-navy border-church-gold/40 font-bold",
          icon: Crown
        };
      case "archdeacon":
        return {
          label: "Archdeaconry",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold",
          icon: Users
        };
      case "department":
        return {
          label: "Diocesan Department",
          className: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
          icon: Building
        };
      default:
        return {
          label: "Leadership",
          className: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
          icon: Users
        };
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden font-sans selection:bg-church-gold selection:text-church-navy">
      {/* Institutional Admin Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
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
                Clergy & Leadership Directory
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Diocesan Staff, Episcopate, Archdeacons & Department Directors
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
              <a href="/team" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3 mr-1.5 text-church-navy" />
                Public Directory
              </a>
            </Button>

            <Button
              size="sm"
              onClick={handleCreateMember}
              className="h-8 text-xs bg-church-navy hover:bg-church-navy/90 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-church-gold" />
              <span>Add Member</span>
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
                  Total Leadership
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeCount} Active
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {teamMembers.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Users className="h-3 w-3 text-slate-400" />
                <span>Recorded diocesan personnel</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Episcopal Office
                </span>
                <Crown className="h-4 w-4 text-church-gold" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {bishopCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>The Bishop & Episcopal Staff</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Archdeaconries
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-church-navy bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Regional
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {archdeaconCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>Venerable Archdeacons</span>
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Departments
                </span>
                <Building className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                {departmentCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>Diocesan Directorate Heads</span>
              </p>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by leader name, title, email, region..."
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

              {/* Status and Refresh */}
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTeamMembers}
                  disabled={refreshing}
                  className="h-9 text-xs border-slate-200 text-slate-600 hover:text-church-navy"
                  title="Refresh records"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Category Segment Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
              {[
                { id: "all", label: "All Members", count: teamMembers.length },
                { id: "bishop", label: "The Bishop", count: bishopCount },
                { id: "archdeacon", label: "Archdeacons", count: archdeaconCount },
                { id: "department", label: "Departments", count: departmentCount }
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
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

          {/* Members Grid View */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-church-navy">
                No Leadership Records Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No team profiles matched your selected filter or search criteria. Try adjusting your search query or reset the category filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setStatusFilter("all");
                }}
                className="text-xs border-slate-200 text-church-navy"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMembers.map((member) => {
                const badge = getCategoryBadge(member.category);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Bar with Category & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border ${badge.className}`}
                        >
                          <BadgeIcon className="h-3 w-3" />
                          <span>{badge.label}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            member.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {member.is_active ? (
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

                      {/* Leader Identity Card */}
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          {member.image && member.image !== "/placeholder.svg" ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : null}
                          {(!member.image || member.image === "/placeholder.svg") && (
                            <div className="h-16 w-16 rounded-2xl bg-church-navy/10 border border-church-navy/20 flex items-center justify-center text-church-navy font-serif font-bold text-xl">
                              {member.name?.charAt(0) || "C"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif font-bold text-base text-church-navy leading-snug truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs font-semibold text-church-gold truncate mt-0.5">
                            {member.title}
                          </p>
                          {member.region && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{member.region}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Brief Bio / Excerpt */}
                      {member.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {member.description}
                        </p>
                      )}

                      {/* Contact Details */}
                      <div className="space-y-1.5 pt-1 text-xs">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-2 text-slate-600 hover:text-church-navy transition-colors truncate"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center gap-2 text-slate-600 hover:text-church-navy transition-colors truncate"
                          >
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{member.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: #{member.id}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMember(member)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-church-navy hover:bg-white"
                          title="Edit member"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member)}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete member"
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
          )}
        </main>
      </div>

      {/* Reusable Modals */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveMemberNew}
        title={isCreating ? "Add Leadership / Staff Profile" : "Edit Leader Profile"}
        data={selectedMember}
        type="team"
        loading={actionLoading}
        isCreating={isCreating}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Leader Profile"
        message="Are you sure you want to delete this profile? This will remove the member from both public listings and the diocesan directory."
        itemName={selectedMember?.name || ""}
        loading={actionLoading}
      />
    </div>
  );
};

export default TeamManagement;
