import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiUrls } from "@/config/api";
import { Trash2, Eye, EyeOff, Download, BarChart3, Lock, Unlock, FileText, Copy, Key, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecureDocument {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    original_filename: string;
    file_type: string;
    file_size: number;
    file_size_human: string;
    access_level: 'public' | 'password' | 'role_based';
    allowed_roles: string[] | null;
    is_public: boolean;
    is_active: boolean;
    download_allowed: boolean;
    download_count: number;
    view_count: number;
    last_downloaded_at: string | null;
    uploaded_by: string | null;
    password: string | null;
    created_at: string;
}

const SecureDocumentsManagement = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [documents, setDocuments] = useState<SecureDocument[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [accessLevel, setAccessLevel] = useState<'public' | 'password' | 'role_based'>('password');
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [downloadAllowed, setDownloadAllowed] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

    const loadDocuments = async () => {
        try {
            const res = await fetch(apiUrls.admin.secureDocuments(), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const result = await res.json();
                setDocuments(result.data || []);
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadDocuments();
    }, [token]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file",
                variant: "destructive",
            });
            return;
        }

        if (accessLevel === 'password' && !password) {
            toast({
                title: "Error",
                description: "Password is required for password-protected documents",
                variant: "destructive",
            });
            return;
        }

        if (accessLevel === 'role_based' && allowedRoles.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one role",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);

        try {
            const fd = new FormData();
            fd.append('title', title);
            if (description) fd.append('description', description);
            if (category) fd.append('category', category);
            fd.append('file', file);
            fd.append('access_level', accessLevel);

            if (accessLevel === 'password') {
                fd.append('password', password);
            }

            if (accessLevel === 'role_based') {
                allowedRoles.forEach(role => {
                    fd.append('allowed_roles[]', role);
                });
            }

            fd.append('is_public', isPublic ? '1' : '0');
            fd.append('is_active', isActive ? '1' : '0');
            fd.append('download_allowed', downloadAllowed ? '1' : '0');

            const res = await fetch(apiUrls.admin.secureDocuments(), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Document uploaded successfully",
                });

                // Reset form
                setTitle("");
                setDescription("");
                setCategory("");
                setFile(null);
                setPassword("");
                setAllowedRoles([]);
                setIsPublic(false);
                setIsActive(true);
                setDownloadAllowed(true);

                await loadDocuments();
            } else {
                const err = await res.json();
                toast({
                    title: "Upload failed",
                    description: err?.message || Object.values(err?.errors || {}).flat()[0] || 'Please try again',
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload document",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;

        try {
            const res = await fetch(apiUrls.admin.secureDocument(id), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Document deleted successfully",
                });
                await loadDocuments();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete document",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
        }
    };

    const togglePublic = async (id: number) => {
        try {
            const res = await fetch(apiUrls.admin.secureDocumentTogglePublic(id), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const result = await res.json();
                toast({
                    title: "Success",
                    description: result.message,
                });
                await loadDocuments();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to toggle visibility",
                variant: "destructive",
            });
        }
    };

    const toggleDownloadAllowed = async (id: number) => {
        try {
            const res = await fetch(apiUrls.admin.secureDocumentToggleDownload(id), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const result = await res.json();
                toast({
                    title: "Success",
                    description: result.message,
                });
                await loadDocuments();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to toggle download permission",
                variant: "destructive",
            });
        }
    };

    const toggleRoleSelection = (role: string) => {
        setAllowedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const getFileIcon = (fileType: string) => {
        const iconClass = "h-5 w-5";
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return <FileText className={`${iconClass} text-red-600`} />;
            case 'doc':
            case 'docx':
                return <FileText className={`${iconClass} text-blue-600`} />;
            case 'xls':
            case 'xlsx':
                return <FileText className={`${iconClass} text-green-600`} />;
            case 'ppt':
            case 'pptx':
                return <FileText className={`${iconClass} text-orange-600`} />;
            default:
                return <FileText className={`${iconClass} text-gray-600`} />;
        }
    };

    const getAccessLevelBadge = (doc: SecureDocument) => {
        if (doc.access_level === 'public') {
            return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Public</span>;
        } else if (doc.access_level === 'password') {
            return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Password</span>;
        } else {
            return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Role-Based</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Secure Documents Management</h1>
                        <p className="text-sm text-muted-foreground">Upload and manage protected documents with access control</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Upload Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload New Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        placeholder="Document title"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g., Reports, Policies, Forms"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the document"
                                    rows={3}
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <Label htmlFor="file">File * (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT)</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                            {/* Access Control */}
                            <div className="border rounded-lg p-4 space-y-4">
                                <h3 className="font-semibold">Access Control</h3>

                                <div>
                                    <Label htmlFor="access_level">Access Level *</Label>
                                    <Select value={accessLevel} onValueChange={(value: any) => setAccessLevel(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public (No restrictions)</SelectItem>
                                            <SelectItem value="password">Password Protected</SelectItem>
                                            <SelectItem value="role_based">Role-Based (Requires login)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Password Field */}
                                {accessLevel === 'password' && (
                                    <div>
                                        <Label htmlFor="password">Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="Enter password for this document"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Role Selection */}
                                {accessLevel === 'role_based' && (
                                    <div>
                                        <Label>Allowed Roles *</Label>
                                        <div className="flex gap-4 mt-2">
                                            {['admin', 'editor', 'viewer'].map(role => (
                                                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={allowedRoles.includes(role)}
                                                        onChange={() => toggleRoleSelection(role)}
                                                    />
                                                    <span className="capitalize">{role}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Visibility Options */}
                            <div className="flex gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                    />
                                    <span>Show on public website</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <span>Active</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={downloadAllowed}
                                        onChange={(e) => setDownloadAllowed(e.target.checked)}
                                    />
                                    <span>Allow Downloads</span>
                                </label>
                            </div>

                            <Button type="submit" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Documents List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No documents uploaded yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                                        {/* File Icon */}
                                        <div>{getFileIcon(doc.file_type)}</div>

                                        {/* Document Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{doc.title}</h3>
                                                {getAccessLevelBadge(doc)}
                                                {doc.password && (
                                                    <div className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">
                                                        <Key className="h-3 w-3" />
                                                        {visiblePasswords.has(doc.id) ? (
                                                            <>
                                                                <span className="font-mono">{doc.password}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        copyPassword(doc.password!);
                                                                    }}
                                                                    className="ml-1 hover:text-amber-900"
                                                                    title="Copy password"
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        togglePasswordVisibility(doc.id);
                                                                    }}
                                                                    className="ml-1 hover:text-amber-900"
                                                                    title="Hide password"
                                                                >
                                                                    <EyeOff className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>••••••</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        togglePasswordVisibility(doc.id);
                                                                    }}
                                                                    className="ml-1 hover:text-amber-900"
                                                                    title="Show password"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {doc.is_public ? (
                                                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Public</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Private</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {doc.description || doc.original_filename}
                                            </p>
                                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                                <span>{doc.file_size_human}</span>
                                                <span>{doc.file_type.toUpperCase()}</span>
                                                {doc.category && <span>Category: {doc.category}</span>}
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> {doc.view_count} views
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Download className="h-3 w-3" />
                                                    {doc.download_count} downloads
                                                </span>
                                                {doc.download_allowed ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <Check className="h-3 w-3" /> Downloads enabled
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-600 flex items-center gap-1">
                                                        <Lock className="h-3 w-3" /> Downloads disabled
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => togglePublic(doc.id)}
                                                title={doc.is_public ? "Make Private" : "Make Public"}
                                            >
                                                {doc.is_public ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDownloadAllowed(doc.id)}
                                                title={doc.download_allowed ? "Disable Downloads" : "Enable Downloads"}
                                                className={!doc.download_allowed ? "text-orange-600" : ""}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/admin/secure-documents/${doc.id}/analytics`)}
                                                title="View Analytics"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDelete(doc.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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

export default SecureDocumentsManagement;
