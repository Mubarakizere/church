import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Home,
  FileText,
  Building2,
  GraduationCap,
  Calendar,
  Newspaper,
  Phone,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Church,
  Compass,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Wifi,
  WifiOff,
  Clock,
  ShieldCheck,
  AlertOctagon,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
  BookOpen
} from "lucide-react";
import { ErrorDetailsConfig, ErrorStatusCode } from "@/types/error";
import { ERROR_PAGES_DATA } from "@/config/errorPagesData";

interface Props {
  errorConfig?: ErrorDetailsConfig;
  errorCode?: ErrorStatusCode | string;
  customError?: Error;
  customComponentStack?: string;
  requestedUrl?: string;
}

const QUICK_DIRECTORIES = [
  {
    title: "Diocesan Projects & Health",
    path: "/projects",
    description: "Health centers, community savings, clean water, and development initiatives.",
    icon: Building2
  },
  {
    title: "Schools & Education",
    path: "/schools",
    description: "Directory of 38 church-founded primary, secondary, and technical schools.",
    icon: GraduationCap
  },
  {
    title: "Documents & Publications",
    path: "/documents",
    description: "Pastoral letters, synod resolutions, policies, and official diocesan archives.",
    icon: FileText
  },
  {
    title: "News & Diocesan Updates",
    path: "/news",
    description: "Official releases, episcopal messages, and community reports.",
    icon: Newspaper
  },
  {
    title: "Calendar & Events",
    path: "/events",
    description: "Upcoming synods, ordination services, youth camps, and parish conferences.",
    icon: Calendar
  },
  {
    title: "Photo & Media Gallery",
    path: "/gallery",
    description: "Photographic archives of parish services, schools, and health outreaches.",
    icon: ImageIcon
  }
];

