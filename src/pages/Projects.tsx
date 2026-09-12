import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiUrls } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Heart,
  Building,
  Droplets,
  Lightbulb,
  TreePine,
  Stethoscope,
  Hammer,
  BookOpen
} from "lucide-react";

interface ProjectStatistics {
  health_centers: number;
  health_posts: number;
  schools: {
    ecd: number;
    primary: number;
    secondary_basic: number;
    secondary_boarding: number;
    tss_boarding: number;
    university: number;
    total: number;
  };
  total_educational_institutions: number;
  summary: {
    health_facilities: number;
    educational_institutions: number;
    total_projects: number;
  };
}

interface HealthCenter {
  id: number;
  name: string;
  description: string;
  location: string;
  contact_phone: string;
  contact_email: string;
  image: string;
  services: string[];
  operating_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HealthPost {
  id: number;
  name: string;
  description: string;
  location: string;
  services_offered: string[];
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
}

interface School {
  id: number;
  name: string;
  type: string;
  description: string;
  location: string;
  head_teacher: string;
  programs_offered: string[];
  contact_phone: string;
  contact_email: string;
  founded_year: number;
  is_active: boolean;
}

interface ProjectData {
  health_centers: HealthCenter[];
  health_posts: HealthPost[];
  schools: {
    ecd: School[];
    primary: School[];
    secondary_basic: School[];
    secondary_boarding: School[];
    tss_boarding: School[];
    university: School[];
  };
  statistics: ProjectStatistics;
}

const Projects = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch project data from API
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Fetch data from individual API endpoints
        const [healthCentersRes, healthPostsRes, schoolsRes] = await Promise.all([
          fetch(apiUrls.healthCenters()),
          fetch(apiUrls.healthPosts()),
          fetch(apiUrls.schools())
        ]);

        const healthCenters = healthCentersRes.ok ? await healthCentersRes.json() : [];
        const healthPosts = healthPostsRes.ok ? await healthPostsRes.json() : [];
        const allSchools = schoolsRes.ok ? await schoolsRes.json() : [];
        
        // Group schools by type manually
        const schoolsGrouped = {
          ecd: allSchools.filter(school => school.type === 'ecd'),
          primary: allSchools.filter(school => school.type === 'primary'),
          secondary_basic: allSchools.filter(school => school.type === 'secondary_basic'),
          secondary_boarding: allSchools.filter(school => school.type === 'secondary_boarding'),
          tss_boarding: allSchools.filter(school => school.type === 'tss_boarding'),
          university: allSchools.filter(school => school.type === 'university')
        };
        
        // Calculate statistics manually
        const schoolsStats = {
          ecd: schoolsGrouped.ecd.length,
          primary: schoolsGrouped.primary.length,
          secondary_basic: schoolsGrouped.secondary_basic.length,
          secondary_boarding: schoolsGrouped.secondary_boarding.length,
          tss_boarding: schoolsGrouped.tss_boarding.length,
          university: schoolsGrouped.university.length,
          total: allSchools.length
        };

