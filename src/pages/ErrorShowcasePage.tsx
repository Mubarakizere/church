import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
  Home,
  AlertTriangle,
  ServerCrash,
  WifiOff,
  Wrench,
  Lock,
  Clock,
  Compass,
  FileQuestion,
  ShieldCheck,
  LifeBuoy
} from "lucide-react";
import { ERROR_PAGES_DATA } from "@/config/errorPagesData";
import { ErrorStatusCode, ErrorCategory } from "@/types/error";

export const ErrorShowcasePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<"all" | ErrorCategory>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const errorList = Object.entries(ERROR_PAGES_DATA).map(([key, config]) => ({
    key: key as ErrorStatusCode,
    ...config
  }));

  const filteredErrors = errorList.filter((err) => {
    const matchesCategory =
      selectedCategory === "all" || err.category === selectedCategory;
    const matchesSearch =
      err.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      err.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      err.subtitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      err.badge.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/error/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(code);
      toast.success(`Copied error landing page link: /error/${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const categoryCounts = {
    all: errorList.length,
    client: errorList.filter((e) => e.category === "client").length,
    server: errorList.filter((e) => e.category === "server").length,
    network: errorList.filter((e) => e.category === "network").length,
    maintenance: errorList.filter((e) => e.category === "maintenance").length
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-church-gold selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* Banner */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Shyogwe Diocese Banner"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-church-navy/95 via-church-navy/90 to-church-navy-light/90 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Link to="/" className="hover:text-church-gold transition-colors flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Error Landing Pages Suite</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              All Possible Error Landing Pages
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 tracking-wider font-medium max-w-2xl mx-auto">
              Comprehensive HTTP & Diocesan Application Error Handling Portfolio • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* System Overview Statistics */}
        <section className="py-6 bg-white border-b border-slate-200/90 shadow-xs">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-church-navy/10 text-church-navy flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-church-navy font-serif leading-none">
                    {errorList.length} Error Scenarios
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Complete RFC Coverage
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-church-navy font-serif leading-none">
                    {categoryCounts.client} Client States
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    400, 401, 403, 404, 429...
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                  <ServerCrash className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-church-navy font-serif leading-none">
                    {categoryCounts.server} Server States
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    500, 502, 503, 504
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-church-navy font-serif leading-none">
                    100% Branded
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Pastoral & Interactive
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="py-8 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              {/* Category Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs w-full md:w-auto">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === "all"
                      ? "bg-church-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-church-navy hover:bg-slate-50"
                  }`}
                >
                  All Pages ({categoryCounts.all})
                </button>
                <button
                  onClick={() => setSelectedCategory("client")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === "client"
                      ? "bg-church-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-church-navy hover:bg-slate-50"
                  }`}
                >
                  Client Errors 4xx ({categoryCounts.client})
                </button>
                <button
                  onClick={() => setSelectedCategory("server")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === "server"
                      ? "bg-church-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-church-navy hover:bg-slate-50"
                  }`}
                >
                  Server Errors 5xx ({categoryCounts.server})
                </button>
                <button
                  onClick={() => setSelectedCategory("network")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === "network"
                      ? "bg-church-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-church-navy hover:bg-slate-50"
                  }`}
                >
                  Offline & Network ({categoryCounts.network})
                </button>
                <button
                  onClick={() => setSelectedCategory("maintenance")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === "maintenance"
                      ? "bg-church-navy text-white shadow-xs"
                      : "text-slate-600 hover:text-church-navy hover:bg-slate-50"
                  }`}
                >
                  Maintenance ({categoryCounts.maintenance})
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by code, name or keyword..."
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold/60 focus:border-church-gold"
                />
              </div>
            </div>

            {/* Error Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredErrors.map((err) => {
                const IconComp = err.icon;
                const pathUrl = `/error/${err.key}`;

                return (
                  <div
                    key={err.key}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all hover:border-church-gold/70 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Card Header with Code and Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-church-navy/5 text-church-navy group-hover:bg-church-navy group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                            <IconComp className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="font-serif font-extrabold text-2xl text-church-navy leading-none block">
                              {err.code}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-church-gold block mt-0.5">
                              {err.category.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyLink(err.key)}
                          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                          title="Copy Direct URL"
                        >
                          {copiedCode === err.key ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-serif font-bold text-lg text-church-navy mb-1.5 group-hover:text-church-gold transition-colors">
                        {err.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3 font-medium line-clamp-1">
                        {err.subtitle}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {err.description}
                      </p>

                      {/* Biblical Verse Callout */}
                      {err.pastoralQuote && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 italic mb-4">
                          "{err.pastoralQuote.verse.slice(0, 90)}..."
                          <span className="block not-italic font-semibold text-slate-700 mt-1">
                            — {err.pastoralQuote.reference}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        /error/{err.key}
                      </span>

                      <Link
                        to={pathUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>Launch Page</span>
                        <ExternalLink className="h-3 w-3 text-church-gold" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredErrors.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <FileQuestion className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-lg text-church-navy mb-1">
                  No Error Pages Found
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  No error scenarios match the current search or category filter.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchFilter("");
                  }}
                  variant="outline"
                  className="text-xs font-semibold"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Integration Instructions for Developers & Administrators */}
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Developer & Registry Reference
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-church-navy">
                How Error Handling Is Integrated
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Unified across routing, React lifecycle errors, API requests, and network state.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="h-8 w-8 rounded-lg bg-church-navy text-white flex items-center justify-center font-bold text-xs mb-3">
                  1
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-church-navy mb-1">
                  Direct & Splat Routing
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct aliases exist for all codes (<code className="text-church-navy font-semibold">/404</code>, <code className="text-church-navy font-semibold">/500</code>, <code className="text-church-navy font-semibold">/error/:code</code>). Any undefined path automatically falls back gracefully.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="h-8 w-8 rounded-lg bg-church-navy text-white flex items-center justify-center font-bold text-xs mb-3">
                  2
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-church-navy mb-1">
                  React Error Boundary
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uncaught runtime React exceptions in production trigger the unified <code className="text-church-navy font-semibold">500</code> layout with live stack tracing and copyable incident reports.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="h-8 w-8 rounded-lg bg-church-navy text-white flex items-center justify-center font-bold text-xs mb-3">
                  3
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-church-navy mb-1">
                  Network Resilience
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time browser online/offline listeners detect loss of Wi-Fi or cellular service and provide an immediate reconnect test ping.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ErrorShowcasePage;
