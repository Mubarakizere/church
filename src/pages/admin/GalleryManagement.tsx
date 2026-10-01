import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { apiUrls } from '@/config/api';
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";

interface GalleryImage {
  id: number;
  title?: string;
  description?: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const GalleryManagement = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrls.gallery());
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setImages(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    if (!token) {
      toast.error('You must be logged in to upload images');
      return;
    }

    if (files.length === 0) return;

    // Convert FileList to Array to ensure we can iterate properly
    const filesArray = Array.from(files);
    const totalFiles = filesArray.length;
    
    console.log(`Starting upload of ${totalFiles} files:`, filesArray.map(f => f.name));
    
    setUploading(true);
    setUploadProgress({ current: 0, total: totalFiles });
    
    let successCount = 0;
    let failCount = 0;

    try {
      // Upload all files one by one
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadProgress({ current: i + 1, total: totalFiles });
        
        console.log(`\n=== Starting upload ${i + 1}/${totalFiles} ===`);
        console.log(`File name: ${file.name}`);
        console.log(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        
        try {
          // Upload the image
          const formData = new FormData();
          formData.append('image', file);
          formData.append('folder', 'gallery');

          console.log(`Calling upload API for: ${file.name}`);
          const uploadResponse = await fetch(apiUrls.uploadImage(), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          console.log(`Upload response status for ${file.name}: ${uploadResponse.status}`);

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log(`Upload result for ${file.name}:`, uploadResult);
            
            if (uploadResult.success && uploadResult.data.url) {
              // Save to gallery
              const imageData = {
                image_url: uploadResult.data.url,
                display_order: 0,
                is_active: true,
              };

              console.log(`Saving to gallery: ${file.name}`);
              const saveResponse = await fetch(apiUrls.gallery(), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(imageData),
              });

              console.log(`Save response status for ${file.name}: ${saveResponse.status}`);

              if (saveResponse.ok) {
                const saveResult = await saveResponse.json();
                console.log(`SUCCESS: Saved to gallery:`, saveResult);
                successCount++;
              } else {
                const errorData = await saveResponse.json();
                console.error(`FAILED to save ${file.name}:`, errorData);
                failCount++;
              }
            } else {
              console.error(`FAILED: Upload failed for ${file.name}: No URL returned`);
              failCount++;
            }
          } else {
            const errorData = await uploadResponse.json();
            console.error(`FAILED: Upload request failed for ${file.name}:`, errorData);
            failCount++;
          }
        } catch (error) {
          console.error(`ERROR uploading file ${file.name}:`, error);
          failCount++;
        }
        
        console.log(`=== Completed upload ${i + 1}/${totalFiles} ===\n`);
      }

      console.log(`\n=== UPLOAD SUMMARY ===`);
      console.log(`Total files: ${totalFiles}`);
      console.log(`Successful: ${successCount}`);
      console.log(`Failed: ${failCount}`);
      console.log(`======================\n`);

      // Show results
      if (successCount > 0) {
        toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully!`);
        console.log('Refreshing gallery data...');
        await fetchGalleryData(); // Refresh list
      }
      if (failCount > 0) {
        toast.error(`${failCount} image${failCount > 1 ? 's' : ''} failed to upload`);
      }

    } catch (error) {
      console.error('Fatal error in upload process:', error);
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      console.log('Upload process completed.');
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!token) {
      toast.error('You must be logged in to delete images');
      return;
    }

    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(apiUrls.galleryItem(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Image deleted successfully!');
        fetchGalleryData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('An error occurred while deleting the image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
            <p className="text-sm text-muted-foreground">Upload and manage photos</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Upload Section */}
        <Card className="shadow-soft mb-6">
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-church-red transition-colors bg-gray-50">
              <Input
                id="multi-image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleMultipleImageUpload(e.target.files);
                    e.target.value = ''; // Reset input
                  }
                }}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="multi-image-upload" className="cursor-pointer block">
                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-16 w-16 animate-spin text-church-red mb-4" />
                    <p className="text-lg font-medium">Uploading images...</p>
                    <p className="text-base text-gray-600 mt-2">
                      {uploadProgress.current} of {uploadProgress.total} images
                    </p>
                    <div className="w-64 h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="h-full bg-church-red transition-all duration-300"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Please wait, this may take a moment</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl font-medium text-gray-700 mb-2">Click to upload images</p>
                    <p className="text-base text-gray-500 mb-1">or drag and drop</p>
                    <p className="text-sm text-gray-400">Select multiple images at once</p>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF, WEBP up to 60MB each</p>
                  </div>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Images */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Gallery Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-church-red mr-3" />
                <span className="text-muted-foreground">Loading images...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No gallery images found</h3>
                <p className="text-muted-foreground mb-6">Upload your first images to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.title || 'Gallery image'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                      />
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GalleryManagement;
