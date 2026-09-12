import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AdminMembers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("member");
  const [status, setStatus] = useState("active");

  // Mock data for demonstration
  const [members, setMembers] = useState([
    { id: "1", name: "John Doe", email: "john@example.com", phone: "555-1234", role: "admin", status: "active", joinDate: "Jan 2022" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "555-5678", role: "member", status: "active", joinDate: "Mar 2022" },
    { id: "3", name: "Michael Johnson", email: "michael@example.com", phone: "555-9012", role: "volunteer", status: "active", joinDate: "Jun 2022" },
    { id: "4", name: "Sarah Williams", email: "sarah@example.com", phone: "555-3456", role: "member", status: "inactive", joinDate: "Sep 2022" },
  ]);

  const openDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setName(member.name);
      setEmail(member.email);
      setPhone(member.phone);
      setRole(member.role);
      setStatus(member.status);
    } else {
      setEditingMember(null);
      setName("");
      setEmail("");
      setPhone("");
      setRole("member");
      setStatus("active");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const memberData = {
      id: editingMember?.id || Date.now().toString(),
      name,
      email,
      phone,
      role,
      status,
      joinDate: editingMember?.joinDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    if (editingMember) {
      setMembers(members.map(m => m.id === memberData.id ? memberData : m));
      toast({ title: "Member updated successfully!" });
    } else {
      setMembers([...members, memberData]);
      toast({ title: "Member added successfully!" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (memberId) => {
    setMembers(members.filter(m => m.id !== memberId));
    toast({ title: "Member deleted successfully!" });
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin": return "default";
      case "volunteer": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status) => {
    return status === "active" ? "success" : "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-section">
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Member Management</h1>
            <p className="text-sm text-muted-foreground">Manage members and roles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="elegant" onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Members Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Name</th>
                    <th className="py-2 hidden md:table-cell">Contact</th>
                    <th className="py-2 hidden md:table-cell">Joined</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3">
                        <div className="font-medium text-foreground">{member.name}</div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {member.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell text-muted-foreground">
                        {member.joinDate}
                      </td>
                      <td className="py-3">
                        <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                          {member.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={getStatusBadgeVariant(member.status)} className="capitalize">
                          {member.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openDialog(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-1234" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button variant="elegant" onClick={handleSave}>{editingMember ? "Update" : "Add"} Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembers;
