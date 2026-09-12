import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, Globe, Mail, Building, Users, Heart, Handshake, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrls } from '@/config/api';
import { SITE_URL } from '@/config';

interface Partner {
  id?: number;
  name: string;
  country?: string;
  type?: string;
  description?: string;
  website?: string;
  email?: string;
  logo?: string;
  category?: string;
  is_active: boolean;
  display_order: number;
}

const PartnersManagement = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partner>({
    name: '',
    country: '',
    type: '',
    description: '',
    website: '',
    email: '',
    logo: '',
    category: 'development',
    is_active: true,
    display_order: 0
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Helper function to fix image URLs
  const fixImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Clean the path and route through backend storage endpoint
    let cleanPath = imagePath.replace(/^\/+/, '').replace(/\\/g, '/');
    if (cleanPath.startsWith('storage/')) {
      cleanPath = cleanPath.substring(8);
    }
    return apiUrls.storage(cleanPath);
  };

  // Fetch partners from API
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrls.partners());
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Process partner logos with fixImageUrl
          const processedPartners = data.data.map((partner: Partner) => ({
            ...partner,
            logo: fixImageUrl(partner.logo)
          }));
          setPartners(processedPartners);
        } else {
          console.error('Unexpected API response format:', data);
          setPartners([]);
        }
      } else {
        console.error('Failed to fetch partners:', response.status);
        setPartners([]);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      const url = editingPartner
        ? apiUrls.partner(editingPartner.id!)
        : apiUrls.partners();

      // Always use POST for FormData (Laravel will handle _method for PUT)
      const method = 'POST';

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add form fields with proper types
      formDataToSend.append('name', formData.name || '');
      if (formData.country && formData.country.trim()) {
        formDataToSend.append('country', formData.country.trim());
      }
      if (formData.type && formData.type.trim()) {
        formDataToSend.append('type', formData.type.trim());
      }
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (formData.website && formData.website.trim()) {
        formDataToSend.append('website', formData.website.trim());
      }
      if (formData.email && formData.email.trim()) {
        formDataToSend.append('email', formData.email.trim());
      }
      if (formData.category && formData.category.trim()) {
        formDataToSend.append('category', formData.category.trim());
      }

      // Handle boolean and number fields properly
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      formDataToSend.append('display_order', (formData.display_order || 0).toString());

      // Add logo file if present
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      } else if (logoPreview && !logoFile && !editingPartner) {
        // If we have a preview but no file, it's a base64 image (only for new partners)
        formDataToSend.append('logo_url', logoPreview);
      }

      // For updates, add the _method field to simulate PUT request
      if (editingPartner) {
        formDataToSend.append('_method', 'PUT');
      }



      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchPartners();
        setIsDialogOpen(false);
        resetForm();
        alert(editingPartner ? 'Partner updated successfully!' : 'Partner added successfully!');
      } else {
        let errorMessage = 'Failed to save partner';
        try {
          const errorData = await response.json();
          console.error('Error saving partner:', errorData);

          // Show specific validation errors
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat().join('\n');
            errorMessage = `Validation errors:\n${errorMessages}`;
          } else if (errorData.message) {
            errorMessage = `Failed to save partner: ${errorData.message}`;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Failed to save partner. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!token) {
      alert('You must be logged in to perform this action');
      return;
    }

    if (!confirm('Are you sure you want to delete this partner?')) {
      return;
    }

    try {
      const response = await fetch(apiUrls.partner(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchPartners();
        alert('Partner deleted successfully!');
      } else {
        alert('Failed to delete partner. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Failed to delete partner. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      type: '',
      description: '',
      website: '',
      email: '',
      logo: '',
      category: 'development',
      is_active: true,
      display_order: 0
    });
    setEditingPartner(null);
    setLogoFile(null);
    setLogoPreview('');
  };

  // Open dialog for editing
  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({ ...partner });
    // Logo preview is already processed by fixImageUrl in fetchPartners
    setLogoPreview(partner.logo || '');
    setLogoFile(null);
    setIsDialogOpen(true);
  };

  // Open dialog for adding
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Filter partners based on search term
  const filteredPartners = Array.isArray(partners) 
    ? partners.filter(partner =>
        (partner.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner.country || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'development':
        return Building;
      case 'mission':
        return Heart;
      case 'diocese':
        return Users;
      default:
        return Handshake;
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, JPG, GIF, SVG)');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
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
            <h1 className="text-2xl font-bold text-gray-900">Partners Management</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-church-red hover:bg-church-red/90"
                onClick={openAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>

            {/* Add/Edit Partner Dialog */}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPartner ? 'Edit Partner' : 'Add Partner'}
                </DialogTitle>
                <DialogDescription>
                  {editingPartner ? 'Update the partner information below.' : 'Fill in the details to add a new partner organization.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload Section - Primary Focus */}
                <div className="text-center">
                  <Label className="text-lg font-semibold">Partner Logo *</Label>
                  <div className="mt-4">
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg mx-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLogoPreview('');
                            setLogoFile(null);
                            setFormData({ ...formData, logo: '' });
                          }}
                          className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Upload Logo</p>
                        </div>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mt-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-church-red file:text-white hover:file:bg-church-red/90"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPEG, PNG, JPG, GIF, SVG (Max 2MB)
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter partner organization name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="e.g., Rwanda, UK, USA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category || 'development'}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="mission">Mission</SelectItem>
                          <SelectItem value="diocese">Diocese</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Optional Details - Collapsible */}
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-4">
                    Additional Details (Optional)
                  </summary>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Brief description of the partner organization"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Organization Type</Label>
                        <Input
                          id="type"
                          value={formData.type || ''}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          placeholder="e.g., NGO, Church, Government"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Contact Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                </details>

                {/* Display Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Show on website</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-church-red hover:bg-church-red/90"
                  >
                    {editingPartner ? 'Update Partner' : 'Add Partner'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Search and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total: {partners.length}</span>
            <span>Active: {partners.filter(p => p.is_active).length}</span>
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p>Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-8">
            <Handshake className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'No partners found matching your search.' : 'No partners found. Add your first partner!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPartners.map((partner) => {
              const CategoryIcon = getCategoryIcon(partner.category || 'development');
              return (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-4">
                    {/* Logo Section - Main Focus */}
                    <div className="aspect-square mb-4 relative">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="w-full h-full object-contain rounded-lg border-2 border-gray-100 group-hover:border-church-red/30 transition-colors"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-church-red/50 transition-colors">
                          <div className="text-center">
                            <CategoryIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">No Logo</p>
                          </div>
                        </div>
                      )}

                      {/* Status Badge */}
                      <Badge
                        variant={partner.is_active ? "default" : "secondary"}
                        className="absolute top-2 right-2 text-xs"
                      >
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Partner Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {partner.name}
                      </h3>

                      {partner.country && (
                        <p className="text-xs text-gray-600">{partner.country}</p>
                      )}

                      {partner.category && (
                        <Badge variant="outline" className="text-xs">
                          {partner.category}
                        </Badge>
                      )}

                      <div className="text-xs text-gray-500">
                        Order: {partner.display_order}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(partner)}
                        className="flex-1 mr-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(partner.id!)}
                        className="text-red-600 hover:text-red-700 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnersManagement;
