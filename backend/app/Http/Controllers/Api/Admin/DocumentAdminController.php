<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentAdminController extends Controller
{
    public function index()
    {
        $documents = Document::orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $documents]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf|max:20480', // 20MB
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        $path = $request->file('file')->store('documents', 'public');
        $data['file'] = '/storage/' . $path;

        $doc = Document::create($data);
        return response()->json(['success' => true, 'data' => $doc], 201);
    }

    public function update(Request $request, string $id)
    {
        $doc = Document::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'file' => 'sometimes|file|mimes:pdf|max:20480',
            'is_active' => 'nullable|boolean',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if ($request->hasFile('file')) {
            if ($doc->file) {
                $old = str_replace('/storage/', '', $doc->file);
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('file')->store('documents', 'public');
            $data['file'] = '/storage/' . $path;
        }
        $doc->update($data);
        return response()->json(['success' => true, 'data' => $doc]);
    }

    public function destroy(string $id)
    {
        $doc = Document::findOrFail($id);
        if ($doc->file) {
            $old = str_replace('/storage/', '', $doc->file);
            Storage::disk('public')->delete($old);
        }
        $doc->delete();
        return response()->json(['success' => true]);
    }
}


