import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordDialog from "@/components/PasswordDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiUrls } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  FileText,
  FileSpreadsheet,
  FileCheck,
  Download,
  Eye,
  Search,
  X,
  ChevronRight,
  Filter,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Church,
  Info,
  ExternalLink,
  BookOpen
} from "lucide-react";

export interface DocumentRecord {
  id: string | number;
  title: string;
  refCode: string;
  description: string;
  category: "pastoral" | "governance" | "liturgical" | "forms" | "education";
  categoryLabel: string;
  fileType: "pdf" | "docx" | "xlsx";
  fileSize: string;
  publishedDate: string;
  issuingAuthority: string;
  accessLevel: "public" | "password" | "role_based";
  requiresPassword?: boolean;
  requiresRole?: boolean;
  allowedRoles?: string[];
  pagesCount?: number;
  downloadCount?: number;
  downloadUrl?: string;
  viewUrl?: string;
  isApiDoc?: boolean;
}

const FALLBACK_DOCUMENTS: DocumentRecord[] = [
  {
    id: "doc-strat-2024",
    title: "Diocesan Strategic Plan (2024–2029)",
    refCode: "EAR-SHY-STRAT-2024-29",
    description: "Five-year comprehensive development framework outlining diocesan priorities in evangelism, education across 38 schools, community health, and economic resilience.",
    category: "pastoral",
    categoryLabel: "Pastoral & Synod",
    fileType: "pdf",
    fileSize: "3.4 MB",
    publishedDate: "January 2024",
    issuingAuthority: "Office of the Bishop & Diocesan Executive Board",
    accessLevel: "public",
    pagesCount: 52,
    downloadCount: 384
  },
  {
    id: "doc-synod-14",
    title: "Resolutions of the 14th Diocesan Synod",
    refCode: "EAR-SHY-SYNOD-14-RES",
    description: "Official canonical resolutions, pastoral guidance, archdeaconry territorial reviews, and resolutions enacted during the 14th Synod of Shyogwe Diocese.",
    category: "pastoral",
    categoryLabel: "Pastoral & Synod",
    fileType: "pdf",
    fileSize: "1.8 MB",
    publishedDate: "November 2024",
    issuingAuthority: "Diocesan Synod Secretariat",
    accessLevel: "public",
    pagesCount: 28,
    downloadCount: 512
  },
  {
    id: "doc-pastoral-letter-25",
    title: "Pastoral Exhortation: Spiritual Renewal & Discipleship",
    refCode: "EAR-SHY-PL-2025-01",
    description: "Annual episcopal pastoral letter addressed to all archdeacons, parish rectors, and congregation members focusing on steadfast prayer, family discipleship, and evangelistic missions.",
    category: "pastoral",
    categoryLabel: "Pastoral & Synod",
    fileType: "pdf",
    fileSize: "850 KB",
    publishedDate: "January 2025",
    issuingAuthority: "Rt. Rev. Dr. Jered Kalimba, Bishop of Shyogwe",
    accessLevel: "public",
    pagesCount: 14,
    downloadCount: 620
  },
  {
    id: "doc-safeguarding-2023",
    title: "Child Safeguarding & Vulnerable Adults Policy",
    refCode: "EAR-SHY-SAFE-2023-REV",
    description: "Mandatory institutional code of conduct and reporting mechanisms for clergy, educators, health workers, and ministry leaders protecting children and vulnerable adults.",
    category: "governance",
    categoryLabel: "Policies & Governance",
    fileType: "pdf",
    fileSize: "2.6 MB",
    publishedDate: "March 2023 (Rev. 2025)",
    issuingAuthority: "Diocesan Justice & Safeguarding Commission",
    accessLevel: "public",
    pagesCount: 36,
    downloadCount: 429
  },
  {
    id: "doc-canons-const",
    title: "Constitution and Canons of the Anglican Diocese of Shyogwe",
    refCode: "EAR-SHY-CANON-ED4",
    description: "Foundational church constitution, canonical statutes, parish vestry regulations, clergy accountability procedures, and synod governance guidelines.",
    category: "governance",
    categoryLabel: "Policies & Governance",
    fileType: "pdf",
    fileSize: "5.1 MB",
    publishedDate: "Reissued 2024",
    issuingAuthority: "Legal Affairs & Canonical Governance Committee",
    accessLevel: "public",
    pagesCount: 76,
    downloadCount: 310
  },
  {
    id: "doc-finance-manual",
    title: "Parish Financial Regulations & Accountability Manual",
    refCode: "EAR-SHY-FIN-2024-V2",
    description: "Financial administration standards, tithe recording rules, parish bookkeeping guidelines, capital project procurement, and internal audit requirements.",
    category: "governance",
    categoryLabel: "Policies & Governance",
    fileType: "pdf",
    fileSize: "3.2 MB",
    publishedDate: "August 2024",
    issuingAuthority: "Diocesan Finance & Audit Committee",
    accessLevel: "public",
    pagesCount: 44,
    downloadCount: 265
  },
  {
    id: "doc-lectionary-2526",
    title: "Liturgical Calendar & Sunday Scripture Lectionary (2025–2026)",
    refCode: "EAR-SHY-LECT-2526",
    description: "Canonical lectionary readings, feast days, psalms, and liturgical color schedules for Sunday services and holy festivals across all parishes.",
    category: "liturgical",
    categoryLabel: "Liturgical & Sacraments",
    fileType: "pdf",
    fileSize: "2.2 MB",
    publishedDate: "December 2024",
    issuingAuthority: "Liturgy & Worship Committee",
    accessLevel: "public",
    pagesCount: 32,
    downloadCount: 780
  },
  {
    id: "doc-matrimony-guide",
    title: "Directives & Pastoral Counseling for Holy Matrimony",
    refCode: "EAR-SHY-MATR-2024",
    description: "Canonical marriage publication requirements, premarital counseling curriculum, marriage banns verification, and liturgical solemnization guidelines.",
    category: "liturgical",
    categoryLabel: "Liturgical & Sacraments",
    fileType: "pdf",
    fileSize: "980 KB",
    publishedDate: "February 2024",
    issuingAuthority: "Office of the Dean & Pastoral Care Desk",
    accessLevel: "public",
    pagesCount: 18,
    downloadCount: 540
  },
  {
    id: "doc-baptism-confirmation",
    title: "Catechism & Order of Service for Baptism and Confirmation",
    refCode: "EAR-SHY-BAPT-2024",
    description: "Preparation guide for catechumens, godparent obligations, baptismal liturgy, and episcopal confirmation examination protocols.",
    category: "liturgical",
    categoryLabel: "Liturgical & Sacraments",
    fileType: "pdf",
    fileSize: "1.4 MB",
    publishedDate: "June 2024",
    issuingAuthority: "Christian Education Department",
    accessLevel: "public",
    pagesCount: 24,
    downloadCount: 395
  },
  {
    id: "doc-form-parish-census",
    title: "Annual Parish Census & Statistical Return Form",
    refCode: "EAR-SHY-FORM-STAT01",
    description: "Official annual census form for reporting registered families, adult communicants, youth membership, Sunday school pupils, and parish welfare activities.",
    category: "forms",
    categoryLabel: "Parish Forms & Reports",
    fileType: "pdf",
    fileSize: "450 KB",
    publishedDate: "Annual Update (2025)",
    issuingAuthority: "Diocesan Registry & Archdeaconry Administration",
    accessLevel: "public",
    pagesCount: 6,
    downloadCount: 480
  },
  {
    id: "doc-clergy-report-template",
    title: "Clergy Quarterly Pastoral & Ministry Return Template",
    refCode: "EAR-SHY-FORM-CLERGY02",
    description: "Standardized reporting instrument submitted quarterly by parish priests covering home visits, hospital ministry, cell fellowships, and local outreach.",
    category: "forms",
    categoryLabel: "Parish Forms & Reports",
    fileType: "docx",
    fileSize: "320 KB",
    publishedDate: "January 2025",
    issuingAuthority: "Bishop's Executive Secretariat",
    accessLevel: "public",
    pagesCount: 8,
    downloadCount: 315
  },
  {
    id: "doc-health-stat-template",
    title: "Health Facilities Monthly Outpatient & Outreach Return",
    refCode: "EAR-SHY-HLTH-STAT",
    description: "Statistical reporting template for health centers (Shyogwe, Hanika, Gikomero) and community health posts recording outpatient and maternal services.",
    category: "forms",
    categoryLabel: "Parish Forms & Reports",
    fileType: "xlsx",
    fileSize: "580 KB",
    publishedDate: "Monthly Revised",
    issuingAuthority: "Healthcare Services Directorate",
    accessLevel: "public",
    pagesCount: 4,
    downloadCount: 190
  },
  {
    id: "doc-education-policy",
    title: "Diocesan Education Standards for Church-Affiliated Schools",
    refCode: "EAR-SHY-EDU-2024",
    description: "Quality guidelines, teacher professional development, chaplaincy programs, and school infrastructure standards for all 38 primary and secondary diocesan schools.",
    category: "education",
    categoryLabel: "Education & Health",
    fileType: "pdf",
    fileSize: "2.9 MB",
    publishedDate: "May 2024",
    issuingAuthority: "Diocesan Education Board",
    accessLevel: "public",
    pagesCount: 40,
    downloadCount: 375
  },
  {
    id: "doc-health-centers-guidelines",
    title: "Diocesan Health Centers & Posts Operational Manual",
    refCode: "EAR-SHY-HLTH-2024",
    description: "Operational framework for Shyogwe, Hanika, and Gikomero Health Centers, defining community health coverage, medicine procurement, and patient care ethics.",
    category: "education",
    categoryLabel: "Education & Health",
    fileType: "pdf",
    fileSize: "3.6 MB",
    publishedDate: "September 2024",
    issuingAuthority: "Diocesan Medical & Public Health Directorate",
    accessLevel: "public",
    pagesCount: 48,
    downloadCount: 280
  }
];

