import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail, 
  Phone, 
  ChevronRight, 
  Church, 
  HeartHandshake, 
  BookOpen, 
  Globe, 
  MapPin, 
  Users, 
  ShieldCheck 
} from "lucide-react";
import { apiUrls } from "@/config/api";

interface BishopData {
  id: number;
  name: string;
  title: string;
  bio?: string;
  description?: string;
  image?: string;
  email?: string;
  phone?: string;
}

export const Bishop: React.FC = () => {
  const [bishop, setBishop] = useState<BishopData | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  // Reliable fallback data based on verified database record
  const fallbackBishop: BishopData = {
    id: 16,
    name: "Rt. Rev. Louis Pasteur KABAYIZA",
    title: "Bishop of Shyogwe Diocese",
    image: "Wi3CMVwFFHFpJz9LhHUSNmVeGHn6T4In6fRsZMr5.jpg",
    email: "bishop@shyogwe.com",
    phone: "+250785451691",
    description:
      "The Bishop provides spiritual leadership and pastoral care to clergy, laity, and institutions, ensuring faithfulness to Scripture and Anglican tradition. He oversees diocesan administration, clergy recruitment and training, and presides over confirmations and ordinations.\n\nThe Bishop promotes evangelism, discipleship, and mission, represents the diocese nationally and internationally, and fosters unity and partnerships. He also advocates for peace, reconciliation, social justice, and leads the church's response to community needs while nurturing spiritual growth through teaching and pastoral guidance."
  };

  useEffect(() => {
    const fetchBishop = async () => {
      try {
        const response = await fetch(apiUrls.teams());
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          const bishopRecord = list.find((m: any) => m.category === "bishop");
          if (bishopRecord) {
            setBishop({
              ...bishopRecord,
              name: bishopRecord.name.replace(/^1\.\s*/, "") // clean "1. " prefix if present
            });
            return;
          }
        }
        setBishop(fallbackBishop);
      } catch (err) {
        console.warn("Could not load bishop from API, using verified fallback:", err);
        setBishop(fallbackBishop);
      }
    };

    fetchBishop();
  }, []);

  const currentBishop = bishop || fallbackBishop;

  const resolveImageUrl = (rawImage?: string): string => {
    if (!rawImage || rawImage === "/placeholder.svg" || rawImage === "placeholder.svg") {
      return "";
    }
    if (rawImage.startsWith("http")) return rawImage;
    const filename = rawImage.split("/").pop() || rawImage;
    return apiUrls.storage(`team-images/${filename}`);
  };

  const handleImageError = () => {
    const filename = currentBishop.image ? currentBishop.image.split("/").pop() : "";
    const backupUrl = `https://earshyogwe.com/api/storage/team-images/${filename}`;
    const imgEl = document.getElementById("bishop-portrait-img") as HTMLImageElement;
    if (imgEl && imgEl.src !== backupUrl) {
      imgEl.src = backupUrl;
      return;
    }
    setImageFailed(true);
  };

  const pastoralPillars = [
    {
      icon: Church,
      title: "Spiritual & Pastoral Care",
      desc: "Providing pastoral guidance to clergy, ordaining ministers, and nurturing spiritual maturity across all parishes."
    },
    {
      icon: BookOpen,
      title: "Evangelism & Discipleship",
      desc: "Faithfully expounding the Holy Scriptures, promoting church planting, and discipling the next generation."
    },
    {
      icon: HeartHandshake,
      title: "Compassion & Social Healing",
      desc: "Leading diocesan initiatives in education, healthcare, reconciliation, and sustainable community empowerment."
    },
    {
      icon: Globe,
      title: "Communion & Global Alliances",
      desc: "Representing Shyogwe Diocese within the Province of the Anglican Church of Rwanda and international partnerships."
    }
  ];

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
              alt="Shyogwe Diocese Episcopal Ministry"
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
              <span className="text-church-gold">The Bishop</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              The Office of the Bishop
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Bishop Profile Section */}
        <section className="py-14 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              
              {/* Main Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 mb-12">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
                  
                  {/* Bishop Portrait */}
                  <div className="w-56 h-64 sm:w-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-church-gold/40 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center">
                    {!imageFailed && resolveImageUrl(currentBishop.image) ? (
                      <img
                        id="bishop-portrait-img"
                        src={resolveImageUrl(currentBishop.image)}
                        alt={currentBishop.name}
                        className="w-full h-full object-cover object-top"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-church-navy text-church-gold font-bold text-3xl flex items-center justify-center">
                        BP
                      </div>
                    )}
                  </div>

                  {/* Bishop Details */}
                  <div className="text-center md:text-left flex-1 space-y-3">
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-church-navy bg-church-cream/70 border border-church-cream px-3 py-1 rounded-full">
                      Episcopal Leadership
                    </span>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-church-navy tracking-tight">
                      {currentBishop.name}
                    </h2>

                    <p className="text-sm sm:text-base font-semibold text-church-gold">
                      {currentBishop.title}
                    </p>

                    <div className="pt-2 text-slate-600 text-sm sm:text-base leading-relaxed space-y-3">
                      {(currentBishop.description || currentBishop.bio || "").split("\n\n").map((para, i) => (
                        <p key={i}>{para.trim()}</p>
                      ))}
                    </div>

                    {/* Direct Contact Options */}
                    <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center md:justify-start gap-3">
                      {currentBishop.email && (
                        <a
                          href={`mailto:${currentBishop.email}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-church-navy text-white text-xs font-semibold hover:bg-church-navy/90 transition-colors shadow-xs"
                        >
                          <Mail className="h-4 w-4 text-church-gold" />
                          <span>{currentBishop.email}</span>
                        </a>
                      )}

                      {currentBishop.phone && (
                        <a
                          href={`tel:${currentBishop.phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:text-church-navy hover:bg-slate-50 transition-colors"
                        >
                          <Phone className="h-4 w-4 text-church-gold" />
                          <span>{currentBishop.phone}</span>
                        </a>
                      )}

                      <Link
                        to="/team"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-church-cream/60 border border-church-cream text-church-navy text-xs font-semibold hover:bg-church-cream transition-colors"
                      >
                        <Users className="h-4 w-4 text-church-navy" />
                        <span>Diocesan Leadership Team</span>
                      </Link>
                    </div>

                  </div>

                </div>
              </div>

              {/* Pastoral Ministry Pillars */}
              <div>
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-church-gold">
                    Calling & Mission
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-church-navy tracking-tight mt-1">
                    Areas of Episcopal Ministry
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {pastoralPillars.map((pillar, idx) => {
                    const Icon = pillar.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-church-gold/60 transition-colors text-center flex flex-col items-center"
                      >
                        <div className="w-11 h-11 rounded-xl bg-church-cream text-church-navy flex items-center justify-center mb-3">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-church-navy text-sm mb-1.5">
                          {pillar.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {pillar.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secretariat Note */}
              <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-church-cream text-church-navy flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-church-navy" />
                  </div>
                  <div>
                    <h4 className="font-bold text-church-navy text-sm">
                      Diocesan Secretariat Headquarters
                    </h4>
                    <p className="text-xs text-slate-500">
                      St. Peter's Cathedral Compound, Mucyakabiri, Muhanga District, Southern Province
                    </p>
                  </div>
                </div>

                <Link
                  to="/contact"
                  className="shrink-0 px-4 py-2 rounded-xl bg-church-navy text-white text-xs font-semibold hover:bg-church-navy/90 transition-colors"
                >
                  Contact Secretariat
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

export default Bishop;