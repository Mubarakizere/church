import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiUrls } from '../config/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Stethoscope, 
  GraduationCap, 
  Building2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

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
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-church-navy animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading {getCategoryTitle(category || '')}...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const catTitle = getCategoryTitle(category || '');
  const catDesc = getCategoryDescription(category || '');

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt={catTitle}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/80 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link to="/projects" className="hover:text-church-gold transition-colors">
                Projects
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">{catTitle}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              {catTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Sub-header Navigation Strip */}
        <section className="py-6 bg-slate-50 border-b border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-church-navy hover:text-church-gold transition-colors mb-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to All Projects & Programs</span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">{catDesc}</p>
            </div>

            <div className="text-xs font-bold text-church-navy bg-church-cream/70 border border-church-cream px-3 py-1.5 rounded-lg self-start sm:self-auto shrink-0">
              {data.length} Facilities Listed
            </div>
          </div>
        </section>

        {/* Facilities Grid */}
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {data.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-church-navy">No records found</h3>
                <p className="text-xs text-slate-500 mt-1">There are currently no records in this category.</p>
                <div className="mt-5">
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-1 text-xs font-bold text-church-navy hover:text-church-gold"
                  >
                    <ChevronLeft className="h-4 w-4" /> Return to Programs
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-church-gold/60 transition-all p-5 sm:p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-serif font-bold text-church-navy mb-2 leading-snug">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      )}

                      <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        {item.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-church-gold shrink-0" />
                            <span>{item.location}</span>
                          </div>
                        )}

                        {item.head_teacher && (
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Head Teacher: {item.head_teacher}</span>
                          </div>
                        )}

                        {item.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <a href={`tel:${item.contact_phone}`} className="hover:text-church-navy">
                              {item.contact_phone}
                            </a>
                          </div>
                        )}

                        {item.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <a href={`mailto:${item.contact_email}`} className="hover:text-church-navy">
                              {item.contact_email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.services && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Services Offered
                        </span>
                        <p className="text-xs text-slate-700">{item.services}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetailPage;