import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

/**
 * Reusable fetch wrapper with automatic JWT injection and error handling.
 */
export async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(customHeaders as Record<string, string>),
    };

    // Only set Content-Type to application/json if body is NOT FormData
    if (!(restOptions.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Inject auth token if available
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
