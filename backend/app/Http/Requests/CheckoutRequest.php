<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items'                => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'shipping_zone_id'    => ['required', 'integer', 'exists:shipping_zones,id'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'items.required'                 => 'Items are required.',
            'items.array'                    => 'Items must be an array.',
            'items.min'                      => 'At least one item is required.',
            'items.*.product_id.required'    => 'Each item must have a product_id.',
            'items.*.product_id.exists'      => 'Product with given ID does not exist.',
            'items.*.quantity.required'      => 'Each item must have a quantity.',
            'items.*.quantity.min'           => 'Quantity must be at least 1.',
            'shipping_zone_id.required'      => 'Shipping zone is required.',
            'shipping_zone_id.exists'        => 'Selected shipping zone does not exist.',
        ];
    }

    /**
     * Handle a failed validation attempt — return standard API response.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed.',
            'data'    => $validator->errors(),
        ], 422));
    }
}
