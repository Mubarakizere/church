<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'visitor_id',
        'path',
        'section',
        'ip_address',
        'user_agent',
        'referrer'
    ];
}
