<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $email = $request->email;
        $token = Str::random(64);

        // Delete existing tokens for this email to prevent duplicates
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Store hashed token in database
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Send email with plain token
        Mail::to($email)->send(new ResetPasswordMail($token, $email));

        // Always return success to prevent email enumeration attacks
        return response()->json([
            'success' => true,
            'message' => 'If your email is registered, you will receive a password reset link.'
        ]);
    }
}
