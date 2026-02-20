'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Map, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Sidebar } from '@/components/ui/Layout/Sidebar';
import { HierarchicalLegend } from '@/components/ui/Controls/HierarchicalLegend';
import { WaybackSelector } from '@/components/modules/TimeMachine/WaybackSelector';
import { LocationSelector } from '@/components/ui/Onboarding/LocationSelector';
import { useMapStore } from '@/store/map-store';
import { ZoningLayer } from '@/components/layers/ZoningLayer';
import { RevenueLayer } from '@/components/layers/RevenueLayer';
import { InfrastructureLayer } from '@/components/layers/InfrastructureLayer';

// Lazy Load Map Components
const BaseMap = dynamic(() => import('@/components/map/BaseMap'), { ssr: false });

import { InspectorPanel } from '@/components/ui/CommandCenter/InspectorPanel';
import { analyzeSelection, SectorAnalysis } from '@/lib/spatial-analysis';
import { fetchElevationProfile, fetchOSMBuildings } from '@/lib/api-integration';
import { loadStaticGeoJSON } from '@/lib/data-loader';
import { BuildingsLayer } from '@/components/layers/BuildingsLayer';
import { Activity } from 'lucide-react';
import { SystemHealthMonitor } from '@/components/ui/SystemHealth/SystemHealthMonitor';

export default function Home() {
  const masterPlan = useMapStore(state => state.masterPlan);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'location' | 'map'>('welcome');
  const [analysisData, setAnalysisData] = useState<SectorAnalysis | null>(null);

  // Load Data for Analysis (Client-side for MVP)
  const [zoningData, setZoningData] = useState<any[]>([]);
  const [infraData, setInfraData] = useState<any[]>([]);

  // API Data
  const [elevationData, setElevationData] = useState<any[]>([]);
  const [buildingsData, setBuildingsData] = useState<any>(null);
  const [showBuildings, setShowBuildings] = useState(false);

  // Pre-Flight Data Fetching Hook
  useEffect(() => {
    let mounted = true;
    const fetchPreflightData = async () => {
      try {
        const [zoning, infra] = await Promise.all([
          loadStaticGeoJSON('zoning.json'),
          loadStaticGeoJSON('infrastructure.json')
        ]);
        if (mounted) {
          setZoningData(zoning?.features || []);
          setInfraData(infra?.features || []);
        }
      } catch (e) {
        console.warn("Preflight missing critical files");
      }
    };

    fetchPreflightData();
    return () => { mounted = false; };
  }, []);

  const onUpdateDraw = useCallback(async (e: any) => {
    const geometry = e.features[0]?.geometry;
    const data = analyzeSelection(geometry, zoningData, infraData);
    setAnalysisData(data);

    if (geometry?.type === 'LineString') {
      const profile = await fetchElevationProfile(geometry.coordinates);
      setElevationData(profile);
    } else {
      setElevationData([]);
    }
  }, [zoningData, infraData]);

  const onDeleteDraw = useCallback(() => {
    setAnalysisData(null);
  }, []);

  const mpOpacity = masterPlan.visible ? masterPlan.opacity : 0;

  const layers = useMemo(() => [
    ZoningLayer(
      // We assume data will eventually load properly, deck.gl handles null/empty gracefully
      loadStaticGeoJSON('metro-stations.json'),
      {
        visible: masterPlan.visible && masterPlan.sublayers.metroStations,
        opacity: mpOpacity
      }
    ),
    RevenueLayer(
      loadStaticGeoJSON('lrts-alignment.json'),
      {
        visible: masterPlan.visible && masterPlan.sublayers.lrtsAlignment,
        opacity: mpOpacity
      }
    ),
    InfrastructureLayer(
      loadStaticGeoJSON('land-use-zones.json'),
      {
        visible: masterPlan.visible && masterPlan.sublayers.landUseZones,
        opacity: mpOpacity
      }
    ),
    ...(showBuildings && buildingsData ? [BuildingsLayer(buildingsData)] : [])
  ], [masterPlan.visible, masterPlan.sublayers, mpOpacity, showBuildings, buildingsData]);

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-slate-950 font-sans text-slate-100 select-none">

      {/* Onboarding Flow */}
      <AnimatePresence mode="wait">

        {/* Step 1: Welcome Screen */}
        {onboardingStep === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"
          >
            <div className="max-w-4xl relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-cyan-900/20 relative z-10">
                <Map className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={48} />
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase relative z-10">
                Eagle Eye
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto font-light leading-relaxed relative z-10">
                State-Level <span className="text-cyan-400 font-medium">Geospatial Intelligence</span> Platform.<br />
                Analyze zoning, revenue records, and 3D topography.
              </p>

              <button
                onClick={() => setOnboardingStep('location')}
                className="group relative px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white text-lg font-bold rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] transition-all flex items-center gap-4 mx-auto uppercase tracking-widest border border-cyan-400/20"
              >
                Initialize System
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="absolute bottom-8 flex gap-8 text-[10px] uppercase tracking-[0.2em] text-slate-600">
              <span>Secure Connection</span>
              <span>•</span>
              <span>v1.0.0 Public Beta</span>
              <span>•</span>
              <span>GovTech Ready</span>
            </div>
          </motion.div>
        )}

        {/* Step 2: Location Selector */}
        {onboardingStep === 'location' && (
          <motion.div
            key="location"
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <LocationSelector onComplete={() => setOnboardingStep('map')} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Step 3: Main Map Application */}
      {(onboardingStep === 'map') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Sidebar>
            <div className="space-y-6 pt-4">
              <HierarchicalLegend />

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-[0.2em]">Modules</h3>

                <button
                  onClick={async () => {
                    if (!showBuildings) {
                      try {
                        const currentViewState = useMapStore.getState().viewState;
                        const center = currentViewState.longitude ? [currentViewState.longitude, currentViewState.latitude] : [76.9366, 8.5241];
                        const bbox: [number, number, number, number] = [
                          center[0] - 0.005, center[1] - 0.005,
                          center[0] + 0.005, center[1] + 0.005
                        ];
                        const data = await fetchOSMBuildings(bbox);
                        setBuildingsData(data);
                      } catch (e) { console.error(e); }
                    }
                    setShowBuildings(!showBuildings);
                  }}
                  className={clsx(
                    "w-full py-3 border rounded transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2",
                    showBuildings
                      ? "bg-slate-100 text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <Activity size={14} />
                  {showBuildings ? 'Clear 3D Context' : 'Scan Live Buildings'}
                </button>
              </div>
            </div>
          </Sidebar>

          <div className="w-full h-full relative bg-slate-950">
            <BaseMap
              layers={layers}
              onDrawCreate={onUpdateDraw}
              onDrawUpdate={onUpdateDraw}
              onDrawDelete={onDeleteDraw}
            />

            <div className="absolute top-4 right-4 z-10">
              <WaybackSelector onSelect={(item) => console.log('Selected Wayback:', item)} />
            </div>

            {/* <InspectorPanel data={analysisData} elevationData={elevationData} onClose={() => setAnalysisData(null)} /> */}
          </div>
        </motion.div>
      )}



      {/* System Health Monitor */}
      <SystemHealthMonitor />
    </main>
  );
}
