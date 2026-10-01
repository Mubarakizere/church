import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Music, Book, Loader2, CheckCircle2 } from "lucide-react";
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

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback data aligned with database records
  const fallbackServices: Service[] = [
    {
      id: "1",
      title: "English Service",
      time: "6:30 AM - 8:30 AM",
      type: "Holy Communion in English",
      description: "Early morning Anglican service conducted entirely in English. Traditional liturgy with Holy Communion, perfect for English-speaking congregation members and visitors.",
      features: ["English Liturgy", "Holy Communion", "Traditional Hymns", "Morning Prayer"],
      language: "English"
    },
    {
      id: "2",
      title: "Kinyarwanda Service",
      time: "9:00 AM - 12:00 PM",
      type: "Holy Communion in Kinyarwanda",
      description: "Main morning service conducted in Kinyarwanda. Full Anglican liturgy with Holy Communion, choral worship, and vibrant community fellowship.",
      features: ["Kinyarwanda Liturgy", "Holy Communion", "Cathedral Choir", "Community Fellowship"],
      language: "Kinyarwanda"
    },
    {
      id: "3",
      title: "Mixed / Bilingual Service",
      time: "3:30 PM - 5:30 PM",
      type: "Bilingual Worship & Fellowship",
      description: "Afternoon service combining both English and Kinyarwanda. A contemporary and traditional worship experience bringing together youths and families.",
      features: ["Bilingual Worship", "Youth & Praise Ministry", "Contemporary & Traditional", "Unity in Fellowship"],
      language: "Bilingual"
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrls.services());
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (list.length > 0) {
            const mapped = list.map((service: any) => ({
              id: service.id.toString(),
              title: service.title || "",
              time: service.time || "",
              type: service.type || "",
              description: service.description || "",
              features: service.features ? 
                (typeof service.features === "string" ? JSON.parse(service.features) : service.features) : [],
              language: service.language || "English"
            }));
            setServices(mapped);
          } else {
            setServices(fallbackServices);
          }
        } else {
          setServices(fallbackServices);
        }
      } catch (err) {
        console.warn("Could not load services, using fallbacks:", err);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-2">
            Worship Life
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-church-navy mb-3">
            Worship Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Join us for liturgical prayer, Scripture reading, preaching, and Holy Communion. 
            All are welcome to worship with us.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 text-church-navy animate-spin" />
            <span className="ml-3 text-sm text-slate-600">Loading services...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-church-gold/60 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      {service.language}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-church-navy bg-church-cream/70 px-2.5 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-church-gold" />
                      {service.time}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-church-navy mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-church-gold mb-3">
                    {service.type}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
                    Highlights
                  </span>
                  <div className="space-y-1.5">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;