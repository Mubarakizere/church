import React from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Heart, 
  ChevronRight, 
  Instagram, 
  Facebook, 
  ExternalLink 
} from "lucide-react";

// Custom TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
  </svg>
);

// Custom X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0c1628] text-white relative overflow-hidden border-t border-slate-800">
      {/* Top subtle golden gradient line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-church-gold/70 to-transparent" />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          
          {/* Column 1: Diocese Identity & Mission (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-3.5 group w-fit">
              <div className="relative">
                <img
                  src="/logo for chuch.jpg"
                  alt="Anglican Church of Rwanda, Shyogwe Diocese Emblem"
                  className="w-13 h-13 sm:w-14 sm:h-14 object-contain rounded-full border-2 border-church-gold/50 shadow-md group-hover:border-church-gold transition-colors duration-300"
                />
              </div>
              <div className="leading-tight">
                <span className="block text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                  Anglican Church of Rwanda
                </span>
                <span className="block text-lg sm:text-xl font-serif font-bold text-white tracking-tight group-hover:text-church-gold transition-colors">
                  Shyogwe Diocese
                </span>
              </div>
            </Link>

            <p className="text-slate-300/90 text-sm leading-relaxed max-w-sm">
              Serving God and community across Southern Rwanda since 1992 through gospel proclamation, 
              pastoral care, holistic education, and socio-economic transformation.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-church-gold uppercase tracking-wider block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {[
                  {
                    name: "X (Twitter)",
                    icon: <XIcon className="h-4 w-4" />,
                    url: "https://twitter.com/SDiocese63071"
                  },
                  {
                    name: "Facebook",
                    icon: <Facebook className="h-4 w-4" />,
                    url: "https://facebook.com/EARShyogweDiocese"
                  },
                  {
                    name: "Instagram",
                    icon: <Instagram className="h-4 w-4" />,
                    url: "https://instagram.com/dioceseshyogwe"
                  },
                  {
                    name: "TikTok",
                    icon: <TikTokIcon className="h-4 w-4" />,
                    url: "https://tiktok.com/@ear.shyogwe.diocese"
                  }
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-church-navy hover:bg-church-gold hover:border-church-gold transition-all duration-300 shadow-xs hover:scale-105"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Leadership & Ministries (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-church-gold mb-5 pb-1 border-b border-white/10">
              Diocese & Ministry
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "About The Diocese", to: "/about" },
                { label: "The Bishop's Office", to: "/bishop" },
                { label: "Diocesan Leadership", to: "/team" },
                { label: "Worship & Services", to: "/services" },
                { label: "Diocesan Schools", to: "/schools" },
                { label: "Community Programs", to: "/projects" }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-slate-300 hover:text-church-gold transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3 w-3 text-church-gold/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: News & Resources (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-church-gold mb-5 pb-1 border-b border-white/10">
              Media & Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Latest News", to: "/news" },
                { label: "Calendar & Events", to: "/events" },
                { label: "Photo Gallery", to: "/gallery" },
                { label: "Documents & Archives", to: "/documents" },
                { label: "Support Our Ministry", to: "/donate" },
                { label: "Contact & Inquiries", to: "/contact" }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-slate-300 hover:text-church-gold transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3 w-3 text-church-gold/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Headquarters Contact (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-church-gold mb-5 pb-1 border-b border-white/10">
              Diocesan Secretariat
            </h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-church-gold shrink-0 mt-0.5" />
                <p className="text-slate-300 leading-snug">
                  St. Peter's Cathedral Compound<br />
                  P.O. Box 27 Gitarama, Muhanga District<br />
                  Southern Province, Rwanda
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-church-gold shrink-0" />
                <a
                  href="tel:+250788503392"
                  className="text-slate-300 hover:text-church-gold transition-colors"
                >
                  +250 788 503 392
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-church-gold shrink-0" />
                <a
                  href="mailto:info@shyogwediocese.org"
                  className="text-slate-300 hover:text-church-gold transition-colors"
                >
                  info@shyogwediocese.org
                </a>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-xs pt-1">
                <Clock className="h-3.5 w-3.5 text-church-gold/80 shrink-0" />
                <span>Monday – Friday: 8:00 AM – 5:00 PM CAT</span>
              </div>
            </div>

            {/* Quick Donation Highlight */}
            <div className="mt-5 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white">Support Diocesan Missions</p>
                <p className="text-[11px] text-slate-400">Partner with our gospel & development work</p>
              </div>
              <Link
                to="/donate"
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-church-gold text-church-navy font-bold text-xs hover:bg-church-gold/90 transition-colors shadow-xs"
              >
                Donate
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            &copy; {currentYear} Anglican Church of Rwanda, Shyogwe Diocese. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-church-gold transition-colors">
              About
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/contact" className="hover:text-church-gold transition-colors">
              Contact
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/donate" className="hover:text-church-gold transition-colors">
              Support
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;