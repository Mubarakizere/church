import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLocation, useParams, Link } from "react-router-dom";

const EventDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const event = (location.state as any) ?? null;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {event ? (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-foreground">{event.title}</h1>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    <div><strong>Date:</strong> {event.date}</div>
                    <div><strong>Time:</strong> {event.time}</div>
                    <div><strong>Location:</strong> {event.location}</div>
                    <div><strong>Attendees:</strong> {event.attendees}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link to="/events">
                      <Button variant="outline">Back to Events</Button>
                    </Link>
                    <a href={`mailto:info@shyogwediocese.org?subject=${encodeURIComponent(event.title)}`}>
                      <Button variant="red">Contact Organizer</Button>
                    </a>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">{event.description}</p>

                {/* Additional details placeholder */}
                <div className="bg-gradient-accent rounded-lg p-6 text-church-navy">
                  <h3 className="font-bold mb-2">More Information</h3>
                  <p className="text-sm">Details about registrations, special instructions, or what to bring can go here.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Event not found</h1>
                <p className="text-muted-foreground mb-6">We couldn't find details for the event{slug ? `: ${slug}` : "."}</p>
                <Link to="/events">
                  <Button variant="outline">Back to Events</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetail;
