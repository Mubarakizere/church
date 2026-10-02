<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Display a listing of the news articles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = News::query();

            // Filter by status if provided
            if ($request->has('status')) {
                if ($request->status !== 'all') {
                    $query->where('status', $request->status);
                }
            } else {
                // Default to published news for public access
                $query->published();
            }

            // Search by term if provided
            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('summary', 'like', "%{$search}%")
                      ->orWhere('author', 'like', "%{$search}%");
                });
            }

            // Filter by featured
            if ($request->boolean('featured')) {
                $query->featured();
            }

            // Limit if provided
            $limit = $request->get('limit', 100);
            if ($limit > 0 && $limit !== 'all') {
                $query->limit((int)$limit);
            }

            $news = $query->orderBy('published_at', 'desc')->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $news,
                'total' => $news->count()
            ]);
        } catch (\Exception $e) {
            Log::error('News API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created news article in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            Log::info('News Store Request:', ['data' => $request->all()]);
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'summary' => 'nullable|string',
                'content' => 'required|string',
                'image' => 'nullable|string|max:2048',
                'images' => 'nullable|array',
                'images.*' => 'string|max:2048',
                'author' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:draft,published,archived',
                'featured' => 'nullable|boolean',
                'published_at' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                Log::error('News Validation Failed:', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $newsData = $request->all();
            
            // Set published_at if status is published and not provided
            if ($newsData['status'] === 'published' && empty($newsData['published_at'])) {
                $newsData['published_at'] = now();
            }

            $news = News::create($newsData);

            return response()->json([
                'success' => true,
                'message' => 'News article created successfully',
                'data' => $news
            ], 201);

        } catch (\Exception $e) {
            Log::error('News Creation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create news article',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified news article.
     *
     * @param  int|string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $news = News::where('id', $id)->orWhere('slug', $id)->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $news
            ]);
        } catch (\Exception $e) {
            Log::error('News Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'News article not found'
            ], 404);
        }
    }

    /**
     * Update the specified news article in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('News Update Request:', ['id' => $id, 'data' => $request->all()]);
            
            $news = News::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'summary' => 'nullable|string',
                'content' => 'sometimes|required|string',
                'image' => 'nullable|string|max:2048',
                'images' => 'nullable|array',
                'images.*' => 'string|max:2048',
                'author' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:draft,published,archived',
                'featured' => 'nullable|boolean',
                'published_at' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                Log::error('News Update Validation Failed:', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Safe update - update each field individually
            if ($request->has('title') && !empty($request->title)) {
                $news->title = $request->title;
            }
            if ($request->has('summary')) {
                $news->summary = $request->summary;
            }
            if ($request->has('content')) {
                $news->content = $request->content;
            }
            if ($request->has('image')) {
                $news->image = $request->image;
            }
            if ($request->has('images')) {
                $news->images = $request->images;
            }
            if ($request->has('author')) {
                $news->author = $request->author;
            }
            if ($request->has('status')) {
                $news->status = $request->status;
                // Set published_at if status is being changed to published
                if ($request->status === 'published' && empty($news->published_at)) {
                    $news->published_at = now();
                }
            }
            if ($request->has('featured')) {
                $news->featured = (bool) $request->featured;
            }
            if ($request->has('published_at')) {
                $news->published_at = $request->published_at;
            }
            
            $news->save();

            return response()->json([
                'success' => true,
                'message' => 'News article updated successfully',
                'data' => $news
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('News not found: ' . $id);
            return response()->json([
                'success' => false,
                'message' => 'News article not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('News Update Error: ' . $e->getMessage() . ' File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update news article: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified news article from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $news = News::findOrFail($id);
            $news->delete();

            return response()->json([
                'success' => true,
                'message' => 'News article deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('News Delete Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete news article',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}




