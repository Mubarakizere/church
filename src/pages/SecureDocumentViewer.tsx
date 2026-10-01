import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrls } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Download, Eye, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentInfo {
    id: number;
    title: string;
    description: string | null;
    file_type: string;
    file_size_human: string;
    download_allowed: boolean;
    can_view_inline: boolean;
}

const SecureDocumentViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, token } = useAuth();
    const { toast } = useToast();

    const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        try {
            // Get document info first
            const infoRes = await fetch(apiUrls.secureDocument(Number(id)));
            if (!infoRes.ok) throw new Error('Document not found');

            const infoData = await infoRes.json();
            setDocumentInfo(infoData.data);

            // Get document content
            const password = searchParams.get('password');
            const viewUrl = apiUrls.secureDocumentView(Number(id));

            const viewRes = await fetch(viewUrl + (password ? `?password=${password}` : ''), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!viewRes.ok) {
                throw new Error('Access denied');
            }

            const blob = await viewRes.blob();
            const url = URL.createObjectURL(blob);
            setDocumentUrl(url);
        } catch (err: any) {
            setError(err.message || 'Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!documentInfo?.download_allowed && user?.role !== 'admin') {
            toast({
                title: 'Downloads Disabled',
                description: 'This document is view-only',
                variant: 'destructive',
            });
            return;
        }

        try {
            const password = searchParams.get('password');
            const downloadUrl = apiUrls.secureDocumentDownload(Number(id));

            const res = await fetch(downloadUrl + (password ? `?password=${password}` : ''), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = documentInfo?.title || 'document';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Success',
                description: 'Document downloaded',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download document',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-red mx-auto mb-4"></div>
                    <p>Loading document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Lock className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-church-red" />
                        <div>
                            <h1 className="font-semibold">{documentInfo?.title}</h1>
                            <p className="text-xs text-muted-foreground">
                                {documentInfo?.file_type.toUpperCase()} • {documentInfo?.file_size_human}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(documentInfo?.download_allowed || user?.role === 'admin') && (
                            <Button size="sm" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
                            Close
                        </Button>
                    </div>
                </div>
            </header>

            {/* Document Viewer */}
            <main className="container mx-auto p-4">
                <div
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    onContextMenu={(e) => {
                        // Disable right-click when downloads are disabled
                        if (!documentInfo?.download_allowed && user?.role !== 'admin') {
                            e.preventDefault();
                        }
                    }}
                    style={{
                        userSelect: documentInfo?.download_allowed || user?.role === 'admin' ? 'auto' : 'none',
                    }}
                >
                    {documentInfo?.file_type.toLowerCase() === 'pdf' ? (
                        // PDF Viewer
                        <iframe
                            src={documentUrl || ''}
                            className="w-full"
                            style={{ height: 'calc(100vh - 140px)' }}
                            title={documentInfo?.title}
                        />
                    ) : (
                        // Google Docs Viewer for other formats
                        <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl || '')}&embedded=true`}
                            className="w-full"
                            style={{ height: 'calc(100vh - 140px)' }}
                            title={documentInfo?.title}
                        />
                    )}
                </div>

                {!documentInfo?.download_allowed && user?.role !== 'admin' && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center text-sm text-orange-800 flex items-center justify-center gap-1.5">
                        <Lock className="h-4 w-4 text-orange-700" />
                        <span>This document is protected. Downloads are disabled. View only.</span>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SecureDocumentViewer;
