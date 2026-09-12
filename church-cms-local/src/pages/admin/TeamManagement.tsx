import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import { apiUrls } from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  Users, 
  Building,
  ArrowLeft,
  Save,
  X
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  category: 'bishop' | 'archdeacon' | 'department';
  description: string;
  email: string;
  phone?: string;
  image: string;
  region?: string;
  display_order?: number;
  is_active?: boolean;
}

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    // ProtectedRoute should handle redirects; just load members when token is available
    if (!token) return;
    loadTeamMembers();
  }, [token]);

  const loadTeamMembers = async () => {
    try {
      // Load team members from API using admin routes (no auth required)
      const response = await fetch(apiUrls.admin.teams(), {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Fix image URLs to point to backend server
          const membersWithFixedImages = (result.data || []).map((member: TeamMember) => {
            if (!member.image || member.image === '/placeholder.svg' || member.image === 'placeholder.svg') {
              return { ...member, image: '/placeholder.svg' };
            }
            
            // Clean the path
            let imagePath = member.image.replace(/^\/+/, '');
            
            // Remove "storage/" prefix if it exists
            if (imagePath.startsWith('storage/')) {
              imagePath = imagePath.substring(8);
            }
            
            // Construct the full URL via backend storage route
            const fixedImage = apiUrls.storage(imagePath);
            
            return {
              ...member,
              image: fixedImage
            };
          });
          setTeamMembers(membersWithFixedImages);
        } else {
          console.error('Failed to load team members:', result.message);
          setTeamMembers([]);
        }
      } else {
        console.error('Failed to load team members: HTTP', response.status);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMember = async (memberData: FormData | TeamMember) => {
    try {
      let response;

      if (memberData instanceof FormData) {
        // Handle FormData (with image upload)
        const memberId = memberData.get('id') as string;

        // Get CSRF token from cookie if available
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        
        const csrfToken = getCookie('XSRF-TOKEN');
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        const headers: HeadersInit = {};
        
        if (csrfToken) {
          headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
        }
        
        // Add Accept header to ensure JSON response
        headers['Accept'] = 'application/json';

        try {
          if (memberId && memberId !== '') {
            // Update existing member using admin routes
            memberData.append('_method', 'PUT');
            response = await fetch(`${apiUrls.admin.teams()}/${memberId}`, {
              method: 'POST',
              headers,
              body: memberData,
              credentials: 'include'
            });
          } else {
            // Create new member using admin routes
            memberData.delete('id'); // Remove empty id
            response = await fetch(apiUrls.admin.teams(), {
              method: 'POST',
              headers,
              body: memberData,
              credentials: 'include'
            });
          }
        } catch (fetchError) {
          console.error('Network error during fetch:', fetchError);
          throw new Error('Network error: Could not connect to the server. Please check your connection.');
        }
      } else {
        // Handle regular object (no image upload)
        const headers = {
          'Content-Type': 'application/json',
        };

        if (memberData.id) {
          // Update existing member using admin routes
          // Ensure is_active is a boolean value, not a string
          const updateData = { 
            ...memberData, 
            is_active: typeof memberData.is_active === 'string' 
                      ? memberData.is_active === 'true' || memberData.is_active === '1'
                      : Boolean(memberData.is_active ?? true)
          };
          response = await fetch(`${apiUrls.admin.teams()}/${memberData.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updateData),
          });
        } else {
          // Create new member using admin routes
          const { id, ...memberWithoutId } = memberData;
          // Ensure is_active is a boolean value, not a string
          const createData = { 
            ...memberWithoutId, 
            is_active: typeof memberWithoutId.is_active === 'string' 
                      ? memberWithoutId.is_active === 'true' || memberWithoutId.is_active === '1'
                      : Boolean(memberWithoutId.is_active ?? true)
          };
          response = await fetch(apiUrls.admin.teams(), {
            method: 'POST',
            headers,
            body: JSON.stringify(createData),
          });
        }
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Response from server:', result);
        if (result.success) {
          // Reload team members from server
          await loadTeamMembers();
          setIsDialogOpen(false);
          setEditingMember(null);
          alert('Team member saved successfully!');
        } else {
          throw new Error(result.message || 'Failed to save team member');
        }
      } else {
        let errorMessage = `Server error (${response.status})`;
        
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          console.error('HTTP error saving team member:', response.status, errorData);
          
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat().join(', ');
            errorMessage = `Validation failed: ${errorMessages}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If we can't parse the response as JSON, it might be an HTML error page
          console.error('Error parsing response:', parseError);
          if (response.status === 500) {
            errorMessage = 'Server error: The server encountered an internal error. This might be related to image upload size or format.';
          } else if (response.status === 413) {
            errorMessage = 'The uploaded file is too large. Maximum size is 2MB.';
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to save member:', error);
      alert(`Failed to save team member: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`${apiUrls.admin.teams()}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Reload team members from server
            await loadTeamMembers();
            alert('Team member deleted successfully!');
          } else {
            throw new Error(result.message || 'Failed to delete team member');
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete team member');
        }
      } catch (error) {
        console.error('Failed to delete member:', error);
        alert('Failed to delete team member. Please try again.');
      }
    }
  };

  // Helper function to get ranking priority based on title hierarchy
  const getTitleRanking = (title: string): number => {
    const lowerTitle = title.toLowerCase();
    
    // Human Resource positions (highest priority)
    if (lowerTitle.includes('human') || lowerTitle.includes('hr')) return 1;
    
    // Director/Head positions
    if (lowerTitle.includes('director') || lowerTitle.includes('head')) return 2;
    
    // Manager/Coordinator positions
    if (lowerTitle.includes('manager') || lowerTitle.includes('coordinator')) return 3;
    
    // Officer/Specialist positions
    if (lowerTitle.includes('officer') || lowerTitle.includes('specialist')) return 4;
    
    // Assistant positions
    if (lowerTitle.includes('assistant') || lowerTitle.includes('deputy')) return 5;
    
    // Secretary positions
    if (lowerTitle.includes('secretary')) return 6;
    
    // Default priority
    return 7;
  };

  // Enhanced sorting function that considers both display_order and title hierarchy
  const sortMembersByRanking = (a: TeamMember, b: TeamMember): number => {
    // First, sort by display_order if both have it
    const aOrder = a.display_order || 0;
    const bOrder = b.display_order || 0;
    
    if (aOrder !== 0 && bOrder !== 0) {
      return aOrder - bOrder;
    }
    
    // If display_order is not set, use title hierarchy
    if (aOrder === 0 && bOrder === 0) {
      const aRank = getTitleRanking(a.title);
      const bRank = getTitleRanking(b.title);
      
      if (aRank !== bRank) {
        return aRank - bRank;
      }
      
      // If same ranking, sort alphabetically by name
      return a.name.localeCompare(b.name);
    }
    
    // If one has display_order and other doesn't, prioritize display_order
    return aOrder - bOrder;
  };

  const filteredMembers = selectedCategory === 'all' 
    ? teamMembers.sort(sortMembersByRanking)
    : teamMembers.filter(member => member.category === selectedCategory)
                 .sort(sortMembersByRanking);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bishop': return Crown;
      case 'archdeacon': return Users;
      case 'department': return Building;
      default: return Users;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-church-red hover:bg-church-red/90"
                onClick={() => setEditingMember({
                  id: '',
                  name: '',
                  title: '',
                  category: 'department',
                  description: '',
                  email: '',
                  image: '/placeholder.svg',
                  is_active: true
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <TeamMemberDialog
              member={editingMember}
              onSave={handleSaveMember}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingMember(null);
              }}
            />
          </Dialog>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Members' },
              { value: 'bishop', label: 'Bishop' },
              { value: 'archdeacon', label: 'Archdeacons' },
              { value: 'department', label: 'Departments' }
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={selectedCategory === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(filter.value)}
                className={selectedCategory === filter.value ? "bg-church-red hover:bg-church-red/90" : ""}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const IconComponent = getCategoryIcon(member.category);
            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-48 h-48 bg-gradient-accent rounded-full flex items-center justify-center mr-3">
                        {member.image && member.image !== '/placeholder.svg' ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-[180px] h-[180px] rounded-full object-cover"
                            style={{
                              imageRendering: 'auto',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'translateZ(0)',
                              WebkitTransform: 'translateZ(0)',
                              filter: 'contrast(1.1) saturate(1.1)'
                            }}
                          />
                        ) : (
                          <IconComponent className="h-16 w-16 text-church-red" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-church-red">{member.title}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMember(member);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{member.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">{member.email}</p>
                    {member.phone && <p className="text-xs text-gray-500">{member.phone}</p>}
                    {member.region && <p className="text-xs text-gray-500">Region: {member.region}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found for the selected category.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Team Member Dialog Component
const TeamMemberDialog = ({
  member,
  onSave,
  onClose
}: {
  member: TeamMember | null;
  onSave: (member: TeamMember) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<TeamMember>(
    member || {
      id: '',
      name: '',
      title: '',
      category: 'department',
      description: '',
      email: '',
      image: '/placeholder.svg',
      is_active: true
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(member?.image || '/placeholder.svg');

  useEffect(() => {
    if (member) {
      setFormData(member);
      setImagePreview(member.image || '/placeholder.svg');
    }
  }, [member]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's no image file, use the regular JSON approach
    if (!imageFile && formData.id) {
      // For updates without image changes
      const updateData = {
        id: formData.id || '',
        name: formData.name,
        title: formData.title,
        category: formData.category,
        email: formData.email,
        phone: formData.phone || null,
        description: formData.description || null,
        region: formData.region || null,
        image: formData.image || '',
        is_active: formData.is_active !== undefined ? 
          (typeof formData.is_active === 'string' 
            ? formData.is_active === 'true' || formData.is_active === '1'
            : Boolean(formData.is_active)) : 
          true
      };
      
      onSave(updateData);
      return;
    }
    
    // Create FormData for file upload
    const submitData = new FormData();
    
    // Add all form fields
    submitData.append('name', formData.name);
    submitData.append('title', formData.title);
    submitData.append('category', formData.category);
    submitData.append('email', formData.email);
    
    // Add optional fields if they exist
    if (formData.phone) submitData.append('phone', formData.phone);
    if (formData.description) submitData.append('description', formData.description);
    if (formData.region) submitData.append('region', formData.region);
    if (formData.id) submitData.append('id', formData.id);
    
    // Add is_active field as a proper boolean value
    // The backend expects a boolean value, not a string
    // For FormData, we need to use '1' for true and '0' for false to ensure proper boolean conversion
    submitData.append('is_active', formData.is_active !== undefined ? 
        (typeof formData.is_active === 'string' 
            ? formData.is_active === 'true' ? '1' : '0'
            : Boolean(formData.is_active) ? '1' : '0') : 
        '1');
    
    // Add image if selected - ensure proper file handling
    if (imageFile) {
      // Check if the file size is within limits (100MB = 100 * 1024 * 1024 bytes)
      if (imageFile.size > 100 * 1024 * 1024) {
        alert('Image file is too large. Maximum size is 100MB.');
        return; // Stop form submission
      }
      
      // Check if the file type is supported
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!supportedTypes.includes(imageFile.type)) {
        alert('Unsupported file type. Please use JPEG, PNG, or GIF images.');
        return; // Stop form submission
      }
      
      // Append the file with the correct field name
      submitData.append('image', imageFile);
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    console.log('formData.id:', formData.id);
    console.log('imageFile:', imageFile);
    
    // Log all form data entries for debugging
    console.log('All FormData entries:');
    for (let [key, value] of submitData.entries()) {
      console.log(key, typeof value === 'object' ? `[File: ${(value as File).name}]` : value);
    }

    // Additional debug for image file
    if (imageFile) {
      console.log('Image file details:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        lastModified: new Date(imageFile.lastModified).toISOString()
      });
    }

    onSave(submitData as any);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {formData.id ? 'Edit Team Member' : 'Add Team Member'}
        </DialogTitle>
        <DialogDescription>
          {formData.id ? 'Update the team member information below.' : 'Fill in the details to add a new team member to the Anglican Church leadership.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bishop">Bishop</SelectItem>
                <SelectItem value="archdeacon">Archdeacon</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <Label htmlFor="image">Profile Image</Label>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-[200px] h-[200px] rounded-full object-cover border border-gray-200"
                style={{
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  filter: 'contrast(1.1) saturate(1.1)'
                }}
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
                Upload a profile image (JPEG, PNG, GIF). Max size: 100MB
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          {formData.category === 'archdeacon' && (
            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region || ''}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
          )}

        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-church-red hover:bg-church-red/90">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default TeamManagement;
