<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table with default accounts.
     */
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Owner',
                'email'    => 'owner@kandangmart.com',
                'password' => Hash::make('password'),
                'role'     => 'owner',
            ],
            [
                'name'     => 'Admin',
                'email'    => 'admin@kandangmart.com',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'User',
                'email'    => 'user@kandangmart.com',
                'password' => Hash::make('password'),
                'role'     => 'user',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
