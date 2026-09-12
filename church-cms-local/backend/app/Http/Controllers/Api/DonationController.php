<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class DonationController extends Controller
{
    /**
     * Handle donation form submission
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:1',
            'donationType' => 'required|string|max:255',
            'message' => 'nullable|string|max:2000',
            'paymentMethod' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            
            // Create donation record
            $donation = Donation::create([
                'first_name' => $data['firstName'],
                'last_name' => $data['lastName'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'amount' => $data['amount'],
                'donation_type' => $data['donationType'],
                'message' => $data['message'] ?? null,
                'status' => 'pending',
                'payment_method' => $data['paymentMethod'] ?? 'in_person',
                'currency' => $data['currency'] ?? 'RWF',
            ]);

            // Log the donation submission
            Log::info('Donation form submission received', [
                'donation_id' => $donation->id,
                'name' => $donation->full_name,
                'email' => $donation->email,
                'amount' => $donation->formatted_amount,
                'type' => $donation->donation_type
            ]);

            // Send email notification
            $this->sendDonationEmail($donation);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your generous donation! We will contact you soon with payment instructions.',
                'donation_id' => $donation->id
            ]);

        } catch (\Exception $e) {
            Log::error('Donation form submission failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process donation. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get donation statistics (for admin)
     */
    public function statistics()
    {
        try {
            $totalDonations = Donation::confirmed()->sum('amount');
            $totalCount = Donation::confirmed()->count();
            $pendingCount = Donation::pending()->count();
            
            $donationsByType = Donation::confirmed()
                ->selectRaw('donation_type, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('donation_type')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_amount' => $totalDonations,
                    'total_donations' => $totalCount,
                    'pending_donations' => $pendingCount,
                    'by_type' => $donationsByType
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch donation statistics'
            ], 500);
        }
    }

    /**
     * Send donation notification email
     */
    private function sendDonationEmail($donation)
    {
        try {
            $subject = 'New Donation Pledge: ' . $donation->formatted_amount . ' - From ' . $donation->full_name;
            
            $emailContent = "
            <html>
            <head>
                <title>New Donation Pledge</title>
            </head>
            <body>
                <h2>New Donation Pledge Received</h2>
                <p><strong>Donor:</strong> {$donation->full_name}</p>
                <p><strong>Email:</strong> {$donation->email}</p>
                <p><strong>Phone:</strong> " . ($donation->phone ?? 'Not provided') . "</p>
                <p><strong>Amount:</strong> {$donation->formatted_amount}</p>
                <p><strong>Donation Type:</strong> {$donation->donation_type}</p>
                <p><strong>Payment Method:</strong> " . ucfirst(str_replace('_', ' ', $donation->payment_method)) . "</p>
                <p><strong>Status:</strong> " . ucfirst($donation->status) . "</p>
                <p><strong>Donation ID:</strong> #{$donation->id}</p>
                <p><strong>Date:</strong> " . $donation->created_at->format('F j, Y \a\t g:i A') . "</p>
                " . ($donation->message ? "<p><strong>Message:</strong></p><p>" . nl2br($donation->message) . "</p>" : "") . "
                <hr>
                <p><em>This donation pledge was submitted through the church website donation form.</em></p>
                <p><strong>Next Steps:</strong> Please contact the donor to arrange payment collection.</p>
            </body>
            </html>
            ";
            
            // Send to admin email
            Mail::html($emailContent, function ($message) use ($donation, $subject) {
                $message->to('admin@earshyogwe.com')
                        ->subject($subject)
                        ->replyTo($donation->email, $donation->full_name);
            });
            
            // Also send a copy to the diocese Gmail
            Mail::html($emailContent, function ($message) use ($donation, $subject) {
                $message->to('dioceseshyogwe@gmail.com')
                        ->subject('Copy: ' . $subject)
                        ->replyTo($donation->email, $donation->full_name);
            });

            // Send confirmation email to donor
            $this->sendDonorConfirmation($donation);
            
            Log::info('Donation email sent successfully via SMTP', [
                'donation_id' => $donation->id,
                'to' => ['admin@earshyogwe.com', 'dioceseshyogwe@gmail.com'],
                'from' => $donation->email,
                'subject' => $subject
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send donation email via SMTP: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send confirmation email to donor
     */
    private function sendDonorConfirmation($donation)
    {
        try {
            $subject = 'Thank You for Your Generous Donation - Anglican Church of Rwanda, Shyogwe Diocese';
            
            $emailContent = "
            <html>
            <head>
                <title>Thank You for Your Donation</title>
            </head>
            <body>
                <h2>Thank You for Your Generous Donation!</h2>
                <p>Dear {$donation->full_name},</p>
                <p>We are deeply grateful for your generous donation of <strong>{$donation->formatted_amount}</strong> towards <strong>{$donation->donation_type}</strong>.</p>
                
                <h3>Donation Details:</h3>
                <ul>
                    <li><strong>Amount:</strong> {$donation->formatted_amount}</li>
                    <li><strong>Purpose:</strong> {$donation->donation_type}</li>
                    <li><strong>Donation ID:</strong> #{$donation->id}</li>
                    <li><strong>Date:</strong> " . $donation->created_at->format('F j, Y \a\t g:i A') . "</li>
                </ul>
                
                <p><strong>Next Steps:</strong></p>
                <p>Our team will contact you within 24 hours to arrange the payment collection. You can reach us at:</p>
                <ul>
                    <li>Phone: +250788503392</li>
                    <li>Email: admin@earshyogwe.com</li>
                    <li>Office: Shyogwe Diocese Office, Muhanga</li>
                </ul>
                
                <p>Your donation will help us continue our mission of spreading God's love and serving our communities throughout Shyogwe Diocese.</p>
                
                <p>May God bless you abundantly for your generosity!</p>
                
                <p>With gratitude,<br>
                <strong>Anglican Church of Rwanda, Shyogwe Diocese</strong></p>
                
                <hr>
                <p><em>This is an automated confirmation. Please keep this email for your records.</em></p>
            </body>
            </html>
            ";
            
            Mail::html($emailContent, function ($message) use ($donation, $subject) {
                $message->to($donation->email)
                        ->subject($subject)
                        ->replyTo('admin@earshyogwe.com', 'Shyogwe Diocese');
            });
            
            Log::info('Donor confirmation email sent', [
                'donation_id' => $donation->id,
                'to' => $donation->email
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send donor confirmation email: ' . $e->getMessage());
        }
    }
}
