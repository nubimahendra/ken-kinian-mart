import React, { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative overflow-hidden">
        {/* Optional decorative top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
        
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 text-center mb-6">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
