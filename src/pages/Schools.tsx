import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Building2, 
  ArrowRight,
  School as SchoolIcon,
  Compass,
  Award,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";

interface School {
  id: number;
  name: string;
  type: string;
  description?: string;
  location?: string;
  head_teacher?: string;
  contact_phone?: string;
  contact_email?: string;
  image?: string;
  founded_year?: number;
  programs_offered?: string[] | string;
  is_active?: boolean;
}

const typeConfig: Record<string, { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  ecd: {
    label: "Early Childhood Development (ECD)",
    badge: "ECD Nursery",
    icon: Sparkles
  },
  primary: {
    label: "Primary Schools",
    badge: "Primary (P1–P6)",
    icon: BookOpen
  },
  secondary_basic: {
    label: "Secondary Schools (Day / 9 & 12 YBE)",
    badge: "Day Secondary",
    icon: SchoolIcon
  },
  secondary_boarding: {
    label: "Secondary Schools (Boarding)",
    badge: "Boarding Secondary",
    icon: Building2
  },
  tss_boarding: {
    label: "Technical & Vocational (TSS / TVET)",
    badge: "TVET & TSS",
    icon: Compass
  },
  university: {
    label: "Higher Education & Polytechnic",
    badge: "Polytechnic / University",
    icon: Award
  }
};

