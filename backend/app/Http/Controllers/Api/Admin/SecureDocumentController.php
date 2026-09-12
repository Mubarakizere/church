<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecureDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SecureDocumentController extends Controller
{
    /**
     * Display a listing of all secure documents (admin only)
     */
    public function index()
    {
        try {
            Log::info('=== SECURE DOCUMENTS INDEX REQUEST ===');
            Log::info('Fetching all secure documents...');
            
            $documents = SecureDocument::with('uploader:id,name,email')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($doc) {
                    $password = null;
                    if ($doc->access_level === 'password' && $doc->password) {
                        // Return actual password for admin to see
                        $password = $doc->password;
                    }
                    
                    return [
                        'id' => $doc->id,
                        'title' => $doc->title,
                        'description' => $doc->description,
                        'category' => $doc->category,
                        'original_filename' => $doc->original_filename,
                        'file_type' => $doc->file_type,
                        'file_size' => $doc->file_size,
                        'file_size_human' => $doc->file_size_human,
                        'access_level' => $doc->access_level,
                        'allowed_roles' => $doc->allowed_roles,
                        'is_public' => $doc->is_public,
                        'is_active' => $doc->is_active,
                        'download_allowed' => $doc->download_allowed,
                        'download_count' => $doc->download_count,
                        'view_count' => $doc->view_count,
                        'last_downloaded_at' => $doc->last_downloaded_at,
                        'uploaded_by' => $doc->uploader?->name,
                        'password' => $password,
                        'created_at' => $doc->created_at,
                        'updated_at' => $doc->updated_at,
                    ];
                });

            Log::info('Documents fetched successfully. Count: ' . $documents->count());
            
            return response()->json([
                'success' => true,
                'data' => $documents,
            ]);
        } catch (\Exception $e) {
            Log::error('=== SECURE DOCUMENTS INDEX FAILED ===');
            Log::error('Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created secure document
     */
    public function store(Request $request)
    {
        try {
            Log::info('=== SECURE DOCUMENT UPLOAD STARTED ===');
            Log::info('Request Method: ' . $request->method());
            Log::info('Request URL: ' . $request->fullUrl());
            Log::info('Request Headers: ', $request->headers->all());
            Log::info('Request All Data (except file): ', $request->except('file'));
            Log::info('Has File: ' . ($request->hasFile('file') ? 'YES' : 'NO'));
            
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                Log::info('File Details:', [
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'extension' => $file->getClientOriginalExtension(),
                    'is_valid' => $file->isValid(),
                    'error' => $file->getError(),
                ]);
            }

            Log::info('Starting validation...');
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'category' => 'nullable|string|max:100',
                'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,odt|max:20480', // 20MB
                'access_level' => 'required|in:public,password,role_based',
                'password' => 'required_if:access_level,password|nullable|string|min:4',
                'allowed_roles' => 'required_if:access_level,role_based|nullable|array',
                'allowed_roles.*' => 'string|in:admin,editor,viewer',
                'is_public' => 'nullable|in:0,1,true,false', // Accept string values from FormData
                'is_active' => 'nullable|in:0,1,true,false', // Accept string values from FormData
                'download_allowed' => 'nullable|in:0,1,true,false', // Accept string values from FormData
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            Log::info('Validation passed successfully');
            $data = $validator->validated();
            Log::info('Validated data:', $data);
            
            // Convert string boolean values to actual booleans
            $data['is_public'] = filter_var($data['is_public'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $data['is_active'] = filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $data['download_allowed'] = filter_var($data['download_allowed'] ?? true, FILTER_VALIDATE_BOOLEAN);

            // Handle file upload
            Log::info('Starting file upload process...');
            $file = $request->file('file');
            $originalFilename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileSize = $file->getSize();
            
            Log::info('File metadata extracted:', [
                'original_filename' => $originalFilename,
                'extension' => $extension,
                'file_size' => $fileSize,
                'file_size_mb' => round($fileSize / 1024 / 1024, 2),
            ]);
            
            // Generate unique filename
            $uniqueFilename = Str::uuid() . '.' . $extension;
            Log::info('Generated unique filename: ' . $uniqueFilename);
            
            // Check storage disk configuration
            Log::info('Storage disk: public (same as images)');
            Log::info('Storage path: ' . storage_path('app/public/documents'));
            
            // Store file in public storage (same as images) - works on shared hosting
            Log::info('Attempting to store file...');
            $filePath = $file->storeAs('documents', $uniqueFilename, 'public');
            Log::info('File stored successfully at: ' . $filePath);

            // Hash password if provided
            if (!empty($data['password'])) {
                Log::info('Hashing password...');
                $data['password'] = Hash::make($data['password']);
                Log::info('Password hashed successfully');
            }

            // Prepare document data
            $documentData = [
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'category' => $data['category'] ?? null,
                'file_path' => $filePath,
                'original_filename' => $originalFilename,
                'file_type' => $extension,
                'file_size' => $fileSize,
                'access_level' => $data['access_level'],
                'password' => $data['password'] ?? null,
                'allowed_roles' => $data['allowed_roles'] ?? null,
                'is_public' => $data['is_public'] ?? false,
                'is_active' => $data['is_active'] ?? true,
                'uploaded_by' => auth()->id(),
            ];
            
            Log::info('Document data prepared:', array_merge($documentData, ['password' => $documentData['password'] ? '[HASHED]' : null]));
            Log::info('Authenticated user ID: ' . auth()->id());
            
            // Create document record
            Log::info('Creating database record...');
            $document = SecureDocument::create($documentData);
            Log::info('Database record created successfully with ID: ' . $document->id);

            Log::info('=== SECURE DOCUMENT UPLOAD COMPLETED SUCCESSFULLY ===');
            Log::info('Document ID: ' . $document->id);
            Log::info('Document Title: ' . $document->title);

            return response()->json([
                'success' => true,
                'data' => $document->fresh(),
                'message' => 'Document uploaded successfully',
            ], 201);

        } catch (\Exception $e) {
            Log::error('=== SECURE DOCUMENT UPLOAD FAILED ===');
            Log::error('Error Type: ' . get_class($e));
            Log::error('Error Message: ' . $e->getMessage());
            Log::error('Error File: ' . $e->getFile());
            Log::error('Error Line: ' . $e->getLine());
            Log::error('Stack Trace:', [
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Additional context
            Log::error('Request Context:', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'has_file' => $request->hasFile('file'),
                'user_id' => auth()->id(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document',
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
            ], 500);
        }
    }

    /**
     * Display the specified secure document (admin view)
     */
    public function show($id)
    {
        try {
            $document = SecureDocument::with('uploader:id,name,email')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $document,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }
    }

    /**
     * Update the specified secure document
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('=== SECURE DOCUMENT UPDATE STARTED ===');
            Log::info('Document ID: ' . $id);
            Log::info('Request data (except file): ', $request->except('file'));
            Log::info('Has file: ' . ($request->hasFile('file') ? 'YES' : 'NO'));
            
            $document = SecureDocument::findOrFail($id);
            Log::info('Document found: ' . $document->title);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:500',
                'category' => 'nullable|string|max:100',
                'file' => 'sometimes|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,odt|max:20480',
                'access_level' => 'sometimes|required|in:public,password,role_based',
                'password' => 'nullable|string|min:4',
                'allowed_roles' => 'nullable|array',
                'allowed_roles.*' => 'string|in:admin,editor,viewer',
                'is_public' => 'nullable|in:0,1,true,false', // Accept string values from FormData
                'is_active' => 'nullable|in:0,1,true,false', // Accept string values from FormData
                'download_allowed' => 'nullable|in:0,1,true,false', // Accept string values from FormData
            ]);

            if ($validator->fails()) {
                Log::error('Update validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            Log::info('Validation passed');
            $data = $validator->validated();
            
            // Convert string boolean values to actual booleans
            if (isset($data['is_public'])) {
                $data['is_public'] = filter_var($data['is_public'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['is_active'])) {
                $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['download_allowed'])) {
                $data['download_allowed'] = filter_var($data['download_allowed'], FILTER_VALIDATE_BOOLEAN);
            }

            // Handle file replacement
            if ($request->hasFile('file')) {
                Log::info('Replacing file...');
                // Delete old file
                if (Storage::exists($document->file_path)) {
                    Log::info('Deleting old file: ' . $document->file_path);
                    Storage::delete($document->file_path);
                    Log::info('Old file deleted');
                }

                // Upload new file
                $file = $request->file('file');
                $originalFilename = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileSize = $file->getSize();
                $uniqueFilename = Str::uuid() . '.' . $extension;
                
                Log::info('Uploading new file: ' . $originalFilename);
                $filePath = $file->storeAs('documents', $uniqueFilename, 'public');
                Log::info('New file uploaded: ' . $filePath);

                $data['file_path'] = $filePath;
                $data['original_filename'] = $originalFilename;
                $data['file_type'] = $extension;
                $data['file_size'] = $fileSize;
            }

            // Hash password if provided and changed
            if (!empty($data['password'])) {
                Log::info('Hashing new password');
                $data['password'] = Hash::make($data['password']);
            } else {
                // Don't update password if not provided
                unset($data['password']);
            }

            Log::info('Updating document record...');
            $document->update($data);
            Log::info('Document updated successfully');
            Log::info('=== SECURE DOCUMENT UPDATE COMPLETED ===');

            return response()->json([
                'success' => true,
                'data' => $document->fresh(),
                'message' => 'Document updated successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('=== SECURE DOCUMENT UPDATE FAILED ===');
            Log::error('Document ID: ' . $id);
            Log::error('Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified secure document
     */
    public function destroy($id)
    {
        try {
            Log::info('=== SECURE DOCUMENT DELETE STARTED ===');
            Log::info('Document ID: ' . $id);
            
            $document = SecureDocument::findOrFail($id);
            Log::info('Document found: ' . $document->title);
            Log::info('File path: ' . $document->file_path);
            
            // File will be deleted automatically by model's boot method
            $document->delete();
            Log::info('Document deleted successfully');
            Log::info('=== SECURE DOCUMENT DELETE COMPLETED ===');

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('=== SECURE DOCUMENT DELETE FAILED ===');
            Log::error('Document ID: ' . $id);
            Log::error('Error: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document',
            ], 500);
        }
    }

    /**
     * Get download analytics for a document
     */
    public function analytics($id)
    {
        try {
            $document = SecureDocument::with(['downloads' => function ($query) {
                $query->orderByDesc('downloaded_at')->limit(50);
            }])->findOrFail($id);

            $analytics = [
                'total_downloads' => $document->download_count,
                'last_downloaded_at' => $document->last_downloaded_at,
                'recent_downloads' => $document->downloads->map(function ($download) {
                    return [
                        'user' => $download->user?->name ?? 'Anonymous',
                        'ip_address' => $download->ip_address,
                        'access_method' => $download->access_method,
                        'downloaded_at' => $download->downloaded_at,
                    ];
                }),
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics',
            ], 404);
        }
    }

    /**
     * Toggle document visibility (public/private)
     */
    public function togglePublic($id)
    {
        try {
            $document = SecureDocument::findOrFail($id);
            $document->update(['is_public' => !$document->is_public]);

            return response()->json([
                'success' => true,
                'data' => $document->fresh(),
                'message' => $document->is_public ? 'Document is now public' : 'Document is now private',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle visibility',
            ], 500);
        }
    }

    /**
     * Toggle document download permission
     */
    public function toggleDownloadAllowed($id)
    {
        try {
            Log::info('=== TOGGLE DOWNLOAD PERMISSION ===');
            Log::info('Document ID: ' . $id);
            
            $document = SecureDocument::findOrFail($id);
            $document->update(['download_allowed' => !$document->download_allowed]);
            
            Log::info('Download permission toggled to: ' . ($document->download_allowed ? 'ALLOWED' : 'DISABLED'));

            return response()->json([
                'success' => true,
                'data' => $document->fresh(),
                'message' => $document->download_allowed ? 'Downloads enabled' : 'Downloads disabled',
            ]);

        } catch (\Exception $e) {
            Log::error('=== TOGGLE DOWNLOAD PERMISSION FAILED ===');
            Log::error('Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle download permission',
            ], 500);
        }
    }
}
