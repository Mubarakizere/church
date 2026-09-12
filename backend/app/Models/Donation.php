<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'amount',
        'donation_type',
        'message',
        'status',
        'payment_method',
        'transaction_id',
        'currency',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the full name of the donor
     */
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 0) . ' ' . ($this->currency ?? 'RWF');
    }

    /**
     * Scope for confirmed donations
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope for pending donations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
