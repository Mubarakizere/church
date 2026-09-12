import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  title: string;
  data: any;
  type: 'school' | 'health' | 'team';
  loading?: boolean;
  isCreating?: boolean;
}

const EditModal = ({ isOpen, onClose, onSave, title, data, type, loading = false, isCreating = false }: EditModalProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData((prev: any) => ({
      ...prev,
      [field]: array
    }));
  };

  const renderSchoolForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">School Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter school name"
        />
      </div>
      <div>
        <Label htmlFor="type">School Type</Label>
        <Select value={formData.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select school type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ecd">ECD</SelectItem>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary_basic">Secondary Basic</SelectItem>
            <SelectItem value="secondary_boarding">Secondary Boarding</SelectItem>
            <SelectItem value="tss_boarding">TSS Boarding</SelectItem>
            <SelectItem value="university">University</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter school description"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="Enter school location"
        />
      </div>
      <div>
        <Label htmlFor="head_teacher">Head Teacher</Label>
        <Input
          id="head_teacher"
          value={formData.head_teacher || ''}
          onChange={(e) => handleInputChange('head_teacher', e.target.value)}
          placeholder="Enter head teacher name"
        />
      </div>
      <div>
        <Label htmlFor="contact_phone">Contact Phone</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone || ''}
          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
          placeholder="Enter contact phone"
        />
      </div>
      <div>
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email || ''}
          onChange={(e) => handleInputChange('contact_email', e.target.value)}
          placeholder="Enter contact email"
        />
      </div>
      <div>
        <Label htmlFor="programs_offered">Programs Offered (comma-separated)</Label>
        <Input
          id="programs_offered"
          value={formData.programs_offered?.join(', ') || ''}
          onChange={(e) => handleArrayChange('programs_offered', e.target.value)}
          placeholder="e.g., Mathematics, Science, English"
        />
      </div>
      <div>
        <Label htmlFor="founded_year">Founded Year</Label>
        <Input
          id="founded_year"
          type="number"
          value={formData.founded_year || ''}
          onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value))}
          placeholder="Enter founded year"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active || false}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_active">Active School</Label>
      </div>
    </div>
  );

  const renderHealthForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Facility Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter facility name"
        />
      </div>
      <div>
        <Label htmlFor="type">Facility Type</Label>
        <Select value={formData.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select facility type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="health_center">Health Center</SelectItem>
            <SelectItem value="health_post">Health Post</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter facility description"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="Enter facility location"
        />
      </div>
      <div>
        <Label htmlFor="contact_phone">Contact Phone</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone || ''}
          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
          placeholder="Enter contact phone"
        />
      </div>
      <div>
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email || ''}
          onChange={(e) => handleInputChange('contact_email', e.target.value)}
          placeholder="Enter contact email"
        />
      </div>
      <div>
        <Label htmlFor="services_offered">Services Offered (comma-separated)</Label>
        <Input
          id="services_offered"
          value={formData.services_offered?.join(', ') || ''}
          onChange={(e) => handleArrayChange('services_offered', e.target.value)}
          placeholder="e.g., General Medicine, Pediatrics, Maternity"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active || false}
          onChange={(e) => handleInputChange('is_active', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_active">Active Facility</Label>
      </div>
    </div>
  );

  const renderTeamForm = () => {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        handleInputChange('image', previewUrl);
        handleInputChange('imageFile', file);
      }
    };

    // Determine the current image display
    const currentImage = formData.imageFile ? 
      URL.createObjectURL(formData.imageFile) : 
      (formData.image || '/placeholder.svg');

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter team member name"
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Position</Label>
          <Input
            id="title"
            value={formData.title || formData.position || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter position/title"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bishop">Bishop</SelectItem>
              <SelectItem value="archdeacon">Archdeacon</SelectItem>
              <SelectItem value="department">Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter description"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone"
          />
        </div>
        <div>
          <Label htmlFor="image">Profile Photo</Label>
          <div className="space-y-2">
            {/* Current image preview */}
            {currentImage && (
              <div className="mb-2">
                <img 
                  src={currentImage} 
                  alt="Profile preview" 
                  className="w-32 h-32 object-cover rounded-full border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.imageFile ? 'New file selected - will replace current image' : 'Current image'}
                </p>
              </div>
            )}
            
            {/* File input for new image */}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Choose a new image file to replace the current profile photo
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active !== false}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="is_active">Active Member</Label>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (type) {
      case 'school':
        return renderSchoolForm();
      case 'health':
        return renderHealthForm();
      case 'team':
        return renderTeamForm();
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {isCreating ? 'Fill in the details to add a new item.' : 'Update the information below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {renderForm()}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
