import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EventEditor from "@/components/admin/EventEditor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  featured: boolean;
  attendees: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

const AdminEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events from API...');
        const response = await fetch(apiUrls.events());
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          if (data.success && data.data) {
            console.log('Setting events:', data.data);
            setEvents(data.data);
          } else {
            console.error('Invalid API response structure:', data);
            throw new Error('Invalid API response structure');
          }
        } else {
          const errorText = await response.text();
          console.error('HTTP Error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast({ 
          title: "Error", 
          description: `Failed to load events: ${error.message}`, 
          variant: "destructive" 
        });
        // Fallback to empty array
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const handleSaveEvent = async (eventData: Event) => {
    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (editingEvent) {
        // Update existing event
        response = await fetch(`${apiUrls.events()}/${eventData.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(eventData),
        });
      } else {
        // Create new event
        response = await fetch(apiUrls.events(), {
          method: 'POST',
          headers,
          body: JSON.stringify(eventData),
        });
      }

      // Check if response is OK
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (editingEvent) {
            setEvents(events.map(e => e.id === eventData.id ? result.data : e));
            toast({ title: "Event updated successfully!" });
          } else {
            setEvents([...events, result.data]);
            toast({ title: "Event created successfully!" });
          }
          setEditingEvent(null);
          setIsEventEditorOpen(false);
        } else {
          throw new Error(result.message || 'Failed to save event');
        }
      } else {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e) {
            // If we can't get text, use default message
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save event: " + (error.message || error.toString()), 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`${apiUrls.events()}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId));
        toast({ title: "Event deleted successfully!" });
      } else {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e) {
            // If we can't get text, use default message
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete event: " + (error.message || error.toString()), 
        variant: "destructive" 
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventEditorOpen(true);
  };

  const handleViewEvent = (eventId: number) => {
    // Navigate to public event view
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-section">
      <EventEditor 
        event={editingEvent as any}
        isOpen={isEventEditorOpen}
        onClose={() => {
          setIsEventEditorOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />
      
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events Management</h1>
            <p className="text-sm text-muted-foreground">Create and manage church events</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="elegant" onClick={() => setIsEventEditorOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-church-red mr-3" />
                <span className="text-muted-foreground">Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first event.</p>
                <Button onClick={() => setIsEventEditorOpen(true)} className="bg-church-red hover:bg-church-red/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      {event.image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.date && /^\d{4}-\d{2}-\d{2}/.test(event.date) 
                            ? format(new Date(event.date), 'MMM d, yyyy')
                            : event.date} 
                          {event.time && ` at ${event.time}`}
                        </p>
                        {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
                        <p className="text-xs text-muted-foreground mt-1 max-w-xl line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      {event.featured && (
                        <Badge variant="outline" className="text-church-red border-church-red">
                          Featured
                        </Badge>
                      )}
                      <div className="inline-flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewEvent(event.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEvents;