import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";

const ChangePassword = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(apiUrls.admin.changePassword(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ current_password: currentPassword, password, password_confirmation: passwordConfirmation })
    });
    if (res.ok) {
      alert('Password updated successfully');
      setCurrentPassword(""); setPassword(""); setPasswordConfirmation("");
    } else {
      try {
        const err = await res.json();
        alert(err.message || Object.values(err?.errors||{}).flat()[0] || 'Failed to update password');
      } catch {
        alert('Failed to update password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Change Password</h1>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                <Input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
              </div>
              <div>
                <Button type="submit">Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChangePassword;


