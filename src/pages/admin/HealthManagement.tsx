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
import EditModal from '@/components/admin/EditModal';
import DeleteModal from '@/components/admin/DeleteModal';
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";

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
  const { token } = useAuth();
  const [healthFacilities, setHealthFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  // CRUD Functions
  const handleCreateFacility = () => {
    setSelectedFacility({
      id: 0,
      name: '',
      type: 'health_center',
      description: '',
      location: '',
      services_offered: [],
      contact_phone: '',
      contact_email: '',
      is_active: true
    });
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleEditFacility = (facility: HealthFacility) => {
    setSelectedFacility(facility);
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const handleDeleteFacility = (facility: HealthFacility) => {
    setSelectedFacility(facility);
    setDeleteModalOpen(true);
  };

  const handleSaveFacility = async (facilityData: HealthFacility) => {
    if (!token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setActionLoading(true);
    try {
      const isHealthCenter = facilityData.type === 'health_center';
      const baseUrl = isHealthCenter ? apiUrls.healthCenters() : apiUrls.healthPosts();
      const url = isCreating ? baseUrl : `${baseUrl}/${facilityData.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      // Transform data to match backend expectations
      let servicesArray = [];
      if (Array.isArray(facilityData.services_offered)) {
        servicesArray = facilityData.services_offered;
      } else if (typeof facilityData.services_offered === 'string') {
        servicesArray = facilityData.services_offered.split(',').map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(facilityData.services)) {
        servicesArray = facilityData.services;
      }

      const transformedData = {
        name: facilityData.name || '',
        description: facilityData.description || '',
        location: facilityData.location || '',
        contact_phone: facilityData.contact_phone || '',
        contact_email: facilityData.contact_email || '',
        services: servicesArray,
        is_active: facilityData.is_active !== false ? true : false,
        // Include other fields if they exist
        ...(facilityData.operating_hours && { operating_hours: facilityData.operating_hours }),
        ...(facilityData.image && { image: facilityData.image })
      };

      console.log('Sending data to backend:', {
        url,
        method,
        data: transformedData,
        originalData: facilityData
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        toast.success(isCreating ? 'Health facility created successfully!' : 'Health facility updated successfully!');
        setEditModalOpen(false);
        // Refresh the facilities list
        const updatedResponse = await fetch(apiUrls.healthCenters());
        const updatedPostsResponse = await fetch(apiUrls.healthPosts());
        
        if (updatedResponse.ok && updatedPostsResponse.ok) {
          const centers = await updatedResponse.json();
          const posts = await updatedPostsResponse.json();
          
          // Normalize the data like in fetchHealthFacilities
          const normalizedCenters = centers.map((center: any) => ({
            ...center,
            type: 'health_center',
            services_offered: center.services_offered || []
          }));
          
          const normalizedPosts = posts.map((post: any) => ({
            ...post,
            type: 'health_post',
            services_offered: post.services_offered || []
          }));
          
          setHealthFacilities([...normalizedCenters, ...normalizedPosts]);
        }
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Failed to save health facility (${response.status})`;
        let errorDetails = null;
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Health facility error response:', errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
            errorDetails = errorData.errors || errorData.error || null;
          } else {
            // Handle HTML error responses
            const errorText = await response.text();
            console.error('Health facility update error:', response.status, errorText);
            
            // Try to extract useful error information from HTML if possible
            if (errorText.includes('ValidationException') || errorText.includes('validation')) {
              errorMessage = 'Validation error: Please check your input data';
            } else if (errorText.includes('MethodNotAllowed')) {
              errorMessage = 'Server method not allowed. Please try again.';
            } else {
              errorMessage = `Server error (${response.status}). Please try again.`;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        
        // Show detailed error message if available
        if (errorDetails && typeof errorDetails === 'object') {
          const errorMessages = Object.values(errorDetails).flat().join(', ');
          errorMessage = `Validation failed: ${errorMessages}`;
        }
        
        console.error('Final error message:', errorMessage);
        console.error('Full error details:', { status: response.status, transformedData, originalData: facilityData });
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving health facility:', error);
      toast.error('An error occurred while saving the health facility.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFacility) return;
    
    if (!token) {
      toast.error('You must be logged in to perform this action');
      return;
    }
    
    setActionLoading(true);
    try {
      const isHealthCenter = selectedFacility.type === 'health_center';
      const baseUrl = isHealthCenter ? apiUrls.healthCenters() : apiUrls.healthPosts();
      const response = await fetch(`${baseUrl}/${selectedFacility.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Health facility deleted successfully!');
        setDeleteModalOpen(false);
        // Remove the facility from the list
        setHealthFacilities(healthFacilities.filter(facility => facility.id !== selectedFacility.id));
      } else {
        toast.error('Failed to delete health facility. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting health facility:', error);
      toast.error('An error occurred while deleting the health facility.');
    } finally {
      setActionLoading(false);
    }
  };

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
                <Button 
                  className="bg-church-red hover:bg-church-red/90"
                  onClick={handleCreateFacility}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Facility
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Facilities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility, index) => (
            <Card key={`${facility.type}-${facility.id}-${index}`} className="hover:shadow-lg transition-shadow">
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditFacility(facility)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteFacility(facility)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      asChild
                    >
                      <Link to={`/admin/health/${facility.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <Button 
                className="bg-church-red hover:bg-church-red/90"
                onClick={handleCreateFacility}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <EditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveFacility}
          title={isCreating ? 'Add New Health Facility' : 'Edit Health Facility'}
          data={selectedFacility}
          type="health"
          loading={actionLoading}
          isCreating={isCreating}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Health Facility"
          message="This will permanently delete the health facility and all its data."
          itemName={selectedFacility?.name || ''}
          loading={actionLoading}
        />
      </div>
    </div>
  );
};

export default HealthManagement;
