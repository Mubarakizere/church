import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventEditor from "@/components/admin/EventEditor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Match the EventEditor Event shape so onSave types align.
interface EditorEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  featured: boolean;
  attendees: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean; // Add is_active field used by Program cards
}

type Program = EditorEvent;

const ProgramsManagement: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/programs`);
        if (!res.ok) throw new Error('Failed to load programs');
        const json = await res.json();
        if (mounted) setPrograms(json.data || []);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Unable to load programs', variant: 'destructive' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiBase, toast]);

  const openCreate = () => { setEditingProgram(null); setIsEditorOpen(true); };
  const openEdit = (p: Program) => { setEditingProgram(p); setIsEditorOpen(true); };

  // Async save helper; returns a Promise but is not passed directly to EventEditor
  const saveAsync = async (eventPayload: EditorEvent) => {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      let res: Response;
      if (editingProgram) {
        res = await fetch(`${apiBase}/api/programs/${editingProgram.id}`, { method: 'PUT', headers, body: JSON.stringify(eventPayload) });
      } else {
        res = await fetch(`${apiBase}/api/programs`, { method: 'POST', headers, body: JSON.stringify(eventPayload) });
      }
      if (!res.ok) throw new Error('Save failed');
      const json = await res.json();
      const newData = json.data ?? json;
      if (editingProgram) setPrograms(prev => prev.map(p => p.id === editingProgram.id ? newData : p));
      else setPrograms(prev => [newData, ...prev]);
      setIsEditorOpen(false);
      setEditingProgram(null);
      toast({ title: 'Saved' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Save failed', variant: 'destructive' });
    }
  };

  // Synchronous wrapper matching EventEditor onSave signature
  const handleSave = (eventData: EditorEvent) => {
    void saveAsync(eventData);
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this program?')) return;
    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${apiBase}/api/programs/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      setPrograms(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Deleted' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Delete failed', variant: 'destructive' });
    }
  };

  if (loading) return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div><p>Loading programs...</p></div></div>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Programs</h1>
            <p className="text-sm text-gray-600">Manage site programs</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreate} className="bg-church-red"><Plus className="h-4 w-4 mr-2"/>Add Program</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.map(p => (
            <Card key={p.id} className="hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <p className="text-sm text-gray-600">{p.location}</p>
                  </div>
                  <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{p.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-gray-500">{p.attendees}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Edit className="h-4 w-4 mr-1"/>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 mr-1"/>Delete</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <EventEditor event={editingProgram ?? undefined} isOpen={isEditorOpen} onClose={() => { setIsEditorOpen(false); setEditingProgram(null); }} onSave={handleSave} />
      </div>
    </div>
  );
};

export default ProgramsManagement;
