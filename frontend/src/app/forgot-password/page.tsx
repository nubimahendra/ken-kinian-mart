"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import FormInput from "@/components/FormInput";
import LoadingButton from "@/components/LoadingButton";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setError(null);
        setSuccess(false);

        if (!email) {
            setError("Email tidak boleh kosong");
            return;
        }

        if (!validateEmail(email)) {
            setError("Format email tidak valid");
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
            const response = await fetch(`${apiUrl}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Terjadi kesalahan pada server. Silakan coba lagi.");
            }

            setSuccess(true);
            setEmail("");
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Lupa Password"
            subtitle="Masukkan email Anda untuk menerima link reset password"
        >
            {success && (
                <div className="mb-5 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center font-medium">
                    Jika email terdaftar, link reset telah dikirim ke inbox Anda.
                </div>
            )}

            {error && !success && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                    }}
                    disabled={loading}
                />

                <div className="mt-6">
                    <LoadingButton type="submit" loading={loading}>
                        Kirim Link Reset
                    </LoadingButton>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                        Kembali ke Login
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
