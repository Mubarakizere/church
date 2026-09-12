import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";

interface School {
  id: number;
  name: string;
  type: string;
  location?: string;
  head_teacher?: string;
  founded_year?: number;
}

const typeLabels: Record<string, string> = {
  ecd: "Early Childhood Development (ECD)",
  primary: "Primary Schools",
  secondary_basic: "Secondary Schools (Day)",
  secondary_boarding: "Secondary Schools (Boarding)",
  tss_boarding: "Technical & Vocational (TSS)",
  university: "University",
};

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const type = params.get("type") || "ecd";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrls.schools()}/by-type/${type}`);
        if (!res.ok) throw new Error("Failed to load schools");
        const data = await res.json();
        if (!cancelled) setSchools(Array.isArray(data) ? data : data?.data || []);
      } catch (e) {
        if (!cancelled) setSchools([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [type]);

  const title = typeLabels[type] || "Schools";

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="bg-gradient-section py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-church-red mb-4">{title}</h1>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.keys(typeLabels).map((t) => (
                <Button key={t} variant={t === type ? "default" : "outline"} onClick={() => navigate(`/schools?type=${t}`)}>
                  {typeLabels[t]}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading schools...</p>
            ) : schools.length === 0 ? (
              <p className="text-center text-muted-foreground">No schools found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((s) => (
                  <Card key={s.id} className="hover:shadow-elegant transition-shadow">
                    <CardHeader>
                      <CardTitle>{s.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {s.location && <div><span className="font-semibold">Location:</span> {s.location}</div>}
                        {s.head_teacher && <div><span className="font-semibold">Head Teacher:</span> {s.head_teacher}</div>}
                        {s.founded_year && <div><span className="font-semibold">Founded:</span> {s.founded_year}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