export const ErrorLandingLayout: React.FC<Props> = ({
  errorConfig,
  errorCode = "404",
  customError,
  customComponentStack,
  requestedUrl
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve active error configuration
  const normalizedKey = (errorCode in ERROR_PAGES_DATA
    ? errorCode
    : "404") as ErrorStatusCode;
  const config = errorConfig || ERROR_PAGES_DATA[normalizedKey] || ERROR_PAGES_DATA["404"];

  // State for interactive widgets
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");

  // State for 429 rate limit countdown
  const [countdown, setCountdown] = useState(45);
  const [cooldownFinished, setCooldownFinished] = useState(false);

  // Auto incident tracking ID
  const [incidentId] = useState(() => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `SHY-${config.code}-${dateStr}-${randomHex}`;
  });

  const currentPath = requestedUrl || location.pathname;

  // Listen to network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet connection detected! You are back online.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Internet connection lost. You are currently offline.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cooldown timer for 429
  useEffect(() => {
    if (config.code === "429") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setCooldownFinished(true);
      }
    }
  }, [config.code, countdown]);

  // Test network connectivity ping
  const handleTestConnection = async () => {
    setPingStatus("testing");
    try {
      const response = await fetch("/index.html", { method: "HEAD", cache: "no-store" });
      if (response.ok) {
        setPingStatus("success");
        setIsOnline(true);
        toast.success("Network ping successful! Server reachable.");
      } else {
        setPingStatus("failed");
        toast.error("Ping returned unexpected status. Please check connectivity.");
      }
    } catch {
      setPingStatus("failed");
      setIsOnline(false);
      toast.error("Network ping failed. Cannot reach the server.");
    }
  };

  // Copy diagnostic incident report
  const handleCopyReport = () => {
    const reportText = `[EAR Shyogwe Diocese - Incident Report]
Incident Reference: ${incidentId}
Error Code: ${config.code}
Status Badge: ${config.badge}
Title: ${config.title}
Path: ${currentPath}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
Diagnostic: ${config.diagnosticContext || "N/A"}
${customError ? `Error Detail: ${customError.name}: ${customError.message}\nStack: ${customError.stack}` : ""}
${customComponentStack ? `Component Stack: ${customComponentStack}` : ""}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      toast.success("Incident report copied to clipboard. Ready to paste for technical support.");
      setTimeout(() => setCopiedReport(false), 3000);
    });
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/news?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Theme colors mapping
  const colorMap = {
    navy: {
      badgeBg: "bg-church-navy/10 text-church-navy border-church-navy/20",
      accentBg: "bg-church-navy text-white",
      borderAccent: "border-church-navy",
      ambientGlow: "from-church-navy/15 to-transparent",
      codeText: "text-church-navy/25"
    },
    gold: {
      badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
      accentBg: "bg-church-gold text-white hover:bg-church-gold-hover",
      borderAccent: "border-church-gold",
      ambientGlow: "from-amber-400/20 to-transparent",
      codeText: "text-amber-500/25"
    },
    red: {
      badgeBg: "bg-red-100 text-red-800 border-red-200",
      accentBg: "bg-red-700 text-white hover:bg-red-800",
      borderAccent: "border-red-600",
      ambientGlow: "from-red-500/20 to-transparent",
      codeText: "text-red-700/20"
    },
    amber: {
      badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
      accentBg: "bg-amber-600 text-white hover:bg-amber-700",
      borderAccent: "border-amber-500",
      ambientGlow: "from-amber-500/20 to-transparent",
      codeText: "text-amber-600/20"
    },
    indigo: {
      badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
      accentBg: "bg-indigo-700 text-white hover:bg-indigo-800",
      borderAccent: "border-indigo-600",
      ambientGlow: "from-indigo-500/20 to-transparent",
      codeText: "text-indigo-700/20"
    },
    emerald: {
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accentBg: "bg-emerald-700 text-white hover:bg-emerald-800",
      borderAccent: "border-emerald-600",
      ambientGlow: "from-emerald-500/20 to-transparent",
      codeText: "text-emerald-700/20"
    },
    rose: {
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      accentBg: "bg-rose-700 text-white hover:bg-rose-800",
      borderAccent: "border-rose-600",
      ambientGlow: "from-rose-500/20 to-transparent",
      codeText: "text-rose-700/20"
    }
  };

  const theme = colorMap[config.themeColor] || colorMap.navy;
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-church-gold selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* Banner with Church Backdrop */}
        <section className="relative h-44 sm:h-52 md:h-60 flex items-center justify-center text-white overflow-hidden shadow-inner">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Shyogwe Diocese Navigation"
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-church-navy/95 via-church-navy/90 to-church-navy-light/90 backdrop-blur-[0.5px]" />
          </div>

          {/* Decorative sacred geometry / cross pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Link to="/" className="hover:text-church-gold transition-colors flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link to="/error" className="hover:text-church-gold transition-colors">
                Portal Status
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">{config.badge.split("•")[0].trim()}</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-white mb-2">
              {config.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 tracking-wider font-medium max-w-xl mx-auto line-clamp-1">
              Anglican Church of Rwanda • Diocese of Shyogwe
            </p>
          </div>
        </section>

        {/* Primary Error Notification Section */}
        <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/90 relative overflow-hidden">
          {/* Subtle background ambient gradient */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-b ${theme.ambientGlow} blur-3xl pointer-events-none -z-0`}
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center relative z-10">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-5 shadow-xs bg-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-church-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-church-navy" />
              </span>
              <span className="text-church-navy">{config.badge}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">Ref: {incidentId}</span>
            </div>

            {/* Artistic Giant Number */}
            <div className="relative mb-4 select-none">
              <div
                className={`font-serif font-extrabold text-7xl sm:text-8xl md:text-9xl tracking-tight leading-none ${theme.codeText}`}
              >
                {config.code}
              </div>

              {/* Floating Center Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white shadow-xl border border-slate-200/90 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
                  <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-church-navy" />
                </div>
              </div>
            </div>

            {/* Subtitle & Clear Explanations */}
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy mb-3">
              {config.subtitle}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto mb-6">
              {config.description}
            </p>

            {/* SPECIALIZED WIDGET: Offline Mode */}
            {config.code.toLowerCase() === "offline" && (
              <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Wifi className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-rose-600" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Live Connection Sensor
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isOnline
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isOnline ? "Network Connected" : "Connection Disconnected"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  We constantly test your device connection. Click below to verify real-time connectivity to the Diocesan server.
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleTestConnection}
                    disabled={pingStatus === "testing"}
                    className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold h-10 px-4"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 mr-2 ${
                        pingStatus === "testing" ? "animate-spin" : ""
                      }`}
                    />
                    {pingStatus === "testing" ? "Testing Connectivity..." : "Ping Server Now"}
                  </Button>

                  {pingStatus === "success" && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="h-4 w-4" /> Reachable!
                    </span>
                  )}
                  {pingStatus === "failed" && (
                    <span className="text-xs text-rose-600 font-semibold">
                      Server still unreachable
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* SPECIALIZED WIDGET: 429 Rate Limit Cooldown */}
            {config.code === "429" && (
              <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-church-navy" />
                  <span className="text-xs font-bold uppercase tracking-wider text-church-navy">
                    Automatic Cooldown Timer
                  </span>
                </div>

                <div className="my-4">
                  <div className="text-4xl font-mono font-bold text-church-navy">
                    {cooldownFinished ? "00:00" : `00:${countdown.toString().padStart(2, "0")}`}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-church-gold h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((45 - countdown) / 45) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-2">
                  {cooldownFinished
                    ? "Cooldown complete! You may now retry your request."
                    : "Requests are throttled temporarily to ensure smooth portal operations for all parishes."}
                </p>

                {cooldownFinished && (
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold mt-2 h-9 px-4"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2 text-church-gold" />
                    Retry Request
                  </Button>
                )}
              </div>
            )}

            {/* SPECIALIZED WIDGET: 503 Maintenance Schedule */}
            {(config.code === "503" || normalizedKey === "maintenance") && (
              <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-church-gold" />
                    <span className="text-xs font-bold uppercase tracking-wider text-church-navy">
                      Diocesan Upgrade Checklist
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    In Progress
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Database Backup & Safety Snapshot
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600">Completed</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-church-gold animate-spin" /> Security & Schema Migration
                    </span>
                    <span className="text-[11px] font-semibold text-church-gold">Underway</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Cache Warmup & Service Restart
                    </span>
                    <span className="text-[11px]">Queued</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Estimated Duration: 15–30 mins</span>
                  <span>Headquarters Muhanga, Rwanda</span>
                </div>
              </div>
            )}

            {/* SPECIALIZED WIDGET: 404 / 410 Fast Search */}
            {(config.code === "404" || config.code === "410") && (
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-md mx-auto mb-8 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news, schools, documents..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/60 focus:border-church-gold text-xs text-slate-800 placeholder:text-slate-400 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold h-10 px-4"
                >
                  Search
                </Button>
              </form>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {config.suggestedActions.map((action, index) => {
                const ActionIcon = action.icon || ArrowRight;
                if (action.onClick) {
                  return (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant === "primary" ? "default" : action.variant || "outline"}
                      className={`font-semibold text-xs uppercase tracking-wider h-11 px-6 shadow-sm ${
                        action.variant === "primary"
                          ? "bg-church-navy hover:bg-church-navy/90 text-white"
                          : "border-slate-300 hover:border-church-gold hover:text-church-navy text-slate-700 bg-white"
                      }`}
                    >
                      <ActionIcon className="h-4 w-4 mr-2 text-church-gold" />
                      {action.label}
                    </Button>
                  );
                }

                if (action.href?.startsWith("tel:") || action.href?.startsWith("mailto:")) {
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="inline-flex items-center justify-center font-semibold text-xs uppercase tracking-wider h-11 px-6 rounded-md border border-slate-300 hover:border-church-gold hover:text-church-navy text-slate-700 bg-white shadow-sm transition-colors"
                    >
                      <ActionIcon className="h-4 w-4 mr-2 text-church-gold" />
                      {action.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={index}
                    to={action.href || "/"}
                    className={`inline-flex items-center justify-center font-semibold text-xs uppercase tracking-wider h-11 px-6 rounded-md shadow-sm transition-colors ${
                      action.variant === "primary"
                        ? "bg-church-navy hover:bg-church-navy/90 text-white"
                        : "border border-slate-300 hover:border-church-gold hover:text-church-navy text-slate-700 bg-white"
                    }`}
                  >
                    <ActionIcon className="h-4 w-4 mr-2 text-church-gold" />
                    {action.label}
                  </Link>
                );
              })}

              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-church-navy text-xs font-semibold h-11 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Go Back
              </Button>
            </div>

            {/* Pastoral Scripture Encouragement */}
            {config.pastoralQuote && (
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-white/80 backdrop-blur-xs border border-amber-200/70 shadow-xs mb-6">
                <div className="flex items-center justify-center gap-1.5 text-church-gold mb-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Pastoral Word of Comfort
                  </span>
                </div>
                <blockquote className="italic text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
                  "{config.pastoralQuote.verse}"
                </blockquote>
                <div className="text-[11px] font-semibold text-slate-500 mt-1">
                  — {config.pastoralQuote.reference}
                </div>
              </div>
            )}

            {/* Technical Diagnostics & Incident Reporting Accordion */}
            <div className="pt-4 border-t border-slate-200 text-left max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="w-full flex items-center justify-between py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-church-navy" />
                  Technical Diagnostic & Incident Details
                </span>
                {showDiagnostics ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showDiagnostics && (
                <div className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-3 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-amber-400 font-bold">
                      Incident Ref: {incidentId}
                    </span>
                    <button
                      onClick={handleCopyReport}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
                      title="Copy Incident Report"
                    >
                      {copiedReport ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <p>
                      <span className="text-slate-500">Resource Path:</span>{" "}
                      {currentPath}
                    </p>
                    <p>
                      <span className="text-slate-500">Status Code:</span>{" "}
                      {config.statusCodeNum || config.code}
                    </p>
                    <p>
                      <span className="text-slate-500">Timestamp:</span>{" "}
                      {new Date().toLocaleString()}
                    </p>
                    <p>
                      <span className="text-slate-500">Diagnosis:</span>{" "}
                      {config.diagnosticContext || "No additional diagnosis recorded."}
                    </p>
                  </div>

                  {customError && (
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-rose-400 font-bold mb-1">
                        {customError.name}: {customError.message}
                      </p>
                      {customError.stack && (
                        <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight max-h-36 overflow-y-auto bg-slate-950 p-2 rounded">
                          {customError.stack}
                        </pre>
                      )}
                    </div>
                  )}

                  {customComponentStack && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Component Stack:</span>
                      <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight max-h-28 overflow-y-auto bg-slate-950 p-2 rounded">
                        {customComponentStack}
                      </pre>
                    </div>
                  )}

                  {config.troubleshootingTips.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1">
                        Troubleshooting Recommendations:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                        {config.troubleshootingTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Directory of Primary Diocesan Portals */}
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Explore The Diocese
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-church-navy">
                Looking for One of These Main Sections?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Direct access to key administrative, pastoral, and educational departments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {QUICK_DIRECTORIES.map((item) => {
                const DirIcon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="p-5 rounded-xl border border-slate-200/90 bg-white hover:border-church-gold/70 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy group-hover:bg-church-navy group-hover:text-white transition-colors flex items-center justify-center mb-3">
                        <DirIcon className="h-5 w-5" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-church-navy group-hover:text-church-gold transition-colors mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-church-navy group-hover:text-church-gold transition-colors">
                      <span>Visit Section</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Error Showcase Quick Access Banner */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                to="/error"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-church-navy transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50"
              >
                <Layers className="h-3.5 w-3.5 text-church-gold" />
                <span>Need to inspect other error scenarios? View Error Landing Pages Directory</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Secretariat Inquiry Callout */}
        <section className="py-10 bg-slate-50 border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="h-12 w-12 rounded-full bg-church-navy/5 text-church-navy shrink-0 hidden sm:flex items-center justify-center">
                  <Church className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-church-navy">
                    Need Direct Assistance from the Diocesan Registry?
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our Secretariat at Shyogwe Headquarters can help locate archives, records, and certificates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:+250788522174"
                  className="inline-flex items-center justify-center bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold h-10 px-4 rounded-md shadow-sm transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-church-gold" />
                  +250 788 522 174
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center border border-slate-300 hover:border-church-gold text-slate-700 hover:text-church-navy bg-white text-xs font-semibold h-10 px-4 rounded-md transition-colors"
                >
                  Contact Form
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ErrorLandingLayout;