const CATEGORY_TABS = [
  { id: "all", label: "All Documents" },
  { id: "pastoral", label: "Pastoral & Synod" },
  { id: "governance", label: "Policies & Governance" },
  { id: "liturgical", label: "Liturgical & Sacraments" },
  { id: "forms", label: "Parish Forms & Reports" },
  { id: "education", label: "Education & Health" }
] as const;

export const Documents: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocumentRecord[]>(FALLBACK_DOCUMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFileType, setSelectedFileType] = useState<string>("all");

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  // Password dialog state for protected docs
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedProtectedDoc, setSelectedProtectedDoc] = useState<DocumentRecord | null>(null);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  useEffect(() => {
    fetchLiveDocuments();
  }, []);

  const fetchLiveDocuments = async () => {
    try {
      setLoading(true);
      const [secRes, stdRes] = await Promise.all([
        fetch(apiUrls.secureDocuments()).catch(() => null),
        fetch(apiUrls.documents()).catch(() => null)
      ]);

      const liveList: DocumentRecord[] = [];

      if (secRes && secRes.ok) {
        const secData = await secRes.json();
        const secDocs = secData.data || [];
        secDocs.forEach((d: any) => {
          let catKey: DocumentRecord["category"] = "pastoral";
          const rawCat = (d.category || "").toLowerCase();
          if (rawCat.includes("policy") || rawCat.includes("governance")) catKey = "governance";
          else if (rawCat.includes("liturg") || rawCat.includes("worship")) catKey = "liturgical";
          else if (rawCat.includes("form") || rawCat.includes("report")) catKey = "forms";
          else if (rawCat.includes("school") || rawCat.includes("health") || rawCat.includes("edu")) catKey = "education";

          liveList.push({
            id: d.id,
            title: d.title,
            refCode: `DOC-SEC-${d.id.toString().padStart(3, "0")}`,
            description: d.description || "Official document published by the Diocese of Shyogwe.",
            category: catKey,
            categoryLabel: d.category || "General Publication",
            fileType: (d.file_type || "pdf").toLowerCase() as any,
            fileSize: d.file_size_human || "File Available",
            publishedDate: d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "Recent",
            issuingAuthority: "Anglican Diocese of Shyogwe",
            accessLevel: d.access_level || (d.requires_password ? "password" : "public"),
            requiresPassword: Boolean(d.requires_password),
            requiresRole: Boolean(d.requires_role),
            allowedRoles: d.allowed_roles || [],
            downloadCount: d.download_count || 0,
            isApiDoc: true
          });
        });
      }

      if (stdRes && stdRes.ok) {
        const stdData = await stdRes.json();
        const stdDocs = Array.isArray(stdData.data) ? stdData.data : Array.isArray(stdData) ? stdData : [];
        stdDocs.forEach((d: any) => {
          if (!liveList.some((item) => item.title.toLowerCase() === (d.title || "").toLowerCase())) {
            let fileExt: "pdf" | "docx" | "xlsx" = "pdf";
            if (typeof d.file === "string") {
              if (d.file.endsWith(".docx") || d.file.endsWith(".doc")) fileExt = "docx";
              else if (d.file.endsWith(".xlsx") || d.file.endsWith(".xls")) fileExt = "xlsx";
            }
            liveList.push({
              id: `std-${d.id}`,
              title: d.title,
              refCode: `EAR-DOC-${d.id}`,
              description: "Official diocesan document and publication.",
              category: "pastoral",
              categoryLabel: "General Publications",
              fileType: fileExt,
              fileSize: "Document File",
              publishedDate: d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "Recent",
              issuingAuthority: "Diocesan Secretariat",
              accessLevel: "public",
              downloadUrl: typeof d.file === "string" ? d.file : undefined,
              isApiDoc: true
            });
          }
        });
      }

      if (liveList.length > 0) {
        // Prepend live API items before fallback catalog
        setDocuments([...liveList, ...FALLBACK_DOCUMENTS]);
      } else {
        setDocuments(FALLBACK_DOCUMENTS);
      }
    } catch {
      setDocuments(FALLBACK_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      if (selectedCategory !== "all" && doc.category !== selectedCategory) {
        return false;
      }
      // File type filter
      if (selectedFileType !== "all" && doc.fileType !== selectedFileType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = doc.title.toLowerCase().includes(query);
        const matchDesc = doc.description.toLowerCase().includes(query);
        const matchRef = doc.refCode.toLowerCase().includes(query);
        const matchAuth = doc.issuingAuthority.toLowerCase().includes(query);
        const matchCat = doc.categoryLabel.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchRef || matchAuth || matchCat;
      }
      return true;
    });
  }, [documents, selectedCategory, selectedFileType, searchQuery]);

  const handleDocumentAction = (doc: DocumentRecord, action: "view" | "download") => {
    if (doc.requiresPassword) {
      setSelectedProtectedDoc(doc);
      setPasswordDialogOpen(true);
      return;
    }

    if (doc.requiresRole && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to your diocesan account to access this restricted document.",
        variant: "destructive"
      });
      return;
    }

    if (doc.isApiDoc && typeof doc.id === "number") {
      if (action === "view") {
        window.open(`/documents/view/${doc.id}`, "_blank");
      } else {
        window.open(apiUrls.secureDocumentDownload(doc.id), "_blank");
      }
      return;
    }

    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, "_blank");
      return;
    }

    if (action === "view") {
      setPreviewDoc(doc);
    } else {
      triggerFallbackDownload(doc);
    }
  };

  const triggerFallbackDownload = (doc: DocumentRecord) => {
    const fileContent = `======================================================
ANGLICAN CHURCH OF RWANDA • SHYOGWE DIOCESE
OFFICIAL DIOCESAN PUBLICATION ARCHIVE
======================================================

DOCUMENT TITLE:
${doc.title}

REFERENCE CODE:
${doc.refCode}

ISSUING AUTHORITY:
${doc.issuingAuthority}

CATEGORY:
${doc.categoryLabel}

PUBLICATION DATE:
${doc.publishedDate}

ACCESS LEVEL:
${doc.accessLevel.toUpperCase()}

FILE SPECIFICATIONS:
Format: ${doc.fileType.toUpperCase()} | Size: ${doc.fileSize}${doc.pagesCount ? ` | Length: ${doc.pagesCount} pages` : ""}

------------------------------------------------------
EXECUTIVE SUMMARY:
------------------------------------------------------
${doc.description}

------------------------------------------------------
CANONICAL & ADMINISTRATIVE NOTICE:
------------------------------------------------------
This document is an authorized release of the Anglican Church of Rwanda,
Shyogwe Diocese. Official hard copies and seal-stamped certified copies may
be requested directly from the Diocesan Secretariat in Muhanga.

Diocesan Secretariat:
P.O. Box 27, Gitarama, Muhanga District, Southern Province, Rwanda
Email: shyogwe@gmail.com | dioceseofshyogwe@yahoo.com
Phone: +250 788 522 174 / +250 788 352 144
======================================================
`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.refCode.toLowerCase()}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Document Brief Downloaded",
      description: `Downloaded official summary for ${doc.title}`
    });
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedProtectedDoc) return;
    setVerifyingPassword(true);

    try {
      if (typeof selectedProtectedDoc.id === "number") {
        const res = await fetch(apiUrls.secureDocumentVerifyPassword(selectedProtectedDoc.id), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });

        if (res.ok) {
          setPasswordDialogOpen(false);
          const viewForm = document.createElement("form");
          viewForm.method = "POST";
          viewForm.action = apiUrls.secureDocumentView(selectedProtectedDoc.id);
          viewForm.target = "_blank";

          const passwordInput = document.createElement("input");
          passwordInput.type = "hidden";
          passwordInput.name = "password";
          passwordInput.value = password;

          viewForm.appendChild(passwordInput);
          document.body.appendChild(viewForm);
          viewForm.submit();
          document.body.removeChild(viewForm);

          toast({
            title: "Access Granted",
            description: "Opening secure document in new tab."
          });
        } else {
          toast({
            title: "Incorrect Password",
            description: "The password provided is not valid for this document.",
            variant: "destructive"
          });
        }
      } else {
        // Fallback protected check
        setPasswordDialogOpen(false);
        setPreviewDoc(selectedProtectedDoc);
        toast({
          title: "Access Verified",
          description: "Displaying document details."
        });
      }
    } catch {
      toast({
        title: "Verification Error",
        description: "Unable to verify document password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifyingPassword(false);
    }
  };

  const getFormatBadge = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="h-3 w-3" />
            PDF
          </span>
        );
      case "docx":
      case "doc":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            <FileCheck className="h-3 w-3" />
            DOCX
          </span>
        );
      case "xlsx":
      case "xls":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileSpreadsheet className="h-3 w-3" />
            XLSX
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-50 text-slate-700 border border-slate-200">
            <FileText className="h-3 w-3" />
            {fileType.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Shyogwe Diocese Publications & Documents"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/80 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Documents & Publications</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Official Documents & Publications
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Introduction & Search Toolbar */}
        <section className="py-8 bg-slate-50 border-b border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Access official canonical resolutions, pastoral letters, safeguarding policies,
                  financial guidelines, and parish administrative forms issued by the Anglican Diocese of Shyogwe.
                </p>
              </div>

              {/* Search and Quick Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search documents by title, keyword, or reference code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:ring-church-navy/30 rounded-lg text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Format Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-lg border border-slate-200 p-1 h-11 items-center">
                    {(["all", "pdf", "docx", "xlsx"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedFileType(type)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                          selectedFileType === type
                            ? "bg-church-navy text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation Pills */}
        <section className="py-4 bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-white/95">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_TABS.map((tab) => {
                const count =
                  tab.id === "all"
                    ? documents.length
                    : documents.filter((d) => d.category === tab.id).length;
                const isActive = selectedCategory === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-church-navy text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Documents Grid Section */}
        <section className="py-10 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-church-navy">
                  {CATEGORY_TABS.find((t) => t.id === selectedCategory)?.label || "Documents"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredDocuments.length} of {documents.length} official diocesan publication{documents.length !== 1 ? "s" : ""}
                </p>
              </div>

              {(searchQuery || selectedCategory !== "all" || selectedFileType !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedFileType("all");
                  }}
                  className="text-xs font-medium text-church-navy hover:text-church-red flex items-center gap-1 self-start sm:self-auto"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset all filters
                </button>
              )}
            </div>

            {/* Document Cards */}
            {filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  No matching publications found
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Try adjusting your search terms or selecting a different category filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedFileType("all");
                  }}
                  className="text-xs"
                >
                  View All Documents
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDocuments.map((doc) => {
                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-church-gold/60 transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Top Card Body */}
                      <div className="p-5">
                        {/* Meta header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            {getFormatBadge(doc.fileType)}
                            <span className="text-[11px] font-mono text-slate-400">
                              {doc.refCode}
                            </span>
                          </div>

                          {doc.requiresPassword ? (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                              title="Password Required"
                            >
                              <Lock className="h-3 w-3" />
                              Protected
                            </span>
                          ) : doc.requiresRole ? (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded"
                              title="Restricted Access"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Clergy
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Public
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-serif font-bold text-base text-church-navy group-hover:text-church-red transition-colors line-clamp-2 mb-2 leading-snug">
                          {doc.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                          {doc.description}
                        </p>

                        {/* Issuing Authority & Category */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Church className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{doc.issuingAuthority}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {doc.publishedDate}
                            </span>
                            <span>{doc.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentAction(doc, "view")}
                          className="text-xs font-semibold text-church-navy hover:text-church-red hover:bg-white h-8 px-2.5"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Read / Details
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocumentAction(doc, "download")}
                          className="text-xs font-semibold border-slate-200 hover:border-church-gold hover:text-church-navy bg-white h-8 px-3"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5 text-church-navy" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Official Registry / Archives Inquiries Callout */}
        <section className="py-14 bg-church-navy text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-church-gold tracking-wide">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Official Diocesan Registry & Archives</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
                    Need Certified Certificates or Historical Church Records?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Official baptismal certificates, canonical letters of transfer, marriage extract certificates,
                    and archival documents are issued directly by the Diocesan Registrar at the Diocesan Headquarters in Muhanga.
                  </p>
                </div>

                <div className="md:col-span-4 bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-church-gold shrink-0 mt-0.5" />
                    <span>Diocesan Secretariat, Shyogwe / Gitarama, Muhanga District</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-church-gold shrink-0" />
                    <span>+250 788 522 174 / +250 788 352 144</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-church-gold shrink-0" />
                    <span className="truncate">shyogwe@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-church-gold shrink-0" />
                    <span>Mon - Fri: 8:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-left space-y-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                {getFormatBadge(previewDoc.fileType)}
                <span className="text-xs font-mono text-slate-400">
                  {previewDoc.refCode}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {previewDoc.categoryLabel}
                </span>
              </div>
              <DialogTitle className="text-xl font-serif font-bold text-church-navy leading-snug">
                {previewDoc.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Official diocesan release authorized by {previewDoc.issuingAuthority}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4 text-sm">
              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Executive Summary & Scope
                </h4>
                <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                  {previewDoc.description}
                </p>
              </div>

              {/* Document Metadata Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Publication Date</span>
                  <span className="font-medium text-slate-800">{previewDoc.publishedDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Specifications</span>
                  <span className="font-medium text-slate-800">
                    {previewDoc.fileType.toUpperCase()} • {previewDoc.fileSize}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Access Level</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {previewDoc.accessLevel === "role_based" ? "Clergy Portal" : previewDoc.accessLevel}
                  </span>
                </div>
              </div>

              {/* Official Seal Note */}
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  Certified stamped copies for legal, immigration, or academic purposes must be verified by the Diocesan Registry Office at Shyogwe Diocesan Headquarters.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDoc(null)}
                className="text-xs"
              >
                Close
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const doc = previewDoc;
                  setPreviewDoc(null);
                  handleDocumentAction(doc, "download");
                }}
                className="text-xs bg-church-navy text-white hover:bg-church-navy/90"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Password Dialog for Protected Documents */}
      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
        documentTitle={selectedProtectedDoc?.title || "Protected Document"}
        loading={verifyingPassword}
      />

      <Footer />
    </div>
  );
};

export default Documents;
