import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image,
  ArrowLeft,
  Save,
  X,
  Upload,
  Eye,
  MoveUp,
  MoveDown
} from "lucide-react";
import { apiUrls } from '@/config/api';

interface HeroImage {
  id?: number;
  src: string;
  title: string;
  subtitle: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const HeroImagesManagement = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    // Load hero images from API
    loadHeroImages();
  }, [token]);

  const loadHeroImages = async () => {
    try {
      const response = await fetch(apiUrls.admin.heroImages(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHeroImages(result.data || []);
        } else {
          console.error('Failed to load hero images:', result.message);
          setHeroImages([]);
        }
      } else {
        console.error('Failed to load hero images: HTTP', response.status);
        setHeroImages([]);
      }
    } catch (error) {
      console.error('Error loading hero images:', error);
      setHeroImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, imageData: HeroImage | FormData) => {
    e.preventDefault();
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    
    try {
      let requestBody: FormData | string;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      // Check if imageData is FormData (always passed from dialog)
      if (imageData instanceof FormData) {
        // Use FormData for both create and update (allows image upload on update)
        requestBody = imageData;
        // Don't set Content-Type header - browser will set it with boundary for FormData
        
        // Debug: Log FormData contents
        console.log('FormData contents:');
        for (const [key, value] of requestBody.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, value.name, `(${value.size} bytes)`);
          } else {
            console.log(`${key}:`, value);
          }
        }
      } else {
        // Fallback: If somehow we get a HeroImage object (shouldn't happen, but just in case)
        const data = imageData as HeroImage;
        requestBody = JSON.stringify({
          title: data.title,
          subtitle: data.subtitle,
          display_order: data.display_order,
          is_active: data.is_active
        });
        headers['Content-Type'] = 'application/json';
      }

      const url = editingImage 
        ? `${apiUrls.admin.heroImages()}/${editingImage.id}`
        : apiUrls.admin.heroImages();

      const method = editingImage ? 'PUT' : 'POST';

      console.log(`Making ${method} request to:`, url);
      console.log('Editing image:', editingImage ? editingImage.id : 'new');

      // Always use POST + _method=PUT for updates with a file (PHP only handles files on POST)
      let actualMethod = method;
      let actualUrl = url;
      if (imageData instanceof FormData && editingImage) {
        console.log('Update with FormData detected, using POST with _method=PUT for reliable parsing');
        imageData.append('_method', 'PUT');
        actualMethod = 'POST';
      }

      let response: Response;
      try {
        response = await fetch(actualUrl, {
          method: actualMethod,
          headers,
          body: requestBody,
        });
      } catch (networkError: any) {
        console.error('Network error:', networkError);
        // Handle HTTP/2 protocol errors specifically
        const errorMsg = networkError.message || String(networkError);
        if (errorMsg.includes('HTTP2') || errorMsg.includes('ERR_HTTP2') || errorMsg.includes('protocol')) {
          alert(
            'Upload failed due to HTTP/2 protocol error. This usually happens with large files.\n\n' +
            'Solutions:\n' +
            '1. Compress the image to under 10MB\n' +
            '2. Contact your hosting provider to increase upload limits\n' +
            '3. Upload the updated backend/routes/api.php file and run: php artisan route:clear\n' +
            '4. Try uploading a smaller image first'
          );
          return;
        }
        throw networkError;
      }

      console.log('Response status:', response.status, response.statusText);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          console.log('Response JSON:', result);
          
          if (result.success !== false) {
            // Success - reload images and close dialog
            console.log('Update successful, refreshing image list...');
            // Update the specific image in the list immediately with the response data
            if (result.data) {
              setHeroImages(prevImages => {
                return prevImages.map(img => 
                  img.id === result.data.id ? result.data : img
                );
              });
            }
            // Try to reload all images, but don't fail if it errors
            try {
              await loadHeroImages();
            } catch (reloadError) {
              console.warn('Failed to reload images list, but update was successful:', reloadError);
              // Update was successful, so we continue anyway
            }
            setIsDialogOpen(false);
            setEditingImage(null);
            // Show success message
            alert('Hero image saved successfully!');
          } else {
            const errorMsg = result.message || 'Failed to save hero image';
            console.error('Backend returned success=false:', result);
            alert('Failed to save hero image: ' + errorMsg);
          }
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          alert('Received unexpected response from server. Please check console for details.');
        }
      } else {
        let errorText = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorResult = JSON.parse(responseText);
          console.error('Error response:', errorResult);
          
          if (errorResult?.errors) {
            const first = Object.values(errorResult.errors).flat()[0] as string;
            errorText = first || errorResult.message || errorText;
          } else if (errorResult?.message) {
            errorText = errorResult.message;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorText = `Server error: ${responseText.substring(0, 100)}`;
        }
        alert('Failed to save hero image: ' + errorText);
      }
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Error saving hero image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero image?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrls.admin.heroImages()}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadHeroImages();
        } else {
          alert('Failed to delete hero image: ' + result.message);
        }
      } else {
        alert('Failed to delete hero image. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting hero image:', error);
      alert('Error deleting hero image. Please try again.');
    }
  };

  const handleMoveUp = async (id: number, currentOrder: number) => {
    const targetImage = heroImages.find(img => img.display_order === currentOrder - 1);
    if (!targetImage) return;

    try {
      // Swap display orders
      const response1 = await fetch(`${apiUrls.admin.heroImages()}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ display_order: currentOrder - 1 })
      });

      const response2 = await fetch(`${apiUrls.admin.heroImages()}/${targetImage.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ display_order: currentOrder })
      });

      if (response1.ok && response2.ok) {
        await loadHeroImages();
      }
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  const handleMoveDown = async (id: number, currentOrder: number) => {
    const targetImage = heroImages.find(img => img.display_order === currentOrder + 1);
    if (!targetImage) return;

    try {
      // Swap display orders
      const response1 = await fetch(`${apiUrls.admin.heroImages()}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ display_order: currentOrder + 1 })
      });

      const response2 = await fetch(`${apiUrls.admin.heroImages()}/${targetImage.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ display_order: currentOrder })
      });

      if (response1.ok && response2.ok) {
        await loadHeroImages();
      }
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hero images...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hero Images Management</h1>
                <p className="text-gray-600">Manage the carousel images on your homepage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Add New Image Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingImage(null)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Hero Image</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingImage ? 'Edit Hero Image' : 'Add New Hero Image'}
                </DialogTitle>
                <DialogDescription>
                  {editingImage 
                    ? 'Update the hero image details below.' 
                    : 'Add a new image to your homepage carousel.'
                  }
                </DialogDescription>
              </DialogHeader>
              <HeroImageDialog
                image={editingImage}
                onSave={handleSubmit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setEditingImage(null);
                }}
                isSaving={isSaving}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Hero Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroImages
            .sort((a, b) => a.display_order - b.display_order)
            .map((image, index) => (
            <Card key={image.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={image.src + (image.src.includes('?') ? '&' : '?') + `v=${image.updated_at || Date.now()}`}
                      alt={image.title}
                      className="w-full h-48 object-cover rounded-lg"
                      key={`hero-img-${image.id}-${image.updated_at || Date.now()}`}
                      onError={(e) => {
                        console.error('Failed to load image:', image.src);
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        #{image.display_order}
                      </span>
                    </div>
                  </div>

                  {/* Image Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{image.subtitle}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        image.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {image.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingImage(image);
                        setIsDialogOpen(true);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(image.id!, image.display_order)}
                      disabled={image.display_order === 1}
                      className="flex items-center space-x-1"
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(image.id!, image.display_order)}
                      disabled={image.display_order === heroImages.length}
                      className="flex items-center space-x-1"
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(image.id!)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {heroImages.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Images</h3>
            <p className="text-gray-500">Get started by adding your first hero image.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Hero Image Dialog Component
const HeroImageDialog = ({
  image,
  onSave,
  onClose,
  isSaving
}: {
  image: HeroImage | null;
  onSave: (e: React.FormEvent, imageData: HeroImage | FormData) => void;
  onClose: () => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState<HeroImage>(
    image || {
      src: '/placeholder.svg',
      title: '',
      subtitle: '',
      display_order: 1,
      is_active: true
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(image?.src || '/placeholder.svg');

  useEffect(() => {
    if (image) {
      setFormData(image);
      setImagePreview(image.src);
    }
  }, [image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('subtitle', formData.subtitle);
    fd.append('display_order', formData.display_order.toString());
    // Send as string 'true'/'false' or '1'/'0' - Laravel will convert it
    fd.append('is_active', formData.is_active ? '1' : '0');
    if (imageFile) {
      fd.append('image', imageFile);
      console.log('Including image file in FormData:', imageFile.name);
    } else {
      console.log('No new image file selected');
    }
    console.log('FormData prepared for:', image ? `update (ID: ${image.id})` : 'create');
    onSave(e, fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image">Hero Image</Label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">
                Upload a high-quality image (1920x1080px recommended). Max size: 65MB
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Welcome to Our Church"
            required
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Textarea
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g., A place of worship and community"
            rows={3}
            required
          />
        </div>

        {/* Display Order */}
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            min="1"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
            placeholder="1"
            required
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="is_active">Active (show on homepage)</Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" variant="elegant" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : (image ? 'Update' : 'Create')} Image
        </Button>
      </div>
    </form>
  );
};

export default HeroImagesManagement;
