<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DocumentAdminController extends Controller
{
    /**
     * Display a listing of official documents.
     */
    public function index(Request $request)
    {
        $query = Document::query();

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $documents = $query->orderByDesc('created_at')->get();
        return response()->json([
            'success' => true,
            'data' => $documents,
            'total' => $documents->count()
        ]);
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip|max:51200', // 50MB
            'file_url' => 'nullable|string|max:1000',
            'file_size' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['category'] = $data['category'] ?? 'pastoral';
        $data['description'] = $data['description'] ?? null;
        $data['is_active'] = $request->boolean('is_active', true);
        $data['download_count'] = 0;

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $bytes = $uploadedFile->getSize();
            if ($bytes >= 1048576) {
                $data['file_size'] = number_format($bytes / 1048576, 1) . ' MB';
            } else {
                $data['file_size'] = number_format($bytes / 1024, 0) . ' KB';
            }

            $path = $uploadedFile->store('documents', 'public');
            $data['file'] = '/storage/' . $path;
        } elseif ($request->filled('file_url')) {
            $data['file'] = $request->input('file_url');
            $data['file_size'] = $request->input('file_size') ?? '1.5 MB';
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a document file or file URL.'
            ], 422);
        }

        $doc = Document::create($data);
        return response()->json(['success' => true, 'data' => $doc], 201);
    }

    /**
     * Display the specified document.
     */
    public function show(string $id)
    {
        $doc = Document::findOrFail($id);
        return response()->json(['success' => true, 'data' => $doc]);
    }

    /**
     * Update the specified document.
     */
    public function update(Request $request, string $id)
    {
        $doc = Document::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip|max:51200',
            'file_url' => 'nullable|string|max:1000',
            'file_size' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        if ($request->hasFile('file')) {
            // Delete old file if present in storage
            if ($doc->file && str_starts_with($doc->file, '/storage/')) {
                $old = str_replace('/storage/', '', $doc->file);
                Storage::disk('public')->delete($old);
            }

            $uploadedFile = $request->file('file');
            $bytes = $uploadedFile->getSize();
            if ($bytes >= 1048576) {
                $data['file_size'] = number_format($bytes / 1048576, 1) . ' MB';
            } else {
                $data['file_size'] = number_format($bytes / 1024, 0) . ' KB';
            }

            $path = $uploadedFile->store('documents', 'public');
            $data['file'] = '/storage/' . $path;
        } elseif ($request->filled('file_url')) {
            $data['file'] = $request->input('file_url');
        }

        $doc->update($data);
        return response()->json(['success' => true, 'data' => $doc->fresh()]);
    }

    /**
     * Remove the specified document.
     */
    public function destroy(string $id)
    {
        $doc = Document::findOrFail($id);
        if ($doc->file && str_starts_with($doc->file, '/storage/')) {
            $old = str_replace('/storage/', '', $doc->file);
            Storage::disk('public')->delete($old);
        }
        $doc->delete();
        return response()->json(['success' => true, 'message' => 'Document deleted successfully']);
    }
}
