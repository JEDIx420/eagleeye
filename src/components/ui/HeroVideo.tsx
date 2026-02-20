'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEOS = [
    '/videos/v1.mp4',
    '/videos/v2.mp4',
    '/videos/v3.mp4',
    '/videos/v4.mp4'
];

interface HeroVideoProps {
    onboardingStep: 'welcome' | 'location' | 'map';
}

export function HeroVideo({ onboardingStep }: HeroVideoProps) {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    useEffect(() => {
        // Always start sequence from v1
        setVideoSrc(VIDEOS[0]);
    }, []);

    // Forcefully unmount when map is active to free GPU WebGL context
    if (onboardingStep === 'map') return null;

    return (
        <AnimatePresence>
            {(onboardingStep === 'welcome' || onboardingStep === 'location') && videoSrc && (
                <motion.div
                    key="hero-video-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                >
                    <video
                        src={videoSrc}
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
