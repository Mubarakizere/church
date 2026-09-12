import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrls } from "@/config/api";
import { Trash2 } from "lucide-react";

interface DocumentItem {
  id: number;
  title: string;
  file: string;
  is_active: boolean;
}

const DocumentsManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const load = async () => {
    const res = await fetch(apiUrls.admin.documents(), { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const result = await res.json();
      setDocs(result.data || []);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append('title', title);
    fd.append('file', file);
    fd.append('is_active', isActive ? '1' : '0');
    const res = await fetch(apiUrls.admin.documents(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      setTitle("");
      setFile(null);
      setIsActive(true);
      await load();
    } else {
      try {
        const err = await res.json();
        alert(`Upload failed: ${err?.message || Object.values(err?.errors||{}).flat()[0] || 'Please try again.'}`);
      } catch {
        alert('Upload failed');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    const res = await fetch(`${apiUrls.admin.documents()}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents Management</h1>
            <p className="text-sm text-muted-foreground">Upload and manage PDF documents</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Document (PDF)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="file">PDF File</Label>
                <Input id="file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              </div>
              <div className="flex items-center space-x-2">
                <input id="is_active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div>
                <Button type="submit">Upload</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center p-3 border rounded-lg bg-white">
                  <span className="font-medium">{d.title}</span>
                  <a href={d.file} target="_blank" rel="noreferrer" className="ml-4 text-church-red underline">Open</a>
                  <span className="ml-4 text-xs px-2 py-1 rounded ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">{d.is_active ? 'Active' : 'Inactive'}</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-red-600" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!docs.length && <div className="text-sm text-gray-500">No documents yet.</div>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DocumentsManagement;


