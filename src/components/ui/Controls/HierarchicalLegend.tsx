'use client';

import { useMapStore } from '@/store/map-store';
import { ChevronDown, ChevronRight, Eye, EyeOff, Layers, Activity, GraduationCap, Bus, Building2, Mountain, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import { useState } from 'react';

export function HierarchicalLegend() {
    const store = useMapStore();
    const { masterPlan, presentDay } = store;

    const [presentDayOpen, setPresentDayOpen] = useState(true);

    const PresentDayToggle = ({ id, label, Icon, colorSignal = "" }: { id: keyof typeof store.presentDay, label: string, Icon: any, colorSignal?: string }) => {
        const active = store.presentDay[id];

        return (
            <div
                className="flex items-center justify-between py-2 pl-4 pr-3 border-l border-slate-800 ml-2 hover:bg-slate-800/50 rounded transition-colors cursor-pointer"
                onClick={() => store.togglePresentDayLayer(id)}
            >
                <div className="flex items-center gap-3">
                    <Icon size={14} className={clsx("transition-colors", active ? "text-cyan-400" : "text-slate-500")} />
                    <div className="flex items-center gap-2">
                        {colorSignal && <span className="block w-1.5 h-4 rounded-sm" style={{ backgroundColor: colorSignal }} />}
                        <span className={clsx("text-xs font-medium transition-colors", active ? "text-slate-200" : "text-slate-600")}>
                            {label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={clsx("w-2 h-2 rounded-full transition-colors", active ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-700")}></div>
                </div>
            </div>
        );
    };

    const SublayerToggle = ({ id, label, color }: { id: 'metroStations' | 'lrtsAlignment' | 'landUseZones', label: string, color: string }) => {
        const active = masterPlan.sublayers[id];

        return (
            <div className="flex items-center justify-between py-2 pl-4 pr-2 border-l border-slate-800 ml-2 hover:bg-slate-800/50 rounded transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: active ? `0 0 8px ${color}` : 'none' }}></div>
                    <span className={clsx("text-xs font-medium transition-colors", active ? "text-slate-300" : "text-slate-600")}>
                        {label}
                    </span>
                </div>
                <button
                    onClick={() => store.toggleSublayer(id)}
                    className={clsx(
                        "p-1 rounded transition-all",
                        active ? "text-slate-200" : "text-slate-600 hover:text-slate-400"
                    )}
                >
                    {active ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
            </div>
        );
    };

    return (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-80">
            <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-[0.2em] border-b border-slate-800 pb-2 flex items-center gap-2">
                <Layers size={10} />
                Data Layers
            </h3>

            {/* Present Day Parent Group */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2 group cursor-pointer" onClick={() => setPresentDayOpen(!presentDayOpen)}>
                    <div className="flex items-center gap-2">
                        {presentDayOpen ? <ChevronDown size={14} className="text-cyan-400" /> : <ChevronRight size={14} className="text-slate-600" />}
                        <span className={clsx("text-sm font-bold tracking-wide transition-colors", presentDayOpen ? "text-white" : "text-slate-500")}>
                            Present Day Scan
                        </span>
                    </div>
                </div>

                <AnimatePresence>
                    {presentDayOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-1"
                        >
                            <PresentDayToggle id="healthcare" label="Healthcare Facilities" Icon={Activity} colorSignal="#EF4444" />
                            <PresentDayToggle id="education" label="Educational Institutions" Icon={GraduationCap} colorSignal="#F59E0B" />
                            <PresentDayToggle id="commercial" label="Commercial & Retail" Icon={ShoppingCart} />
                            <PresentDayToggle id="transport" label="Transport & Transit" Icon={Bus} colorSignal="#3B82F6" />
                            <PresentDayToggle id="buildings3D" label="3D Building Extrusions" Icon={Building2} />
                            <PresentDayToggle id="terrain3D" label="Topographic Terrain" Icon={Mountain} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Master Plan Parent Group */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-2 group cursor-pointer" onClick={store.toggleMasterPlan}>
                    <div className="flex items-center gap-2">
                        {masterPlan.visible ? <ChevronDown size={14} className="text-cyan-400" /> : <ChevronRight size={14} className="text-slate-600" />}
                        <span className={clsx("text-sm font-bold tracking-wide transition-colors", masterPlan.visible ? "text-white" : "text-slate-500")}>
                            2040 Master Plan
                        </span>
                    </div>
                </div>

                <AnimatePresence>
                    {masterPlan.visible && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-1 mb-4">
                                <SublayerToggle id="metroStations" label="Proposed Metro Stations" color="#d946ef" />
                                <SublayerToggle id="lrtsAlignment" label="Proposed LRTS Alignment" color="#84cc16" />
                                <SublayerToggle id="landUseZones" label="Proposed Land Use Zones (High-transparency)" color="#06b6d4" />
                            </div>

                            {/* Global Opacity for Master Plan */}
                            <div className="px-2 mb-4">
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono uppercase">
                                    <span>Opacity</span>
                                    <span>{Math.round(masterPlan.opacity * 100)}%</span>
                                </div>
                                <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-300"
                                        style={{ width: `${masterPlan.opacity * 100}%` }}
                                    ></div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={masterPlan.opacity}
                                        onChange={(e) => store.setMasterPlanOpacity(parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


        </div>
    );
}
