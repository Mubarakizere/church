<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = Document::where('is_active', true)->orderByDesc('created_at')->get();
        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }
}


