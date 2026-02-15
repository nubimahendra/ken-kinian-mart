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
    options: RequestInit = {}
): Promise<T> {
    const { headers: customHeaders, body, ...restOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(customHeaders as Record<string, string>),
    };

    // If body is FormData, delete Content-Type to let browser set boundary
    if (body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...restOptions,
        headers,
        body
    });

    if (response.status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/login?redirect=/admin';
        }
        throw new Error('Unauthorized');
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
