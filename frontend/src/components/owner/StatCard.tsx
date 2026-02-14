import { ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    color: string;
    sub?: string;
}

export default function StatCard({ label, value, icon, color, sub }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white shadow-sm`}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}
