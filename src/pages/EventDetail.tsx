import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  ChevronRight, 
  Share2, 
  Mail,
  Church
} from "lucide-react";
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
  featured?: boolean;
  image?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export default function EventDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateEvent = (location.state as EventItem) ?? null;
  const [event, setEvent] = useState<EventItem | null>(stateEvent);
  const [loading, setLoading] = useState(!stateEvent);

  useEffect(() => {
    if (stateEvent) {
      setEvent(stateEvent);
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const res = await fetch(`${apiUrls.events()}/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setEvent({
              id: data.data.id,
              title: data.data.title,
              date: data.data.date || "Scheduled Date",
              time: data.data.time || "Scheduled Time",
              location: data.data.location || "Shyogwe Diocese",
              description: data.data.description || "",
              attendees: data.data.attendees || "All Welcome",
              image: data.data.image,
              is_recurring: data.data.is_recurring,
              recurrence_pattern: data.data.recurrence_pattern
            });
          }
        }
      } catch (err) {
        console.warn("Could not load event from API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, stateEvent]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Event link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner */}
        <section className="relative h-44 sm:h-52 md:h-60 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt={event?.title || "Diocesan Gathering"}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/85 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link to="/events" className="hover:text-church-gold transition-colors">
                Events
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Gathering Details</span>
            </nav>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-white mb-1 line-clamp-1 max-w-3xl mx-auto">
              {event?.title || "Diocesan Event"}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-church-navy transition-colors py-1 px-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Events Calendar</span>
              </Link>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-3 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading gathering details...</p>
              </div>
            ) : event ? (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-church-navy bg-church-cream px-3 py-1 rounded-full border border-church-gold/20">
                    Diocesan Gathering
                  </span>
                  {event.is_recurring && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {event.recurrence_pattern || "Recurring"}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-church-navy leading-tight mb-6">
                  {event.title}
                </h2>

                {event.image && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-auto max-h-[450px] object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/01.jpg";
                      }}
                    />
                  </div>
                )}

                {/* Event Metadata Card */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-church-gold shrink-0" />
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">Date</span>
                      <span className="font-bold text-church-navy">{event.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-church-gold shrink-0" />
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">Time</span>
                      <span className="font-semibold text-slate-700">{event.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-church-gold shrink-0" />
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">Location</span>
                      <span className="font-semibold text-slate-700">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-church-gold shrink-0" />
                    <div>
                      <span className="block text-[11px] uppercase font-bold text-slate-400">Intended Audience</span>
                      <span className="font-semibold text-slate-700">{event.attendees}</span>
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                {event.description && (
                  <div className="mb-8">
                    <h3 className="text-base font-serif font-bold text-church-navy mb-3">
                      Event Overview & Details
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Share and Action Controls */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5 text-church-gold" />
                    <span>Share Event Link</span>
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/events")}
                      className="text-xs text-slate-600"
                    >
                      All Events
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate("/contact")}
                      className="bg-church-navy hover:bg-church-navy/90 text-white text-xs"
                    >
                      Contact Secretariat
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-church-navy mb-2">Event Not Found</h3>
                <p className="text-xs text-slate-500 mb-6">
                  The event details may have expired or been rescheduled.
                </p>
                <Button
                  onClick={() => navigate("/events")}
                  className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-bold"
                >
                  Return to Events Calendar
                </Button>
              </div>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
