import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Heart, Handshake, Users, Building, Mail, ExternalLink, Loader2 } from "lucide-react";
import { apiUrls } from '@/config/api';
// SITE_URL not needed for storage; use backend storage route

interface Partner {
  id: number;
  name: string;
  country: string;
  type: string;
  description: string;
  website?: string;
  email?: string;
  logo?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback data in case API is not available
  const fallbackPartners = [
    {
      id: 1,
      name: "Grassroots Rwanda (UK)",
      country: "United Kingdom",
      type: "Development Partner",
      description: "Supporting community development and grassroots initiatives in Rwanda.",
      website: "https://grassrootsrwanda.org.uk",
      email: "info@grassrootsrwanda.org.uk",
      category: "development",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      logo: ""
    },
    {
      id: 2,
      name: "Anglican Church Mission Society",
      country: "United Kingdom",
      type: "Mission Partner",
      description: "Supporting Anglican mission work and church development in Rwanda.",
      website: "https://churchmissionsociety.org",
      email: "info@churchmissionsociety.org",
      category: "mission",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      logo: ""
    },
    {
      id: 3,
      name: "Diocese of London",
      country: "United Kingdom",
      type: "Sister Diocese",
      description: "Partnership for mutual support and shared ministry between dioceses.",
      website: "https://london.anglican.org",
      email: "info@london.anglican.org",
      category: "diocese",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      logo: ""
    }
  ];

  // Helper function to fix image URLs
  const fixImageUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) return url;
    
    // Remove any leading slashes
    let cleanPath = url.replace(/^\/+/, '');
    
    // Remove "storage/" prefix if it exists (Laravel storage path)
    if (cleanPath.startsWith('storage/')) {
      cleanPath = cleanPath.substring(8);
    }
    
    // Construct the full URL via backend storage route
    return apiUrls.storage(cleanPath);
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrls.partners());
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Process the partners to fix image URLs
            const processedPartners = data.data.map((partner: Partner) => ({
              ...partner,
              logo: partner.logo ? fixImageUrl(partner.logo) : ''
            }));
            setPartners(processedPartners);
          } else {
            setPartners(fallbackPartners);
          }
        } else {
          setPartners(fallbackPartners);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
        setPartners(fallbackPartners);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'development':
        return Building;
      case 'mission':
        return Heart;
      case 'diocese':
        return Users;
      default:
        return Handshake;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'mission':
        return 'bg-green-100 text-green-800';
      case 'diocese':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6 drop-shadow-lg">
              Our Partners
            </h2>
            <p className="text-xl md:text-2xl text-church-navy drop-shadow-md">
              Building bridges through collaboration
            </p>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-church-navy mr-3" />
            <span className="text-church-navy/80">Loading partners...</span>
          </div>
        </div>
      </section>
    );
  }

  // Filter partners that have logos
  const partnersWithLogos = partners.filter(partner => partner.logo && partner.logo.trim() !== '');

  return (
    <section className="py-20 bg-gradient-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6 drop-shadow-lg">
            Our Partners
          </h2>
          <p className="text-xl md:text-2xl text-church-navy drop-shadow-md">
            Building bridges through collaboration
          </p>
        </div>

        {partnersWithLogos.length === 0 ? (
          <div className="text-center py-8">
            <Handshake className="h-16 w-16 text-church-navy/50 mx-auto mb-4" />
            <p className="text-church-navy/80">No partner logos available at the moment.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partnersWithLogos.map((partner) => (
              <div 
                key={partner.id} 
                className="group cursor-pointer transition-all duration-300 hover:scale-110"
                onClick={() => partner.website && window.open(partner.website, '_blank')}
                title={`${partner.name} - ${partner.type}`}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center p-4">
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <p className="text-church-navy/90 mb-6 text-lg">
            Interested in partnering with us?
          </p>
          <Button 
            className="bg-church-red text-white hover:bg-church-red/90 text-lg px-8 py-3"
            onClick={() => window.location.href = '/contact'}
          >
            <Handshake className="h-5 w-5 mr-2" />
            Get In Touch
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
