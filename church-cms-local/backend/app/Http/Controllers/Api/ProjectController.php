<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthCenter;
use App\Models\HealthPost;
use App\Models\School;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Get all projects
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $projects = Project::where('is_active', true)->orderBy('created_at', 'desc')->get();
        return response()->json($projects);
    }

    /**
     * Get comprehensive project statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStatistics()
    {
        $healthCenters = HealthCenter::where('is_active', true)->count();
        $healthPosts = HealthPost::where('is_active', true)->count();
        $schools = School::getStatistics();
        
        return response()->json([
            'health_centers' => $healthCenters,
            'health_posts' => $healthPosts,
            'schools' => $schools,
            'total_educational_institutions' => $schools['total'],
            'summary' => [
                'health_facilities' => $healthCenters + $healthPosts,
                'educational_institutions' => $schools['total'],
                'total_projects' => $healthCenters + $healthPosts + $schools['total'],
            ]
        ]);
    }

    /**
     * Get all project data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllProjects()
    {
        $healthCenters = HealthCenter::where('is_active', true)->get();
        $healthPosts = HealthPost::where('is_active', true)->get();
        $schools = School::getByTypeGrouped();
        
        return response()->json([
            'health_centers' => $healthCenters,
            'health_posts' => $healthPosts,
            'schools' => $schools,
            'statistics' => $this->getStatistics()->getData(),
        ]);
    }

    /**
     * Get health facilities (centers and posts)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHealthFacilities()
    {
        $healthCenters = HealthCenter::where('is_active', true)->get();
        $healthPosts = HealthPost::where('is_active', true)->get();
        
        return response()->json([
            'health_centers' => $healthCenters,
            'health_posts' => $healthPosts,
            'total_facilities' => $healthCenters->count() + $healthPosts->count(),
        ]);
    }

    /**
     * Get educational institutions
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEducationalInstitutions()
    {
        $schools = School::getByTypeGrouped();
        $statistics = School::getStatistics();
        
        return response()->json([
            'schools' => $schools,
            'statistics' => $statistics,
            'breakdown' => [
                'ecd_schools' => $statistics['ecd'],
                'primary_schools' => $statistics['primary'],
                'secondary_basic' => $statistics['secondary_basic'],
                'secondary_boarding' => $statistics['secondary_boarding'],
                'tss_boarding' => $statistics['tss_boarding'],
                'university' => $statistics['university'],
            ]
        ]);
    }

    /**
     * Get project impact data
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getImpactData()
    {
        $statistics = $this->getStatistics()->getData();
        
        // Estimated beneficiaries based on typical capacity
        $healthCenterBeneficiaries = $statistics->health_centers * 5000; // ~5000 patients per center annually
        $healthPostBeneficiaries = $statistics->health_posts * 2000; // ~2000 patients per post annually
        $schoolBeneficiaries = [
            'ecd' => $statistics->schools['ecd'] * 100, // ~100 children per ECD
            'primary' => $statistics->schools['primary'] * 400, // ~400 students per primary school
            'secondary_basic' => $statistics->schools['secondary_basic'] * 500, // ~500 students per secondary
            'secondary_boarding' => $statistics->schools['secondary_boarding'] * 800, // ~800 students per boarding
            'tss_boarding' => $statistics->schools['tss_boarding'] * 600, // ~600 students per TSS
            'university' => $statistics->schools['university'] * 1200, // ~1200 students per university
        ];
        
        $totalStudents = array_sum($schoolBeneficiaries);
        $totalHealthBeneficiaries = $healthCenterBeneficiaries + $healthPostBeneficiaries;
        
        return response()->json([
            'health_impact' => [
                'total_beneficiaries' => $totalHealthBeneficiaries,
                'per_center' => $healthCenterBeneficiaries / max(1, $statistics->health_centers),
                'per_post' => $healthPostBeneficiaries / max(1, $statistics->health_posts)
            ],
            'education_impact' => [
                'total_students' => $totalStudents,
                'breakdown' => $schoolBeneficiaries
            ],
            'total_impact' => $totalStudents + $totalHealthBeneficiaries
        ]);
    }

    /**
     * Store a new project
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'attendees' => 'required|string|max:255',
            'start_date' => 'required|date',
            'recurrence_pattern' => 'nullable|string',
            'featured' => 'boolean',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array'
        ]);

        // Handle backward compatibility for old field names
        if ($request->has('name')) {
            $validated['title'] = $request->input('name');
        }
        if ($request->has('type')) {
            $validated['category'] = $request->input('type');
        }
        if ($request->has('beneficiaries')) {
            $validated['attendees'] = $request->input('beneficiaries');
        }

        $project = Project::create($validated);
        return response()->json($project, 201);
    }

    /**
     * Show a specific project
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $project = Project::findOrFail($id);
        return response()->json($project);
    }

    /**
     * Update a project
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'attendees' => 'required|string|max:255',
            'start_date' => 'required|date',
            'recurrence_pattern' => 'nullable|string',
            'featured' => 'boolean',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array'
        ]);

        // Handle backward compatibility for old field names
        if ($request->has('name')) {
            $validated['title'] = $request->input('name');
        }
        if ($request->has('type')) {
            $validated['category'] = $request->input('type');
        }
        if ($request->has('beneficiaries')) {
            $validated['attendees'] = $request->input('beneficiaries');
        }

        $project->update($validated);
        return response()->json($project);
    }

    /**
     * Delete a project
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(null, 204);
    }
}
