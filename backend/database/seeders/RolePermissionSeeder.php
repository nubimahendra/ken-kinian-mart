<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Permission;
use App\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'manage_products',
            'manage_categories',
            'manage_orders',
            'view_financial',
            'manage_users',
            'export_reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $ownerRole = Role::firstOrCreate(['name' => 'owner']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $customerRole = Role::firstOrCreate(['name' => 'customer']);

        // Assign permissions to roles
        $ownerRole->permissions()->sync(Permission::all());
        
        $adminRole->permissions()->sync(
            Permission::whereIn('name', [
                'manage_products',
                'manage_categories',
                'manage_orders'
            ])->get()
        );

        $customerRole->permissions()->sync([]);
    }
}
