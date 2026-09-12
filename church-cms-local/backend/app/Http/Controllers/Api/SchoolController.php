<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SchoolController extends Controller
{
    /**
     * Display a listing of the schools.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $schools = School::where('is_active', true)->get();
        return response()->json($schools);
    }

    /**
     * Get schools grouped by type or by specific type.
     *
     * @param  string|null  $type
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByType(string $type = null)
    {
        if ($type) {
            $validTypes = ['ecd', 'primary', 'secondary_basic', 'secondary_boarding', 'tss_boarding', 'university'];

            if (!in_array($type, $validTypes)) {
                return response()->json(['error' => 'Invalid school type'], 400);
            }

            $schools = School::byType($type)->get();
            return response()->json($schools);
        }

        $schools = School::where('is_active', true)->get();
        $groupedSchools = $schools->groupBy('type');
        return response()->json($groupedSchools);
    }

    /**
     * Store a newly created school in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:ecd,primary,secondary_basic,secondary_boarding,tss_boarding,university',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'head_teacher' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'image' => 'nullable|string',
            'founded_year' => 'nullable|integer',
            'programs_offered' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $school = School::create($request->all());

        return response()->json($school, 201);
    }

    /**
     * Display the specified school.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $school = School::findOrFail($id);
        return response()->json($school);
    }

    /**
     * Update the specified school in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $school = School::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:ecd,primary,secondary_basic,secondary_boarding,tss_boarding,university',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'head_teacher' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'image' => 'nullable|string',
            'founded_year' => 'nullable|integer',
            'programs_offered' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $school->update($request->all());

        return response()->json($school);
    }

    /**
     * Remove the specified school from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $school = School::findOrFail($id);
        $school->delete();

        return response()->json(null, 204);
    }

    /**
     * Get schools grouped by type
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByTypeGrouped()
    {
        $schools = School::getByTypeGrouped();
        return response()->json($schools);
    }

    /**
     * Get school statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics()
    {
        $statistics = School::getStatistics();
        return response()->json($statistics);
    }

}
