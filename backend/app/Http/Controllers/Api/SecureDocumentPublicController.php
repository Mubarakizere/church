<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SecureDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SecureDocumentPublicController extends Controller
{
    /**
     * Display a listing of public secure documents
     */
    public function index()
    {
        try {
            $documents = SecureDocument::where('is_public', true)
                ->where('is_active', true)
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'title' => $doc->title,
                        'description' => $doc->description,
                        'category' => $doc->category,
                        'file_type' => $doc->file_type,
                        'file_size_human' => $doc->file_size_human,
                        'access_level' => $doc->access_level,
                        'requires_password' => $doc->requires_password,
                        'requires_role' => $doc->requires_role,
                        'allowed_roles' => $doc->allowed_roles,
                        'download_allowed' => $doc->download_allowed,
                        'can_view_inline' => $doc->can_view_inline,
                        'download_count' => $doc->download_count,
                        'view_count' => $doc->view_count,
                        'created_at' => $doc->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $documents,
            ]);
        } catch (\Exception $e) {
            Log::error('SecureDocument Public Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents',
            ], 500);
        }
    }

    /**
     * Display the specified document (metadata only, no file access)
     */
    public function show($id)
    {
        try {
            $document = SecureDocument::where('is_public', true)
                ->where('is_active', true)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $document->id,
                    'title' => $document->title,
                    'description' => $document->description,
                    'category' => $document->category,
                    'file_type' => $document->file_type,
                    'file_size_human' => $document->file_size_human,
                    'access_level' => $document->access_level,
                    'requires_password' => $document->requires_password,
                    'requires_role' => $document->requires_role,
                    'allowed_roles' => $document->allowed_roles,
                    'download_allowed' => $document->download_allowed,
                    'can_view_inline' => $document->can_view_inline,
                    'download_count' => $document->download_count,
                    'view_count' => $document->view_count,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }
    }

    /**
     * Verify password for password-protected document
     */
    public function verifyPassword(Request $request, $id)
    {
        try {
            $document = SecureDocument::where('is_public', true)
                ->where('is_active', true)
                ->findOrFail($id);

            if (!$document->requiresPassword()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This document does not require a password',
                ], 400);
            }

            $password = $request->input('password');
            
            if (!$password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password is required',
                ], 422);
            }

            if ($document->verifyPassword($password)) {
                // Log failed attempt
                $document->logDownload(auth()->user(), 'password', false);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Password verified',
                    'can_download' => true,
                ]);
            } else {
                // Log failed attempt
                $document->logDownload(auth()->user(), 'password_failed', false);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password',
                ], 403);
            }

        } catch (\Exception $e) {
            Log::error('Password Verification Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
            ], 500);
        }
    }

    /**
     * Check if current user has access to document
     */
    public function checkAccess($id)
    {
        try {
            $document = SecureDocument::where('is_public', true)
                ->where('is_active', true)
                ->findOrFail($id);

            $user = auth()->user();

            // Public documents
            if ($document->isPublicAccess()) {
                return response()->json([
                    'success' => true,
                    'has_access' => true,
                    'access_method' => 'public',
                ]);
            }

            // Role-based documents
            if ($document->requiresRole()) {
                $hasAccess = $document->userHasAccess($user);
                
                return response()->json([
                    'success' => true,
                    'has_access' => $hasAccess,
                    'access_method' => 'role',
                    'required_roles' => $document->allowed_roles,
                    'user_role' => $user?->role ?? null,
                ]);
            }

            // Password-protected documents
            if ($document->requiresPassword()) {
                return response()->json([
                    'success' => true,
                    'has_access' => false,
                    'access_method' => 'password',
                    'message' => 'Password required',
                ]);
            }

            return response()->json([
                'success' => false,
                'has_access' => false,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Access check failed',
            ], 500);
        }
    }

    /**
     * View document inline (with access control)
     * Serves document for browser viewing without downloading
     */
    public function view(Request $request, $id)
    {
        try {
            Log::info('=== SECURE DOCUMENT VIEW ATTEMPT ===');
            Log::info('Document ID: ' . $id);
            Log::info('User: ' . (auth()->check() ? auth()->user()->email : 'Anonymous'));
            
            $document = SecureDocument::where('is_public', true)
                ->where('is_active', true)
                ->findOrFail($id);

            Log::info('Document found:', [
                'title' => $document->title,
                'access_level' => $document->access_level,
                'file_type' => $document->file_type,
            ]);

            $user = auth()->user();
            $accessGranted = false;
            $accessMethod = '';

            // Check access based on document type (same logic as download)
            if ($document->isPublicAccess()) {
                Log::info('Document has public access');
                $accessGranted = true;
                $accessMethod = 'public';
            } elseif ($document->requiresPassword()) {
                Log::info('Document requires password');
                $password = $request->input('password');
                
                if (!$password) {
                    Log::warning('Password required but not provided');
                    return response()->json([
                        'success' => false,
                        'message' => 'Password is required',
                    ], 403);
                }

                if ($document->verifyPassword($password)) {
                    Log::info('Password verified successfully');
                    $accessGranted = true;
                    $accessMethod = 'password';
                } else {
                    Log::warning('Invalid password provided');
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid password',
                    ], 403);
                }
            } elseif ($document->requiresRole()) {
                Log::info('Document requires role-based access');
                
                if ($document->userHasAccess($user)) {
                    Log::info('User has required role');
                    $accessGranted = true;
                    $accessMethod = 'role';
                } else {
                    Log::warning('User does not have required role');
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to access this document',
                    ], 403);
                }
            }

            if (!$accessGranted) {
                Log::warning('Access denied - no valid access method');
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }

            Log::info('Access granted via: ' . $accessMethod);

            // Check if file exists
            if (!Storage::disk('public')->exists($document->file_path)) {
                Log::error('FILE NOT FOUND: ' . $document->file_path);
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            // Increment view count
            $document->incrementViewCount();
            Log::info('View count incremented');
            Log::info('=== SECURE DOCUMENT VIEW SUCCESSFUL ===');

            // Return file for inline viewing
            return response()->file(
                storage_path('app/public/' . $document->file_path),
                [
                    'Content-Type' => Storage::disk('public')->mimeType($document->file_path),
                    'Content-Disposition' => 'inline; filename="' . $document->original_filename . '"',
                ]
            );

        } catch (\Exception $e) {
            Log::error('=== SECURE DOCUMENT VIEW FAILED ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'View failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download document (with access control)
     */
    public function download(Request $request, $id)
    {
        try {
            Log::info('=== SECURE DOCUMENT DOWNLOAD ATTEMPT ===');
            Log::info('Document ID: ' . $id);
            Log::info('User: ' . (auth()->check() ? auth()->user()->email : 'Anonymous'));
            Log::info('IP Address: ' . $request->ip());
            Log::info('Has password in request: ' . ($request->has('password') ? 'YES' : 'NO'));
            
            $document = SecureDocument::where('is_public', true)
                ->where('is_active', true)
                ->findOrFail($id);

            Log::info('Document found:', [
                'title' => $document->title,
                'access_level' => $document->access_level,
                'file_path' => $document->file_path,
            ]);

            $user = auth()->user();
            $accessGranted = false;
            $accessMethod = '';

            // Check access based on document type
            if ($document->isPublicAccess()) {
                Log::info('Document has public access');
                $accessGranted = true;
                $accessMethod = 'public';
            } elseif ($document->requiresPassword()) {
                Log::info('Document requires password');
                // For password-protected, password must be verified first
                $password = $request->input('password');
                
                if (!$password) {
                    Log::warning('Password required but not provided');
                    return response()->json([
                        'success' => false,
                        'message' => 'Password is required',
                    ], 403);
                }

                Log::info('Verifying password...');
                if ($document->verifyPassword($password)) {
                    Log::info('Password verified successfully');
                    $accessGranted = true;
                    $accessMethod = 'password';
                } else {
                    Log::warning('Invalid password provided');
                    $document->logDownload($user, 'password_failed', false);
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid password',
                    ], 403);
                }
            } elseif ($document->requiresRole()) {
                Log::info('Document requires role-based access');
                Log::info('User role: ' . ($user?->role ?? 'none'));
                Log::info('Allowed roles: ' . json_encode($document->allowed_roles));
                
                if ($document->userHasAccess($user)) {
                    Log::info('User has required role');
                    $accessGranted = true;
                    $accessMethod = 'role';
                } else {
                    Log::warning('User does not have required role');
                    $document->logDownload($user, 'role_denied', false);
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to access this document',
                    ], 403);
                }
            }

            if (!$accessGranted) {
                Log::warning('Access denied - no valid access method');
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }

            Log::info('Access granted via: ' . $accessMethod);

            // Check download permission (admins can always download)
            if (!$document->canDownload($user)) {
                Log::warning('Download not allowed for this document');
                return response()->json([
                    'success' => false,
                    'message' => 'Downloads are disabled for this document. Please use the view option instead.',
                ], 403);
            }

            Log::info('Download permission granted');

            // Check if file exists on public disk (same as images)
            Log::info('Checking if file exists: ' . $document->file_path);
            if (!Storage::disk('public')->exists($document->file_path)) {
                Log::error('FILE NOT FOUND IN STORAGE: ' . $document->file_path);
                Log::error('Storage disk: public');
                Log::error('Storage root: ' . storage_path('app/public'));
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            Log::info('File exists, proceeding with download');

            // Log successful download
            $document->logDownload($user, $accessMethod, true);
            $document->incrementDownloadCount();

            Log::info('Download logged and count incremented');
            Log::info('=== SECURE DOCUMENT DOWNLOAD SUCCESSFUL ===');

            // Return file from public disk
            return Storage::disk('public')->download(
                $document->file_path,
                $document->original_filename,
                [
                    'Content-Type' => Storage::disk('public')->mimeType($document->file_path),
                ]
            );

        } catch (\Exception $e) {
            Log::error('=== SECURE DOCUMENT DOWNLOAD FAILED ===');
            Log::error('Document ID: ' . $id);
            Log::error('Error Type: ' . get_class($e));
            Log::error('Error Message: ' . $e->getMessage());
            Log::error('Error File: ' . $e->getFile());
            Log::error('Error Line: ' . $e->getLine());
            Log::error('Stack Trace:', [
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Download failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
