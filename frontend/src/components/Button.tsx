import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: ReactNode;
    fullWidth?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary:
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
        secondary:
            'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300',
        outline:
            'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        danger:
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    };

    const sizeStyles = {
        sm: 'px-3.5 py-2 text-sm gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
