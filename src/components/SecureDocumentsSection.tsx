import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Lock, Download, Users } from "lucide-react";
import { apiUrls } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import PasswordDialog from "./PasswordDialog";
import { useToast } from "@/hooks/use-toast";

interface SecureDocument {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    file_type: string;
    file_size_human: string;
    access_level: 'public' | 'password' | 'role_based';
    requires_password: boolean;
    requires_role: boolean;
    allowed_roles: string[] | null;
    download_allowed: boolean;
    can_view_inline: boolean;
    download_count: number;
    view_count: number;
    created_at: string;
}

const SecureDocumentsSection = () => {
    const { user, token } = useAuth();
    const { toast } = useToast();

    const [documents, setDocuments] = useState<SecureDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [categories, setCategories] = useState<string[]>([]);

    // Password dialog state
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<SecureDocument | null>(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const res = await fetch(apiUrls.secureDocuments());
            if (res.ok) {
                const result = await res.json();
                const docs: SecureDocument[] = result.data || [];
                setDocuments(docs);

                // Extract unique categories
                const uniqueCategories = Array.from(
                    new Set(docs.map(d => d.category).filter(Boolean))
                ) as string[];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType: string) => {
        const iconClass = "h-6 w-6";
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

    const handleDocumentClick = async (doc: SecureDocument) => {
        // Public documents - navigate to viewer page
        if (doc.access_level === 'public') {
            window.open(`/documents/view/${doc.id}`, '_blank');
            return;
        }

        // Password-protected documents
        if (doc.requires_password) {
            setSelectedDocument(doc);
            setPasswordDialogOpen(true);
            return;
        }

        // Role-based documents
        if (doc.requires_role) {
            if (!user) {
                toast({
                    title: "Login Required",
                    description: "Please log in to access this document",
                    variant: "destructive",
                });
                return;
            }

            // Check if user has access
            try {
                const res = await fetch(apiUrls.secureDocumentCheckAccess(doc.id), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.has_access) {
                        window.open(`/documents/view/${doc.id}`, '_blank');
                    } else {
                        toast({
                            title: "Access Denied",
                            description: `This document requires one of the following roles: ${doc.allowed_roles?.join(', ')}`,
                            variant: "destructive",
                        });
                    }
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to check access permissions",
                    variant: "destructive",
                });
            }
        }
    };

    const handlePasswordSubmit = async (password: string) => {
        if (!selectedDocument) return;

        setVerifying(true);

        try {
            // Verify password first
            const res = await fetch(apiUrls.secureDocumentVerifyPassword(selectedDocument.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                setPasswordDialogOpen(false);
                // Use POST to view document with password in body (more secure than URL)
                const viewForm = document.createElement('form');
                viewForm.method = 'POST';
                viewForm.action = apiUrls.secureDocumentView(selectedDocument.id);
                viewForm.target = '_blank';

                const passwordInput = document.createElement('input');
                passwordInput.type = 'hidden';
                passwordInput.name = 'password';
                passwordInput.value = password;

                viewForm.appendChild(passwordInput);
                document.body.appendChild(viewForm);
                viewForm.submit();
                document.body.removeChild(viewForm);

                toast({
                    title: "Success",
                    description: "Document opened in new tab",
                });
            } else {
                toast({
                    title: "Invalid Password",
                    description: "The password you entered is incorrect",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to verify password",
                variant: "destructive",
            });
        } finally {
            setVerifying(false);
        }
    };

    const downloadDocument = async (id: number, password?: string) => {
        try {
            let url = apiUrls.secureDocumentDownload(id);

            if (password) {
                url += `?password=${encodeURIComponent(password)}`;
            }

            const res = await fetch(url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (res.ok) {
                const blob = await res.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;

                // Get filename from Content-Disposition header or use default
                const contentDisposition = res.headers.get('Content-Disposition');
                const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
                a.download = filenameMatch ? filenameMatch[1] : 'document';

                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(a);

                toast({
                    title: "Success",
                    description: "Document downloaded successfully",
                });
            } else {
                const error = await res.json();
                toast({
                    title: "Download Failed",
                    description: error.message || "Failed to download document",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download document",
                variant: "destructive",
            });
        }
    };

    const filteredDocuments = selectedCategory === "all"
        ? documents
        : documents.filter(d => d.category === selectedCategory);

    if (loading) return null;
    if (documents.length === 0) return null;

    return (
        <>
            <section id="secure-documents" className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <Card className="shadow-soft">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Documents</CardTitle>

                                {/* Category Filter */}
                                {categories.length > 0 && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant={selectedCategory === "all" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedCategory("all")}
                                        >
                                            All
                                        </Button>
                                        {categories.map(cat => (
                                            <Button
                                                key={cat}
                                                variant={selectedCategory === cat ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedCategory(cat)}
                                            >
                                                {cat}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleDocumentClick(doc)}
                                        className="flex items-start gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white cursor-pointer group"
                                    >
                                        {/* File Icon */}
                                        <div className="flex-shrink-0 mt-1">
                                            {getFileIcon(doc.file_type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-medium line-clamp-2 group-hover:text-church-red transition-colors">
                                                    {doc.title}
                                                </h3>

                                                {/* Access Level Indicator */}
                                                {doc.requires_password && (
                                                    <Lock className="h-4 w-4 text-yellow-600 flex-shrink-0" title="Password Protected" />
                                                )}
                                                {doc.requires_role && (
                                                    <Users className="h-4 w-4 text-blue-600 flex-shrink-0" title="Requires Login" />
                                                )}
                                            </div>

                                            {doc.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                    {doc.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="uppercase font-medium">{doc.file_type}</span>
                                                <span>{doc.file_size_human}</span>
                                                <span className="flex items-center gap-1">
                                                    <Download className="h-3 w-3" />
                                                    {doc.download_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredDocuments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No documents found in this category.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Password Dialog */}
            <PasswordDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
                onSubmit={handlePasswordSubmit}
                documentTitle={selectedDocument?.title || ""}
                loading={verifying}
            />
        </>
    );
};

export default SecureDocumentsSection;
