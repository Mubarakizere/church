import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  Edit, 
  Save,
  ArrowLeft,
  X,
  Plus,
  AlertCircle
} from "lucide-react";
import { apiUrls } from "@/config/api";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

interface Service {
  id: string;
  title: string;
  time: string;
  type: string;
  description: string;
  features: string[];
  language: string;
  is_active?: boolean;
  display_order?: number;
}

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    // ProtectedRoute should handle redirects; just load services if token exists
    if (!token) return;
    loadServices();
  }, [token]);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API
      const response = await axios.get(apiUrls.services(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let servicesData: Service[] = [];
      
      if (response.data && response.data.success) {
        // API returned data successfully
        servicesData = response.data.data.map((service: any) => ({
          ...service,
          // Ensure features is an array
          features: Array.isArray(service.features) 
            ? service.features 
            : (service.features ? JSON.parse(service.features) : [])
        }));
      }
      
      // If no services from API, use mock data as initial data
      if (servicesData.length === 0) {
        const mockData: Service[] = [
          {
            id: '1',
            title: 'English Service',
            time: '6:30 AM - 8:30 AM',
            type: 'Holy Communion in English',
            description: 'Early morning Anglican service conducted entirely in English. Traditional liturgy with Holy Communion, perfect for English-speaking congregation members.',
            features: ['English Liturgy', 'Holy Communion', 'Traditional Hymns', 'Morning Prayer'],
            language: 'English',
            is_active: true,
            display_order: 1
          },
          {
            id: '2',
            title: 'Kinyarwanda Service',
            time: '9:00 AM - 12:00 PM',
            type: 'Holy Communion in Kinyarwanda',
            description: 'Main morning service conducted in Kinyarwanda, our local language. Full Anglican liturgy with Holy Communion, designed for the local community.',
            features: ['Kinyarwanda Liturgy', 'Holy Communion', 'Local Hymns', 'Community Fellowship'],
            language: 'Kinyarwanda',
            is_active: true,
            display_order: 2
          },
          {
            id: '3',
            title: 'Mixed Service',
            time: '3:30 PM - 5:30 PM',
            type: 'Bilingual Worship',
            description: 'Afternoon service combining both English and Kinyarwanda. A unique worship experience that brings together our diverse congregation in unity.',
            features: ['Bilingual Worship', 'Mixed Congregation', 'Contemporary & Traditional', 'Unity in Diversity'],
            language: 'Mixed',
            is_active: true,
            display_order: 3
          }
        ];
        servicesData = mockData;
        
        // If no services in database, add the mock data to the database
        for (const service of mockData) {
          try {
            await axios.post(apiUrls.services(), {
              ...service,
              features: JSON.stringify(service.features)
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err) {
            console.error('Failed to add mock service to database:', err);
          }
        }
        
        // Reload services from API after adding mock data
        const refreshResponse = await axios.get(apiUrls.services(), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (refreshResponse.data && refreshResponse.data.success) {
          servicesData = refreshResponse.data.data.map((service: any) => ({
            ...service,
            features: Array.isArray(service.features) 
              ? service.features 
              : (service.features ? JSON.parse(service.features) : [])
          }));
        }
      }
      
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to load services:', error);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (service: Service) => {
    try {
      const serviceData = {
        ...service,
        features: JSON.stringify(service.features),
        is_active: service.is_active !== undefined ? service.is_active : true,
        display_order: service.display_order || 0
      };
      
      let response;
      
      if (service.id && service.id !== 'new') {
        // Update existing service
        response = await axios.put(`${apiUrls.services()}/${service.id}`, serviceData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Add new service
        response = await axios.post(apiUrls.services(), serviceData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (response.data && response.data.success) {
        toast({
          title: service.id !== 'new' ? "Service Updated" : "Service Created",
          description: response.data.message || "Service saved successfully",
        });
        
        // Reload services to get fresh data
        loadServices();
      }
      
      setIsDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Failed to save service:', error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await axios.delete(`${apiUrls.services()}/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          toast({
            title: "Service Deleted",
            description: response.data.message || "Service deleted successfully",
          });
          
          // Reload services to get fresh data
          loadServices();
        }
      } catch (error) {
        console.error('Failed to delete service:', error);
        toast({
          title: "Error",
          description: "Failed to delete service. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-church-red hover:bg-church-red/90"
                onClick={() => setEditingService({
                  id: 'new',
                  title: '',
                  time: '',
                  type: '',
                  description: '',
                  features: [],
                  language: '',
                  is_active: true,
                  display_order: services.length + 1
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <ServiceDialog
              service={editingService}
              onSave={handleSaveService}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingService(null);
              }}
            />
          </Dialog>
        </div>
      </header>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 m-6 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => loadServices()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-church-red">{service.title}</CardTitle>
                    <div className="flex items-center mt-2 text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-medium">{service.time}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingService(service);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Service Type:</p>
                    <p className="text-sm text-gray-600">{service.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Language:</p>
                    <p className="text-sm text-gray-600">{service.language}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status:</p>
                    <p className="text-sm text-gray-600">
                      {service.is_active ? 
                        <span className="text-green-600">Active</span> : 
                        <span className="text-gray-500">Inactive</span>
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Features:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block bg-church-red/10 text-church-red text-xs px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No services configured yet.</p>
            <p className="text-gray-400">Add your first service to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Service Dialog Component
const ServiceDialog = ({ 
  service, 
  onSave, 
  onClose 
}: { 
  service: Service | null; 
  onSave: (service: Service) => void; 
  onClose: () => void; 
}) => {
  const [formData, setFormData] = useState<Service>(
    service || {
      id: 'new',
      title: '',
      time: '',
      type: '',
      description: '',
      features: [],
      language: ''
    }
  );

  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    if (service) {
      setFormData(service);
      setFeaturesText(service.features.join(', '));
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText.split(',').map(f => f.trim()).filter(f => f);
    onSave({ ...formData, features });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {formData.id === 'new' ? 'Add Service' : 'Edit Service'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Service Time *</Label>
            <Input
              id="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="e.g., 9:00 AM - 12:00 PM"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Service Type *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g., Holy Communion"
              required
            />
          </div>
          <div>
            <Label htmlFor="language">Language *</Label>
            <Input
              id="language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="e.g., English, Kinyarwanda, Mixed"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order || 0}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              placeholder="e.g., 1, 2, 3"
            />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active !== false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-church-red focus:ring-church-red"
            />
            <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active Service
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe the service..."
          />
        </div>

        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Textarea
            id="features"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={2}
            placeholder="e.g., Holy Communion, Traditional Hymns, Community Fellowship"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-church-red hover:bg-church-red/90">
            <Save className="h-4 w-4 mr-2" />
            Save Service
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default ServicesManagement;
