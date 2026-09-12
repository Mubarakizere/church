<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    /**
     * Display a listing of the events.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Fetch all events or only published ones
            $events = Event::orderBy('date', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $events,
                'total' => $events->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Events API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created event in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            Log::info('Event Store Request:', ['data' => $request->all()]);
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'date' => 'required|date',
                'time' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:draft,published,upcoming,ongoing,completed',
                'attendees' => 'nullable|string|max:255',
                'featured' => 'nullable|boolean',
                'is_recurring' => 'nullable|boolean',
                'recurrence_pattern' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                Log::error('Event Validation Failed:', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Set default values for missing fields
            $eventData = $request->all();
            if (!isset($eventData['status'])) {
                $eventData['status'] = 'draft';
            }
            if (!isset($eventData['featured'])) {
                $eventData['featured'] = false;
            }
            if (!isset($eventData['is_recurring'])) {
                $eventData['is_recurring'] = false;
            }
            if (!isset($eventData['attendees'])) {
                $eventData['attendees'] = 'All Welcome';
            }

            Log::info('Creating event with data:', $eventData);
            $event = Event::create($eventData);

            Log::info('Event created successfully:', ['event' => $event]);
            return response()->json([
                'success' => true,
                'data' => $event,
                'message' => 'Event created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Event Store Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $event = Event::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $event->id,
                    'title' => $event->title ?? '',
                    'description' => $event->description ?? '',
                    'date' => $event->date ? $event->date->format('Y-m-d') : '',
                    'time' => $event->time ?? '',
                    'location' => $event->location ?? '',
                    'status' => $event->status ?? 'draft',
                    'attendees' => $event->attendees ?? 'All Welcome',
                    'featured' => $event->featured ?? false,
                    'is_recurring' => $event->is_recurring ?? false,
                    'recurrence_pattern' => $event->recurrence_pattern ?? null,
                    'created_at' => $event->created_at ? $event->created_at->toISOString() : '',
                    'updated_at' => $event->updated_at ? $event->updated_at->toISOString() : ''
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Events Show API Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified event in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('Event Update Request:', ['id' => $id, 'data' => $request->all()]);
            
            $event = Event::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'date' => 'sometimes|required|date',
                'time' => 'nullable|string',
                'location' => 'nullable|string|max:255',
                'status' => 'nullable|string|in:draft,published,upcoming,ongoing,completed',
                'attendees' => 'nullable|string|max:255',
                'featured' => 'nullable|boolean',
                'is_recurring' => 'nullable|boolean',
                'recurrence_pattern' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                Log::error('Event Update Validation Failed:', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Filter out null values to avoid overwriting with null
            $updateData = array_filter($request->all(), function($value) {
                return $value !== null;
            });

            Log::info('Updating event with data:', $updateData);
            $event->update($updateData);

            Log::info('Event updated successfully:', ['event' => $event]);
            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
            Log::error('Events Update API Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'event_id' => $id
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            Log::info('Event Delete Request:', ['id' => $id, 'id_type' => gettype($id)]);
            
            // Check if $id is actually an array or collection
            if (is_array($id) || is_object($id)) {
                Log::error('ID is not a scalar value:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid event ID',
                    'error' => 'ID must be a scalar value'
                ], 400);
            }
            
            // Use findOrFail to get a single model instance
            $event = Event::findOrFail($id);
            
            Log::info('Found event for deletion:', [
                'event' => $event, 
                'event_type' => get_class($event),
                'is_collection' => $event instanceof \Illuminate\Database\Eloquent\Collection
            ]);
            
            // Check if we got a collection instead of a model
            if ($event instanceof \Illuminate\Database\Eloquent\Collection) {
                Log::error('Expected model but got collection:', ['collection' => $event]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unexpected collection returned',
                    'error' => 'Expected single model but got collection'
                ], 500);
            }
            
            // Delete the model instance
            $result = $event->delete();
            
            Log::info('Event delete result:', ['result' => $result]);

            Log::info('Event deleted successfully:', ['id' => $id]);
            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Events Delete API Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'event_id' => $id
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}