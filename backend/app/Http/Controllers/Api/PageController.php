<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class PageController extends Controller
{
    public function index()
    {
        // Return a simple pages list placeholder
        return response()->json([
            ['id' => 1, 'title' => 'Home', 'slug' => 'home', 'content' => 'Welcome to our church'],
            ['id' => 2, 'title' => 'About', 'slug' => 'about', 'content' => 'About us']
        ]);
    }

    public function show($id)
    {
        return response()->json(['id' => $id, 'title' => 'Page ' . $id, 'content' => 'Content for page ' . $id]);
    }
}
