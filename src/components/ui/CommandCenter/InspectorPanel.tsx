'use client';

import { SectorAnalysis } from '@/lib/spatial-analysis';
import { X, Ruler, Home, Building2, MapPin, Activity } from 'lucide-react';
import clsx from 'clsx';
import { ElevationChart } from '@/components/visualization/ElevationChart';

interface InspectorPanelProps {
    data: SectorAnalysis | null;
    elevationData?: any[];
    onClose: () => void;
}

export function InspectorPanel({ data, elevationData, onClose }: InspectorPanelProps) {
    if (!data && !elevationData) return null;

    return (
        <div className="absolute bottom-6 right-6 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">

            {/* Header */}
            <div className="bg-slate-800/80 p-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                        <Ruler size={16} className="text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spatial Analysis</h3>
                        <p className="text-[10px] text-slate-400">Custom Sector Evaluation</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">

                {/* Elevation Profile */}
                {elevationData && (
                    <ElevationChart data={elevationData} />
                )}

                {/* Key Metrics Grid */}
                {data && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Total Area</span>
                                <span className="text-2xl font-mono text-cyan-400 font-light">{data.areaAcres} <span className="text-xs text-slate-500">ac</span></span>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Impact</span>
                                <span className="text-2xl font-mono text-fuchsia-400 font-light">{data.amenityCount} <span className="text-xs text-slate-500">nodes</span></span>
                            </div>
                        </div>

                        {/* Zones List */}
                        <div>
                            <h4 className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2 flex items-center gap-2">
                                <Home size={12} /> Zoning Intersections
                            </h4>
                            <div className="space-y-2">
                                {data.intersectedZones.length > 0 ? (
                                    data.intersectedZones.map((zone, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_5px_rgba(217,70,239,0.5)]"></span>
                                            {zone}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-600 italic">No marked zones detected in this sector.</p>
                                )}
                            </div>
                        </div>

                        {/* Amenities List */}
                        <div>
                            <h4 className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2 flex items-center gap-2">
                                <Building2 size={12} /> Infrastructure
                            </h4>
                            <div className="space-y-2">
                                {data.amenities.length > 0 ? (
                                    data.amenities.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_5px_rgba(132,204,22,0.5)]"></span>
                                            {item}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-600 italic">No infrastructure nodes in range.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-yellow-500"></div>
        </div>
    );
}
