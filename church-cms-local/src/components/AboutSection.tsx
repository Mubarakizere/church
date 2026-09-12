import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Book, HandHeart } from "lucide-react";

const AboutSection = () => {
  const values = [
    {
      icon: Heart,
      title: "Faith",
      description: "Rooted in the Anglican tradition, we seek to know and follow Christ in all aspects of life."
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in the power of fellowship and supporting one another through life's journey."
    },
    {
      icon: Book,
      title: "Scripture",
      description: "The Word of God guides our worship, teaching, and daily living as we grow in understanding."
    },
    {
      icon: HandHeart,
      title: "Service",
      description: "Called to serve our neighbors and community through acts of love and compassion."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
            About Our Church
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The Anglican Church of Rwanda Shyogwe Diocese (EAR Shyogwe Diocese) is one of the dioceses of the Anglican Church of Rwanda. 
            It is located in the Southern Province of Rwanda, with its headquarters in Muhanga District (Mucyakabiri).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {values.map((value, index) => (
            <Card key={index} className="text-center p-6 shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-background rounded-2xl p-8 md:p-12 shadow-medium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-6">Our History</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Anglican Church of Rwanda, Shyogwe Diocese has been a cornerstone of faith in our communities across Muhanga, Kamonyi, and surrounding areas. 
                Our churches and institutions stand as a testament to the dedication of generations 
                who have worshipped and served within our diocese.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we continue to honor our rich Anglican traditions while embracing new ways to serve God and our communities. 
                Our diverse congregations come together to worship, learn, and grow in faith across the diocese.
              </p>
            </div>
            <div className="bg-church-cream/50 rounded-xl p-8">
              <h4 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h4>
              <blockquote className="text-lg italic text-muted-foreground leading-relaxed border-l-4 border-church-red pl-6">
                "To know Christ and make Him known through worship, fellowship, and service, 
                walking together in faith as we build God's kingdom on earth."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;