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

  const handleSubmit = async (e: React.FormEvent, imageData: HeroImage) => {
    e.preventDefault();
    
    try {
      let requestBody;
      let contentType = 'application/json';

      if (editingImage) {
        // For updates, send JSON data
        requestBody = JSON.stringify({
          title: imageData.title,
          subtitle: imageData.subtitle,
          display_order: imageData.display_order,
          is_active: imageData.is_active
        });
      } else {
        // For new images, use FormData if there's a file
        const formData = new FormData();
        formData.append('title', imageData.title);
        formData.append('subtitle', imageData.subtitle);
        formData.append('display_order', imageData.display_order.toString());
        formData.append('is_active', imageData.is_active.toString());
        
        if (imageData.src && imageData.src !== '/placeholder.svg') {
          if (imageData.src.startsWith('blob:') || imageData.src.startsWith('data:')) {
            console.log('Image file handling needed for new images');
          } else {
            formData.append('src', imageData.src);
          }
        }
        
        requestBody = formData;
        contentType = 'multipart/form-data';
      }

      const url = editingImage 
        ? `${apiUrls.admin.heroImages()}/${editingImage.id}`
        : apiUrls.admin.heroImages();

      const method = editingImage ? 'PUT' : 'POST';

      const headers: HeadersInit = {};
      if (contentType === 'application/json') {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`
        },
        body: requestBody,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadHeroImages();
          setIsDialogOpen(false);
          setEditingImage(null);
        } else {
          alert('Failed to save hero image: ' + result.message);
        }
      } else {
        const errorResult = await response.json();
        alert('Failed to save hero image: ' + (errorResult.message || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Error saving hero image. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero image?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrls.heroImages()}/${id}`, {
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
      const response1 = await fetch(`${apiUrls.heroImages()}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: currentOrder - 1 })
      });

      const response2 = await fetch(`${apiUrls.heroImages()}/${targetImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const response1 = await fetch(`${apiUrls.heroImages()}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: currentOrder + 1 })
      });

      const response2 = await fetch(`${apiUrls.heroImages()}/${targetImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
                      src={image.src}
                      alt={image.title}
                      className="w-full h-48 object-cover rounded-lg"
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
  onClose
}: {
  image: HeroImage | null;
  onSave: (e: React.FormEvent, imageData: HeroImage) => void;
  onClose: () => void;
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
    onSave(e, formData);
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
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" variant="elegant">
          <Save className="h-4 w-4 mr-2" />
          {image ? 'Update' : 'Create'} Image
        </Button>
      </div>
    </form>
  );
};

export default HeroImagesManagement;
