import { CartItem } from '@/types';

const CART_KEY = 'kenkinian_cart';

function getCartFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
    return getCartFromStorage();
}

export function addToCart(item: CartItem): CartItem[] {
    const cart = getCartFromStorage();
    const existingIndex = cart.findIndex((c) => c.product_id === item.product_id);

    if (existingIndex > -1) {
        // Increase quantity, cap at stock
        const newQty = cart[existingIndex].quantity + item.quantity;
        cart[existingIndex].quantity = Math.min(newQty, item.stock);
    } else {
        cart.push({ ...item, quantity: Math.min(item.quantity, item.stock) });
    }

    saveCart(cart);
    return cart;
}

export function updateQuantity(productId: number, quantity: number): CartItem[] {
    const cart = getCartFromStorage();
    const index = cart.findIndex((c) => c.product_id === productId);

    if (index > -1) {
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = Math.min(quantity, cart[index].stock);
        }
    }

    saveCart(cart);
    return cart;
}

export function removeFromCart(productId: number): CartItem[] {
    const cart = getCartFromStorage().filter((c) => c.product_id !== productId);
    saveCart(cart);
    return cart;
}

export function clearCart(): void {
    localStorage.removeItem(CART_KEY);
}

export function getCartTotal(): { totalPrice: number; totalWeight: number; itemCount: number } {
    const cart = getCartFromStorage();
    return cart.reduce(
        (acc, item) => ({
            totalPrice: acc.totalPrice + item.price * item.quantity,
            totalWeight: acc.totalWeight + item.weight * item.quantity,
            itemCount: acc.itemCount + item.quantity,
        }),
        { totalPrice: 0, totalWeight: 0, itemCount: 0 }
    );
}
