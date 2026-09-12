import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Users } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  category: string;
  email: string;
  image?: string;
  is_active: boolean;
  display_order: number;
}

const TestTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    category: "",
    email: "",
    is_active: true,
    display_order: 0
  });

  // Load team members
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/admin/teams');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
        setError("");
      } else {
        setError(`Failed to load team members: ${response.status}`);
      }
    } catch (err) {
      setError(`Error loading team members: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Create team member
  const createTeamMember = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers([...teamMembers, data.data]);
        setShowAddDialog(false);
        setFormData({ name: "", title: "", category: "", email: "", is_active: true, display_order: 0 });
        setError("");
      } else {
        const errorData = await response.json();
        setError(`Failed to create team member: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Error creating team member: ${err}`);
    }
  };

  // Update team member
  const updateTeamMember = async () => {
    if (!editingMember) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/teams/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(teamMembers.map(member => 
          member.id === editingMember.id ? data.data : member
        ));
        setEditingMember(null);
        setFormData({ name: "", title: "", category: "", email: "", is_active: true, display_order: 0 });
        setError("");
      } else {
        const errorData = await response.json();
        setError(`Failed to update team member: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Error updating team member: ${err}`);
    }
  };

  // Delete team member
  const deleteTeamMember = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/teams/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeamMembers(teamMembers.filter(member => member.id !== id));
        setError("");
      } else {
        setError(`Failed to delete team member: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Error deleting team member: ${err}`);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateTeamMember();
    } else {
      createTeamMember();
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      category: member.category,
      email: member.email,
      is_active: member.is_active,
      display_order: member.display_order
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-church-red mb-2">Team Management Test</h1>
          <p className="text-muted-foreground">Test CRUD operations for team members</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-church-red" />
            <span className="text-lg font-medium">
              Team Members ({teamMembers.length})
            </span>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-church-red hover:bg-church-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Add a new team member to the church leadership.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bishop">Bishop</SelectItem>
                      <SelectItem value="archdeacon">Archdeacon</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-church-red hover:bg-church-red/90">
                    {editingMember ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-red mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading team members...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{member.title}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTeamMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Category:</span> {member.category}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {member.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {member.is_active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Order:</span> {member.display_order}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {teamMembers.length === 0 && !loading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No team members found. Add some to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestTeamManagement;
