'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Lock } from 'lucide-react';
import clsx from 'clsx';

interface LocationSelectorProps {
    onComplete: () => void;
}

type Step = 'state' | 'district' | 'ready';

const STATES = [
    { id: 'kerala', name: 'Kerala', enabled: true, count: '14 Districts' },
    { id: 'tamil-nadu', name: 'Tamil Nadu', enabled: false, count: 'Coming Soon' },
    { id: 'karnataka', name: 'Karnataka', enabled: false, count: 'Coming Soon' },
];

const DISTRICTS = [
    { id: 'trivandrum', name: 'Thiruvananthapuram', enabled: true, type: 'Capital District' },
    { id: 'ernakulam', name: 'Ernakulam', enabled: false, type: 'Commercial Hub' },
    { id: 'kozhikode', name: 'Kozhikode', enabled: false, type: 'Coastal Hub' },
];

export function LocationSelector({ onComplete }: LocationSelectorProps) {
    const [step, setStep] = useState<Step>('state');
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const handleStateSelect = (id: string, enabled: boolean) => {
        if (!enabled) return;
        setSelectedState(id);
        setStep('district');
    };

    const handleDistrictSelect = (id: string, enabled: boolean) => {
        if (!enabled) return;
        setSelectedDistrict(id);
        setStep('ready');
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-slate-800 text-slate-100"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <MapPin size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {step === 'state' && 'Select Jurisdiction'}
                        {step === 'district' && 'Select Administrative Zone'}
                        {step === 'ready' && 'Confirm Deployment'}
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        {step === 'state' && 'Access state-level geospatial intelligence'}
                        {step === 'district' && 'Drill down to specific district data layers'}
                        {step === 'ready' && 'Launch Command Center interface'}
                    </p>
                </div>

                {/* State Selection */}
                {step === 'state' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        {STATES.map((state) => (
                            <button
                                key={state.id}
                                onClick={() => handleStateSelect(state.id, state.enabled)}
                                className={clsx(
                                    "p-6 rounded-xl border text-left flex flex-col justify-between transition-all h-32 relative overflow-hidden group",
                                    state.enabled
                                        ? "border-slate-700 bg-slate-800 hover:border-cyan-500 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                                        : "border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div>
                                    <span className={clsx("font-semibold text-lg block", state.enabled ? "text-white" : "text-slate-500")}>
                                        {state.name}
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider mt-1 block">{state.count}</span>
                                </div>
                                {!state.enabled && <Lock size={16} className="absolute bottom-4 right-4 text-slate-600" />}
                                {state.enabled && <ChevronRight size={20} className="absolute bottom-4 right-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* District Selection */}
                {step === 'district' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <button
                            onClick={() => setStep('state')}
                            className="text-xs text-slate-500 hover:text-slate-300 mb-2 flex items-center uppercase tracking-wider font-bold"
                        >
                            <ChevronRight size={14} className="rotate-180 mr-1" /> Back to State Selection
                        </button>

                        <div className="grid grid-cols-1 gap-3">
                            {DISTRICTS.map((district) => (
                                <button
                                    key={district.id}
                                    onClick={() => handleDistrictSelect(district.id, district.enabled)}
                                    className={clsx(
                                        "w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group",
                                        district.enabled
                                            ? "border-slate-700 bg-slate-800 hover:border-cyan-500 hover:bg-slate-800/80"
                                            : "border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    <div>
                                        <span className={clsx("font-medium block", district.enabled ? "text-white" : "text-slate-500")}>
                                            {district.name}
                                        </span>
                                        <span className="text-xs text-slate-500">{district.type}</span>
                                    </div>
                                    {!district.enabled && (
                                        <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-500 px-2 py-1 rounded">LOCKED</span>
                                    )}
                                    {district.enabled && <ChevronRight size={16} className="text-cyan-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Ready State */}
                {step === 'ready' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-8 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="flex items-center justify-between mb-4 relative z-10 border-b border-slate-800 pb-4">
                                <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Jurisdiction</span>
                                <span className="text-sm font-semibold text-cyan-400">Kerala State</span>
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Zone</span>
                                <span className="text-sm font-semibold text-white">Thiruvananthapuram</span>
                            </div>
                        </div>

                        <button
                            onClick={onComplete}
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                        >
                            Initialize Command Center
                        </button>

                        <button
                            onClick={() => setStep('district')}
                            className="mt-6 text-xs text-slate-600 hover:text-slate-400 uppercase tracking-wider font-semibold"
                        >
                            Modify Parameters
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
