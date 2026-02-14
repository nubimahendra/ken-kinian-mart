'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { setToken, setStoredUser } from '@/lib/auth';
import { ApiResponse, AuthData } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiFetch<ApiResponse<AuthData>>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                skipAuth: true,
            });

            setToken(res.data.token);
            setStoredUser(res.data.user);

            // Force refresh to update navbar
            window.location.href = redirect;
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Login failed. Please check your credentials.');
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <Button type="submit" loading={loading} fullWidth size="lg">
                            Sign In
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
