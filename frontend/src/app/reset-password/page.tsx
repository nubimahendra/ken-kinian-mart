"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import FormInput from "@/components/FormInput";
import LoadingButton from "@/components/LoadingButton";
import Link from "next/link";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        password?: string;
        passwordConfirmation?: string;
    }>({});

    useEffect(() => {
        if (!token || !email) {
            setError("Link reset password tidak valid atau sudah kadaluarsa.");
        }
    }, [token, email]);

    const validate = () => {
        const errors: any = {};
        let isValid = true;

        if (!password) {
            errors.password = "Password tidak boleh kosong";
            isValid = false;
        } else if (password.length < 8) {
            errors.password = "Password minimal 8 karakter";
            isValid = false;
        }

        if (!passwordConfirmation) {
            errors.passwordConfirmation = "Konfirmasi password tidak boleh kosong";
            isValid = false;
        } else if (password !== passwordConfirmation) {
            errors.passwordConfirmation = "Konfirmasi password harus sama";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || !token || !email) return;

        setError(null);
        setValidationErrors({});

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
            const response = await fetch(`${apiUrl}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Gagal mereset password. Silakan coba lagi.");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="text-center">
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                    {error || "Link reset password tidak valid atau sudah kadaluarsa."}
                </div>
                <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                    Minta link baru
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
                    Password berhasil direset! Mengalihkan ke halaman login...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <FormInput
                label="Password Baru"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: undefined });
                    }
                }}
                error={validationErrors.password}
                disabled={loading}
            />

            <FormInput
                label="Konfirmasi Password"
                type="password"
                placeholder="Ketik ulang password baru"
                value={passwordConfirmation}
                onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    if (validationErrors.passwordConfirmation) {
                        setValidationErrors({ ...validationErrors, passwordConfirmation: undefined });
                    }
                }}
                error={validationErrors.passwordConfirmation}
                disabled={loading}
            />

            <div className="mt-6">
                <LoadingButton type="submit" loading={loading}>
                    Reset Password
                </LoadingButton>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthCard
            title="Reset Password"
            subtitle="Silakan masukkan password baru Anda"
        >
            <Suspense fallback={
                <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </AuthCard>
    );
}
