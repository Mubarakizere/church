import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  ChevronRight, 
  Loader2,
  GraduationCap,
  Heart,
  Home,
  Wrench,
  Church
} from "lucide-react";
import { apiUrls } from "@/config/api";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  category: "bishop" | "archdeacon" | "department";
  description?: string;
  image?: string;
  email?: string;
  phone?: string;
  region?: string;
  display_order?: number;
  is_active: boolean;
}

export const Team: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bishop" | "archdeacons" | "departments">("bishop");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  // Helper to build team member image URL
  const resolveTeamImageUrl = (rawImage?: string): string => {
    if (!rawImage || rawImage === "/placeholder.svg" || rawImage === "placeholder.svg") {
      return "";
    }
    if (rawImage.startsWith("http")) return rawImage;
    const filename = rawImage.split("/").pop() || rawImage;
    return apiUrls.storage(`team-images/${filename}`);
  };

  // Fallback bishop in case of network issue
  const fallbackBishop: TeamMember = {
    id: 16,
    name: "Rt. Rev. Louis Pasteur KABAYIZA",
    title: "Bishop of The Diocese",
    category: "bishop",
    description: "The Bishop provides spiritual leadership and pastoral care to clergy, laity, and institutions, ensuring faithfulness to Scripture and Anglican tradition. He oversees diocesan administration, clergy recruitment and training, and presides over confirmations and ordinations.",
    image: "Wi3CMVwFFHFpJz9LhHUSNmVeGHn6T4In6fRsZMr5.jpg",
    email: "bishop@shyogwe.com",
    phone: "+250785451691",
    is_active: true
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrls.teams());
        if (response.ok) {
          const data = await response.json();
          const members: TeamMember[] = Array.isArray(data)
            ? data
            : (Array.isArray(data?.data) ? data.data : []);
          if (members.length > 0) {
            setTeamMembers(members);
          }
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleImageError = (memberId: number, rawImage?: string) => {
    if (rawImage) {
      const filename = rawImage.split("/").pop();
      const backupUrl = `https://earshyogwe.com/api/storage/team-images/${filename}`;
      const imgElement = document.getElementById(`team-img-${memberId}`) as HTMLImageElement;
      if (imgElement && imgElement.src !== backupUrl) {
        imgElement.src = backupUrl;
        return;
      }
    }
    setFailedImages((prev) => ({ ...prev, [memberId]: true }));
  };

  const getInitials = (name: string): string => {
    const clean = name.replace(/^(Arch\.|Rev\.|Rt\.\s*Rev\.|Dr\.)\s*/i, "").trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const getDepartmentIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("education")) return GraduationCap;
    if (t.includes("health")) return Heart;
    if (t.includes("family")) return Home;
    if (t.includes("technician") || t.includes("it")) return Wrench;
    if (t.includes("mission") || t.includes("evangelism")) return Church;
    return Building2;
  };

  // Group members
  const bishop = teamMembers.find((m) => m.category === "bishop") || fallbackBishop;
  const archdeacons = teamMembers.filter((m) => m.category === "archdeacon");
  const departments = teamMembers.filter((m) => m.category === "department");

  const tabs = [
    { id: "bishop", label: "The Bishop", count: bishop ? 1 : 0 },
    { id: "archdeacons", label: "Archdeacons", count: archdeacons.length },
    { id: "departments", label: "Diocesan Secretariat & Departments", count: departments.length }
  ] as const;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          {/* Background image with clean dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Shyogwe Diocese Leadership"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/80 backdrop-blur-[0.5px]" />
          </div>

          {/* Banner Content */}
          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Leadership & Team</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Our Leadership Team
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Content Section */}
        <div className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Clean Tab Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-church-navy text-white shadow-sm"
                      : "bg-white text-slate-600 hover:text-church-navy hover:bg-slate-100 border border-slate-200/90"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span 
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                        activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-church-navy mb-3" />
                <span className="text-sm text-slate-500 font-medium">Loading leadership directory...</span>
              </div>
            ) : (
              <div>
                {/* 1. BISHOP TAB */}
                {activeTab === "bishop" && (
                  <div className="max-w-4xl mx-auto">
                    {bishop ? (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          {/* Bishop Portrait */}
                          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-church-gold/40 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center">
                            {!failedImages[bishop.id] && resolveTeamImageUrl(bishop.image) ? (
                              <img
                                id={`team-img-${bishop.id}`}
                                src={resolveTeamImageUrl(bishop.image)}
                                alt={bishop.name}
                                className="w-full h-full object-cover object-top"
                                onError={() => handleImageError(bishop.id, bishop.image)}
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-church-navy text-church-gold font-bold text-2xl flex items-center justify-center">
                                {getInitials(bishop.name)}
                              </div>
                            )}
                          </div>

                          {/* Bishop Information */}
                          <div className="text-center md:text-left flex-1 space-y-3">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-church-gold bg-church-cream/70 px-3 py-1 rounded-full">
                              Diocesan Bishop
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                              {bishop.name}
                            </h2>
                            <p className="text-sm font-semibold text-slate-700">
                              {bishop.title}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed pt-1">
                              {bishop.description || 
                                "Leading the Anglican Church of Rwanda, Shyogwe Diocese in faithful preaching of the Gospel, pastoral care, and community transformation."}
                            </p>

                            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                              <Link
                                to="/bishop"
                                className="px-4 py-2 rounded-lg bg-church-navy text-white text-xs font-semibold hover:bg-church-navy/90 transition-colors shadow-xs"
                              >
                                Bishop's Office & Message
                              </Link>
                              {bishop.email && (
                                <a
                                  href={`mailto:${bishop.email}`}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-church-navy hover:bg-slate-50 transition-colors"
                                >
                                  <Mail className="h-3.5 w-3.5 text-church-gold" />
                                  <span>{bishop.email}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        Bishop information is currently being updated.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. ARCHDEACONS TAB */}
                {activeTab === "archdeacons" && (
                  <div className="max-w-6xl mx-auto">
                    {archdeacons.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archdeacons.map((arch) => {
                          const imgSrc = resolveTeamImageUrl(arch.image);
                          const isFailed = failedImages[arch.id] || !imgSrc;

                          return (
                            <div
                              key={arch.id}
                              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-church-gold/60 transition-all p-5 flex flex-col items-center text-center group"
                            >
                              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 shrink-0 flex items-center justify-center">
                                {!isFailed ? (
                                  <img
                                    id={`team-img-${arch.id}`}
                                    src={imgSrc}
                                    alt={arch.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                    onError={() => handleImageError(arch.id, arch.image)}
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-church-navy text-church-gold font-bold text-lg flex items-center justify-center">
                                    {getInitials(arch.name)}
                                  </div>
                                )}
                              </div>

                              <h3 className="font-bold text-church-navy text-base leading-snug">
                                {arch.name}
                              </h3>
                              <p className="text-xs font-semibold text-church-gold mt-1 mb-2">
                                {arch.title}
                              </p>

                              {arch.description && (
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                                  {arch.description}
                                </p>
                              )}

                              {/* Contact shortcuts */}
                              <div className="mt-auto pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-3 text-xs text-slate-600">
                                {arch.email && (
                                  <a
                                    href={`mailto:${arch.email}`}
                                    className="hover:text-church-navy inline-flex items-center gap-1"
                                    title={arch.email}
                                  >
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Email</span>
                                  </a>
                                )}
                                {arch.phone && (
                                  <a
                                    href={`tel:${arch.phone}`}
                                    className="hover:text-church-navy inline-flex items-center gap-1"
                                    title={arch.phone}
                                  >
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Call</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        No archdeacons records found.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DEPARTMENTS & STAFF TAB */}
                {activeTab === "departments" && (
                  <div className="max-w-6xl mx-auto">
                    {departments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((member) => {
                          const imgSrc = resolveTeamImageUrl(member.image);
                          const isFailed = failedImages[member.id] || !imgSrc;
                          const DeptIcon = getDepartmentIcon(member.title);

                          return (
                            <div
                              key={member.id}
                              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-church-gold/60 transition-all p-5 flex flex-col items-center text-center group"
                            >
                              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 shrink-0 flex items-center justify-center">
                                {!isFailed ? (
                                  <img
                                    id={`team-img-${member.id}`}
                                    src={imgSrc}
                                    alt={member.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                    onError={() => handleImageError(member.id, member.image)}
                                  />
                                ) : (
                                  <DeptIcon className="h-10 w-10 text-church-navy/60" />
                                )}
                              </div>

                              <h3 className="font-bold text-church-navy text-sm sm:text-base leading-snug">
                                {member.name}
                              </h3>
                              <p className="text-xs font-semibold text-slate-600 mt-1 mb-2">
                                {member.title}
                              </p>

                              {member.description && (
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                                  {member.description}
                                </p>
                              )}

                              <div className="mt-auto pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-3 text-xs text-slate-600">
                                {member.email && (
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="hover:text-church-navy inline-flex items-center gap-1"
                                    title={member.email}
                                  >
                                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Email</span>
                                  </a>
                                )}
                                {member.phone && (
                                  <a
                                    href={`tel:${member.phone}`}
                                    className="hover:text-church-navy inline-flex items-center gap-1"
                                    title={member.phone}
                                  >
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Call</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        No department staff records found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Team;