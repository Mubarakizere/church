import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MobileSundayServices = () => {
  const services = [
    {
      title: "English Service",
      time: "6:30 AM - 8:30 AM",
      type: "Holy Communion in English"
    },
    {
      title: "Kinyarwanda Service",
      time: "9:00 AM - 12:00 PM",
      type: "Holy Communion in Kinyarwanda"
    },
    {
      title: "Mixed Service",
      time: "3:30 PM - 5:30 PM",
      type: "Bilingual Worship"
    }
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-bold text-church-red mb-4 text-center">
          Sunday Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-foreground mb-2">{service.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{service.type}</p>
                  <div className="flex items-center justify-center text-church-red">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{service.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileSundayServices;