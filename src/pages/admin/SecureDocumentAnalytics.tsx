import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiUrls } from "@/config/api";
import { Download, Eye, Calendar, User, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentAnalytics {
    total_downloads: number;
    last_downloaded_at: string | null;
    recent_downloads: Array<{
        user: string;
        ip_address: string;
        access_method: string;
        downloaded_at: string;
    }>;
}

interface DocumentInfo {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    original_filename: string;
    file_type: string;
    file_size_human: string;
    access_level: string;
    is_public: boolean;
    download_allowed: boolean;
    download_count: number;
    view_count: number;
    last_downloaded_at: string | null;
    created_at: string;
}

const SecureDocumentAnalytics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { toast } = useToast();

    const [document, setDocument] = useState<DocumentInfo | null>(null);
    const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && id) {
            loadData();
        }
    }, [token, id]);

    const loadData = async () => {
        try {
            // Load document info
            const docRes = await fetch(apiUrls.admin.secureDocument(Number(id)), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (docRes.ok) {
                const docData = await docRes.json();
                setDocument(docData.data);
            }

            // Load analytics
            const analyticsRes = await fetch(apiUrls.admin.secureDocumentAnalytics(Number(id)), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                setAnalytics(analyticsData.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load analytics",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-red mx-auto mb-4"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">Document not found</p>
                    <Button onClick={() => navigate("/admin/secure-documents")}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-sm shadow-soft border-b sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Document Analytics</h1>
                        <p className="text-sm text-muted-foreground">{document.title}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/secure-documents")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 space-y-6">
                {/* Document Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">File Name</p>
                                    <p className="font-medium">{document.original_filename}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">File Type</p>
                                <p className="font-medium">{document.file_type.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">File Size</p>
                                <p className="font-medium">{document.file_size_human}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="font-medium">{document.category || "None"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Access Level</p>
                                <p className="font-medium capitalize">{document.access_level.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="flex gap-2">
                                    {document.is_public && (
                                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Public</span>
                                    )}
                                    {document.download_allowed ? (
                                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Downloads On</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">View Only</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Eye className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Views</p>
                                    <p className="text-3xl font-bold">{document.view_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Download className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                                    <p className="text-3xl font-bold">{document.download_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Downloaded</p>
                                    <p className="text-sm font-medium">
                                        {document.last_downloaded_at
                                            ? new Date(document.last_downloaded_at).toLocaleDateString()
                                            : "Never"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Downloads */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity (Last 50)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics?.recent_downloads && analytics.recent_downloads.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.recent_downloads.map((download, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{download.user}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {download.ip_address} • {download.access_method}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(download.downloaded_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No download activity yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default SecureDocumentAnalytics;
