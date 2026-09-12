import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiUrls } from "@/config/api";

interface GalleryImage {
  id: number;
  title?: string;
  description?: string;
  image_url: string;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
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
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-20 min-h-screen bg-gradient-to-br from-background to-church-red/5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-20 bg-gradient-to-br from-background to-church-red/5">
        {/* Header Section */}
        <section className="relative py-20 bg-gradient-to-r from-church-red to-church-red/80 text-white">
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Explore moments of faith, fellowship, and service from Shyogwe Diocese.
            </p>
          </div>
          <div className="absolute inset-0 bg-black/20"></div>
        </section>

        {/* Gallery Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No images yet</h3>
                <p className="text-gray-600">Check back soon for photos from our ministry.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image) => (
                  <Card 
                    key={image.id} 
                    className="overflow-hidden shadow-soft hover:shadow-medium transition-all cursor-pointer group"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="relative w-full h-64 bg-gray-100">
                      <img 
                        src={image.image_url} 
                        alt={image.title || 'Gallery image'} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                      />
                    </div>
                    {(image.title || image.description) && (
                      <CardContent className="p-4">
                        {image.title && (
                          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{image.title}</h3>
                        )}
                        {image.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeLightbox} 
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 hover:text-white z-10"
            >
              <X className="h-6 w-6" />
            </Button>
            <img 
              src={selectedImage.image_url} 
              alt={selectedImage.title || 'Gallery image'} 
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg" 
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                {selectedImage.title && (
                  <h3 className="text-xl font-bold text-foreground mb-2">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-muted-foreground">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
