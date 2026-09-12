import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrls } from '@/config/api';
import { RefreshCw } from "lucide-react";

interface Stats {
  health_centers: number;
  health_posts: number;
  total_educational_institutions: number;
  schools: {
    ecd: number; primary: number; secondary_basic: number; secondary_boarding: number; tss_boarding: number; university: number; total: number;
  };
}

const ProjectsOverview = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [healthCenters, setHealthCenters] = useState<any[]>([]);
  const [healthPosts, setHealthPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data from individual endpoints (these endpoints exist)
        const [hcRes, hpRes, schoolsRes] = await Promise.all([
          fetch(apiUrls.healthCenters()),
          fetch(apiUrls.healthPosts()),
          fetch(apiUrls.schools())
        ]);
        
        const [health_centers, health_posts, allSchools] = await Promise.all([
          hcRes.ok ? hcRes.json() : [],
          hpRes.ok ? hpRes.json() : [],
          schoolsRes.ok ? schoolsRes.json() : []
        ]);
        
        // Group schools by type manually since schoolsGrouped endpoint doesn't exist
        const schools = {
          ecd: Array.isArray(allSchools) ? allSchools.filter((s: any) => s.type === 'ecd') : [],
          primary: Array.isArray(allSchools) ? allSchools.filter((s: any) => s.type === 'primary') : [],
          secondary_basic: Array.isArray(allSchools) ? allSchools.filter((s: any) => s.type === 'secondary_basic') : [],
          secondary_boarding: Array.isArray(allSchools) ? allSchools.filter((s: any) => s.type === 'secondary_boarding') : [],
          tss_boarding: Array.isArray(allSchools) ? allSchools.filter((s: any) => s.type === 'tss_boarding') : [],
          university: Array.isArray(allSchools) ? allSchools.filter((s: any) => s.type === 'university') : []
        };
        
        const data = { health_centers, health_posts, schools };

        const schoolsGrouped = data.schools || {};
        const counts = {
          ecd: Array.isArray(schoolsGrouped.ecd) ? schoolsGrouped.ecd.length : 0,
          primary: Array.isArray(schoolsGrouped.primary) ? schoolsGrouped.primary.length : 0,
          secondary_basic: Array.isArray(schoolsGrouped.secondary_basic) ? schoolsGrouped.secondary_basic.length : 0,
          secondary_boarding: Array.isArray(schoolsGrouped.secondary_boarding) ? schoolsGrouped.secondary_boarding.length : 0,
          tss_boarding: Array.isArray(schoolsGrouped.tss_boarding) ? schoolsGrouped.tss_boarding.length : 0,
          university: Array.isArray(schoolsGrouped.university) ? schoolsGrouped.university.length : 0,
        } as Stats['schools'];
        const totalSchools = counts.ecd + counts.primary + counts.secondary_basic + counts.secondary_boarding + counts.tss_boarding + counts.university;
        const derived: Stats = {
          health_centers: Array.isArray(data.health_centers) ? data.health_centers.length : 0,
          health_posts: Array.isArray(data.health_posts) ? data.health_posts.length : 0,
          total_educational_institutions: totalSchools,
          schools: { ...counts, total: totalSchools }
        } as Stats;

        setStats(derived);
        setHealthCenters(Array.isArray(data?.health_centers) ? data.health_centers : []);
        setHealthPosts(Array.isArray(data?.health_posts) ? data.health_posts : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-church-red mb-2">Projects Overview</h1>
        <p className="text-muted-foreground">Unified view of the data used on the public Projects page.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/health')}>Manage Health</Button>
          <Button variant="outline" onClick={() => navigate('/admin/schools')}>Manage Schools</Button>
          <Button variant="outline" onClick={() => navigate('/admin/programs')}>Manage Programs</Button>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</Button>
          <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse"><div className="h-4 w-40 bg-gray-200 rounded"/></CardHeader>
              <CardContent><div className="h-8 w-24 bg-gray-200 rounded"/></CardContent>
            </Card>
          ))}
        </div>
      ) : !stats ? (
        <div className="text-center text-muted-foreground">
          <p className="mb-4">{error || 'No data available.'}</p>
          <Button onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4 mr-2"/>Retry</Button>
        </div>
      ) : (
        <>
          {/* Summary cards moved from Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-elegant" onClick={() => navigate('/schools')}>
              <CardHeader><CardTitle>Total Educational Institutions</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.total}</div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-elegant" onClick={() => navigate('/admin/health')}>
              <CardHeader><CardTitle>Health Centers</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.health_centers}</div></CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-elegant" onClick={() => navigate('/admin/health')}>
              <CardHeader><CardTitle>Health Posts</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.health_posts}</div></CardContent>
            </Card>
          </div>

          {/* Schools breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card onClick={() => navigate('/schools?type=ecd')} className="cursor-pointer hover:shadow-elegant">
              <CardHeader><CardTitle>ECD Schools</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.ecd}</div></CardContent>
            </Card>
            <Card onClick={() => navigate('/schools?type=primary')} className="cursor-pointer hover:shadow-elegant">
              <CardHeader><CardTitle>Primary Schools</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.primary}</div></CardContent>
            </Card>
            <Card onClick={() => navigate('/schools?type=secondary_basic')} className="cursor-pointer hover:shadow-elegant">
              <CardHeader><CardTitle>Secondary (Day)</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.secondary_basic}</div></CardContent>
            </Card>
            <Card onClick={() => navigate('/schools?type=secondary_boarding')} className="cursor-pointer hover:shadow-elegant">
              <CardHeader><CardTitle>Secondary (Boarding)</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.secondary_boarding}</div></CardContent>
            </Card>
            <Card onClick={() => navigate('/schools?type=tss_boarding')} className="cursor-pointer hover:shadow-elegant">
              <CardHeader><CardTitle>TSS Boarding</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.tss_boarding}</div></CardContent>
            </Card>
            <Card onClick={() => navigate('/schools?type=university')} className="cursor-pointer hover:shadow-elegant">
              <CardHeader><CardTitle>University</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.schools.university}</div></CardContent>
            </Card>
          </div>

          {/* Recent health facilities lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Health Centers</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {healthCenters.slice(0, 8).map((hc) => (
                    <li key={hc.id} className="flex items-center justify-between">
                      <span>{hc.name}</span>
                      <Button variant="outline" size="sm" onClick={() => navigate('/admin/health')}>Open</Button>
                    </li>
                  ))}
                  {healthCenters.length === 0 && <li>No health centers found.</li>}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Health Posts</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {healthPosts.slice(0, 8).map((hp) => (
                    <li key={hp.id} className="flex items-center justify-between">
                      <span>{hp.name}</span>
                      <Button variant="outline" size="sm" onClick={() => navigate('/admin/health')}>Open</Button>
                    </li>
                  ))}
                  {healthPosts.length === 0 && <li>No health posts found.</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsOverview;


