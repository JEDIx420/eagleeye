'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useMapStore } from '@/store/map-store';

export function SystemHealthMonitor() {
    const store = useMapStore();
    const { status, message } = store.systemHealth;
    const [fps, setFps] = useState(60);
    const [memory, setMemory] = useState<string>('N/A');

    useEffect(() => {
        // Mock System Check or bind to real events
        // In a real app, we would listen to map 'error' events

        const interval = setInterval(() => {
            // Memory is now just updating local component state string
            if (typeof window !== 'undefined' && (performance as any).memory) {
                setMemory(Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB');
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // FPS Counter (Mock for now, could use requestAnimationFrame)
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();

        const loop = () => {
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(loop);
        };
        const handle = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(handle);
    }, []);

    return (
        <div className="fixed bottom-0 right-0 p-2 bg-slate-950/80 backdrop-blur border-t border-l border-slate-800 rounded-tl-lg flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider z-50">
            <div className="flex items-center gap-2">
                <Activity size={12} className="text-slate-500" />
                <span className="text-slate-400">FPS: <span className="text-white">{fps}</span></span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
                {status === 'healthy' && <CheckCircle size={12} className="text-emerald-500" />}
                {status === 'warning' && <AlertTriangle size={12} className="text-amber-500" />}
                {status === 'error' && <XCircle size={12} className="text-red-500" />}

                <span className={clsx(
                    status === 'healthy' ? "text-emerald-400" :
                        status === 'warning' ? "text-amber-400" : "text-red-400"
                )}>
                    {message}
                </span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="text-slate-600">
                Mem: {memory}
            </div>
        </div>
    );
}
