import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Clock, 
  MapPin, 
  Languages, 
  BookOpen, 
  Heart, 
  Users, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Church,
  Music,
  ArrowRight
} from "lucide-react";
import { apiUrls } from "@/config/api";

interface ServiceItem {
  id: string | number;
  title: string;
  time: string;
  type: string;
  description: string;
  features: string[];
  language: string;
}

const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: 1,
    title: "English Service",
    time: "6:30 AM - 8:30 AM",
    type: "Holy Communion in English",
    description: "Early morning Anglican service conducted entirely in English. Traditional liturgy with Holy Communion, perfect for English-speaking congregation members and visitors.",
    features: ["English Liturgy", "Holy Communion", "Traditional Hymns", "Morning Prayer"],
    language: "english"
  },
  {
    id: 2,
    title: "Kinyarwanda Service",
    time: "9:00 AM - 12:00 PM",
    type: "Holy Communion in Kinyarwanda",
    description: "Main morning service conducted in Kinyarwanda. Full Anglican liturgy with Holy Communion, choral worship, and vibrant community fellowship.",
    features: ["Kinyarwanda Liturgy", "Holy Communion", "Cathedral Choir", "Community Fellowship"],
    language: "kinyarwanda"
  },
  {
    id: 3,
    title: "Mixed / Bilingual Service",
    time: "3:30 PM - 5:30 PM",
    type: "Bilingual Worship & Fellowship",
    description: "Afternoon service combining both English and Kinyarwanda. A contemporary and traditional worship experience bringing together youths and families.",
    features: ["Bilingual Worship", "Youth & Praise Ministry", "Contemporary & Traditional", "Unity in Fellowship"],
    language: "mixed"
  }
];

const WEEKDAY_MINISTRIES = [
  {
    day: "Wednesday",
    time: "5:00 PM - 6:30 PM",
    title: "Mid-Week Bible Study & Prayer",
    location: "Cathedral Hall & Parish Chapels",
    description: "In-depth exposition of Scripture, small group discussion, and intercessory prayer for families and the nation."
  },
  {
    day: "Friday",
    time: "12:00 PM - 2:00 PM",
    title: "Fasting & Intercession Gathering",
    location: "Parish Sanctuaries",
    description: "Pastoral fasting and prayer for the sick, spiritual renewal, national leaders, and diocesan ministries."
  },
  {
    day: "Saturday",
    time: "2:00 PM - 5:00 PM",
    title: "Choir Rehearsal & Youth Ministry",
    location: "Cathedral & Parishes",
    description: "Praise preparation, musical discipleship, and youth mentorship programs."
  }
];

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrls.services());
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (list.length > 0) {
            const mapped = list.map((item: any) => ({
              id: item.id,
              title: item.title,
              time: item.time,
              type: item.type,
              description: item.description,
              features: Array.isArray(item.features)
                ? item.features
                : (typeof item.features === "string" ? JSON.parse(item.features) : []),
              language: item.language || "english"
            }));
            setServices(mapped);
          }
        }
      } catch (err) {
        console.warn("Using fallback worship services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getLanguageBadge = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("kinyarwanda")) {
      return { label: "Ikinyarwanda", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    if (l.includes("english")) {
      return { label: "English", color: "bg-blue-50 text-blue-800 border-blue-200" };
    }
    return { label: "Bilingual (EN / RW)", color: "bg-purple-50 text-purple-800 border-purple-200" };
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
              alt="Shyogwe Diocese Worship Services"
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
              <span className="text-church-gold">Worship Services</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Worship Services & Schedules
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Cathedral & Parish Welcome Overview */}
        <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-church-cream border border-church-cream text-church-navy text-xs font-semibold mb-3">
              <Church className="h-3.5 w-3.5 text-church-gold" />
              St. Peter's Cathedral & 45 Diocesan Parishes
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy mb-3">
              Worship With Us Every Sunday
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Whether you are living in the diocese, visiting Rwanda, or searching for a Christian community of faith, 
              our doors and hearts are open. Our liturgical services follow the Anglican Book of Common Prayer, 
              featuring Holy Communion, Biblical preaching, and choir praise.
            </p>
          </div>
        </section>

        {/* Sunday Worship Services Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold">
                Sunday Assemblies
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy tracking-tight mt-1">
                Cathedral Sunday Schedule
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                St. Peter's Cathedral, Muhanga (Mucyakabiri)
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-church-navy mb-3" />
                <span className="text-sm font-medium text-slate-500">Loading service schedules...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {services.map((srv) => {
                  const lang = getLanguageBadge(srv.language);
                  return (
                    <div
                      key={srv.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-church-gold/60 transition-all p-6 sm:p-7 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Time & Language Header */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${lang.color}`}>
                            {lang.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-church-navy bg-church-cream/70 px-2.5 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5 text-church-gold" />
                            {srv.time}
                          </span>
                        </div>

                        {/* Title & Type */}
                        <h4 className="text-xl font-serif font-bold text-church-navy mb-1">
                          {srv.title}
                        </h4>
                        <p className="text-xs font-semibold text-church-gold mb-3">
                          {srv.type}
                        </p>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                          {srv.description}
                        </p>
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="pt-4 border-t border-slate-100">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
                          Service Highlights
                        </span>
                        <div className="space-y-1.5">
                          {srv.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Mid-Week Gatherings & Parish Ministries */}
        <section className="py-16 bg-slate-50 border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold">
                Fellowship Throughout The Week
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy tracking-tight mt-1">
                Mid-Week Ministries & Prayer
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                Join our spiritual gatherings across parishes and archdeaconries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {WEEKDAY_MINISTRIES.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-church-navy mb-2">
                    <span className="bg-church-cream px-2 py-0.5 rounded text-church-navy">{item.day}</span>
                    <span className="text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-church-gold" />
                      {item.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-church-navy text-sm mb-1">{item.title}</h4>
                  <p className="text-[11px] text-church-gold font-semibold mb-2">{item.location}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* First-Time Visitor Hospitality Guide */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-r from-church-navy via-slate-900 to-church-navy rounded-3xl p-8 sm:p-10 text-white shadow-xl">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                  Hospitality & Welcome
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                  First Time Joining Our Worship?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                  You are warmly invited just as you are. Our parish wardens and hospitality teams are at the doors 
                  to assist you with hymn books, order of service, and seating.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200 mb-6">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-church-gold shrink-0" />
                    <span>Anglican liturgy with prayer books provided</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-church-gold shrink-0" />
                    <span>Sunday School & ministry for children</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-church-gold shrink-0" />
                    <span>Multilingual services (EN & Kinyarwanda)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-church-gold shrink-0" />
                    <span>Pastoral counseling & prayers after service</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="px-5 py-2.5 rounded-xl bg-church-gold text-church-navy font-bold text-xs uppercase tracking-wider hover:bg-church-gold-hover transition-colors shadow-xs"
                  >
                    Contact Cathedral Office
                  </Link>
                  <Link
                    to="/about"
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors"
                  >
                    About the Diocese
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Services;