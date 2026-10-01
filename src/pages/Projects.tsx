import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Building2, 
  Stethoscope, 
  GraduationCap, 
  HeartHandshake, 
  Sprout, 
  Droplets, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  X, 
  ArrowRight,
  Loader2,
  Church,
  ShieldCheck,
  Compass,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";

interface HealthCenter {
  id: number;
  name: string;
  description?: string;
  location?: string;
  contact_phone?: string;
  contact_email?: string;
  services?: string[];
  operating_hours?: string;
}

interface HealthPost {
  id: number;
  name: string;
  description?: string;
  location?: string;
  services_offered?: string[];
  contact_phone?: string;
  contact_email?: string;
}

interface School {
  id: number;
  name: string;
  type: string;
  description?: string;
  location?: string;
  head_teacher?: string;
  contact_phone?: string;
  contact_email?: string;
}

interface ProjectCategoryItem {
  id: string;
  pillar: "health" | "education" | "community";
  title: string;
  badge: string;
  description: string;
  beneficiaries: string;
  features: string[];
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activePillar, setActivePillar] = useState<"all" | "health" | "education" | "community">("all");
  const [loading, setLoading] = useState(true);
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [healthPosts, setHealthPosts] = useState<HealthPost[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectCategoryItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Fallback data in case of network issues
  const fallbackHealthCenters: HealthCenter[] = [
    { id: 1, name: "Shyogwe Health Center", location: "Shyogwe Sector, Muhanga District", description: "Accredited health center providing maternal, child health, and outpatient care." },
    { id: 2, name: "Hanika Health Center", location: "Hanika, Southern Province", description: "Serving community members with general medical, laboratory, and immunization services." },
    { id: 3, name: "Gikomero Health Center", location: "Gikomero Sector, Muhanga District", description: "Comprehensive rural healthcare center serving remote community villages." }
  ];

  const fallbackHealthPosts: HealthPost[] = [
    { id: 1, name: "Mbayaya Health Post", location: "Mbayaya Cell", description: "Primary outpatient health post providing first-line triage and maternal care." },
    { id: 2, name: "Shyogwe Health Post", location: "Shyogwe Outpost", description: "First-contact clinic serving local parish members and residents." },
    { id: 3, name: "Nyamagana Health Post", location: "Nyamagana Village", description: "Primary community consultation, vaccination, and health outreach." },
    { id: 4, name: "Kibinja Health Post", location: "Kibinja Cell", description: "Rural outreach health outpost providing emergency triage and health coverage." }
  ];

  const fallbackSchools: School[] = [
    { id: 1, name: "GS Shyogwe", type: "secondary_boarding", location: "Shyogwe", head_teacher: "Diocesan Appointed" },
    { id: 2, name: "GS St. Peter's Gitarama", type: "secondary_basic", location: "Muhanga Center", head_teacher: "Diocesan Appointed" },
    { id: 3, name: "Hanika TSS Vocational School", type: "tss_boarding", location: "Hanika", head_teacher: "Diocesan Appointed" },
    { id: 4, name: "EP Shyogwe Primary School", type: "primary", location: "Shyogwe", head_teacher: "Diocesan Appointed" },
    { id: 5, name: "EP Gitarama Primary School", type: "primary", location: "Gitarama", head_teacher: "Diocesan Appointed" },
    { id: 6, name: "Shyogwe ECD Nursery", type: "ecd", location: "Shyogwe", head_teacher: "Diocesan Appointed" }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [hcRes, hpRes, schRes] = await Promise.all([
          fetch(apiUrls.healthCenters()).catch(() => null),
          fetch(apiUrls.healthPosts()).catch(() => null),
          fetch(apiUrls.schools()).catch(() => null)
        ]);

        if (hcRes && hcRes.ok) {
          const hcData = await hcRes.json();
          const items = Array.isArray(hcData) ? hcData : (Array.isArray(hcData?.data) ? hcData.data : []);
          setHealthCenters(items.length > 0 ? items : fallbackHealthCenters);
        } else {
          setHealthCenters(fallbackHealthCenters);
        }

        if (hpRes && hpRes.ok) {
          const hpData = await hpRes.json();
          const items = Array.isArray(hpData) ? hpData : (Array.isArray(hpData?.data) ? hpData.data : []);
          setHealthPosts(items.length > 0 ? items : fallbackHealthPosts);
        } else {
          setHealthPosts(fallbackHealthPosts);
        }

        if (schRes && schRes.ok) {
          const schData = await schRes.json();
          const items = Array.isArray(schData) ? schData : (Array.isArray(schData?.data) ? schData.data : []);
          setSchools(items.length > 0 ? items : fallbackSchools);
        } else {
          setSchools(fallbackSchools);
        }
      } catch (e) {
        console.warn("Using fallback projects data:", e);
        setHealthCenters(fallbackHealthCenters);
        setHealthPosts(fallbackHealthPosts);
        setSchools(fallbackSchools);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Intersection observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Project categories
  const projectCategories: ProjectCategoryItem[] = [
    {
      id: "health-centers",
      pillar: "health",
      title: "Diocesan Health Centers",
      badge: "Accredited Medical Care",
      icon: Stethoscope,
      description: "Operating certified health centers delivering maternal care, inpatient and outpatient services, pediatric nutrition, and laboratory diagnostics across Muhanga and Southern Province.",
      beneficiaries: "3 Centers • 20,000+ Consultations Annually",
      features: [
        "Maternal & Neonatal Healthcare",
        "Community Health Insurance (Mutuelle de Santé)",
        "Outpatient Consultation & Laboratory",
        "Immunization & Nutrition Programs"
      ],
      slug: "health-centers"
    },
    {
      id: "health-posts",
      pillar: "health",
      title: "Community Health Posts",
      badge: "Primary Outreach",
      icon: ShieldCheck,
      description: "Bringing vital healthcare to rural, hard-to-reach villages. Health posts serve as the first point of contact for maternal assistance, emergency stabilization, and rapid malaria screening.",
      beneficiaries: "4 Outposts • 12,000+ Rural Patients",
      features: [
        "Rapid Diagnostic Testing & Triage",
        "Basic First Aid & Emergency Referral",
        "Maternal Monitoring & Vaccination",
        "Community Hygiene Education"
      ],
      slug: "health-posts"
    },
    {
      id: "secondary-education",
      pillar: "education",
      title: "Secondary & Boarding Schools",
      badge: "Academic Excellence",
      icon: GraduationCap,
      description: "Providing values-based secondary education through renowned diocesan day and boarding academies, fostering discipline, scientific inquiry, and Christian character.",
      beneficiaries: "17 Secondary Schools • 8,500+ Students",
      features: [
        "Sciences, Humanities & Economics Curricula",
        "Boarding Accommodations & Pastoral Mentorship",
        "Modern ICT & Laboratory Facilities",
        "Spiritual Discipleship & Sports"
      ],
      slug: "secondary-education"
    },
    {
      id: "tss-schools",
      pillar: "education",
      title: "Technical & Vocational Training (TVET)",
      badge: "Skills & Employment",
      icon: Building2,
      description: "Equipping young people with market-ready vocational and technical capabilities, addressing youth unemployment and driving local economic development.",
      beneficiaries: "6 TSS Centers • 3,000+ Trainees",
      features: [
        "Construction & Building Technology",
        "Carpentry & Woodwork Craft",
        "Culinary Arts & Hospitality Training",
        "Automotive & Electronics Repair"
      ],
      slug: "tss-schools"
    },
    {
      id: "primary-education",
      pillar: "education",
      title: "Primary & Early Childhood Education",
      badge: "Foundational Learning",
      icon: BookOpen,
      description: "Nurturing young minds in 15 primary and nursery schools with holistic Christian foundations, literacy, arithmetic, and school feeding support.",
      beneficiaries: "15 Primary & ECD Schools • 6,000+ Children",
      features: [
        "Early Childhood Development (ECD) Nurseries",
        "Foundational Literacy & Numeracy",
        "School Meal & Nutrition Assistance",
        "Community Parent-Teacher Fellowships"
      ],
      slug: "primary-education"
    },
    {
      id: "community-microfinance",
      pillar: "community",
      title: "Community Savings & Empowerment (VSLA)",
      badge: "Economic Resilience",
      icon: HeartHandshake,
      description: "Fostering village savings and loan associations in partnership with five talents and international partners, empowering women and families to start sustainable micro-enterprises.",
      beneficiaries: "150+ Savings Groups • 4,500+ Members",
      features: [
        "Financial Literacy & Bookkeeping Training",
        "Micro-Loans for Agricultural Enterprise",
        "Family Welfare Emergency Funds",
        "Women's Economic Empowerment"
      ],
      slug: "community-microfinance"
    },
    {
      id: "water-climate",
      pillar: "community",
      title: "Clean Water & Environmental Stewardship",
      badge: "Green Diocese Initiative",
      icon: Droplets,
      description: "Drilling water supply networks, protecting natural springs, rainwater harvesting at parish schools, and agro-forestry tree planting for environmental protection.",
      beneficiaries: "25+ Water Points • 35,000+ Community Beneficiaries",
      features: [
        "Protected Gravity-Fed Spring Catchments",
        "Parish & School Rainwater Harvesting Tanks",
        "Diocesan Agro-Forestry & Tree Nurseries",
        "Community Water Sanitation Committees"
      ],
      slug: "water-climate"
    }
  ];

  const filteredCategories = projectCategories.filter((item) => {
    if (activePillar === "all") return true;
    return item.pillar === activePillar;
  });

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
              alt="Shyogwe Diocese Development Projects"
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
              <span className="text-church-gold">Projects & Programs</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Diocesan Projects & Community Impact
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Impact Statistics Bar with Scroll Entrance */}
        <section 
          ref={statsRef}
          className="py-12 bg-slate-50/70 border-b border-slate-200/80"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {[
                { 
                  value: "7", 
                  label: "Health Facilities", 
                  sub: "3 Centers • 4 Rural Posts",
                  icon: Stethoscope 
                },
                { 
                  value: "38", 
                  label: "Diocesan Schools", 
                  sub: "Primary, Boarding & TSS",
                  icon: GraduationCap 
                },
                { 
                  value: "150+", 
                  label: "Communities Served", 
                  sub: "Across Southern Province",
                  icon: Church 
                },
                { 
                  value: "50,000+", 
                  label: "Annual Beneficiaries", 
                  sub: "Patients, Students & Families",
                  icon: Users 
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs text-center transition-all duration-500 hover:-translate-y-1 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-church-cream text-church-navy mx-auto flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-church-navy" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-church-navy tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      {stat.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {stat.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content & Program Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header with Sector Filter Tabs */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                Holistic Development
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy tracking-tight mb-3">
                Key Development Pillars
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Addressing physical, educational, and economic needs through integrated diocesan programs.
              </p>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { id: "all", label: "All Programs", count: projectCategories.length },
                  { id: "health", label: "Healthcare Ministry", count: 2 },
                  { id: "education", label: "Schools & Education", count: 3 },
                  { id: "community", label: "Community & Climate", count: 2 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePillar(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                      activePillar === tab.id
                        ? "bg-church-navy text-white shadow-sm scale-105"
                        : "bg-white text-slate-600 hover:text-church-navy hover:bg-slate-100 border border-slate-200/90"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span 
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                        activePillar === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Programs Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {filteredCategories.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-church-gold/60 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-1.5 cursor-pointer"
                    onClick={() => setSelectedProject(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedProject(item);
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-church-cream text-church-navy flex items-center justify-center shrink-0 group-hover:bg-church-gold group-hover:text-church-navy transition-colors duration-300">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <h3 className="text-xl font-serif font-bold text-church-navy mb-2 group-hover:text-church-gold transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                        {item.description}
                      </p>

                      {/* Feature Bullet Points */}
                      <div className="space-y-2 mb-6">
                        {item.features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-church-gold shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-church-navy">
                        {item.beneficiaries}
                      </span>
                      <span className="text-xs font-bold text-church-gold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Facilities Directory List (Health & Schools Data) */}
        <section className="py-16 bg-slate-50/70 border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                Operational Facilities
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy tracking-tight">
                Our Healthcare & Education Network
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Health Facilities Box */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-church-cream text-church-navy flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-church-navy" />
                  </div>
                  <div>
                    <h4 className="font-bold text-church-navy text-base">Diocesan Healthcare Facilities</h4>
                    <p className="text-xs text-slate-500">3 Health Centers & 4 Health Posts</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[...healthCenters, ...healthPosts].slice(0, 5).map((fac: any, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-church-navy">{fac.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-church-gold" />
                          {fac.location || "Muhanga District"}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {fac.services_offered ? "Health Post" : "Health Center"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational Institutions Box */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-church-cream text-church-navy flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-church-navy" />
                  </div>
                  <div>
                    <h4 className="font-bold text-church-navy text-base">Diocesan Schools Network</h4>
                    <p className="text-xs text-slate-500">38 Schools across Primary, Secondary & TVET</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {schools.slice(0, 5).map((sch, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-church-navy">{sch.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-church-gold" />
                          {sch.location || "Southern Province"}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {sch.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Partnership & Involvement Call to Action */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-r from-church-navy via-slate-900 to-church-navy rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                  Partner in Community Transformation
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                  Support Diocesan Projects & Ministries
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Join hands with the Anglican Church of Rwanda, Shyogwe Diocese in establishing clean water points, 
                  equipping rural health clinics, and funding student scholarships for vulnerable children.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/donate"
                  className="px-6 py-3 rounded-xl bg-church-gold text-church-navy font-bold text-xs uppercase tracking-wider hover:bg-church-gold-hover transition-colors shadow-md text-center"
                >
                  Make a Donation
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  Contact Planning Office
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Program Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {selectedProject.badge}
              </span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-church-navy mb-3">
              {selectedProject.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {selectedProject.description}
            </p>

            <div className="mb-6">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                Key Initiatives & Services
              </h4>
              <div className="space-y-2">
                {selectedProject.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-church-gold shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs mb-6">
              <span className="font-semibold text-slate-500">Reach & Scope:</span>
              <span className="font-bold text-church-navy">{selectedProject.beneficiaries}</span>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProject(null)}
                className="text-slate-600"
              >
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-church-navy hover:bg-church-navy/90 text-white"
                onClick={() => {
                  setSelectedProject(null);
                  navigate("/contact");
                }}
              >
                Inquire With Planning Office
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Projects;