        setProjectData({
          health_centers: healthCenters,
          health_posts: healthPosts,
          schools: schoolsGrouped,
          statistics: {
            health_centers: healthCenters.length,
            health_posts: healthPosts.length,
            schools: schoolsStats,
            total_educational_institutions: schoolsStats.total,
            summary: {
              health_facilities: healthCenters.length + healthPosts.length,
              educational_institutions: schoolsStats.total,
              total_projects: healthCenters.length + healthPosts.length + schoolsStats.total
            }
          }
        });
      } catch (error) {
        console.error('Failed to fetch project data:', error);
        
        // Fallback to sample data for testing
        setProjectData({
          health_centers: [
            { id: 1, name: "Shyogwe Health Center", location: "Shyogwe, Muhanga District" },
            { id: 2, name: "Hanika Health Center", location: "Hanika, Muhanga District" },
            { id: 3, name: "Gikomero Health Center", location: "Gikomero, Muhanga District" }
          ],
          health_posts: [
            { id: 1, name: "Mbayaya Health Post", location: "Mbayaya" },
            { id: 2, name: "Shyogwe Health Post", location: "Shyogwe" },
            { id: 3, name: "Nyamagana Health Post", location: "Nyamagana" },
            { id: 4, name: "Kibinja Health Post", location: "Kibinja" }
          ],
          schools: {
            ecd: [
              { id: 1, name: "ECD School 1", type: "ecd", location: "Location 1" },
              { id: 2, name: "ECD School 2", type: "ecd", location: "Location 2" },
              { id: 3, name: "ECD School 3", type: "ecd", location: "Location 3" },
              { id: 4, name: "ECD School 4", type: "ecd", location: "Location 4" },
              { id: 5, name: "ECD School 5", type: "ecd", location: "Location 5" },
              { id: 6, name: "ECD School 6", type: "ecd", location: "Location 6" }
            ],
            primary: [
              { id: 7, name: "Primary School 1", type: "primary", location: "Location 1" },
              { id: 8, name: "Primary School 2", type: "primary", location: "Location 2" },
              { id: 9, name: "Primary School 3", type: "primary", location: "Location 3" },
              { id: 10, name: "Primary School 4", type: "primary", location: "Location 4" },
              { id: 11, name: "Primary School 5", type: "primary", location: "Location 5" },
              { id: 12, name: "Primary School 6", type: "primary", location: "Location 6" },
              { id: 13, name: "Primary School 7", type: "primary", location: "Location 7" },
              { id: 14, name: "Primary School 8", type: "primary", location: "Location 8" },
              { id: 15, name: "Primary School 9", type: "primary", location: "Location 9" }
            ],
            secondary_basic: [
              { id: 16, name: "Secondary School 1", type: "secondary_basic", location: "Location 1" },
              { id: 17, name: "Secondary School 2", type: "secondary_basic", location: "Location 2" },
              { id: 18, name: "Secondary School 3", type: "secondary_basic", location: "Location 3" },
              { id: 19, name: "Secondary School 4", type: "secondary_basic", location: "Location 4" },
              { id: 20, name: "Secondary School 5", type: "secondary_basic", location: "Location 5" },
              { id: 21, name: "Secondary School 6", type: "secondary_basic", location: "Location 6" },
              { id: 22, name: "Secondary School 7", type: "secondary_basic", location: "Location 7" },
              { id: 23, name: "Secondary School 8", type: "secondary_basic", location: "Location 8" },
              { id: 24, name: "Secondary School 9", type: "secondary_basic", location: "Location 9" },
              { id: 25, name: "Secondary School 10", type: "secondary_basic", location: "Location 10" },
              { id: 26, name: "Secondary School 11", type: "secondary_basic", location: "Location 11" },
              { id: 27, name: "Secondary School 12", type: "secondary_basic", location: "Location 12" },
              { id: 28, name: "Secondary School 13", type: "secondary_basic", location: "Location 13" },
              { id: 29, name: "Secondary School 14", type: "secondary_basic", location: "Location 14" },
              { id: 30, name: "Secondary School 15", type: "secondary_basic", location: "Location 15" }
            ],
            secondary_boarding: [
              { id: 31, name: "Boarding School 1", type: "secondary_boarding", location: "Location 1" },
              { id: 32, name: "Boarding School 2", type: "secondary_boarding", location: "Location 2" }
            ],
            tss_boarding: [
              { id: 33, name: "TSS School 1", type: "tss_boarding", location: "Location 1" },
              { id: 34, name: "TSS School 2", type: "tss_boarding", location: "Location 2" },
              { id: 35, name: "TSS School 3", type: "tss_boarding", location: "Location 3" },
              { id: 36, name: "TSS School 4", type: "tss_boarding", location: "Location 4" },
              { id: 37, name: "TSS School 5", type: "tss_boarding", location: "Location 5" },
              { id: 38, name: "TSS School 6", type: "tss_boarding", location: "Location 6" }
            ],
            university: [
              { id: 39, name: "Shyogwe Anglican University", type: "university", location: "Shyogwe" }
            ]
          },
          statistics: {
            health_centers: 3,
            health_posts: 4,
            schools: {
              ecd: 6,
              primary: 9,
              secondary_basic: 15,
              secondary_boarding: 2,
              tss_boarding: 6,
              university: 1,
              total: 39
            },
            total_educational_institutions: 39,
            summary: {
              health_facilities: 7,
              educational_institutions: 39,
              total_projects: 46
            }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, []);

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const handleProjectClick = (project: any) => {
    if (typeof project.onClick === 'function') {
      project.onClick();
      return;
    }
    const s = slugify(project.title || project.name || 'project');
    navigate(`/projects/${s}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const projects = [
    {
      icon: Stethoscope,
      title: "Health Centers",
      description: "Operating comprehensive health centers providing quality healthcare services to our communities.",
      features: projectData?.health_centers?.length ?
        [...(projectData?.health_centers?.slice(0, 2).map(center => center.name) || []), "Comprehensive medical services", "Maternal and child health care"] :
        ["Shyogwe Health Center", "Hanika Health Center", "Comprehensive medical services", "Maternal and child health care"],
      status: "Active",
      beneficiaries: `${projectData?.statistics?.health_centers || 3} centers serving 15,000+ patients annually`,
      color: "bg-red-500",
      onClick: () => navigate('/projects/health-centers')
    },
    {
      icon: Heart,
      title: "Health Posts",
      description: "Community-based health posts providing primary healthcare and health education in rural areas.",
      features: projectData?.health_posts?.length ?
        [...(projectData?.health_posts?.slice(0, 2).map(post => post.name) || []), "Primary healthcare services"] :
        ["Mbayaya Health Post", "Shyogwe Health Post", "Primary healthcare services"],
      status: "Active",
      beneficiaries: `${projectData?.statistics?.health_posts || 4} posts serving 8,000+ community members`,
      color: "bg-pink-500",
      onClick: () => navigate('/projects/health-posts')
    },
    {
      icon: GraduationCap,
      title: "ECD Schools",
      description: "Early Childhood Development schools providing quality early childhood education and development programs.",
      features: [
        `${projectData?.statistics?.schools?.ecd || 6} ECD Schools operating`,
        "Early childhood education programs",
        "Child development activities",
        "Nutritional support programs",
        "Parent education initiatives"
      ],
      status: "Active",
      beneficiaries: `${(projectData?.statistics?.schools?.ecd || 6) * 100}+ young children`,
      color: "bg-yellow-500",
      onClick: () => navigate('/projects/ecd-schools')
    },
    {
      icon: BookOpen,
      title: "Primary Schools",
      description: "Primary education schools providing foundational education for children in our communities.",
      features: [
        `${projectData?.statistics?.schools?.primary || 9} Primary Schools (EP Schools)`,
        "Qualified head teachers and staff",
        "Quality basic education curriculum",
        "Educational materials provision",
        "Community-based learning"
      ],
      status: "Active",
      beneficiaries: `${(projectData?.statistics?.schools?.primary || 9) * 400}+ primary students`,
      color: "bg-blue-500",
      onClick: () => navigate('/projects/primary-schools')
    },
    {
      icon: Building,
      title: "Secondary Day Schools",
      description: "Secondary day schools providing comprehensive secondary education programs.",
      features: [
        `${projectData?.statistics?.schools?.secondary_basic || 15} Day Schools (GS Schools)`,
        "Experienced head teachers",
        "Quality secondary education",
        "Community-based learning",
        "Comprehensive curriculum"
      ],
      status: "Active",
      beneficiaries: `${(projectData?.statistics?.schools?.secondary_basic || 15) * 500}+ secondary students`,
      color: "bg-purple-500",
      onClick: () => navigate('/projects/secondary-day-schools')
    },
    {
      icon: Building,
      title: "Boarding Schools",
      description: "Secondary boarding schools providing residential education and comprehensive care.",
      features: [
        `${projectData?.statistics?.schools?.secondary_boarding || 2} General Education Boarding Schools`,
        "Residential facilities",
        "24/7 supervision and care",
        "Comprehensive education programs",
        "Character development"
      ],
      status: "Active",
      beneficiaries: `${(projectData?.statistics?.schools?.secondary_boarding || 2) * 800}+ boarding students`,
      color: "bg-green-500",
      onClick: () => navigate('/projects/boarding-schools')
    },
    {
      icon: Hammer,
      title: "TSS Schools",
      description: "Technical and Vocational boarding schools providing practical skills and career training.",
      features: [
        `${projectData?.statistics?.schools?.tss_boarding || 6} TSS Technical & Vocational Schools`,
        "Technical skills training",
        "Vocational programs",
        "Career preparation",
        "Practical hands-on learning"
      ],
      status: "Active",
      beneficiaries: `${(projectData?.statistics?.schools?.tss_boarding || 6) * 600}+ technical students`,
      color: "bg-orange-500",
      onClick: () => navigate('/projects/tss-schools')
    },
    {
      icon: Lightbulb,
      title: "Higher Education",
      description: "University-level education providing advanced learning opportunities and professional development.",
      features: [
        `${projectData?.statistics?.schools?.university || 1} University operating`,
        "Higher education programs",
        "Professional development courses",
        "Research and innovation",
        "Community engagement programs"
      ],
      status: "Active",
      beneficiaries: `${(projectData?.statistics?.schools?.university || 1) * 1200}+ university students`,
      color: "bg-indigo-500",
      onClick: () => navigate('/projects/higher-education')
    },
    
  ];

  // Dynamic impact statistics from database - showing schools by categories
  const impactStats = projectData ? [
    { number: String(projectData?.statistics?.health_centers ?? 3), label: "Health Centers" },
    { number: String(projectData?.statistics?.health_posts ?? 4), label: "Health Posts" },
    { number: String(projectData?.statistics?.schools?.ecd ?? 6), label: "ECD Schools" },
    { number: String(projectData?.statistics?.schools?.primary ?? 9), label: "Primary Schools" },
    { number: String(projectData?.statistics?.schools?.secondary_basic ?? 15), label: "Secondary Schools" },
    { number: String(projectData?.statistics?.schools?.secondary_boarding ?? 2), label: "Boarding Schools" },
    { number: String(projectData?.statistics?.schools?.tss_boarding ?? 6), label: "TSS Schools" },
    { number: String(projectData?.statistics?.schools?.university ?? 1), label: "University" }
  ] : [
    { number: "3", label: "Health Centers" },
    { number: "4", label: "Health Posts" },
    { number: "6", label: "ECD Schools" },
    { number: "9", label: "Primary Schools" },
    { number: "15", label: "Secondary Schools" },
    { number: "2", label: "Boarding Schools" },
    { number: "6", label: "TSS Schools" },
    { number: "1", label: "University" }
  ];

  // Render detail list based on slug
  const renderSlugView = () => {
    if (!slug) return null;
    const s = String(slug).toLowerCase();
    const sectionBase = (title: string, subtitle?: string, children?: any) => (
      <>
        <section className="bg-gradient-section py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-church-red mb-4">{title}</h1>
            {subtitle && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
            )}
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </section>
      </>
    );

    if (s === 'health-centers') {
      const items = projectData?.health_centers || [];
      return sectionBase(
        'Health Centers',
        'All health centers operated by the Diocese',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No health centers found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((c) => (
              <Card key={c.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Location:</span> {c.location}</div>
                    <div><span className="font-semibold">Description:</span> {c.description}</div>
                    {c.contact_phone && (<div><span className="font-semibold">Phone:</span> {c.contact_phone}</div>)}
                    {c.contact_email && (<div><span className="font-semibold">Email:</span> {c.contact_email}</div>)}
                    {c.operating_hours && (<div><span className="font-semibold">Hours:</span> {c.operating_hours}</div>)}
                    {Array.isArray(c.services) && c.services.length > 0 && (
                      <div>
                        <span className="font-semibold">Services:</span> {c.services.join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    if (s === 'health-posts') {
      const items = projectData?.health_posts || [];
      return sectionBase(
        'Health Posts',
        'All community health posts in our network',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No health posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <Card key={p.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Location:</span> {p.location}</div>
                    {Array.isArray(p.services_offered) && p.services_offered.length > 0 && (
                      <div>
                        <span className="font-semibold">Services:</span> {p.services_offered.join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    if (s === 'primary-education') {
      const items = projectData?.schools?.primary || [];
      return sectionBase(
        'Primary Education',
        'All primary schools (EP)',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No primary schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((sch) => (
              <Card key={sch.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{sch.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Location:</span> {sch.location}</div>
                    {sch.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {sch.head_teacher}</div>)}
                    {sch.founded_year && (<div><span className="font-semibold">Founded:</span> {sch.founded_year}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    if (s === 'secondary-education') {
      const basic = projectData?.schools?.secondary_basic || [];
      const boarding = projectData?.schools?.secondary_boarding || [];
      const tss = projectData?.schools?.tss_boarding || [];
      const items = [...basic, ...boarding, ...tss];
      return sectionBase(
        'Secondary Education',
        'All secondary schools (Day, Boarding, and TSS)',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No secondary schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((sch) => (
              <Card key={sch.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{sch.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Type:</span> {sch.type}</div>
                    <div><span className="font-semibold">Location:</span> {sch.location}</div>
                    {sch.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {sch.head_teacher}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    if (s === 'higher-education') {
      const items = projectData?.schools?.university || [];
      return sectionBase(
        'Higher Education',
        'University-level institutions',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No university found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((u) => (
              <Card key={u.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{u.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Location:</span> {u.location}</div>
                    {u.founded_year && (<div><span className="font-semibold">Founded:</span> {u.founded_year}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    // ECD Schools section
    if (s === 'ecd-schools') {
      const items = projectData?.schools?.ecd || [];
      return sectionBase(
        'ECD Schools',
        'Early Childhood Development Schools',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No ECD schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((school) => (
              <Card key={school.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Type:</span> {school.type}</div>
                    <div><span className="font-semibold">Location:</span> {school.location}</div>
                    {school.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {school.head_teacher}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    // Primary Schools section
    if (s === 'primary-schools') {
      const items = projectData?.schools?.primary || [];
      return sectionBase(
        'Primary Schools',
        'Primary Education Schools',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No primary schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((school) => (
              <Card key={school.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Type:</span> {school.type}</div>
                    <div><span className="font-semibold">Location:</span> {school.location}</div>
                    {school.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {school.head_teacher}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    // Secondary Day Schools section
    if (s === 'secondary-day-schools') {
      const items = projectData?.schools?.secondary_basic || [];
      return sectionBase(
        'Secondary Day Schools',
        'Secondary Schools (Day)',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No secondary day schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((school) => (
              <Card key={school.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Type:</span> {school.type}</div>
                    <div><span className="font-semibold">Location:</span> {school.location}</div>
                    {school.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {school.head_teacher}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    // Boarding Schools section
    if (s === 'boarding-schools') {
      const items = projectData?.schools?.secondary_boarding || [];
      return sectionBase(
        'Boarding Schools',
        'Secondary Boarding Schools',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No boarding schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((school) => (
              <Card key={school.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Type:</span> {school.type}</div>
                    <div><span className="font-semibold">Location:</span> {school.location}</div>
                    {school.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {school.head_teacher}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    // TSS Schools section
    if (s === 'tss-schools') {
      const items = projectData?.schools?.tss_boarding || [];
      return sectionBase(
        'TSS Schools',
        'Technical and Vocational Boarding Schools',
        items.length === 0 ? (
          <p className="text-center text-muted-foreground">No TSS schools found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((school) => (
              <Card key={school.id} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <CardTitle>{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-semibold">Type:</span> {school.type}</div>
                    <div><span className="font-semibold">Location:</span> {school.location}</div>
                    {school.head_teacher && (<div><span className="font-semibold">Head Teacher:</span> {school.head_teacher}</div>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <div className="pt-24 pb-16">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading project data...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        
        {/* Project Detail Modal */}
        {showModal && selectedProject && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${selectedProject.color} rounded-full flex items-center justify-center`}>
                      <selectedProject.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-church-red">{selectedProject.title}</h2>
                      <span className="text-sm font-semibold text-church-red bg-church-red/10 px-3 py-1 rounded-full">
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4 text-base leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3 text-lg">Key Features:</h3>
                  <ul className="text-muted-foreground space-y-2">
                    {selectedProject.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-church-red mr-3 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-base bg-gray-50 p-4 rounded-lg">
                  <span className="text-muted-foreground">Beneficiaries:</span>
                  <span className="font-semibold text-church-red">{selectedProject.beneficiaries}</span>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={closeModal}
                    className="bg-church-red hover:bg-church-red/90 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If slug present, render the specific list view
  if (slug) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          {renderSlugView() || (
            <section className="py-20">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">Not Found</h2>
                <p className="text-muted-foreground">The requested project category was not found.</p>
              </div>
            </section>
          )}
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
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-church-red mb-6">
              Our Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transforming communities through faith-based development initiatives that address 
              the physical, spiritual, and social needs of our people.
            </p>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
                Our Impact
              </h2>
              <p className="text-xl text-muted-foreground">
                Making a difference in communities across Shyogwe Diocese
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-church-red mb-2">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-20 bg-gradient-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
                Active Projects
              </h2>
              <p className="text-xl text-muted-foreground">
                Comprehensive programs addressing community needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card 
                  key={index} 
                  className="shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-church-red/20 focus:outline-none focus:ring-2 focus:ring-church-red/50"
                  onClick={() => handleProjectClick(project)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectClick(project);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${project.title}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${project.color} rounded-full flex items-center justify-center`}>
                        <project.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-church-red bg-church-red/10 px-3 py-1 rounded-full">
                        {project.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-foreground">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Key Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {project.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-church-red mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">Beneficiaries:</span>
                      <span className="font-semibold text-church-red">{project.beneficiaries}</span>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-church-red border-church-red hover:bg-church-red hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project);
                        }}
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-8">
              Get Involved
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join us in making a difference. Whether through volunteering, donations, 
              or partnerships, there are many ways to support our community development efforts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/donate">
                <Button size="lg" className="bg-church-red hover:bg-church-red/90">
                  <Heart className="mr-2 h-5 w-5" />
                  Support Our Projects
                </Button>
              </a>
              <a href="/contact">
                <Button size="lg" variant="outline" className="border-church-red text-church-red hover:bg-church-red hover:text-white">
                  <Users className="mr-2 h-5 w-5" />
                  Volunteer With Us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Projects;