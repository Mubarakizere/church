import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrls } from '@/config/api';
import { format, parseISO } from 'date-fns';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<Array<any>>([]);

  // Helper to format dates for the ticker
  const formatTickerDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM d, yyyy'); // e.g., "October 22, 2025"
    } catch (error) {
      return dateString; // Return as-is if not parseable
    }
  };

  // Helper to format time for the ticker
  const formatTickerTime = (timeString: string): string => {
    try {
      if (timeString && timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchFeatured = async () => {
      try {
        const res = await fetch(apiUrls.events());
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        const items = (data.data || []).filter((e: any) => !!e.featured).map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time,
          description: e.description,
        }));
        if (!cancelled) setFeaturedEvents(items);
      } catch (err) {
        // Only log in development if not a network error
        if (import.meta.env.DEV && !(err instanceof TypeError && err.message.includes('Failed to fetch'))) {
          console.error('Header: failed to fetch featured events', err);
        }
        // keep fallback static messages on error
      }
    };

    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Upcoming Event Banner */}
      <div className="bg-church-red text-white py-2 overflow-hidden fixed top-0 w-full z-50">
        <div className="animate-slide-in-right">
          <div className="whitespace-nowrap">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((evt) => (
                <span key={evt.id} className="inline-block px-8">
                  {`🎪 ${evt.title} - ${formatTickerDate(evt.date)}${evt.time ? ` at ${formatTickerTime(evt.time)}` : ''}${evt.description ? ` | ${evt.description}` : ''}`}
                </span>
              ))
            ) : (
              <>
                <span className="inline-block px-8">
                  🎄 Christmas Carol Service - December 24th at 7:00 PM | Join us for a beautiful evening of worship
                </span>
                <span className="inline-block px-8">
                  ✨ New Year Prayer Service - January 1st at 10:00 AM | Start the year with God's blessing
                </span>
                <span className="inline-block px-8">
                  👥 Youth Group Meeting - Every Friday at 6:00 PM | All teens welcome
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <header className="bg-background/95 backdrop-blur-sm shadow-soft sticky top-8 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src="/logo for chuch.jpg"
                  alt="Anglican Church of Rwanda, Shyogwe Diocese Logo"
                  className="w-14 h-16 object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-church-red">ANGLICAN CHURCH OF RWANDA, SHYOGWE DIOCESE</h1>
                <p className="text-sm text-muted-foreground">Faithful • Welcoming • Growing</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-foreground hover:text-church-red transition-colors">Home</a>
              <a href="/about" className="text-foreground hover:text-church-red transition-colors">About</a>
              <a href="/team" className="text-foreground hover:text-church-red transition-colors">Team</a>
              <a href="/services" className="text-foreground hover:text-church-red transition-colors">Services</a>
              <a href="/projects" className="text-foreground hover:text-church-red transition-colors">Projects</a>
              <a href="/events" className="text-foreground hover:text-church-red transition-colors">Events</a>
              <a href="/news" className="text-foreground hover:text-church-red transition-colors">News</a>
              <a href="/gallery" className="text-foreground hover:text-church-red transition-colors">Gallery</a>
              <a href="/documents" className="text-foreground hover:text-church-red transition-colors">Documents</a>
              <a href="/donate" className="text-foreground hover:text-church-red transition-colors">Donate</a>
              <a href="/contact" className="text-foreground hover:text-church-red transition-colors">Contact</a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
              <div className="flex flex-col space-y-4">
                <a href="/" className="text-foreground hover:text-church-red transition-colors">Home</a>
                <a href="/about" className="text-foreground hover:text-church-red transition-colors">About</a>
                <a href="/team" className="text-foreground hover:text-church-red transition-colors">Team</a>
                <a href="/services" className="text-foreground hover:text-church-red transition-colors">Services</a>
                <a href="/projects" className="text-foreground hover:text-church-red transition-colors">Projects</a>
                <a href="/events" className="text-foreground hover:text-church-red transition-colors">Events</a>
                <a href="/news" className="text-foreground hover:text-church-red transition-colors">News</a>
                <a href="/gallery" className="text-foreground hover:text-church-red transition-colors">Gallery</a>
                <a href="/documents" className="text-foreground hover:text-church-red transition-colors">Documents</a>
                <a href="/donate" className="text-foreground hover:text-church-red transition-colors">Donate</a>
                <a href="/contact" className="text-foreground hover:text-church-red transition-colors">Contact</a>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;