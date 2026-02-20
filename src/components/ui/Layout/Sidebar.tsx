'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Layers } from 'lucide-react';

interface SidebarProps {
    children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`absolute left-0 top-0 h-full transition-all duration-300 z-10 ${isOpen ? 'w-80' : 'w-0'}`}>
            <div className={`h-full bg-slate-950 shadow-2xl overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 border-r border-slate-800`}>
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Eagle Eye</h1>
                    <p className="text-[10px] text-cyan-500 font-mono mt-1 tracking-widest uppercase">Geospatial Command Center</p>
                </div>
                {children}
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-4 -right-12 bg-slate-900 border border-slate-700 p-2 rounded-r-lg shadow-xl hover:bg-slate-800 flex items-center justify-center text-cyan-400 transition-all"
            >
                {isOpen ? <ChevronLeft size={20} /> : <Layers size={20} />}
            </button>
        </div>
    );
}
