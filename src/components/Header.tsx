import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavGroupItem {
  name: string;
  href: string;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavGroupItem[];
}

const NAV_GROUPS: Record<string, NavGroupItem[]> = {
  about: [
    { name: "About the Diocese", href: "/about", description: "Our history, mission, and vision" },
    { name: "Our Team", href: "/team", description: "Diocesan staff and archdeaconries" },
    { name: "The Bishop", href: "/bishop", description: "Message from the Bishop" },
  ],
  ministries: [
    { name: "Church Services", href: "/services", description: "Sunday worship and ministry schedules" },
    { name: "Development Projects", href: "/projects", description: "Community, health, and water programs" },
    { name: "Schools & Education", href: "/schools", description: "Diocesan schools and institutions" },
  ],
  media: [
    { name: "News & Updates", href: "/news", description: "Latest announcements and stories" },
    { name: "Events Calendar", href: "/events", description: "Conferences, meetings, and gatherings" },
    { name: "Photo Gallery", href: "/gallery", description: "Moments and ministry highlights" },
    { name: "Documents", href: "/documents", description: "Official diocesan publications & forms" },
  ],
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    about: false,
    ministries: false,
    media: false,
  });
  const location = useLocation();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileGroup = (key: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isGroupActive = (items: NavGroupItem[]) => {
    return items.some((item) => location.pathname === item.href);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-church-cream/80 shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Compact Title */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
              <img
                src="/logo for chuch.jpg"
                alt="Anglican Church of Rwanda, Shyogwe Diocese Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-full border border-church-cream group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-church-navy tracking-tight leading-tight group-hover:text-church-gold transition-colors">
                Anglican Church of Rwanda
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-church-gold tracking-wide uppercase">
                Shyogwe Diocese
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 font-medium text-sm">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md transition-colors ${
                location.pathname === "/"
                  ? "text-church-gold font-semibold"
                  : "text-church-navy hover:text-church-gold hover:bg-church-cream/40"
              }`}
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("about")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isGroupActive(NAV_GROUPS.about) || activeDropdown === "about"
                    ? "text-church-gold font-semibold"
                    : "text-church-navy hover:text-church-gold hover:bg-church-cream/40"
                }`}
                onClick={() => setActiveDropdown(activeDropdown === "about" ? null : "about")}
              >
                <span>About</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "about" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "about" && (
                <div className="absolute left-0 top-full pt-1.5 w-60 z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-church-cream/90 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {NAV_GROUPS.about.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === item.href
                            ? "bg-church-cream text-church-navy font-semibold"
                            : "text-church-navy hover:bg-church-cream/60 hover:text-church-gold"
                        }`}
                      >
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ministries & Projects Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("ministries")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isGroupActive(NAV_GROUPS.ministries) || activeDropdown === "ministries"
                    ? "text-church-gold font-semibold"
                    : "text-church-navy hover:text-church-gold hover:bg-church-cream/40"
                }`}
                onClick={() => setActiveDropdown(activeDropdown === "ministries" ? null : "ministries")}
              >
                <span>Ministries & Projects</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "ministries" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "ministries" && (
                <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-church-cream/90 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {NAV_GROUPS.ministries.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === item.href
                            ? "bg-church-cream text-church-navy font-semibold"
                            : "text-church-navy hover:bg-church-cream/60 hover:text-church-gold"
                        }`}
                      >
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media & Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("media")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isGroupActive(NAV_GROUPS.media) || activeDropdown === "media"
                    ? "text-church-gold font-semibold"
                    : "text-church-navy hover:text-church-gold hover:bg-church-cream/40"
                }`}
                onClick={() => setActiveDropdown(activeDropdown === "media" ? null : "media")}
              >
                <span>Media & Resources</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === "media" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "media" && (
                <div className="absolute left-0 top-full pt-1.5 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-church-cream/90 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {NAV_GROUPS.media.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === item.href
                            ? "bg-church-cream text-church-navy font-semibold"
                            : "text-church-navy hover:bg-church-cream/60 hover:text-church-gold"
                        }`}
                      >
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className={`px-3 py-2 rounded-md transition-colors ${
                location.pathname === "/contact"
                  ? "text-church-gold font-semibold"
                  : "text-church-navy hover:text-church-gold hover:bg-church-cream/40"
              }`}
            >
              Contact
            </Link>

            {/* Donate CTA Button */}
            <Link
              to="/donate"
              className="ml-2 inline-flex items-center justify-center px-4 py-2 rounded-full bg-church-gold hover:bg-church-gold-hover text-church-navy font-semibold shadow-xs hover:shadow transition-all text-xs uppercase tracking-wider"
            >
              Donate
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/donate"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-church-gold text-church-navy font-semibold text-xs uppercase tracking-wider shadow-xs"
            >
              Donate
            </Link>
            <button
              className="p-2 text-church-navy hover:text-church-gold transition-colors rounded-md hover:bg-church-cream/60"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-3 pb-4 border-t border-church-cream pt-3 space-y-2 font-medium text-sm animate-in fade-in duration-200">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/"
                  ? "bg-church-cream text-church-gold font-semibold"
                  : "text-church-navy hover:bg-church-cream/50"
              }`}
            >
              Home
            </Link>

            {/* Mobile About Group */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileGroup("about")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-church-navy hover:bg-church-cream/50 transition-colors"
              >
                <span>About</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileExpanded.about ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileExpanded.about && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-church-cream/30 rounded-lg mt-1">
                  {NAV_GROUPS.about.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-3 py-1.5 text-xs rounded-md ${
                        location.pathname === item.href
                          ? "text-church-gold font-semibold"
                          : "text-church-charcoal hover:text-church-gold"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Ministries Group */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileGroup("ministries")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-church-navy hover:bg-church-cream/50 transition-colors"
              >
                <span>Ministries & Projects</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileExpanded.ministries ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileExpanded.ministries && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-church-cream/30 rounded-lg mt-1">
                  {NAV_GROUPS.ministries.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-3 py-1.5 text-xs rounded-md ${
                        location.pathname === item.href
                          ? "text-church-gold font-semibold"
                          : "text-church-charcoal hover:text-church-gold"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Media Group */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileGroup("media")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-church-navy hover:bg-church-cream/50 transition-colors"
              >
                <span>Media & Resources</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileExpanded.media ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileExpanded.media && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-church-cream/30 rounded-lg mt-1">
                  {NAV_GROUPS.media.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`block px-3 py-1.5 text-xs rounded-md ${
                        location.pathname === item.href
                          ? "text-church-gold font-semibold"
                          : "text-church-charcoal hover:text-church-gold"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/contact"
                  ? "bg-church-cream text-church-gold font-semibold"
                  : "text-church-navy hover:bg-church-cream/50"
              }`}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;