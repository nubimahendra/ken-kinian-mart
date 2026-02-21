<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table with default accounts.
     */
    public function run(): void
    {
        $ownerRole = Role::where('name', 'owner')->first()->id ?? null;
        $adminRole = Role::where('name', 'admin')->first()->id ?? null;
        $customerRole = Role::where('name', 'customer')->first()->id ?? null;

        $users = [
            [
                'name'     => 'Owner',
                'email'    => 'owner@kandangmart.com',
                'password' => Hash::make('password'),
                'role_id'  => $ownerRole,
            ],
            [
                'name'     => 'Admin',
                'email'    => 'admin@kandangmart.com',
                'password' => Hash::make('password'),
                'role_id'  => $adminRole,
            ],
            [
                'name'     => 'Customer',
                'email'    => 'user@kandangmart.com',
                'password' => Hash::make('password'),
                'role_id'  => $customerRole,
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
