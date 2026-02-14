import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          block w-full px-4 py-2.5 text-sm text-gray-900
          bg-gray-50 border border-gray-200 rounded-xl
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
