import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrls } from '../config/api';

interface School {
  id: number;
  name: string;
  type: string;
  location: string;
  head_teacher?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  is_active: boolean;
}

interface HealthCenter {
  id: number;
  name: string;
  location: string;
  services?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  is_active: boolean;
}

interface HealthPost {
  id: number;
  name: string;
  location: string;
  services?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  is_active: boolean;
}

const ProjectDetailPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        switch (category) {
          case 'health-centers':
            response = await fetch(apiUrls.healthCenters());
            break;
          case 'health-posts':
            response = await fetch(apiUrls.healthPosts());
            break;
          case 'ecd-schools':
            response = await fetch(`${apiUrls.schools()}/by-type/ecd`);
            break;
          case 'primary-schools':
            response = await fetch(`${apiUrls.schools()}/by-type/primary`);
            break;
          case 'secondary-day-schools':
            response = await fetch(`${apiUrls.schools()}/by-type/secondary_basic`);
            break;
          case 'boarding-schools':
            response = await fetch(`${apiUrls.schools()}/by-type/secondary_boarding`);
            break;
          case 'tss-schools':
            response = await fetch(`${apiUrls.schools()}/by-type/tss_boarding`);
            break;
          case 'higher-education':
            response = await fetch(`${apiUrls.schools()}/by-type/university`);
            break;
          // Legacy support
          case 'ecd':
            response = await fetch(`${apiUrls.schools()}/by-type/ecd`);
            break;
          case 'primary-education':
            response = await fetch(`${apiUrls.schools()}/by-type/primary`);
            break;
          case 'secondary-education':
            response = await fetch(`${apiUrls.schools()}/by-type/secondary_basic`);
            break;
          default:
            throw new Error('Invalid category');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const items = result.data || result;
        setData(Array.isArray(items) ? items : []);
      } catch (err) {
        // Only log in development if not a network error
        if (import.meta.env.DEV && !(err instanceof TypeError && err.message.includes('Failed to fetch'))) {
          console.error('Failed to fetch data:', err);
        }
        setError('Failed to fetch. Showing fallback data.');
        
        // Fallback to static data
        setData(getFallbackData(category || ''));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const getFallbackData = (category: string) => {
    switch (category) {
      case 'health-centers':
        return [
          {
            id: 1,
            name: "Shyogwe Health Center",
            location: "Shyogwe, Muhanga District",
            services: "General Medicine, Maternal and Child Health, Laboratory Services",
            contact_phone: "+250 788 100 001",
            contact_email: "shyogwe.hc@shyogwe.org",
            description: "Main health center providing comprehensive medical services to the Shyogwe community and surrounding areas.",
            is_active: true
          },
          {
            id: 2,
            name: "Hanika Health Center",
            location: "Hanika, Muhanga District",
            services: "General Medicine, Pediatrics, Emergency Care",
            contact_phone: "+250 788 100 002",
            contact_email: "hanika.hc@shyogwe.org",
            description: "Health center serving the Hanika community with essential medical services.",
            is_active: true
          },
          {
            id: 3,
            name: "Gikomero Health Center",
            location: "Gikomero, Muhanga District",
            services: "General Medicine, Women's Health, Pharmacy",
            contact_phone: "+250 788 100 003",
            contact_email: "gikomero.hc@shyogwe.org",
            description: "Community health center providing primary healthcare services.",
            is_active: true
          }
        ];
      case 'health-posts':
        return [
          {
            id: 1,
            name: "Mbayaya Health Post",
            location: "Mbayaya Village",
            services: "Primary Healthcare, Health Education",
            contact_phone: "+250 788 200 001",
            contact_email: "mbayaya.hp@shyogwe.org",
            description: "Community health post providing primary healthcare and health education services.",
            is_active: true
          },
          {
            id: 2,
            name: "Shyogwe Health Post",
            location: "Shyogwe Village",
            services: "Primary Healthcare, Vaccination",
            contact_phone: "+250 788 200 002",
            contact_email: "shyogwe.hp@shyogwe.org",
            description: "Local health post serving the immediate Shyogwe community.",
            is_active: true
          },
          {
            id: 3,
            name: "Nyamagana Health Post",
            location: "Nyamagana Village",
            services: "Primary Healthcare, Maternal Care",
            contact_phone: "+250 788 200 003",
            contact_email: "nyamagana.hp@shyogwe.org",
            description: "Health post providing essential healthcare services to Nyamagana residents.",
            is_active: true
          },
          {
            id: 4,
            name: "Kibinja Health Post",
            location: "Kibinja Village",
            services: "Primary Healthcare, Child Health",
            contact_phone: "+250 788 200 004",
            contact_email: "kibinja.hp@shyogwe.org",
            description: "Community health post focusing on child and family health services.",
            is_active: true
          }
        ];
      case 'ecd':
        return [
          {
            id: 1,
            name: "Shyogwe ECD Center",
            type: "ecd",
            location: "Shyogwe, Muhanga District",
            head_teacher: "Grace Mukamana",
            contact_phone: "+250 788 250 001",
            contact_email: "shyogwe.ecd@shyogwe.org",
            description: "Early Childhood Development center providing quality early education to young children.",
            is_active: true
          },
          {
            id: 2,
            name: "Hanika ECD Center",
            type: "ecd",
            location: "Hanika, Muhanga District",
            head_teacher: "Marie Claire",
            contact_phone: "+250 788 250 002",
            contact_email: "hanika.ecd@shyogwe.org",
            description: "Early Childhood Development center serving young children in the Hanika community.",
            is_active: true
          },
          {
            id: 3,
            name: "Gikomero ECD Center",
            type: "ecd",
            location: "Gikomero, Muhanga District",
            head_teacher: "Sarah Uwimana",
            contact_phone: "+250 788 250 003",
            contact_email: "gikomero.ecd@shyogwe.org",
            description: "Early Childhood Development center providing foundational learning for children.",
            is_active: true
          },
          {
            id: 4,
            name: "Nyamagana ECD Center",
            type: "ecd",
            location: "Nyamagana, Muhanga District",
            head_teacher: "Joyce Mukamana",
            contact_phone: "+250 788 250 004",
            contact_email: "nyamagana.ecd@shyogwe.org",
            description: "Early Childhood Development center focusing on early learning and development.",
            is_active: true
          },
          {
            id: 5,
            name: "Mbayaya ECD Center",
            type: "ecd",
            location: "Mbayaya, Muhanga District",
            head_teacher: "Therese Nyiramana",
            contact_phone: "+250 788 250 005",
            contact_email: "mbayaya.ecd@shyogwe.org",
            description: "Early Childhood Development center providing quality early education services.",
            is_active: true
          },
          {
            id: 6,
            name: "Kibinja ECD Center",
            type: "ecd",
            location: "Kibinja, Muhanga District",
            head_teacher: "Ange Mukamana",
            contact_phone: "+250 788 250 006",
            contact_email: "kibinja.ecd@shyogwe.org",
            description: "Early Childhood Development center serving young children in the Kibinja area.",
            is_active: true
          }
        ];
      case 'primary-education':
        return [
          {
            id: 1,
            name: "Shyogwe Primary School",
            type: "primary",
            location: "Shyogwe, Muhanga District",
            head_teacher: "John Doe",
            contact_phone: "+250 788 300 001",
            contact_email: "shyogwe.ps@shyogwe.org",
            description: "Primary school providing quality basic education to children in Shyogwe.",
            is_active: true
          },
          {
            id: 2,
            name: "Hanika Primary School",
            type: "primary",
            location: "Hanika, Muhanga District",
            head_teacher: "Jane Smith",
            contact_phone: "+250 788 300 002",
            contact_email: "hanika.ps@shyogwe.org",
            description: "Primary school serving the Hanika community with comprehensive basic education.",
            is_active: true
          },
          {
            id: 3,
            name: "Gikomero Primary School",
            type: "primary",
            location: "Gikomero, Muhanga District",
            head_teacher: "Peter Nkurunziza",
            contact_phone: "+250 788 300 003",
            contact_email: "gikomero.ps@shyogwe.org",
            description: "Primary school providing foundational education to children in Gikomero.",
            is_active: true
          },
          {
            id: 4,
            name: "Nyamagana Primary School",
            type: "primary",
            location: "Nyamagana, Muhanga District",
            head_teacher: "Mary Nyirarukundo",
            contact_phone: "+250 788 300 004",
            contact_email: "nyamagana.ps@shyogwe.org",
            description: "Primary school offering quality basic education to the Nyamagana community.",
            is_active: true
          },
          {
            id: 5,
            name: "Mbayaya Primary School",
            type: "primary",
            location: "Mbayaya, Muhanga District",
            head_teacher: "Joseph Nkurunziza",
            contact_phone: "+250 788 300 005",
            contact_email: "mbayaya.ps@shyogwe.org",
            description: "Primary school providing comprehensive basic education services.",
            is_active: true
          },
          {
            id: 6,
            name: "Kibinja Primary School",
            type: "primary",
            location: "Kibinja, Muhanga District",
            head_teacher: "Agnes Mukamana",
            contact_phone: "+250 788 300 006",
            contact_email: "kibinja.ps@shyogwe.org",
            description: "Primary school serving children in the Kibinja area with quality education.",
            is_active: true
          },
          {
            id: 7,
            name: "Ndiza Primary School",
            type: "primary",
            location: "Ndiza, Muhanga District",
            head_teacher: "Samuel Nkurunziza",
            contact_phone: "+250 788 300 007",
            contact_email: "ndiza.ps@shyogwe.org",
            description: "Primary school providing quality basic education in the Ndiza district.",
            is_active: true
          },
          {
            id: 8,
            name: "Gitarama Primary School",
            type: "primary",
            location: "Gitarama, Muhanga District",
            head_teacher: "Esther Mukamana",
            contact_phone: "+250 788 300 008",
            contact_email: "gitarama.ps@shyogwe.org",
            description: "Primary school offering comprehensive basic education in Gitarama.",
            is_active: true
          },
          {
            id: 9,
            name: "Rwamagana Primary School",
            type: "primary",
            location: "Rwamagana, Muhanga District",
            head_teacher: "Paul Nkurunziza",
            contact_phone: "+250 788 300 009",
            contact_email: "rwamagana.ps@shyogwe.org",
            description: "Primary school providing quality education to children in Rwamagana.",
            is_active: true
          }
        ];
      case 'secondary-education':
        return [
          {
            id: 1,
            name: "Shyogwe Secondary School",
            type: "secondary_basic",
            location: "Shyogwe, Muhanga District",
            head_teacher: "Robert Johnson",
            contact_phone: "+250 788 400 001",
            contact_email: "shyogwe.ss@shyogwe.org",
            description: "Secondary school providing quality secondary education to students.",
            is_active: true
          },
          {
            id: 2,
            name: "Hanika Secondary School",
            type: "secondary_basic",
            location: "Hanika, Muhanga District",
            head_teacher: "Mary Wilson",
            contact_phone: "+250 788 400 002",
            contact_email: "hanika.ss@shyogwe.org",
            description: "Secondary school offering comprehensive secondary education programs.",
            is_active: true
          },
          {
            id: 3,
            name: "Gikomero Secondary School",
            type: "secondary_basic",
            location: "Gikomero, Muhanga District",
            head_teacher: "David Nkurunziza",
            contact_phone: "+250 788 400 003",
            contact_email: "gikomero.ss@shyogwe.org",
            description: "Secondary school providing quality education to students in Gikomero.",
            is_active: true
          },
          {
            id: 4,
            name: "Nyamagana Secondary School",
            type: "secondary_basic",
            location: "Nyamagana, Muhanga District",
            head_teacher: "Sarah Mukamana",
            contact_phone: "+250 788 400 004",
            contact_email: "nyamagana.ss@shyogwe.org",
            description: "Secondary school offering comprehensive secondary education in Nyamagana.",
            is_active: true
          },
          {
            id: 5,
            name: "Mbayaya Secondary School",
            type: "secondary_basic",
            location: "Mbayaya, Muhanga District",
            head_teacher: "Paul Nkurunziza",
            contact_phone: "+250 788 400 005",
            contact_email: "mbayaya.ss@shyogwe.org",
            description: "Secondary school providing quality education to students in Mbayaya.",
            is_active: true
          },
          {
            id: 6,
            name: "Kibinja Secondary School",
            type: "secondary_basic",
            location: "Kibinja, Muhanga District",
            head_teacher: "Grace Mukamana",
            contact_phone: "+250 788 400 006",
            contact_email: "kibinja.ss@shyogwe.org",
            description: "Secondary school serving students in the Kibinja area with quality education.",
            is_active: true
          },
          {
            id: 7,
            name: "Ndiza Secondary School",
            type: "secondary_basic",
            location: "Ndiza, Muhanga District",
            head_teacher: "John Nkurunziza",
            contact_phone: "+250 788 400 007",
            contact_email: "ndiza.ss@shyogwe.org",
            description: "Secondary school providing quality education in the Ndiza district.",
            is_active: true
          },
          {
            id: 8,
            name: "Gitarama Secondary School",
            type: "secondary_basic",
            location: "Gitarama, Muhanga District",
            head_teacher: "Esther Mukamana",
            contact_phone: "+250 788 400 008",
            contact_email: "gitarama.ss@shyogwe.org",
            description: "Secondary school offering comprehensive education in Gitarama.",
            is_active: true
          },
          {
            id: 9,
            name: "Rwamagana Secondary School",
            type: "secondary_basic",
            location: "Rwamagana, Muhanga District",
            head_teacher: "Joseph Nkurunziza",
            contact_phone: "+250 788 400 009",
            contact_email: "rwamagana.ss@shyogwe.org",
            description: "Secondary school providing quality education to students in Rwamagana.",
            is_active: true
          },
          {
            id: 10,
            name: "Kibuye Secondary School",
            type: "secondary_basic",
            location: "Kibuye, Muhanga District",
            head_teacher: "Marie Claire",
            contact_phone: "+250 788 400 010",
            contact_email: "kibuye.ss@shyogwe.org",
            description: "Secondary school offering quality education to students in Kibuye.",
            is_active: true
          },
          {
            id: 11,
            name: "Muhanga Secondary School",
            type: "secondary_basic",
            location: "Muhanga, Muhanga District",
            head_teacher: "Peter Nkurunziza",
            contact_phone: "+250 788 400 011",
            contact_email: "muhanga.ss@shyogwe.org",
            description: "Secondary school providing comprehensive education in Muhanga.",
            is_active: true
          },
          {
            id: 12,
            name: "Rwabicuma Secondary School",
            type: "secondary_basic",
            location: "Rwabicuma, Muhanga District",
            head_teacher: "Agnes Mukamana",
            contact_phone: "+250 788 400 012",
            contact_email: "rwabicuma.ss@shyogwe.org",
            description: "Secondary school serving students in Rwabicuma with quality education.",
            is_active: true
          },
          {
            id: 13,
            name: "Nyabubare Secondary School",
            type: "secondary_basic",
            location: "Nyabubare, Muhanga District",
            head_teacher: "Samuel Nkurunziza",
            contact_phone: "+250 788 400 013",
            contact_email: "nyabubare.ss@shyogwe.org",
            description: "Secondary school providing quality education in Nyabubare.",
            is_active: true
          },
          {
            id: 14,
            name: "Rusororo Secondary School",
            type: "secondary_basic",
            location: "Rusororo, Muhanga District",
            head_teacher: "Joyce Mukamana",
            contact_phone: "+250 788 400 014",
            contact_email: "rusororo.ss@shyogwe.org",
            description: "Secondary school offering comprehensive education in Rusororo.",
            is_active: true
          },
          {
            id: 15,
            name: "Bwiza Secondary School",
            type: "secondary_basic",
            location: "Bwiza, Muhanga District",
            head_teacher: "Therese Nyiramana",
            contact_phone: "+250 788 400 015",
            contact_email: "bwiza.ss@shyogwe.org",
            description: "Secondary school providing quality education to students in Bwiza.",
            is_active: true
          }
        ];
      case 'higher-education':
        return [
          {
            id: 1,
            name: "Shyogwe University",
            type: "university",
            location: "Shyogwe, Muhanga District",
            head_teacher: "Dr. James Brown",
            contact_phone: "+250 788 500 001",
            contact_email: "info@shyogwe.edu.rw",
            description: "University providing higher education and professional development programs.",
            is_active: true
          }
        ];
      case 'ecd-schools':
        return getFallbackData('ecd');
      case 'primary-schools':
        return getFallbackData('primary-education');
      case 'secondary-day-schools':
        return getFallbackData('secondary-education');
      case 'boarding-schools':
        return [
          {
            id: 1,
            name: "Shyogwe Boarding School",
            type: "secondary_boarding",
            location: "Shyogwe, Muhanga District",
            head_teacher: "Dr. Sarah Johnson",
            contact_phone: "+250 788 600 001",
            contact_email: "shyogwe.boarding@shyogwe.org",
            description: "Boarding school providing residential education and comprehensive care.",
            is_active: true
          },
          {
            id: 2,
            name: "Hanika Boarding School",
            type: "secondary_boarding",
            location: "Hanika, Muhanga District",
            head_teacher: "Mr. Peter Wilson",
            contact_phone: "+250 788 600 002",
            contact_email: "hanika.boarding@shyogwe.org",
            description: "Boarding school offering residential education with 24/7 supervision.",
            is_active: true
          }
        ];
      case 'tss-schools':
        return [
          {
            id: 1,
            name: "Shyogwe TSS School",
            type: "tss_boarding",
            location: "Shyogwe, Muhanga District",
            head_teacher: "Eng. Marie Claire",
            contact_phone: "+250 788 700 001",
            contact_email: "shyogwe.tss@shyogwe.org",
            description: "Technical and Vocational boarding school providing practical skills training.",
            is_active: true
          },
          {
            id: 2,
            name: "Hanika TSS School",
            type: "tss_boarding",
            location: "Hanika, Muhanga District",
            head_teacher: "Eng. John Mukamana",
            contact_phone: "+250 788 700 002",
            contact_email: "hanika.tss@shyogwe.org",
            description: "Technical and Vocational school offering career-focused education.",
            is_active: true
          },
          {
            id: 3,
            name: "Gikomero TSS School",
            type: "tss_boarding",
            location: "Gikomero, Muhanga District",
            head_teacher: "Eng. Sarah Uwimana",
            contact_phone: "+250 788 700 003",
            contact_email: "gikomero.tss@shyogwe.org",
            description: "Technical and Vocational school providing hands-on learning experiences.",
            is_active: true
          },
          {
            id: 4,
            name: "Nyamagana TSS School",
            type: "tss_boarding",
            location: "Nyamagana, Muhanga District",
            head_teacher: "Eng. Joyce Nkurunziza",
            contact_phone: "+250 788 700 004",
            contact_email: "nyamagana.tss@shyogwe.org",
            description: "Technical and Vocational school focusing on practical skills development.",
            is_active: true
          },
          {
            id: 5,
            name: "Mbayaya TSS School",
            type: "tss_boarding",
            location: "Mbayaya, Muhanga District",
            head_teacher: "Eng. Therese Mukamana",
            contact_phone: "+250 788 700 005",
            contact_email: "mbayaya.tss@shyogwe.org",
            description: "Technical and Vocational school providing career preparation programs.",
            is_active: true
          },
          {
            id: 6,
            name: "Kibinja TSS School",
            type: "tss_boarding",
            location: "Kibinja, Muhanga District",
            head_teacher: "Eng. Ange Nyiramana",
            contact_phone: "+250 788 700 006",
            contact_email: "kibinja.tss@shyogwe.org",
            description: "Technical and Vocational school offering specialized training programs.",
            is_active: true
          }
        ];
      default:
        return [];
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'health-centers':
        return 'Health Centers';
      case 'health-posts':
        return 'Health Posts';
      case 'ecd-schools':
        return 'ECD Schools';
      case 'primary-schools':
        return 'Primary Schools';
      case 'secondary-day-schools':
        return 'Secondary Day Schools';
      case 'boarding-schools':
        return 'Boarding Schools';
      case 'tss-schools':
        return 'TSS Schools';
      case 'higher-education':
        return 'Higher Education';
      // Legacy support
      case 'ecd':
        return 'Early Childhood Development (ECD)';
      case 'primary-education':
        return 'Primary Education';
      case 'secondary-education':
        return 'Secondary Education';
      default:
        return 'Projects';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'health-centers':
        return 'Comprehensive health centers providing quality healthcare services to our communities.';
      case 'health-posts':
        return 'Community-based health posts providing primary healthcare and health education in rural areas.';
      case 'ecd-schools':
        return 'Early Childhood Development schools providing quality early education and development programs for young children.';
      case 'primary-schools':
        return 'Primary schools providing foundational education for children in our communities.';
      case 'secondary-day-schools':
        return 'Secondary day schools offering comprehensive education programs for young adults.';
      case 'boarding-schools':
        return 'Secondary boarding schools providing residential education and comprehensive care.';
      case 'tss-schools':
        return 'Technical and Vocational boarding schools providing practical skills and career training.';
      case 'higher-education':
        return 'University-level education providing advanced learning opportunities and professional development.';
      // Legacy support
      case 'ecd':
        return 'Early Childhood Development centers providing quality early education and development programs for young children.';
      case 'primary-education':
        return 'Primary schools providing foundational education for children in our communities.';
      case 'secondary-education':
        return 'Secondary schools offering comprehensive education programs for young adults.';
      default:
        return 'Development initiatives and projects in our community.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {getCategoryTitle(category || '')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{getCategoryTitle(category || '')}</h1>
              <p className="mt-2 text-gray-600">{getCategoryDescription(category || '')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  {error}. Showing fallback data.
                </p>
              </div>
            </div>
          </div>
        )}

        {data.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {getCategoryTitle(category || '').toLowerCase()} found</h3>
            <p className="mt-1 text-sm text-gray-500">There are currently no {getCategoryTitle(category || '').toLowerCase()} in our database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </div>
                    
                    {item.head_teacher && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {item.head_teacher}
                      </div>
                    )}
                    
                    {item.contact_phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {item.contact_phone}
                      </div>
                    )}
                    
                    {item.contact_email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {item.contact_email}
                      </div>
                    )}
                    
                    {item.services && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Services:</h4>
                        <p className="text-sm text-gray-600">{item.services}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
