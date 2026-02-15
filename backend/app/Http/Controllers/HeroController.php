<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class HeroController extends Controller
{
    public function index()
    {
        $heroes = Hero::where('is_active', true)->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $heroes
        ]);
    }

    public function indexAdmin()
    {
        $heroes = Hero::latest()->get();
        return response()->json([
            'success' => true,
            'data' => $heroes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|image|max:2048', // Max 2MB
            'cta_text' => 'nullable|string|max:50',
            'cta_link' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadImage($request->file('image'));
        }

        $hero = Hero::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hero slide created successfully.',
            'data' => $hero
        ], 201);
    }

    public function update(Request $request, Hero $hero)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'cta_text' => 'nullable|string|max:50',
            'cta_link' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($hero->image) {
                Storage::disk('public')->delete($hero->image);
            }
            $validated['image'] = $this->uploadImage($request->file('image'));
        }

        $hero->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hero slide updated successfully.',
            'data' => $hero
        ]);
    }

    public function destroy(Hero $hero)
    {
        if ($hero->image) {
            Storage::disk('public')->delete($hero->image);
        }

        $hero->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hero slide deleted successfully.'
        ]);
    }

    private function uploadImage($file)
    {
        $manager = new ImageManager(new Driver());
        $name_gen = hexdec(uniqid()) . '.' . 'webp';
        $location = 'heroes/' . $name_gen;

        $image = $manager->read($file);
        $image->toWebp(80);

        Storage::disk('public')->put($location, (string) $image->encode());

        return $location;
    }
}