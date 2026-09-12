<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TeamController extends Controller
{
    /**
     * Display a listing of the team members.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $team = Team::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get();
        return response()->json($team);
    }

    /**
     * Store a newly created team member in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'description' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'social_media' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
            'category' => 'required|in:bishop,archdeacon,department',
            'department_type' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $team = Team::create($request->all());

        return response()->json($team, 201);
    }

    /**
     * Display the specified team member.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $team = Team::findOrFail($id);
        return response()->json($team);
    }

    /**
     * Update the specified team member in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $team = Team::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'title' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'description' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'social_media' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
            'category' => 'sometimes|required|in:bishop,archdeacon,department',
            'department_type' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $team->update($request->all());

        return response()->json($team);
    }

    /**
     * Remove the specified team member from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $team = Team::findOrFail($id);
        $team->delete();

        return response()->json(null, 204);
    }

    /**
     * Get hierarchical team structure
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function hierarchy()
    {
        $structure = Team::getHierarchicalStructure();
        return response()->json($structure);
    }

    /**
     * Get bishop information
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function bishop()
    {
        $bishop = Team::bishop()->first();
        return response()->json($bishop);
    }

    /**
     * Get archdeacons
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function archdeacons()
    {
        $archdeacons = Team::archdeacons()->get();
        return response()->json($archdeacons);
    }

    /**
     * Get departments
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function departments()
    {
        $departments = Team::departments()->get();
        return response()->json($departments);
    }

    /**
     * Get team members by category
     *
     * @param  string  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function byCategory(string $category)
    {
        $validCategories = ['bishop', 'archdeacon', 'department'];

        if (!in_array($category, $validCategories)) {
            return response()->json(['error' => 'Invalid category'], 400);
        }

        $members = Team::getByCategory($category);
        return response()->json($members);
    }
}
