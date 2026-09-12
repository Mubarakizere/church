import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Search, Edit, Trash2, Users, Target, ArrowLeft } from "lucide-react";
import { apiUrls } from '@/config/api';

interface Program {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  attendees: string;
  featured: boolean;
  is_active: boolean;
  start_date: string;
  recurrence_pattern?: string;
  metadata?: any;
  // Backward compatibility accessors
  name?: string;
  type?: string;
  beneficiaries?: string;
  status?: string;
  end_date?: string;
}

const ProjectsManagement = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // form state
  const [form, setForm] = useState<Partial<Program>>({});

  const openCreateForm = () => {
    setEditingProgram(null);
    setForm({
      title: '',
      category: '',
      description: '',
      location: '',
      attendees: '',
      start_date: new Date().toISOString().slice(0,10),
      featured: false,
      is_active: true
    });
    setIsFormOpen(true);
  }

  const openEditForm = (program: Program) => {
    setEditingProgram(program);
    setForm({ ...program });
    setIsFormOpen(true);
  }

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProgram(null);
    setForm({});
  }

  const saveProgram = async () => {
    try {
      const payload = { ...form } as any;
      let res;
      if (editingProgram) {
        // update
        res = await fetch(apiUrls.program(editingProgram.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setPrograms(prev => prev.map(p => p.id === updated.id ? updated : p));
        } else {
          console.warn('Update failed, server replied', res.status);
        }
      } else {
        // create
        res = await fetch(apiUrls.programs(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          // Refresh the programs list to get the latest data
          fetchPrograms();
        } else {
          console.warn('Create failed, server replied', res.status);
        }
      }
    } catch (err) {
      console.error('Save program error', err);
    } finally {
      closeForm();
    }
  }

  const deleteProgram = async (program: Program) => {
    if (!confirm(`Delete program "${program.title || program.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(apiUrls.program(program.id), {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        // Refresh the programs list to get the latest data
        fetchPrograms();
      } else {
        console.warn('Delete failed, server replied', res.status);
      }
    } catch (err) {
      console.error('Delete program error', err);
    }
  }

  // Fetch programs from backend
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrls.programs(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle API response structure {success: true, data: [...]}
        if (data.success && Array.isArray(data.data)) {
          setPrograms(data.data);
        } else if (Array.isArray(data)) {
          setPrograms(data);
        } else {
          console.error('Unexpected API response format:', data);
          setPrograms([]);
        }
      } else {
        console.error('Failed to fetch programs:', response.status);
        // Fallback to static data if API fails
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      // Fallback to static data if API fails
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Load programs on component mount
  useEffect(() => {
    fetchPrograms();
  }, [token]);

  // We now use real API data instead of static data

  const filteredPrograms = Array.isArray(programs)
    ? programs.filter(program =>
        (program.title || program.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (program.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (program.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Programs</h1>
          <p className="text-gray-600">Manage development initiatives across the diocese</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Programs</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(programs) ? programs.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-full">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Programs</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(programs) ? programs.filter(p => p.is_active).length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Beneficiaries</p>
                  <p className="text-2xl font-bold text-gray-900">4,000+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(programs) ? new Set(programs.map(p => p.location)).size : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Programs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, location, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={openCreateForm} className="bg-church-red hover:bg-church-red/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{program.title || program.name}</CardTitle>
                    <p className="text-sm text-gray-600">{program.location}</p>
                  </div>
                  <Badge variant={program.is_active ? "default" : "secondary"}>
                    {program.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <Badge variant="outline">{(program.category || program.type || '').toUpperCase()}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Attendees</p>
                    <p className="text-sm text-gray-600">{program.attendees || program.beneficiaries}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Started</p>
                    <p className="text-sm text-gray-600">{new Date(program.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => openEditForm(program)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteProgram(program)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first program"
                }
              </p>
              <Button className="bg-church-red hover:bg-church-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modal form */}
        {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">{editingProgram ? 'Edit Program' : 'Add Program'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title || ''} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category || ''} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description || ''} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location || ''} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="attendees">Attendees</Label>
                <Input id="attendees" value={form.attendees || ''} onChange={e => setForm(prev => ({ ...prev, attendees: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={form.start_date || ''} onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="featured">Featured</Label>
                <Input id="featured" type="checkbox" checked={form.featured || false} onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
              <Button className="bg-church-red" onClick={saveProgram}>{editingProgram ? 'Save Changes' : 'Create Program'}</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ProjectsManagement;