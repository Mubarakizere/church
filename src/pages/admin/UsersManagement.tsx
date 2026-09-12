import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrls } from "@/config/api";
import { Trash2 } from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

const UsersManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const load = async () => {
    const res = await fetch(apiUrls.admin.users(), { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const result = await res.json();
      setUsers(result.data || []);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(apiUrls.admin.users(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation })
    });
    if (res.ok) {
      setName(""); setEmail(""); setPassword(""); setPasswordConfirmation("");
      await load();
    } else {
      try {
        const err = await res.json();
        alert(err.message || Object.values(err?.errors||{}).flat()[0] || 'Failed to create user');
      } catch {
        alert('Failed to create user');
      }
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    const res = await fetch(`${apiUrls.admin.users()}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Admin User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center p-3 border rounded-lg bg-white">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-gray-600">{u.email}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto text-red-600" onClick={() => deleteUser(u.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!users.length && <div className="text-sm text-gray-500">No users yet.</div>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UsersManagement;


