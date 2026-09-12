import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { apiUrls } from "@/config/api";

interface DocumentItem {
  id: number;
  title: string;
  file: string; // storage path or URL
  is_active: boolean;
  created_at?: string;
}

const DocumentsSection = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrls.documents());
        if (res.ok) {
          const result = await res.json();
          const items: DocumentItem[] = (result.data || result || []).filter((d: any) => d.is_active !== false);
          // Normalize file paths through storage route when necessary
          const normalized = items.map((d) => {
            let fileUrl = d.file;
            if (typeof fileUrl === 'string' && (fileUrl.startsWith('storage/') || fileUrl.startsWith('/storage/'))) {
              const clean = fileUrl.replace(/^\//, '');
              return { ...d, file: apiUrls.storage(clean) };
            }
            return d;
          });
          setDocs(normalized);
        } else {
          setDocs([]);
        }
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;

  if (!docs.length) return null;

  return (
    <section id="documents" className="py-16">
      <div className="container mx-auto px-4">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <a key={doc.id} href={doc.file} target="_blank" rel="noreferrer">
                  <div className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                    <FileText className="h-6 w-6 text-church-red mr-3" />
                    <span className="font-medium line-clamp-2">{doc.title}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">Open</Button>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DocumentsSection;


