'use client';

/**
 * Simple bar chart rendered with pure CSS/HTML — no external chart libraries.
 */
interface SalesChartProps {
    data: { label: string; value: number }[];
    title?: string;
}

export default function SalesChart({ data, title = 'Sales Overview' }: SalesChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">{title}</h3>
            <div className="flex items-end gap-2 h-48">
                {data.map((item, idx) => {
                    const heightPct = (item.value / maxValue) * 100;
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-medium text-gray-600">
                                {item.value > 0 ? item.value.toLocaleString('id-ID') : ''}
                            </span>
                            <div className="w-full flex items-end justify-center" style={{ height: '140px' }}>
                                <div
                                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300 cursor-default"
                                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                                    title={`${item.label}: ${item.value.toLocaleString('id-ID')}`}
                                />
                            </div>
                            <span className="text-[10px] text-gray-400 truncate max-w-full">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
