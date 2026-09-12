import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { School, Plus, Search, Edit, Trash2, MapPin, Users, Calendar } from "lucide-react";
import { apiUrls } from '@/config/api';

interface School {
  id: number;
  name: string;
  type: string;
  description: string;
  location: string;
  head_teacher: string;
  contact_phone: string;
  contact_email: string;
  programs_offered: string[];
  founded_year: number;
  is_active: boolean;
}

const SchoolsManagement = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // Fetch schools from database
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch(apiUrls.schools());
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
        } else {
          // Fallback to static data
          setSchools([]);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.head_teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || school.type === selectedType;
    return matchesSearch && matchesType;
  });

  const schoolTypes = ["all", "ecd", "primary", "secondary_basic", "secondary_boarding", "tss_boarding", "university"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Institutions</h1>
            <p className="text-gray-600">Manage 32 Schools & Universities across the diocese</p>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-full">
                  <School className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Schools</p>
                  <p className="text-2xl font-bold text-gray-900">{schools.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Schools</p>
                  <p className="text-2xl font-bold text-gray-900">{schools.filter(s => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(schools.map(s => s.location)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Established</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.min(...schools.map(s => s.founded_year))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Schools</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, location, or head teacher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="type">School Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolTypes.map(type => (
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
                  Add School
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schools List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <p className="text-sm text-gray-600">{school.location}</p>
                  </div>
                  <Badge variant={school.is_active ? "default" : "secondary"}>
                    {school.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Head Teacher</p>
                    <p className="text-sm text-gray-600">{school.head_teacher}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Type</p>
                    <Badge variant="outline">{(school.type ?? 'unknown').replace("_", " ").toUpperCase()}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Founded</p>
                    <p className="text-sm text-gray-600">{school.founded_year}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType !== "all" 
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first school"
                }
              </p>
              <Button className="bg-church-red hover:bg-church-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchoolsManagement;
