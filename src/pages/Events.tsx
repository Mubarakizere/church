import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  ChevronRight, 
  ArrowRight, 
  X, 
  Share2, 
  Church, 
  Tag, 
  CheckCircle2, 
  Mail,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";
import { toast } from "sonner";

interface EventItem {
  id: number | string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: string;
  featured: boolean;
  category?: "service" | "fellowship" | "program" | "assembly";
  status?: string;
  image?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

// Authentic diocesan calendar of annual celebrations, services and ministry programs
const authenticEvents: EventItem[] = [
  {
    id: 1,
    title: "Diocesan Synod & Clergy Assembly",
    date: "Annual Diocesan Gathering",
    time: "9:00 AM - 4:00 PM",
    location: "St. Peter's Cathedral, Shyogwe",
    description: "Annual gathering of clergy, lay readers, archdeaconry leaders, and parish representatives to evaluate pastoral ministry, governance, and community mission across the Diocese.",
    attendees: "Clergy, Synod Delegates & Guests",
    featured: true,
    category: "assembly",
    image: "/01.jpg"
  },
  {
    id: 2,
    title: "Diocesan Ordination of Deacons & Priests",
    date: "Holy Orders Service",
    time: "9:30 AM",
    location: "St. Peter's Cathedral, Shyogwe",
    description: "Solemn diocesan service presided over by the Bishop for the laying on of hands and ordination of candidates called to holy orders in the Anglican Church of Rwanda.",
    attendees: "All Welcome",
    featured: true,
    category: "service",
    image: "/02.jpg"
  },
  {
    id: 3,
    title: "Easter Resurrection Celebration",
    date: "Easter Sunday",
    time: "9:00 AM & 11:30 AM",
    location: "Cathedral & All Diocesan Parishes",
    description: "Commemoration of the resurrection of Jesus Christ with joyous choral hymns, holy communion, and parish thanksgiving across all archdeaconries.",
    attendees: "All Parishioners & Visitors",
    featured: true,
    category: "service",
    image: "/03.jpg"
  },
  {
    id: 4,
    title: "Christmas Eve & Carols by Candlelight",
    date: "December 24",
    time: "6:30 PM",
    location: "St. Peter's Cathedral, Shyogwe",
    description: "Traditional festival of nine lessons and carols celebrating the birth of Jesus Christ, featuring diocesan choir performances and scripture readings in Kinyarwanda and English.",
    attendees: "All Families & Visitors",
    featured: false,
    category: "service"
  },
  {
    id: 5,
    title: "Mothers' Union Fellowship & Training Conference",
    date: "Monthly Diocesan Program",
    time: "2:00 PM - 5:00 PM",
    location: "Muhanga Center & Parish Halls",
    description: "Monthly fellowship and capacity-building workshops for Christian women, focusing on family welfare, early childhood support, literacy, and community savings groups.",
    attendees: "Mothers' Union & Women Leaders",
    featured: false,
    category: "program",
    is_recurring: true,
    recurrence_pattern: "Monthly"
  },
  {
    id: 6,
    title: "Diocesan Youth Fellowship & Leadership Summit",
    date: "Every Friday & Youth Gatherings",
    time: "5:00 PM - 7:00 PM",
    location: "Diocesan Youth Center, Shyogwe",
    description: "Weekly scripture study, praise and worship, discipleship mentorship, and career guidance for secondary and university youth across Shyogwe Diocese.",
    attendees: "Youth & Young Adults (14-30)",
    featured: false,
    category: "fellowship",
    is_recurring: true,
    recurrence_pattern: "Weekly"
  },
  {
    id: 7,
    title: "Boys' and Girls' Brigade Parade & Skills Day",
    date: "First Saturday of Month",
    time: "8:30 AM - 12:00 PM",
    location: "Parish Grounds & Schools",
    description: "Christian youth development program promoting physical discipline, community service, biblical foundations, and citizenship skills.",
    attendees: "Brigade Members & Children",
    featured: false,
    category: "program",
    is_recurring: true,
    recurrence_pattern: "Monthly"
  },
  {
    id: 8,
    title: "Confirmation & Baptism Preparation Classes",
    date: "Every Saturday Morning",
    time: "10:00 AM - 12:00 PM",
    location: "Cathedral & Parish Classrooms",
    description: "Instruction in Anglican catechism, Scripture, baptismal vows, and Christian commitment in preparation for episcopal confirmation services.",
    attendees: "Confirmation Candidates",
    featured: false,
    category: "fellowship",
    is_recurring: true,
    recurrence_pattern: "Weekly"
  },
  {
    id: 9,
    title: "Pastors & Spouses Pastoral Retreat",
    date: "Diocesan Ministerial Retreat",
    time: "Full Day Sessions",
    location: "Diocesan Pastoral Center",
    description: "Spiritual renewal, pastoral reflection, and marriage enrichment retreat for pastors and their spouses serving in parishes and institutions.",
    attendees: "Pastors & Spouses",
    featured: false,
    category: "assembly"
  }
];

const categoryLabels: Record<string, string> = {
  all: "All Gatherings",
  service: "Special Services",
  fellowship: "Fellowship & Study",
  program: "Diocesan Programs",
  assembly: "Synod & Assemblies"
};

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchEventsAndPrograms = async () => {
      try {
        setLoading(true);
        const [eventsRes, programsRes] = await Promise.all([
          fetch(apiUrls.events()).catch(() => null),
          fetch(apiUrls.programs()).catch(() => null)
        ]);

        const eventsData = eventsRes && eventsRes.ok ? await eventsRes.json() : null;
        const programsData = programsRes && programsRes.ok ? await programsRes.json() : null;

        const liveEvents: EventItem[] = [];

        if (eventsData && eventsData.success && Array.isArray(eventsData.data) && eventsData.data.length > 0) {
          eventsData.data.forEach((e: any) => {
            liveEvents.push({
              id: e.id,
              title: e.title,
              date: e.date || "Scheduled Date",
              time: e.time || "Scheduled Time",
              location: e.location || "Shyogwe Diocese",
              description: e.description || "",
              attendees: e.attendees || "All Welcome",
              featured: !!e.featured,
              category: "service",
              image: e.image || undefined,
              is_recurring: !!e.is_recurring,
              recurrence_pattern: e.recurrence_pattern
            });
          });
        }

        if (programsData && programsData.success && Array.isArray(programsData.data) && programsData.data.length > 0) {
          programsData.data.forEach((p: any) => {
            liveEvents.push({
              id: `program-${p.id}`,
              title: p.title,
              date: p.start_date ? new Date(p.start_date).toLocaleDateString() : (p.recurrence_pattern ? `${p.recurrence_pattern} Program` : "Regular Program"),
              time: p.recurrence_pattern === "monthly" ? "Monthly Gathering" : "Weekly Gathering",
              location: p.location || "Parish Grounds",
              description: p.description || "",
              attendees: p.attendees || "Community Members",
              featured: false,
              category: "program",
              is_recurring: !!p.recurrence_pattern,
              recurrence_pattern: p.recurrence_pattern
            });
          });
        }

        if (!cancelled) {
          // Merge API items with our authentic diocesan events so calendar is always full and rich
          if (liveEvents.length > 0) {
            setEvents([...liveEvents, ...authenticEvents.filter(a => !liveEvents.some(l => l.title.toLowerCase() === a.title.toLowerCase()))]);
          } else {
            setEvents(authenticEvents);
          }
        }
      } catch (err) {
        console.warn("Using authentic events data:", err);
        if (!cancelled) setEvents(authenticEvents);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEventsAndPrograms();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter events by search & category
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category match
      if (activeCategory !== "all" && ev.category !== activeCategory) {
        return false;
      }

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title?.toLowerCase().includes(q);
      const matchLocation = ev.location?.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchAttendees = ev.attendees?.toLowerCase().includes(q);

      return matchTitle || matchLocation || matchDesc || matchAttendees;
    });
  }, [events, activeCategory, searchQuery]);

  // Lead / Featured Event
  const featuredEvent = useMemo(() => {
    return events.find((e) => e.featured) || events[0] || null;
  }, [events]);

  // Remaining events when not searching
  const regularEvents = useMemo(() => {
    if (searchQuery.trim() || activeCategory !== "all") {
      return filteredEvents;
    }
    return filteredEvents.filter((e) => e.id !== featuredEvent?.id);
  }, [filteredEvents, featuredEvent, searchQuery, activeCategory]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    Object.keys(categoryLabels).forEach((cat) => {
      if (cat !== "all") {
        counts[cat] = events.filter((e) => e.category === cat).length;
      }
    });
    return counts;
  }, [events]);

  const handleShare = (event: EventItem) => {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied to clipboard");
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
              alt="Anglican Church of Rwanda Shyogwe Diocese Events"
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
              <span className="text-church-gold">Events & Calendar</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Diocesan Events & Gatherings
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Featured Marquee Event (When In Default View) */}
        {!searchQuery.trim() && activeCategory === "all" && featuredEvent && (
          <section className="py-10 bg-white border-b border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block">
                  Upcoming Highlight
                </span>
              </div>

              <div className="bg-slate-50 rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden bg-slate-900">
                  <img
                    src={featuredEvent.image || "/02.jpg"}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/01.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold text-church-navy bg-church-cream px-3 py-1 rounded-full border border-church-gold/20">
                        Featured Event
                      </span>
                      {featuredEvent.is_recurring && (
                        <span className="text-[11px] text-slate-500 font-semibold bg-white px-2.5 py-0.5 rounded border border-slate-200">
                          {featuredEvent.recurrence_pattern || "Recurring"}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-church-navy group-hover:text-church-gold transition-colors leading-snug mb-4">
                      {featuredEvent.title}
                    </h2>

                    <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 mb-5">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-church-gold shrink-0" />
                        <span className="font-semibold text-church-navy">{featuredEvent.date}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{featuredEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{featuredEvent.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{featuredEvent.attendees}</span>
                      </div>
                    </div>

                    {featuredEvent.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                        {featuredEvent.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEvent(featuredEvent)}
                      className="px-4 py-2 rounded-xl bg-church-navy text-white text-xs font-bold hover:bg-church-navy/90 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>View Event Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleShare(featuredEvent)}
                      title="Share Event"
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-church-navy hover:bg-slate-100 transition-colors"
                      aria-label="Share event"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Directory & Event Grid Section */}
        <section className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            
            {/* Header and Live Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                  Calendar Schedule
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                  Browse Diocesan Gatherings
                </h2>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by event, location, or audience..."
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
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const count = categoryCounts[key] || 0;
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? "bg-church-navy text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-church-navy"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-3 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading diocesan calendar...</p>
              </div>
            ) : regularEvents.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-xl mx-auto">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-church-navy mb-1">No gatherings match your search</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Try checking another category or clearing your search keywords.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="text-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="text-[11px] font-bold text-church-navy bg-church-cream/70 px-2.5 py-1 rounded-md border border-church-gold/20">
                          {event.category ? categoryLabels[event.category] : "Church Event"}
                        </span>
                        {event.is_recurring && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {event.recurrence_pattern || "Recurring"}
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3 className="text-lg font-serif font-bold text-church-navy group-hover:text-church-gold transition-colors mb-3 leading-snug">
                        {event.title}
                      </h3>

                      {/* Meta Details */}
                      <div className="space-y-2 text-xs text-slate-600 mb-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 font-semibold text-church-navy">
                          <Calendar className="h-3.5 w-3.5 text-church-gold shrink-0" />
                          <span className="truncate">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.attendees}</span>
                        </div>
                      </div>

                      {/* Description Snippet */}
                      {event.description && (
                        <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-xs font-bold text-church-navy hover:text-church-gold flex items-center gap-1.5 transition-colors group/btn"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => handleShare(event)}
                        title="Share Gathering"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-church-navy hover:bg-slate-100 transition-colors"
                        aria-label="Share gathering link"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div 
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-church-navy bg-church-cream px-3 py-1 rounded-full border border-church-gold/20">
                  {selectedEvent.category ? categoryLabels[selectedEvent.category] : "Diocesan Event"}
                </span>
                {selectedEvent.is_recurring && (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {selectedEvent.recurrence_pattern || "Recurring"}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-serif font-bold text-church-navy mb-4">
                {selectedEvent.title}
              </h3>

              {/* Event Metadata Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-church-gold shrink-0" />
                  <span className="font-semibold text-church-navy">{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-church-gold shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-church-gold shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-church-gold shrink-0" />
                  <span>Intended Audience: {selectedEvent.attendees}</span>
                </div>
              </div>

              {/* Event Description */}
              {selectedEvent.description && (
                <div className="mb-6">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                    About This Gathering
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-600 text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-church-navy hover:bg-church-navy/90 text-white text-xs"
                  onClick={() => {
                    setSelectedEvent(null);
                    navigate("/contact");
                  }}
                >
                  Contact Diocesan Office
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Announcements & Parish Submissions Callout */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="bg-gradient-to-r from-church-navy via-slate-900 to-church-navy rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
                  Parish Announcements
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                  Have an Event or Gathering to Announce?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Pastors, archdeaconry leaders, and ministry coordinators can submit parish announcements and event details to the Diocesan Secretariat for inclusion in the official calendar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-church-gold text-church-navy font-bold text-xs uppercase tracking-wider hover:bg-church-gold-hover transition-colors shadow-md text-center"
                >
                  Submit Announcement
                </Link>
                <Link
                  to="/services"
                  className="px-6 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors text-center"
                >
                  Worship Schedules
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