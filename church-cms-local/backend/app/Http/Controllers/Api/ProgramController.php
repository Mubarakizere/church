<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Program;
use Illuminate\Support\Facades\Validator;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::orderBy('start_date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $programs]);
    }

    public function show($id)
    {
        $program = Program::find($id);
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $program]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'location' => 'nullable|string',
            'attendees' => 'nullable|string',
            'featured' => 'boolean',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'recurrence_pattern' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'location' => 'nullable|string',
            'attendees' => 'nullable|string',
            'featured' => 'boolean',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'recurrence_pattern' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $program = Program::create($data);
        return response()->json(['success' => true, 'data' => $program], 201);
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'location' => 'nullable|string',
            'attendees' => 'nullable|string',
            'featured' => 'boolean',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'recurrence_pattern' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $program->update($data);
        return response()->json(['success' => true, 'data' => $program]);
    }

    public function destroy($id)
    {
        $program = Program::findOrFail($id);
        $program->delete();
        return response()->json(null, 204);
    }
}
