import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  featured: boolean;
  attendees: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface EventEditorProps {
  event?: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Event) => void;
}

const EventEditor = ({ event, isOpen, onClose, onSave }: EventEditorProps) => {
  const [title, setTitle] = useState(event?.title || "");
  const [date, setDate] = useState(event?.date || "");
  const [time, setTime] = useState(event?.time || "");
  const [location, setLocation] = useState(event?.location || "");
  const [description, setDescription] = useState(event?.description || "");
  const [status, setStatus] = useState(event?.status || "draft");
  const [featured, setFeatured] = useState(event?.featured || false);
  const [attendees, setAttendees] = useState(event?.attendees || "All Welcome");
  const [isRecurring, setIsRecurring] = useState(event?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(event?.recurrence_pattern || "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [image, setImage] = useState(event?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Parse the date string when the component loads or event changes
  useEffect(() => {
    // Reset all fields when event changes
    if (event) {
      setTitle(event.title || "");
      setDate(event.date || "");
      setTime(event.time || "");
      setLocation(event.location || "");
      setDescription(event.description || "");
      setStatus(event.status || "draft");
      setFeatured(event.featured || false);
      setAttendees(event.attendees || "All Welcome");
      setIsRecurring(event.is_recurring || false);
      setRecurrencePattern(event.recurrence_pattern || "");
      setImage(event.image || "");
      setImageFile(null);
    } else {
      // Reset to defaults when creating new event
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDescription("");
      setStatus("draft");
      setFeatured(false);
      setAttendees("All Welcome");
      setIsRecurring(false);
      setRecurrencePattern("");
      setImage("");
      setImageFile(null);
      setSelectedDate(undefined);
    }

    if (event?.date) {
      try {
        // Try to parse the date from various formats
        let parsedDate;
        
        // Check if it's already in ISO format (from API)
        if (/^\d{4}-\d{2}-\d{2}/.test(event.date)) {
          parsedDate = new Date(event.date);
        } 
        // Check if it's in format like "Dec 24, 2023" or "Dec 24"
        else {
          const currentYear = new Date().getFullYear();
          const dateWithYear = event.date.includes(currentYear.toString()) 
            ? event.date 
            : `${event.date}, ${currentYear}`;
          
          try {
            parsedDate = parse(dateWithYear, 'MMM d, yyyy', new Date());
          } catch (e) {
            try {
              parsedDate = parse(dateWithYear, 'MMMM d, yyyy', new Date());
            } catch (e) {
              // If all parsing fails, default to today
              parsedDate = new Date();
            }
          }
        }
        
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          setDate(format(parsedDate, 'yyyy-MM-dd')); // Store in ISO format for API
        }
      } catch (e) {
        console.error("Error parsing date:", e);
        setDate("");
        setSelectedDate(undefined);
      }
    }
  }, [event]);

  const handleSave = () => {
    const eventData: Event = {
      id: event?.id || Date.now(),
      title,
      date, // This is now in YYYY-MM-DD format for the API
      time,
      location,
      description,
      status,
      featured,
      attendees,
      is_recurring: isRecurring,
      recurrence_pattern: recurrencePattern,
      image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onSave(eventData);
  };
  
  // Update the date string when the calendar date changes
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setSelectedDate(selectedDate);
    if (selectedDate) {
      setDate(format(selectedDate, 'yyyy-MM-dd')); // Store in ISO format for API
    } else {
      setDate("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Select time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <Input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Enter attendees"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="featured">Featured Event</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="isRecurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="isRecurring">Recurring Event</Label>
          </div>
          
          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
              <Input
                id="recurrencePattern"
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value)}
                placeholder="Enter recurrence pattern (e.g., weekly, monthly)"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image">Event Image</Label>
            <div className="space-y-2">
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Create a preview URL for immediate display
                    const previewUrl = URL.createObjectURL(file);
                    setImage(previewUrl);
                    setImageFile(file);
                  }
                }}
                className="cursor-pointer"
              />
              {/* URL input as fallback */}
              <Input
                id="image-url"
                value={typeof image === 'string' && !image?.startsWith('blob:') ? image : ''}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or enter image URL manually"
              />
            </div>
            {image && (
              <div className="mt-2">
                <img 
                  src={image} 
                  alt="Event preview" 
                  className="w-32 h-32 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {imageFile ? 'New file selected' : 'Current image'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="elegant" onClick={handleSave}>
              {event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventEditor;