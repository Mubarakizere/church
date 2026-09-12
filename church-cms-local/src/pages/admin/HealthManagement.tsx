import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Search, Edit, Trash2, MapPin, Users, Phone } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { apiUrls } from '@/config/api';

interface HealthFacility {
  id: number;
  name: string;
  type: string;
  description: string;
  location: string;
  services_offered: string[];
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
}

const HealthManagement = () => {
  const [healthFacilities, setHealthFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Fetch health facilities from database
  useEffect(() => {
    const fetchHealthFacilities = async () => {
      try {
        // Fetch both centers and posts in parallel and normalize fields
        const [centersRes, postsRes] = await Promise.all([
          fetch(apiUrls.healthCenters()),
          fetch(apiUrls.healthPosts())
        ]);

        if (!centersRes.ok || !postsRes.ok) {
          throw new Error('Failed to fetch health centers or posts');
        }

        const [centersData, postsData] = await Promise.all([centersRes.json(), postsRes.json()]);

        // Normalize backend fields to frontend shape: add `type` and `services_offered`
        const normalizedCenters = (centersData || []).map((c: any) => ({
          ...c,
          type: 'health_center',
          services_offered: c.services ?? [],
        }));

        const normalizedPosts = (postsData || []).map((p: any) => ({
          ...p,
          type: 'health_post',
          services_offered: p.services ?? [],
        }));

        setHealthFacilities([...normalizedCenters, ...normalizedPosts]);
      } catch (error) {
        console.error('Failed to fetch health facilities:', error);
        // Fallback: keep the page usable with an empty list
        setHealthFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthFacilities();
  }, []);

  const filteredFacilities = healthFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || facility.type === selectedType;
    const matchesActive = !showOnlyActive || facility.is_active;
    return matchesSearch && matchesType && matchesActive;
  });

  const facilityTypes = ["all", "health_center", "health_post"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health facilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Facilities</h1>
            <p className="text-gray-600">Manage Health Centers & Posts across the diocese</p>
          </div>
          <div>
            <Link to="/admin/dashboard">
              <Button variant="outline" className="inline-flex items-center">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div onClick={() => { setSelectedType('all'); setShowOnlyActive(false); }} className={`cursor-pointer`}>
            <Card className={`hover:shadow-lg transition-shadow ${selectedType === 'all' && !showOnlyActive ? 'ring-2 ring-church-red' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                    <p className="text-2xl font-bold text-gray-900">{healthFacilities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div onClick={() => { setSelectedType('health_center'); setShowOnlyActive(false); }} className="cursor-pointer">
            <Card className={`hover:shadow-lg transition-shadow ${selectedType === 'health_center' ? 'ring-2 ring-church-red' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Health Centers</p>
                    <p className="text-2xl font-bold text-gray-900">{healthFacilities.filter(f => f.type === 'health_center').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div onClick={() => { setSelectedType('health_post'); setShowOnlyActive(false); }} className="cursor-pointer">
            <Card className={`hover:shadow-lg transition-shadow ${selectedType === 'health_post' ? 'ring-2 ring-church-red' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Health Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{healthFacilities.filter(f => f.type === 'health_post').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div onClick={() => { setShowOnlyActive((s) => !s); setSelectedType('all'); }} className="cursor-pointer">
            <Card className={`hover:shadow-lg transition-shadow ${showOnlyActive ? 'ring-2 ring-church-red' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500 rounded-full">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Facilities</p>
                    <p className="text-2xl font-bold text-gray-900">{healthFacilities.filter(f => f.is_active).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Facilities</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="type">Facility Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : (type ?? '').replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="bg-church-red hover:bg-church-red/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Facility
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Facilities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <div key={facility.id}>
              <Link to={`/admin/health/${facility.id}`} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <p className="text-sm text-gray-600">{facility.location}</p>
                    </div>
                    <Badge variant={facility.is_active ? "default" : "secondary"}>
                      {facility.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Type</p>
                      <Badge variant="outline">{(facility.type ?? 'unknown').replace("_", " ").toUpperCase()}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact</p>
                      <p className="text-sm text-gray-600">{facility.contact_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Services</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(facility.services_offered ?? []).slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {(facility.services_offered ?? []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(facility.services_offered ?? []).length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); /* open edit modal */ }}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); /* confirm delete */ }}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {filteredFacilities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No health facilities found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType !== "all" 
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first health facility"
                }
              </p>
              <Button className="bg-church-red hover:bg-church-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HealthManagement;
