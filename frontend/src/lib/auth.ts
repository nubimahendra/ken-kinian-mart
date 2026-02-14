const TOKEN_KEY = 'kenkinian_token';
const USER_KEY = 'kenkinian_user';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export function getStoredUser(): { id: number; name: string; email: string; role: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setStoredUser(user: { id: number; name: string; email: string; role: string }): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
