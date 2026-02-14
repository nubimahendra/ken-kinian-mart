'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { setToken, setStoredUser } from '@/lib/auth';
import { ApiResponse, AuthData } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch<ApiResponse<AuthData>>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: confirmPassword,
                    role: 'user',
                }),
                skipAuth: true,
            });

            setToken(res.data.token);
            setStoredUser(res.data.user);

            window.location.href = redirect;
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join Kenkinian Mart today</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <Button type="submit" loading={loading} fullWidth size="lg">
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary-600 hover:text-primary-700 font-semibold">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
