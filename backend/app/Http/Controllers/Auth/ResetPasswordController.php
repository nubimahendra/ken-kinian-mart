<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;

class ResetPasswordController extends Controller
{
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $resetRequest = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$resetRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token or email.'
            ], 400);
        }

        // Check if token has expired (60 minutes)
        if (Carbon::parse($resetRequest->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Token has expired.'
            ], 400);
        }

        // Verify the token
        if (!Hash::check($request->token, $resetRequest->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token.'
            ], 400);
        }

        // Update User password
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been successfully updated.'
        ]);
    }
}
