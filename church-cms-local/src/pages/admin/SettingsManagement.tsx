import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Globe, Mail, Phone } from "lucide-react";

const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    siteName: "Anglican Church of Rwanda, Shyogwe Diocese",
    siteEmail: "info@shyogwediocese.org",
    sitePhone: "+250 788 503 392",
    maintenanceMode: false,
    allowRegistration: true,
    enableComments: true
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Website configuration and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="siteEmail">Contact Email</Label>
                <Input
                  id="siteEmail"
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="sitePhone">Contact Phone</Label>
                <Input
                  id="sitePhone"
                  value={settings.sitePhone}
                  onChange={(e) => setSettings({...settings, sitePhone: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Temporarily disable public access</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">Allow Registration</Label>
                  <p className="text-sm text-gray-600">Enable user registration</p>
                </div>
                <Switch
                  id="registration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comments">Enable Comments</Label>
                  <p className="text-sm text-gray-600">Allow comments on posts</p>
                </div>
                <Switch
                  id="comments"
                  checked={settings.enableComments}
                  onCheckedChange={(checked) => setSettings({...settings, enableComments: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button className="bg-church-red hover:bg-church-red/90">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
