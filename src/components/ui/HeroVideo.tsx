'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroVideoProps {
    onboardingStep: 'welcome' | 'location' | 'map';
}

export function HeroVideo({ onboardingStep }: HeroVideoProps) {

    // Forcefully unmount when map is active to free GPU WebGL context
    if (onboardingStep === 'map') return null;

    return (
        <AnimatePresence>
            {(onboardingStep === 'welcome' || onboardingStep === 'location') && (
                <motion.div
                    key="hero-video-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                >
                    <video
                        src="/videos/v1.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Glassmorphism Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