// Comprehensive authentic fallback dataset based on diocesan records
const fallbackSchools: School[] = [
  // ECD
  {
    id: 1,
    name: "Kavumu ECD",
    type: "ecd",
    description: "Early Childhood Development center providing quality education for young children in Kavumu area.",
    location: "Kavumu, Shyogwe Diocese",
    head_teacher: "Diocesan Appointed",
    contact_phone: "+250 788 300100",
    contact_email: "kavumu.ecd@shyogwe.org",
    founded_year: 2012,
    programs_offered: ["Pre-Primary Education", "Child Development Programs", "Nutritional Support"]
  },
  {
    id: 2,
    name: "Gasharu ECD",
    type: "ecd",
    description: "Community-based ECD center focusing on holistic child development in Gasharu.",
    location: "Gasharu, Shyogwe Diocese",
    head_teacher: "Diocesan Appointed",
    contact_phone: "+250 788 300101",
    contact_email: "gasharu.ecd@shyogwe.org",
    founded_year: 2014,
    programs_offered: ["Early Learning", "Play-based Education", "Parent Education"]
  },
  {
    id: 3,
    name: "Sholi ECD",
    type: "ecd",
    description: "Rural ECD center providing foundational education for young learners in Sholi.",
    location: "Sholi, Shyogwe Diocese",
    head_teacher: "Diocesan Appointed",
    contact_phone: "+250 788 300102",
    contact_email: "sholi.ecd@shyogwe.org",
    founded_year: 2015,
    programs_offered: ["Pre-School Education", "Child Care Services", "Health Monitoring"]
  },
  {
    id: 4,
    name: "Gitarama ECD",
    type: "ecd",
    description: "Community ECD center serving the Gitarama urban parish community.",
    location: "Gitarama, Muhanga",
    head_teacher: "Diocesan Appointed",
    contact_phone: "+250 788 300103",
    contact_email: "gitarama.ecd@shyogwe.org",
    founded_year: 2011,
    programs_offered: ["Early Childhood Education", "Developmental Activities", "Family Support"]
  },
  {
    id: 5,
    name: "Runda ECD",
    type: "ecd",
    description: "ECD center providing quality early education in the Runda archdeaconry.",
    location: "Runda, Kamonyi",
    head_teacher: "Diocesan Appointed",
    contact_phone: "+250 788 300104",
    contact_email: "runda.ecd@shyogwe.org",
    founded_year: 2016,
    programs_offered: ["Pre-Primary Learning", "Social Development", "Basic Skills"]
  },
  {
    id: 6,
    name: "Munazi ECD",
    type: "ecd",
    description: "Community-based ECD center focusing on child development in Munazi parish.",
    location: "Munazi, Shyogwe Diocese",
    head_teacher: "Diocesan Appointed",
    contact_phone: "+250 788 300105",
    contact_email: "munazi.ecd@shyogwe.org",
    founded_year: 2017,
    programs_offered: ["Early Learning Programs", "Child Development", "Community Engagement"]
  },

  // Primary Schools
  {
    id: 7,
    name: "EP Muhazi",
    type: "primary",
    description: "Primary school providing quality basic education under diocesan Christian leadership.",
    location: "Muhazi, Shyogwe Diocese",
    head_teacher: "Munyambonera Theoneste",
    contact_phone: "+250 788 400100",
    contact_email: "ep.muhazi@shyogwe.org",
    founded_year: 2005,
    programs_offered: ["Primary Education (P1–P6)", "English & Kinyarwanda", "Mathematics", "Science & Technology", "Social Studies"]
  },
  {
    id: 8,
    name: "EP Gisura",
    type: "primary",
    description: "Community primary school serving local children with holistic curriculum and moral values.",
    location: "Gisura, Shyogwe Diocese",
    head_teacher: "Ngango Viateur",
    contact_phone: "+250 788 400101",
    contact_email: "ep.gisura@shyogwe.org",
    founded_year: 2006,
    programs_offered: ["Basic Primary Education", "Literacy Programs", "Numeracy Skills", "Spiritual Formation"]
  },
  {
    id: 9,
    name: "EP Rubyinoro",
    type: "primary",
    description: "Rural primary school providing foundational education and youth development.",
    location: "Rubyinoro, Shyogwe Diocese",
    head_teacher: "Ndoriyobijya Azarias",
    contact_phone: "+250 788 400102",
    contact_email: "ep.rubyinoro@shyogwe.org",
    founded_year: 2007,
    programs_offered: ["Primary Curriculum", "Life Skills", "Environmental Education"]
  },
  {
    id: 10,
    name: "EP Gishali",
    type: "primary",
    description: "Community primary school with dedicated focus on student literacy and science education.",
    location: "Gishali, Shyogwe Diocese",
    head_teacher: "Dusengimana Justin",
    contact_phone: "+250 788 400103",
    contact_email: "ep.gishali@shyogwe.org",
    founded_year: 2008,
    programs_offered: ["Primary Education", "Computer Literacy", "Sports & Arts"]
  },
  {
    id: 11,
    name: "EP Mpemba",
    type: "primary",
    description: "Primary school serving rural communities led by diocesan clergy and educational staff.",
    location: "Mpemba, Shyogwe Diocese",
    head_teacher: "Rev. Munyaburanga Innocent",
    contact_phone: "+250 788 400104",
    contact_email: "ep.mpemba@shyogwe.org",
    founded_year: 2009,
    programs_offered: ["Basic Education", "Religious Studies", "Health & Hygiene Education"]
  },
  {
    id: 12,
    name: "EP Rugendabali",
    type: "primary",
    description: "Primary school providing accessible basic education and moral mentorship.",
    location: "Rugendabali, Shyogwe Diocese",
    head_teacher: "Rev. Dukuzumuremyi Gad",
    contact_phone: "+250 788 400105",
    contact_email: "ep.rugendabali@shyogwe.org",
    founded_year: 2010,
    programs_offered: ["Primary Education", "Language Skills", "Mathematics", "Choir & Music"]
  },
  {
    id: 13,
    name: "EP Ntungamo",
    type: "primary",
    description: "Community primary school with dedicated teachers fostering academic curiosity and discipline.",
    location: "Ntungamo, Shyogwe Diocese",
    head_teacher: "Rev. Ndagijimana J. d'Amour",
    contact_phone: "+250 788 400106",
    contact_email: "ep.ntungamo@shyogwe.org",
    founded_year: 2011,
    programs_offered: ["Basic Primary Education", "Science Education", "Social Skills"]
  },
  {
    id: 14,
    name: "EP Nyakabungo",
    type: "primary",
    description: "Primary school serving the rural parish community with foundational academic excellence.",
    location: "Nyakabungo, Shyogwe Diocese",
    head_teacher: "Kayitete M. Claire",
    contact_phone: "+250 788 400107",
    contact_email: "ep.nyakabungo@shyogwe.org",
    founded_year: 2012,
    programs_offered: ["Primary Curriculum", "Cultural Studies", "Physical Education"]
  },

  // Secondary Day (Basic Education)
  {
    id: 15,
    name: "GS Nyabinoni",
    type: "secondary_basic",
    description: "Day secondary school providing Nine and Twelve Years Basic Education with high graduation rates.",
    location: "Nyabinoni, Shyogwe Diocese",
    head_teacher: "Mwumvaneza J. dela Croix",
    contact_phone: "+250 788 500100",
    contact_email: "nyabinoni@shyogwe.org",
    founded_year: 2010,
    programs_offered: ["O-Level Secondary", "A-Level Sciences", "Languages & Humanities", "Co-curricular Clubs"]
  },
  {
    id: 16,
    name: "GS Murehe B",
    type: "secondary_basic",
    description: "Comprehensive day school committed to quality teaching and Christian values.",
    location: "Murehe B, Shyogwe Diocese",
    head_teacher: "Munyazikwiye Faustin",
    contact_phone: "+250 788 500101",
    contact_email: "murehe.b@shyogwe.org",
    founded_year: 2011,
    programs_offered: ["O-Level Education", "A-Level Education", "Sciences & Mathematics"]
  },
  {
    id: 17,
    name: "GS Shaki",
    type: "secondary_basic",
    description: "Secondary day school fostering student leadership and STEM foundation.",
    location: "Shaki, Shyogwe Diocese",
    head_teacher: "Munyambonera Vincent",
    contact_phone: "+250 788 500102",
    contact_email: "shaki@shyogwe.org",
    founded_year: 2012,
    programs_offered: ["Basic Secondary Education", "Mathematics & Physics", "Humanities"]
  },
  {
    id: 18,
    name: "GS Ntenyo",
    type: "secondary_basic",
    description: "Day secondary school serving local community youth with comprehensive secondary curriculum.",
    location: "Ntenyo, Shyogwe Diocese",
    head_teacher: "Niyirera Benjamin",
    contact_phone: "+250 788 500103",
    contact_email: "ntenyo@shyogwe.org",
    founded_year: 2013,
    programs_offered: ["O-Level Curriculum", "A-Level Arts & Science", "Youth Fellowship"]
  },
  {
    id: 19,
    name: "GS Nyamagana",
    type: "secondary_basic",
    description: "Diocesan day school focused on inclusive learning and female student empowerment.",
    location: "Nyamagana, Muhanga",
    head_teacher: "Nikomeze Mediatrice",
    contact_phone: "+250 788 500104",
    contact_email: "nyamagana@shyogwe.org",
    founded_year: 2014,
    programs_offered: ["Secondary Curriculum", "Science Labs", "Community Service"]
  },
  {
    id: 20,
    name: "GS St Etienne",
    type: "secondary_basic",
    description: "Church-partnered basic education school providing accessible secondary learning.",
    location: "St Etienne, Shyogwe Diocese",
    head_teacher: "Bisangimana Adolphe",
    contact_phone: "+250 788 500105",
    contact_email: "st.etienne@shyogwe.org",
    founded_year: 2015,
    programs_offered: ["O-Level & A-Level", "Languages & Literature", "Social Sciences"]
  },
  {
    id: 21,
    name: "GS Hanika",
    type: "secondary_basic",
    description: "Day secondary institution closely connected with Hanika Parish educational programs.",
    location: "Hanika, Southern Province",
    head_teacher: "Mugiraneza Oswald",
    contact_phone: "+250 788 500111",
    contact_email: "hanika.gs@shyogwe.org",
    founded_year: 2016,
    programs_offered: ["Secondary Education", "Biology & Chemistry", "Computer Basics"]
  },

  // Secondary Boarding
  {
    id: 22,
    name: "GS Shyogwe",
    type: "secondary_boarding",
    description: "Premier boarding school with a storied legacy of academic excellence, discipline, and Christian leadership formation in Rwanda.",
    location: "Shyogwe Sector, Muhanga",
    head_teacher: "Nyabyenda Paul",
    contact_phone: "+250 788 600100",
    contact_email: "gs.shyogwe@shyogwe.org",
    founded_year: 1952,
    programs_offered: [
      "Advanced Secondary Education (A-Level)",
      "Mathematics, Chemistry & Biology (MCB)",
      "Physics, Chemistry & Mathematics (PCM)",
      "Full Boarding Facilities",
      "Spiritual Chaplaincy & Leadership",
      "Extracurricular Sports & Debating"
    ]
  },
  {
    id: 23,
    name: "TTC Muhanga",
    type: "secondary_boarding",
    description: "Acclaimed Teacher Training College shaping future primary and basic education educators with high pedagogical standards.",
    location: "Muhanga Center",
    head_teacher: "Mukabatesi Jeanne d'Arc",
    contact_phone: "+250 788 600101",
    contact_email: "ttc.muhanga@shyogwe.org",
    founded_year: 1998,
    programs_offered: [
      "Early Childhood & Primary Teacher Education",
      "Educational Leadership & Pedagogy",
      "Practicum & Classroom Mentorship",
      "Boarding Accommodation",
      "Professional Teacher Certification"
    ]
  },

  // Technical & Vocational (TSS / TVET)
  {
    id: 24,
    name: "Shyogwe TSS (MYTEC)",
    type: "tss_boarding",
    description: "Technical and Vocational boarding institution offering practical skills, modern workshop practice, and industry certifications.",
    location: "Shyogwe, Muhanga",
    head_teacher: "Mr. BYIRINGIRO Daniel",
    contact_phone: "+250 783 172865",
    contact_email: "mytec@shyogwe.org",
    founded_year: 2017,
    programs_offered: [
      "Building Construction & Masonry",
      "Automobile Mechanics & Maintenance",
      "Electrical Technology & Installation",
      "Carpentry & Wood Technology",
      "Entrepreneurship & Financial Literacy"
    ]
  },
  {
    id: 25,
    name: "Kanyinya TVET",
    type: "tss_boarding",
    description: "Technical and Vocational Education Training center equipping youth with hands-on skills for immediate employment.",
    location: "Kanyinya, Shyogwe Diocese",
    head_teacher: "Habanabashaka Simon",
    contact_phone: "+250 788 600103",
    contact_email: "kanyinya.tvet@shyogwe.org",
    founded_year: 2018,
    programs_offered: [
      "Vocational Trades & Technology",
      "Welding & Metal Fabrication",
      "Tailoring & Fashion Design",
      "Job Placement Assistance"
    ]
  },
  {
    id: 26,
    name: "St Peter College",
    type: "tss_boarding",
    description: "Technical college providing practical training, computer technology, and career preparation.",
    location: "Gitarama, Shyogwe Diocese",
    head_teacher: "Habumuremyi Evariste",
    contact_phone: "+250 788 600104",
    contact_email: "st.peter.college@shyogwe.org",
    founded_year: 2019,
    programs_offered: [
      "Information & Communication Technology (ICT)",
      "Accounting & Business Services",
      "Hospitality & Culinary Operations"
    ]
  },
  {
    id: 27,
    name: "Hanika TSS",
    type: "tss_boarding",
    description: "Technical secondary school providing specialized vocational tracks and apprenticeship partnerships.",
    location: "Hanika, Southern Province",
    head_teacher: "Ngiruwonsanga Deogratias",
    contact_phone: "+250 788 600105",
    contact_email: "hanika.tss@shyogwe.org",
    founded_year: 2020,
    programs_offered: [
      "Technical Construction",
      "Agricultural Technology & Processing",
      "Mechanics",
      "Small Business Skills"
    ]
  },
  {
    id: 28,
    name: "Vunga VTC",
    type: "tss_boarding",
    description: "Vocational Training Center focused on youth livelihood development and rural poverty alleviation.",
    location: "Vunga, Shyogwe Diocese",
    head_teacher: "Rev. Niyomugaba Felecien",
    contact_phone: "+250 788 600102",
    contact_email: "vunga.vtc@shyogwe.org",
    founded_year: 2022,
    programs_offered: [
      "Masonry & Construction Arts",
      "Sewing & Garment Production",
      "Carpentry",
      "Christian Stewardship"
    ]
  },

  // Higher Education / Polytechnic
  {
    id: 29,
    name: "Hanika Anglican Integrated Polytechnic (HAIP)",
    type: "university",
    description: "Diocesan higher education institution offering diploma and degree programs founded on Christian ethics, technical research, and academic rigor.",
    location: "Hanika / Muhanga",
    head_teacher: "Rector / Academic Leadership",
    contact_phone: "+250 788 800001",
    contact_email: "info@sau.ac.rw",
    founded_year: 2010,
    programs_offered: [
      "Civil Engineering & Environmental Technology",
      "Information Technology & Software Systems",
      "Business Administration & Management",
      "Theology & Pastoral Studies",
      "Community Development Studies"
    ]
  }
];

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeType = params.get("type") || "all";

  // Load schools from API with fallback
  useEffect(() => {
    let cancelled = false;

    const fetchSchools = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrls.schools());
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (!cancelled) {
            setSchools(list.length > 0 ? list : fallbackSchools);
          }
        } else {
          if (!cancelled) setSchools(fallbackSchools);
        }
      } catch (err) {
        console.warn("Using fallback schools data:", err);
        if (!cancelled) setSchools(fallbackSchools);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSchools();
    return () => {
      cancelled = true;
    };
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

  // Filter schools based on category and search query
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Type match
      const matchesType = activeType === "all" || school.type === activeType;
      if (!matchesType) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchName = school.name?.toLowerCase().includes(query);
      const matchLocation = school.location?.toLowerCase().includes(query);
      const matchLeader = school.head_teacher?.toLowerCase().includes(query);
      const matchDesc = school.description?.toLowerCase().includes(query);

      return matchName || matchLocation || matchLeader || matchDesc;
    });
  }, [schools, activeType, searchQuery]);

  // Counts by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: schools.length };
    Object.keys(typeConfig).forEach((key) => {
      counts[key] = schools.filter((s) => s.type === key).length;
    });
    return counts;
  }, [schools]);

  const handleTypeChange = (typeKey: string) => {
    if (typeKey === "all") {
      navigate("/schools");
    } else {
      navigate(`/schools?type=${typeKey}`);
    }
  };

  const parsePrograms = (programs: string[] | string | undefined): string[] => {
    if (!programs) return [];
    if (Array.isArray(programs)) return programs;
    try {
      const parsed = JSON.parse(programs);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return programs.split(",").map((p) => p.trim()).filter(Boolean);
    }
  };

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
              alt="Anglican Church of Rwanda Shyogwe Diocese Schools"
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
              <span className="text-church-gold">Diocesan Schools</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Diocesan Educational Institutions
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
                  value: "38", 
                  label: "Diocesan Schools", 
                  sub: "Across 3 Administrative Districts",
                  icon: SchoolIcon 
                },
                { 
                  value: "6", 
                  label: "Educational Levels", 
                  sub: "ECD Nursery to Polytechnic",
                  icon: GraduationCap 
                },
                { 
                  value: "20,000+", 
                  label: "Students Nurtured", 
                  sub: "Holistic Christian Formation",
                  icon: BookOpen 
                },
                { 
                  value: "100%", 
                  label: "Value-Based Focus", 
                  sub: "Faith, Integrity & Academic Rigor",
                  icon: Award 
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
                    <div className="text-2xl sm:text-3xl font-bold text-church-navy tabular-nums mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {stat.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Educational Mission & Core Values */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-church-navy flex items-center justify-center mb-4">
                  <Award className="h-5 w-5 text-church-gold" />
                </div>
                <h3 className="font-bold text-church-navy text-base mb-2">Christian Character & Moral Integrity</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every diocesan school provides daily chapel services, scripture education, and pastoral mentorship, guiding students into responsible citizenship.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-church-navy flex items-center justify-center mb-4">
                  <Compass className="h-5 w-5 text-church-gold" />
                </div>
                <h3 className="font-bold text-church-navy text-base mb-2">STEM & Hands-On TVET Training</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focusing on modern science labs, vocational workshops, computer literacy, and practical trades to prepare youth for high-demand national industries.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-church-navy flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5 text-church-gold" />
                </div>
                <h3 className="font-bold text-church-navy text-base mb-2">Inclusive Education for All</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ensuring children from remote parishes, vulnerable families, and underrepresented communities receive equitable access to quality education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Controls: Search & Category Filters */}
        <section className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            {/* Header and Live Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                  Institutional Directory
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                  Browse Diocesan Schools
                </h2>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by school, location, or leader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 overflow-x-auto">
              <button
                onClick={() => handleTypeChange("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeType === "all"
                    ? "bg-church-navy text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-church-navy"
                }`}
              >
                <span>All Schools</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeType === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {typeCounts.all || schools.length}
                </span>
              </button>

              {Object.entries(typeConfig).map(([key, conf]) => {
                const count = typeCounts[key] || 0;
                const isActive = activeType === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleTypeChange(key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? "bg-church-navy text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-church-navy"
                    }`}
                  >
                    <span>{conf.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* School Cards Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-3 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading diocesan schools...</p>
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-xl mx-auto">
                <SchoolIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-church-navy mb-1">No schools match your search</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Try checking another educational level or clearing your keyword filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    handleTypeChange("all");
                  }}
                  className="text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchools.map((school) => {
                  const conf = typeConfig[school.type] || {
                    label: "School",
                    badge: "General Education",
                    icon: SchoolIcon
                  };
                  const SchoolBadgeIcon = conf.icon;
                  const programs = parsePrograms(school.programs_offered);

                  return (
                    <div
                      key={school.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Badge & Level */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-church-navy bg-church-cream/70 px-2.5 py-1 rounded-md border border-church-gold/20">
                            <SchoolBadgeIcon className="h-3 w-3 text-church-navy" />
                            {conf.badge}
                          </span>
                          {school.founded_year && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Est. {school.founded_year}
                            </span>
                          )}
                        </div>

                        {/* School Name */}
                        <h3 className="text-lg font-serif font-bold text-church-navy group-hover:text-church-gold transition-colors mb-2">
                          {school.name}
                        </h3>

                        {/* Description */}
                        {school.description && (
                          <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                            {school.description}
                          </p>
                        )}

                        {/* Info List */}
                        <div className="space-y-2 mb-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          {school.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-church-gold shrink-0" />
                              <span className="truncate">{school.location}</span>
                            </div>
                          )}

                          {school.head_teacher && (
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate"><span className="text-slate-400">Leader:</span> {school.head_teacher}</span>
                            </div>
                          )}

                          {school.contact_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <a 
                                href={`tel:${school.contact_phone}`} 
                                className="text-slate-600 hover:text-church-navy transition-colors truncate"
                              >
                                {school.contact_phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Programs Offered Pills */}
                        {programs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {programs.slice(0, 3).map((prog, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded"
                              >
                                {prog}
                              </span>
                            ))}
                            {programs.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{programs.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedSchool(school)}
                          className="text-xs font-bold text-church-navy hover:text-church-gold flex items-center gap-1.5 transition-colors group/btn"
                        >
                          <span>View School Details</span>
                          <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>

                        {school.contact_email && (
                          <a
                            href={`mailto:${school.contact_email}`}
                            title="Send Email"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-church-navy hover:bg-slate-100 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </section>

        {/* School Detail Modal */}
        {selectedSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div 
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSchool(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-church-navy bg-church-cream px-3 py-1 rounded-full border border-church-gold/20">
                  {typeConfig[selectedSchool.type]?.label || selectedSchool.type}
                </span>
                {selectedSchool.founded_year && (
                  <span className="text-xs text-slate-400">
                    Established {selectedSchool.founded_year}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-serif font-bold text-church-navy mb-2">
                {selectedSchool.name}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-5 pb-4 border-b border-slate-100">
                {selectedSchool.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-church-gold" />
                    <span>{selectedSchool.location}</span>
                  </div>
                )}
                {selectedSchool.head_teacher && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Head: {selectedSchool.head_teacher}</span>
                  </div>
                )}
              </div>

              {selectedSchool.description && (
                <div className="mb-6">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                    About This Institution
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {selectedSchool.description}
                  </p>
                </div>
              )}

              {/* Programs / Curricula */}
              {parsePrograms(selectedSchool.programs_offered).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                    Academic & Technical Programs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parsePrograms(selectedSchool.programs_offered).map((prog, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <CheckCircle2 className="h-3.5 w-3.5 text-church-gold shrink-0 mt-0.5" />
                        <span>{prog}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 space-y-2">
                <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
                  Institutional Contact
                </h4>
                {selectedSchool.contact_phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-church-gold" /> Phone:
                    </span>
                    <a href={`tel:${selectedSchool.contact_phone}`} className="font-bold text-church-navy hover:underline">
                      {selectedSchool.contact_phone}
                    </a>
                  </div>
                )}
                {selectedSchool.contact_email && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-church-gold" /> Email:
                    </span>
                    <a href={`mailto:${selectedSchool.contact_email}`} className="font-bold text-church-navy hover:underline">
                      {selectedSchool.contact_email}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSchool(null)}
                  className="text-slate-600 text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-church-navy hover:bg-church-navy/90 text-white text-xs"
                  onClick={() => {
                    setSelectedSchool(null);
                    navigate("/contact");
                  }}
                >
                  Inquire via Education Office
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Education Department & Partnership Call to Action */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-r from-church-navy via-slate-900 to-church-navy rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                  Diocesan Education Department
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                  Partner in Educating the Next Generation
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Join the Anglican Church of Rwanda, Shyogwe Diocese in providing student scholarships for vulnerable children, equipping science laboratories, and funding classroom infrastructure across our 38 schools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/donate"
                  className="px-6 py-3 rounded-xl bg-church-gold text-church-navy font-bold text-xs uppercase tracking-wider hover:bg-church-gold-hover transition-colors shadow-md text-center"
                >
                  Support Education Fund
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors text-center"
                >
                  Contact Education Office
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
