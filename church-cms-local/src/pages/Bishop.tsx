import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Mail, Phone, Award, Book, Heart, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrls } from "@/config/api";

interface BishopData {
  id: number;
  name: string;
  position: string;
  title: string;
  bio?: string;
  description?: string;
  biography?: string;
  image?: string;
  email?: string;
  phone?: string;
  category: string;
  is_active: boolean;
}

const Bishop = () => {
  const [bishop, setBishop] = useState<BishopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBishop = async () => {
      try {
        // Try to fetch from the teams endpoint with category filter
        const response = await fetch(`${apiUrls.teams()}?category=bishop`);
        if (response.ok) {
          const teamData = await response.json();
          // Find the bishop in the team data
          const bishopData = teamData.find((member: any) => member.category === 'bishop');
          if (bishopData) {
            setBishop(bishopData);
          } else {
            // No bishop found, will use fallback
            setBishop(null);
          }
        } else {
          // API not available, will use fallback data
          setBishop(null);
        }
      } catch (err) {
        // Only log in development if not a network error
        if (import.meta.env.DEV && !(err instanceof TypeError && err.message.includes('Failed to fetch'))) {
          console.error('Error fetching bishop:', err);
        }
        // Use fallback data on error
        setBishop(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBishop();
  }, []);

  // Default fallback data if API fails
  const defaultBishop = {
    name: "Rt. Rev. Bishop",
    title: "Bishop of Shyogwe Diocese",
    image: "/placeholder.svg",
    email: "bishop@shyogwe.org",
    phone: "+250 788 123 456",
    bio: "Spiritual leader of Shyogwe Diocese, dedicated to serving God and the community with love and compassion.",
    description: "The Bishop provides spiritual leadership and pastoral care to clergy, laity, and institutions, ensuring faithfulness to Scripture and Anglican tradition.",
    biography: "The Rt. Rev. Bishop serves as the spiritual leader of the Anglican Church of Rwanda, Shyogwe Diocese. With deep commitment to the Gospel and Anglican tradition, the Bishop provides pastoral care and leadership to clergy, laity, and institutions across Muhanga, Kamonyi, and surrounding areas.\n\nDedicated to community development and theological education, the Bishop oversees the growth and strengthening of Anglican churches throughout the diocese, ensuring that the love of Christ is shared with all people through worship, fellowship, and service."
  };

  const bishopData = bishop || defaultBishop;
  
  
  const ministryFocus = [
    {
      icon: Heart,
      title: "Pastoral Care",
        description: "Providing spiritual guidance and support to clergy and congregations across the diocese."
      },
      {
        icon: Users,
        title: "Community Development",
        description: "Leading initiatives that improve the lives of people in rural and urban communities."
      },
      {
        icon: Book,
        title: "Theological Education",
        description: "Promoting theological education and training for clergy and lay leaders."
      },
      {
        icon: Award,
        title: "Church Growth",
        description: "Overseeing the expansion and strengthening of Anglican churches throughout the diocese."
      }
    ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-red mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bishop information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-section py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <Card className="shadow-elegant">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="w-64 h-64 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <img 
                        src={bishopData.image || "/placeholder.svg"} 
                        alt={bishopData.name}
                        className="w-60 h-60 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="text-center lg:text-left flex-1">
                      <div className="flex items-center justify-center lg:justify-start mb-4">
                        <Crown className="h-8 w-8 text-church-red mr-3" />
                        <span className="text-church-red font-semibold">{bishopData.title}</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{bishopData.name}</h1>
                      <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        {bishopData.bio || bishopData.description || bishopData.biography || "Spiritual leader, pastor, and servant of the Anglican Church of Rwanda, dedicated to spreading the Gospel and serving our communities with love and compassion."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        {bishopData.email && (
                          <a href={`mailto:${bishopData.email}`}>
                            <Button className="bg-church-red hover:bg-church-red/90">
                              <Mail className="mr-2 h-4 w-4" />
                              Contact Bishop
                            </Button>
                          </a>
                        )}
                        {bishopData.phone && (
                          <a href={`tel:${bishopData.phone}`}>
                            <Button variant="outline" className="border-church-red text-church-red hover:bg-church-red hover:text-white">
                              <Phone className="mr-2 h-4 w-4" />
                              Call Office
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Biography Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-8 text-center">
                Biography
              </h2>
              <Card className="shadow-soft">
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    {(bishopData.biography || bishopData.bio || bishopData.description || "Spiritual leader, pastor, and servant of the Anglican Church of Rwanda, dedicated to spreading the Gospel and serving our communities with love and compassion.").split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Ministry Focus */}
        <section className="py-20 bg-gradient-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
                Ministry Focus
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Key areas of pastoral leadership and diocesan development
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {ministryFocus.map((focus, index) => (
                <Card key={index} className="shadow-soft hover:shadow-elegant transition-all duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                      <focus.icon className="h-8 w-8 text-church-red" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{focus.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {focus.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Bishop;
