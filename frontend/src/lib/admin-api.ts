import { getToken, removeToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

/**
 * Admin API fetch wrapper — auto-injects JWT and handles 401 (redirect to login).
 */
export async function adminFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(customHeaders as Record<string, string>),
    };

    // If body is FormData, let browser set Content-Type (with boundary)
    if (restOptions.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    if (!skipAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...restOptions,
        headers,
    });

    // Auto-logout on 401
    if (response.status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/login?redirect=/admin';
        }
        throw { status: 401, message: 'Unauthorized' };
    }

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            message: data.message || 'Something went wrong',
            data: data,
        };
    }

    return data as T;
}
