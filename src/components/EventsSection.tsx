import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { apiUrls } from '@/config/api';
import { format, parseISO } from 'date-fns';

interface Event {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: string;
  featured: boolean;
  status?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  image?: string;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [programs, setPrograms] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format dates nicely
  const formatEventDate = (dateString: string): string => {
    try {
      // Try to parse as ISO date
      const date = parseISO(dateString);
      return format(date, 'MMMM d, yyyy'); // e.g., "October 22, 2025"
    } catch (error) {
      // If it's not a valid ISO date, return as-is (e.g., "Every Saturday")
      return dateString;
    }
  };

  // Helper function to format time
  const formatEventTime = (timeString: string): string => {
    try {
      // If it's in HH:mm:ss format, convert to 12-hour format
      if (timeString && timeString.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  // Fetch events and programs from the backend, merge them for display
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [eventsRes, programsRes] = await Promise.all([
          fetch(apiUrls.events()),
          fetch(apiUrls.programs())
        ]);

        const eventsData = eventsRes.ok ? await eventsRes.json() : null;
        const programsData = programsRes.ok ? await programsRes.json() : null;

        // Helper to map program -> Event shape
        const mapProgramToEvent = (p: any): Event => ({
          id: p.id,
          title: p.title || 'Untitled Program',
          date: p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Ongoing',
          time: p.recurrence_pattern === 'monthly' ? 'Monthly' :
                p.recurrence_pattern === 'weekly' ? 'Weekly' :
                'Regular',
          location: p.location || 'TBD',
          description: p.description || '',
          attendees: p.attendees || 'All Welcome',
          featured: false, // Force programs to appear in regular events section
          status: 'program',
          is_recurring: !!p.recurrence_pattern,
          recurrence_pattern: p.recurrence_pattern || ''
        });

        if (eventsData && eventsData.success && Array.isArray(eventsData.data) && eventsData.data.length > 0) {
          const transformedEvents: Event[] = eventsData.data
            .filter((event: any) => event.status === 'published' || event.status === 'upcoming' || !event.status)
            .map((event: any) => ({
              id: event.id,
              title: event.title,
              date: event.date || 'TBD',
              time: event.time || 'TBD',
              location: event.location || 'TBD',
              description: event.description || '',
              attendees: event.attendees || 'All Welcome',
              featured: !!event.featured,
              status: event.status || 'upcoming',
              is_recurring: !!event.is_recurring,
              recurrence_pattern: event.recurrence_pattern || '',
              image: event.image || ''
            }));

          const programItems: Event[] = (programsData && programsData.success && Array.isArray(programsData.data))
            ? programsData.data.map(mapProgramToEvent)
            : [];

          setEvents([...transformedEvents, ...programItems]);
        } else {
          // No events, just set empty array
          setEvents([]);
        }

        // Always process programs separately
        if (programsData && programsData.success && Array.isArray(programsData.data) && programsData.data.length > 0) {
          setPrograms(programsData.data.map(mapProgramToEvent));
        } else {
          setPrograms([]);
        }

        // If no events and no programs, use static events only
        if ((!eventsData || !eventsData.success || !eventsData.data || eventsData.data.length === 0) &&
            (!programsData || !programsData.success || !programsData.data || programsData.data.length === 0)) {
          setEvents(staticEvents);
          setPrograms([]);
        }
      } catch (error) {
        // Only log in development if not a network error
        if (import.meta.env.DEV && !(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
          console.error('Failed to fetch events/programs, using static data:', error);
        }
        setEvents(staticEvents);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Static fallback events data - Updated for Anglican Church of Rwanda, Shyogwe Diocese
  const staticEvents = [
    {
      title: "Christmas Carol Service",
      date: "December 24, 2024",
      time: "7:00 PM",
      location: "Shyogwe Cathedral",
      description: "Join us for a beautiful evening of traditional Christmas carols and readings in both English and Kinyarwanda. A celebration of Christ's birth for all families.",
      attendees: "All Welcome",
      featured: true
    },
    {
      title: "New Year Prayer Service",
      date: "January 1, 2025",
      time: "10:00 AM",
      location: "Shyogwe Cathedral",
      description: "Begin the new year with prayer, reflection, and hope. A peaceful service to set intentions for the year ahead in God's grace.",
      attendees: "All Welcome",
      featured: true
    },
    {
      title: "Easter Sunday Celebration",
      date: "April 20, 2025",
      time: "9:00 AM",
      location: "Shyogwe Cathedral",
      description: "Celebrate the resurrection of Jesus Christ with our special Easter Sunday service. Join us for this joyous celebration of our Lord's victory over death.",
      attendees: "All Welcome",
      featured: true
    },
    {
      title: "Youth Fellowship Meeting",
      date: "Every Friday",
      time: "7:00 PM",
      location: "Parish Hall",
      description: "Weekly gathering for young people featuring Bible study, discussion, and fellowship. Building strong Christian foundations for our youth.",
      attendees: "Youth (13-25)",
      featured: false
    },
    {
      title: "Community Outreach Lunch",
      date: "First Sunday of Month",
      time: "12:30 PM",
      location: "Parish Hall",
      description: "Free community lunch open to all. A ministry of love and fellowship, bringing together our church family and neighbors.",
      attendees: "All Welcome",
      featured: false
    },
    {
      title: "Women's Bible Study",
      date: "Second Thursday",
      time: "2:00 PM",
      location: "Church Library",
      description: "Monthly Bible study and fellowship for women. Currently studying the book of Proverbs and its wisdom for daily Christian living.",
      attendees: "Women's Ministry",
      featured: false
    },
    {
      title: "Men's Prayer Breakfast",
      date: "Third Saturday",
      time: "8:00 AM",
      location: "Parish Hall",
      description: "Monthly fellowship breakfast with prayer, Bible study, and discussion. Strengthening our men in faith and Christian leadership.",
      attendees: "Men's Ministry",
      featured: false
    },
    {
      title: "Confirmation Classes",
      date: "Every Saturday",
      time: "10:00 AM",
      location: "Classroom 1",
      description: "Preparation classes for young people seeking confirmation in the Anglican faith. Learning the foundations of our Christian beliefs.",
      attendees: "Youth (14+)",
      featured: false
    }
  ];


  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const featuredEvents = events.filter(event => event.featured);
  const allRegularEvents = events.filter(event => !event.featured);

  // Separate programs and regular events, prioritize programs
  const programEvents = allRegularEvents.filter(event => event.status === 'program');
  const otherRegularEvents = allRegularEvents.filter(event => event.status !== 'program');
  const regularEvents = [...programEvents, ...otherRegularEvents];



  return (
    <section id="events" className="py-20 bg-gradient-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
            Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join us for special services, community gatherings, and fellowship opportunities
            throughout the year at the Anglican Church of Rwanda, Shyogwe Diocese!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Featured Events */}
            {featuredEvents.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Featured Events</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredEvents.map((event, index) => {
                const slug = slugify(event.title);
                return (
                  <Card key={index} className="shadow-medium border-church-red/20 bg-gradient-to-br from-background to-church-red/5">
                    {event.image && (
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl text-foreground flex items-center">
                        <Calendar className="h-6 w-6 text-church-red mr-3" />
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-3" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-3" />
                          <span>{formatEventTime(event.time)}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-3" />
                          <span>{event.attendees}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {event.description}
                      </p>
                      <Link to={`/events/${slug}`} state={event} className="block">
                        <Button variant="red" className="w-full">
                          Learn More
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Events */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Regular Programs</h3>

          {/* Show programs first if available */}
          {programs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {programs.map((program, index) => (
                <Card key={`program-${index}`} className="shadow-soft hover:shadow-medium transition-shadow border-l-4 border-l-church-red">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-foreground">{program.title}</CardTitle>
                    <div className="text-xs text-church-red font-medium">PROGRAM</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>{formatEventDate(program.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-2" />
                        <span>{formatEventTime(program.time)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-2" />
                        <span>{program.location}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {program.description}
                    </p>
                    <div className="text-xs text-church-red font-medium">
                      {program.attendees}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Show regular events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularEvents.filter(event => event.status !== 'program').map((event, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                {event.image && (
                  <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-foreground">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-2" />
                      <span>{formatEventTime(event.time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="text-xs text-church-red font-medium">
                    {event.attendees}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </>
        )}

        {/* Stay Connected section removed as requested */}
      </div>
    </section>
  );
};

export default EventsSection;