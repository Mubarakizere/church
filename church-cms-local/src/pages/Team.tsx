import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Users, Building, Heart, GraduationCap, Home, Wrench, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL, SITE_URL } from "@/config";
import { useState, useEffect } from "react";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  category: 'bishop' | 'archdeacon' | 'department';
  description?: string;
  image?: string;
  email?: string;
  phone?: string;
  region?: string;
  display_order?: number;
  is_active: boolean;
}

const Team = () => {
  const [activeTab, setActiveTab] = useState('leadership');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get ranking priority based on title hierarchy
  const getTitleRanking = (title: string): number => {
    const lowerTitle = title.toLowerCase();
    
    // Human Resource positions (highest priority)
    if (lowerTitle.includes('human') || lowerTitle.includes('hr')) return 1;
    
    // Director/Head positions
    if (lowerTitle.includes('director') || lowerTitle.includes('head')) return 2;
    
    // Manager/Coordinator positions
    if (lowerTitle.includes('manager') || lowerTitle.includes('coordinator')) return 3;
    
    // Officer/Specialist positions
    if (lowerTitle.includes('officer') || lowerTitle.includes('specialist')) return 4;
    
    // Assistant positions
    if (lowerTitle.includes('assistant') || lowerTitle.includes('deputy')) return 5;
    
    // Secretary positions
    if (lowerTitle.includes('secretary')) return 6;
    
    // Default priority
    return 7;
  };

  // Enhanced sorting function that considers both display_order and title hierarchy
  const sortMembersByRanking = (a: TeamMember, b: TeamMember): number => {
    // First, sort by display_order if both have it
    const aOrder = a.display_order || 0;
    const bOrder = b.display_order || 0;
    
    if (aOrder !== 0 && bOrder !== 0) {
      return aOrder - bOrder;
    }
    
    // If display_order is not set, use title hierarchy
    if (aOrder === 0 && bOrder === 0) {
      const aRank = getTitleRanking(a.title);
      const bRank = getTitleRanking(b.title);
      
      if (aRank !== bRank) {
        return aRank - bRank;
      }
      
      // If same ranking, sort alphabetically by name
      return a.name.localeCompare(b.name);
    }
    
    // If one has display_order and other doesn't, prioritize display_order
    return aOrder - bOrder;
  };

  // Fetch team members from database
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/teams`);
        const data = await response.json();
        if (data.success) {
          // Fix image URLs to point to backend server
          const membersWithFixedImages = data.data.map((member: TeamMember) => {
            // Default placeholder if missing
            if (!member.image || member.image === '/placeholder.svg' || member.image === 'placeholder.svg') {
              return { ...member, image: '/placeholder.svg' };
            }

            // Clean and build storage URL via backend route
            let img = member.image;
            if (!img.startsWith('http')) {
              img = img.replace(/^\/+/, '').replace(/\\/g, '/');
              img = apiUrls.storage(img);
            }

            return {
              ...member,
              image: img
            };
          });
          setTeamMembers(membersWithFixedImages);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Filter team members by category and sort by ranking
  const bishop = teamMembers.find(member => member.category === 'bishop');
  const archdeacons = teamMembers
    .filter(member => member.category === 'archdeacon')
    .sort(sortMembersByRanking);
  const departments = teamMembers
    .filter(member => member.category === 'department')
    .sort(sortMembersByRanking);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team members...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper function to get icon for department members
  const getDepartmentIcon = (title: string) => {
    if (title.toLowerCase().includes('education')) return GraduationCap;
    if (title.toLowerCase().includes('family')) return Home;
    if (title.toLowerCase().includes('technical') || title.toLowerCase().includes('technician')) return Wrench;
    if (title.toLowerCase().includes('evangelism')) return Heart;
    if (title.toLowerCase().includes('hr') || title.toLowerCase().includes('human')) return Users;
    return Building; // Default icon
  };

  const tabs = [
    { id: 'leadership', label: 'Leadership', icon: Crown },
    { id: 'archdeacons', label: 'Archdeacons', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-section py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-church-red mb-4">
              Our Leadership Team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Meet the dedicated servants who lead the Anglican Church of Rwanda, Shyogwe Diocese with wisdom, faith, and commitment.
            </p>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-church-red text-white shadow-lg'
                      : 'bg-white text-church-red hover:bg-church-red hover:text-white border border-church-red'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">

            {/* Leadership Tab */}
            {activeTab === 'leadership' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-church-red mb-2">
                    <Crown className="inline-block mr-3 h-7 w-7" />
                    Our Bishop
                  </h2>
                  <p className="text-muted-foreground">Spiritual Leader of Shyogwe Diocese</p>
                </div>

                {bishop ? (
                  <Card className="shadow-elegant hover:shadow-soft transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-56 h-56 bg-gradient-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <img
                            src={bishop.image || '/placeholder.svg'}
                            alt={bishop.name}
                            className="w-[220px] h-[220px] rounded-full object-cover"
                            style={{
                              imageRendering: 'auto',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'translateZ(0)',
                              WebkitTransform: 'translateZ(0)',
                              filter: 'contrast(1.1) saturate(1.1)'
                            }}
                          />
                        </div>
                        <div className="text-center md:text-left flex-1">
                          <h3 className="text-2xl font-bold text-foreground mb-2">{bishop.name}</h3>
                          <p className="text-church-red font-semibold mb-3">{bishop.title}</p>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                            {bishop.description || 'Leading the Anglican Church of Rwanda, Shyogwe Diocese with spiritual wisdom and pastoral care.'}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/bishop">
                              <Button size="sm" variant="default" className="bg-church-red hover:bg-church-red/90">
                                Learn More
                              </Button>
                            </Link>
                            {bishop.email && (
                              <a href={`mailto:${bishop.email}`}>
                                <Button size="sm" variant="outline" className="border-church-red text-church-red hover:bg-church-red hover:text-white">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bishop information available at this time.</p>
                  </div>
                )}
              </div>
            )}

            {/* Archdeacons Tab */}
            {activeTab === 'archdeacons' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-church-red mb-2">
                    <Users className="inline-block mr-3 h-7 w-7" />
                    Archdeacons
                  </h2>
                  <p className="text-muted-foreground">Regional Leaders Serving Our Communities</p>
                </div>

                {archdeacons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {archdeacons.map((archdeacon) => (
                      <Card key={archdeacon.id} className="shadow-soft hover:shadow-elegant transition-all duration-300 hover-scale">
                        <CardContent className="p-4 text-center">
                          <div className="w-44 h-44 bg-gradient-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                            <img
                              src={archdeacon.image || '/placeholder.svg'}
                              alt={archdeacon.name}
                              className="w-[170px] h-[170px] rounded-full object-cover"
                              style={{
                                imageRendering: 'auto',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'translateZ(0)',
                                WebkitTransform: 'translateZ(0)',
                                filter: 'contrast(1.1) saturate(1.1)'
                              }}
                            />
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-1">{archdeacon.name}</h3>
                          <p className="text-church-red font-semibold mb-3 text-sm">{archdeacon.title}</p>
                          <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
                            {archdeacon.description || 'Serving the community with dedication and faith.'}
                          </p>
                          <div className="flex flex-col gap-2">
                            {archdeacon.email && (
                              <a
                                href={`mailto:${archdeacon.email}`}
                                className="inline-flex items-center gap-1 text-church-red hover:text-foreground transition-colors text-xs"
                              >
                                <Mail className="h-3 w-3" />
                                Contact
                              </a>
                            )}
                            {archdeacon.phone && (
                              <a
                                href={`tel:${archdeacon.phone}`}
                                className="inline-flex items-center gap-1 text-church-red hover:text-foreground transition-colors text-xs"
                              >
                                <Phone className="h-3 w-3" />
                                {archdeacon.phone}
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No archdeacons information available at this time.</p>
                  </div>
                )}
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-church-red mb-2">
                    <Building className="inline-block mr-3 h-7 w-7" />
                    Administration & Departments
                  </h2>
                  <p className="text-muted-foreground">Dedicated Staff Serving Our Diocese</p>
                </div>

                {departments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {departments.map((member) => {
                      const IconComponent = getDepartmentIcon(member.title);
                      return (
                        <Card key={member.id} className="shadow-soft hover:shadow-elegant transition-all duration-300 hover-scale">
                          <CardContent className="p-4 text-center">
                            <div className="w-44 h-44 bg-gradient-accent rounded-full mx-auto mb-3 flex items-center justify-center">
                              {member.image && member.image !== '/placeholder.svg' ? (
                                <img
                                  src={member.image}
                                  alt={member.name}
                                  className="w-[170px] h-[170px] rounded-full object-cover"
                                  style={{
                                    imageRendering: 'auto',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: 'translateZ(0)',
                                    WebkitTransform: 'translateZ(0)',
                                    filter: 'contrast(1.1) saturate(1.1)'
                                  }}
                                />
                              ) : (
                                <IconComponent className="h-14 w-14 text-church-red" />
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1">{member.name}</h3>
                            <p className="text-church-red font-semibold mb-2 text-xs">{member.title}</p>
                            <p className="text-muted-foreground mb-3 text-xs leading-relaxed line-clamp-3">
                              {member.description || 'Dedicated to serving the diocese with excellence.'}
                            </p>
                            <div className="flex flex-col gap-1">
                              {member.email && (
                                <a
                                  href={`mailto:${member.email}`}
                                  className="inline-flex items-center gap-1 text-church-red hover:text-foreground transition-colors text-xs"
                                >
                                  <Mail className="h-3 w-3" />
                                  Contact
                                </a>
                              )}
                              {member.phone && (
                                <a
                                  href={`tel:${member.phone}`}
                                  className="inline-flex items-center gap-1 text-church-red hover:text-foreground transition-colors text-xs"
                                >
                                  <Phone className="h-3 w-3" />
                                  {member.phone}
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No department information available at this time.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Team;
import { apiUrls } from '@/config/api';