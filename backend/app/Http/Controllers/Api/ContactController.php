<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Handle contact form submission
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
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
            
            // Log the contact form submission
            Log::info('Contact form submission received', [
                'name' => $data['firstName'] . ' ' . $data['lastName'],
                'email' => $data['email'],
                'subject' => $data['subject']
            ]);

            // Send email notification
            try {
                $this->sendContactEmail($data);
            } catch (\Exception $mailEx) {
                Log::warning('Contact form email delivery deferred: ' . $mailEx->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully. We will get back to you soon!'
            ]);

        } catch (\Exception $e) {
            Log::error('Contact form submission failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.'
            ], 500);
        }
    }

    /**
     * Send contact form email using Laravel Mail facade
     */
    private function sendContactEmail($data)
    {
        try {
            $subject = 'Website Contact: ' . $data['subject'] . ' - From ' . $data['firstName'] . ' ' . $data['lastName'];
            
            $emailContent = "
            <html>
            <head>
                <title>New Contact Form Submission</title>
            </head>
            <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {$data['firstName']} {$data['lastName']}</p>
                <p><strong>Email:</strong> {$data['email']}</p>
                <p><strong>Phone:</strong> " . ($data['phone'] ?? 'Not provided') . "</p>
                <p><strong>Subject:</strong> {$data['subject']}</p>
                <p><strong>Message:</strong></p>
                <p>" . nl2br($data['message']) . "</p>
                <hr>
                <p><em>This message was sent from the church website contact form.</em></p>
            </body>
            </html>
            ";
            
            // Send to admin email
            Mail::html($emailContent, function ($message) use ($data, $subject) {
                $message->to('admin@earshyogwe.com')
                        ->subject($subject)
                        ->replyTo($data['email'], $data['firstName'] . ' ' . $data['lastName']);
            });
            
            // Also send a copy to the diocese Gmail
            Mail::html($emailContent, function ($message) use ($data, $subject) {
                $message->to('dioceseshyogwe@gmail.com')
                        ->subject('Copy: ' . $subject)
                        ->replyTo($data['email'], $data['firstName'] . ' ' . $data['lastName']);
            });
            
            Log::info('Contact form email sent successfully via SMTP', [
                'to' => ['admin@earshyogwe.com', 'dioceseshyogwe@gmail.com'],
                'from' => $data['email'],
                'subject' => $subject
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send contact form email via SMTP: ' . $e->getMessage());
            throw $e;
        }
    }
}
