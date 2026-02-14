'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    const widthClass = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Panel */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widthClass} mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* Content */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
