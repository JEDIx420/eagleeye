'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ElevationChartProps {
    data: any[];
}

export function ElevationChart({ data }: ElevationChartProps) {
    if (!data || data.length === 0) return (
        <div className="h-32 flex items-center justify-center text-slate-500 text-xs">
            No elevation data available
        </div>
    );

    return (
        <div className="h-40 w-full mt-4">
            <h4 className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">Terrain Profile</h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorEle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="distance" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                        itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="elevation" stroke="#06b6d4" fillOpacity={1} fill="url(#colorEle)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
