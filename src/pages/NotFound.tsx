import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  Building2,
  GraduationCap,
  Calendar,
  Newspaper,
  Phone,
  ArrowRight,
  ChevronRight,
  Church,
  Compass,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";

export const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn("404 Error: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  const QUICK_LINKS = [
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Shyogwe Diocese Navigation"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/85 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Error 404</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* 404 Hero & Notice Section */}
        <section className="py-14 bg-slate-50 border-b border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-xs font-bold text-church-navy uppercase tracking-wider mb-4">
              <Compass className="h-3.5 w-3.5 text-church-gold" />
              <span>Requested Path: {location.pathname}</span>
            </div>

            <div className="font-serif font-extrabold text-7xl sm:text-8xl text-church-navy/20 select-none mb-2">
              404
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy mb-3">
              We Couldn't Find That Diocesan Resource
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto mb-8">
              The page, document, or article you are searching for may have been relocated, archived,
              or the web address was typed with a small discrepancy.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => navigate("/")}
                className="bg-church-navy hover:bg-church-navy/90 text-white font-semibold text-xs uppercase tracking-wider h-11 px-6 shadow-sm"
              >
                <Home className="h-4 w-4 mr-2 text-church-gold" />
                Return to Homepage
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/documents")}
                className="border-slate-300 hover:border-church-gold hover:text-church-navy text-slate-700 font-semibold text-xs uppercase tracking-wider h-11 px-6 bg-white"
              >
                <FileText className="h-4 w-4 mr-2 text-church-navy" />
                Browse Official Documents
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/contact")}
                className="border-slate-300 hover:border-church-gold hover:text-church-navy text-slate-700 font-semibold text-xs uppercase tracking-wider h-11 px-6 bg-white"
              >
                <Phone className="h-4 w-4 mr-2 text-church-navy" />
                Contact Secretariat
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Destination Pages Directory */}
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
              {QUICK_LINKS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="p-5 rounded-xl border border-slate-200/90 bg-white hover:border-church-gold/70 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy group-hover:bg-church-navy group-hover:text-white transition-colors flex items-center justify-center mb-3">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-church-navy group-hover:text-church-red transition-colors mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-church-navy group-hover:text-church-red transition-colors">
                      <span>Visit Section</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
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
                    Our Secretariat at Shyogwe Headquarters can help locate archives and records.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate("/contact")}
                className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold h-10 px-5 shrink-0"
              >
                Reach Out to Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
