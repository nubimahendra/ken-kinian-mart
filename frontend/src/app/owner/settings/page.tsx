'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function OwnerSettingsPage() {
    const [settings, setSettings] = useState({
        min_order: '50000',
        default_discount: '0',
        store_name: 'Kenkinian Mart',
        store_email: 'hello@kenkinian.com',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (field: string, value: string) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Settings save — placeholder (extend with backend endpoint as needed)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <p className="text-sm text-gray-500">Configure store settings</p>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Store Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Store Information</h3>
                    <div className="space-y-4">
                        <Input
                            label="Store Name"
                            value={settings.store_name}
                            onChange={(e) => handleChange('store_name', e.target.value)}
                        />
                        <Input
                            label="Store Email"
                            type="email"
                            value={settings.store_email}
                            onChange={(e) => handleChange('store_email', e.target.value)}
                        />
                    </div>
                </div>

                {/* Order Settings */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Order Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Minimum Order (IDR)"
                            type="number"
                            value={settings.min_order}
                            onChange={(e) => handleChange('min_order', e.target.value)}
                        />
                        <Input
                            label="Default Discount (%)"
                            type="number"
                            value={settings.default_discount}
                            onChange={(e) => handleChange('default_discount', e.target.value)}
                        />
                    </div>
                </div>

                {/* Environment Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Environment</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">API URL</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</code>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-500">Midtrans Mode</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                                {process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? 'Production' : 'Sandbox'}
                            </code>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-500">Frontend Version</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700">Next.js 16</code>
                        </div>
                    </div>
                </div>

                {/* Save */}
                <div className="flex items-center gap-3">
                    <Button type="submit" loading={saving}>Save Settings</Button>
                    {saved && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Saved successfully
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
