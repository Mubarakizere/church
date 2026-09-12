import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Music, Book, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrls } from "@/config/api";

interface Service {
  id: string;
  title: string;
  time: string;
  type: string;
  description: string;
  features: string[];
  language: string;
}

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback data in case API fails
  const fallbackServices = [
    {
      id: "1",
      title: "Sunday Morning Service",
      time: "9:00 AM",
      type: "Holy Communion",
      description: "Traditional Anglican service with choir, organ, and full liturgy. Perfect for families and those who appreciate formal worship.",
      features: ["Holy Communion", "Choir & Organ", "Children's Ministry", "Coffee Fellowship"],
      language: "English"
    },
    {
      id: "2",
      title: "Sunday Evening Service",
      time: "6:00 PM", 
      type: "Evening Prayer",
      description: "A more intimate service focused on prayer, reflection, and contemporary worship. Great for busy families and young adults.",
      features: ["Contemporary Music", "Interactive Prayer", "Sermon Discussion", "Light Refreshments"],
      language: "English"
    },
    {
      id: "3",
      title: "Wednesday Bible Study",
      time: "7:00 PM",
      type: "Teaching & Fellowship",
      description: "Weekly Bible study and discussion group. All ages welcome. Currently studying the Gospel of John.",
      features: ["Scripture Study", "Group Discussion", "Prayer Time", "Childcare Available"],
      language: "English"
    },
    {
      id: "4",
      title: "Special Services",
      time: "Various",
      type: "Seasonal & Holidays",
      description: "Christmas, Easter, baptisms, confirmations, weddings, and other special occasions throughout the year.",
      features: ["Christmas Eve", "Easter Vigil", "Baptisms", "Confirmations"],
      language: "English"
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrls.services());
        
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the API response data
        if (data) {
          // Check if data is in data.data format or direct array format
          const serviceArray = Array.isArray(data) ? data : 
                              (data.data && Array.isArray(data.data)) ? data.data : 
                              [];
          
          if (serviceArray.length > 0) {
            // Map the API response to match our Service interface
            const processedServices = serviceArray.map(service => ({
              id: service.id.toString(),
              title: service.title || '',
              time: service.time || '',
              type: service.type || '',
              description: service.description || '',
              features: service.features ? 
                (typeof service.features === 'string' ? 
                  JSON.parse(service.features) : service.features) : [],
              language: service.language || 'English'
            }));
            
            setServices(processedServices);
            setError(null);
          } else {
            console.warn("No services data found in API response, using fallback data");
            setServices(fallbackServices);
            setError("No services found in the database. Showing default services instead.");
          }
        } else {
          console.warn("Invalid API response format, using fallback data");
          setServices(fallbackServices);
          setError("Unable to load services from the database. Showing default services instead.");
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Unable to load services from the database. Showing default services instead.");
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
            Worship Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join us for meaningful worship that honors God and nurtures our community. 
            Whether you prefer traditional or contemporary styles, there's a place for you here.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-church-red animate-spin" />
            <span className="ml-3 text-lg">Loading services...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl text-foreground">{service.title}</CardTitle>
                    <div className="flex items-center text-church-red">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-semibold">{service.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Music className="h-4 w-4 mr-2" />
                    <span className="text-sm">{service.type}</span>
                  </div>
                  {service.language && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Language: {service.language}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-church-red rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-accent rounded-2xl p-8 md:p-12 text-center">
          <Users className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">First Time Visiting?</h3>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            We'd love to welcome you! No need to dress up or bring anything special. 
            Come as you are, and we'll help you feel at home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center text-white">
              <Book className="h-5 w-5 mr-2" />
              <span>Prayer books provided</span>
            </div>
            <div className="flex items-center text-white">
              <Users className="h-5 w-5 mr-2" />
              <span>Greeters at the door</span>
            </div>
            <div className="flex items-center text-white">
              <Clock className="h-5 w-5 mr-2" />
              <span>Services start on time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;