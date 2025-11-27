'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sword, Zap, Shield, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';

interface WeaponInfoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    weaponId?: string;
}

const SIDEBAR_WIDTH = 'clamp(240px, 22vw, 300px)';
const SCALE = 0.75;
const DEFAULT_HEIGHT = 3500;

// Premium Loading Screen Component
const PremiumLoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('กำลังโหลดข้อมูลอาวุธ...');

    useEffect(() => {
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 15;
            });
        }, 200);

        // Loading text rotation
        const textInterval = setInterval(() => {
            const texts = [
                'กำลังโหลดข้อมูลอาวุธ...',
                'กำลังเตรียมสถิติ...',
                'กำลังโหลดรายละเอียด...',
                'เกือบเสร็จแล้ว...'
            ];
            setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
        }, 1500);

        return () => {
            clearInterval(progressInterval);
            clearInterval(textInterval);
        };
    }, []);

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                        initial={{
                            x: Math.random() * 100 + '%',
                            y: Math.random() * 100 + '%',
                        }}
                        animate={{
                            x: [
                                Math.random() * 100 + '%',
                                Math.random() * 100 + '%',
                            ],
                            y: [
                                Math.random() * 100 + '%',
                                Math.random() * 100 + '%',
                            ],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Loading Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-6">
                {/* Animated Weapon Icons Ring */}
                <div className="relative w-32 h-32">
                    {/* Center Glow */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Rotating Icons */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        {[Sword, Shield, Zap, Sparkles].map((Icon, index) => (
                            <motion.div
                                key={index}
                                className="absolute"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${index * 90}deg) translateY(-50px) translateX(-50%)`,
                                }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        rotate: [-360, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.2,
                                    }}
                                >
                                    <Icon className="w-8 h-8 text-blue-400" />
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Center Sparkle */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Sparkles className="w-12 h-12 text-yellow-400" />
                    </motion.div>
                </div>

                {/* Loading Text */}
                <motion.div
                    className="text-center space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <AnimatePresence mode="wait">
                        <motion.h3
                            key={loadingText}
                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {loadingText}
                        </motion.h3>
                    </AnimatePresence>
                    <p className="text-blue-300/70 text-sm">Weapons Database</p>
                </motion.div>

                {/* Progress Bar */}
                <div className="w-full space-y-3">
                    <div className="relative w-full h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-500/20">
                        {/* Background Shine */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />

                        {/* Progress Fill */}
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-sm" />
                        </motion.div>
                    </div>

                    {/* Progress Percentage */}
                    <motion.div
                        className="flex justify-between items-center text-xs text-blue-400/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span>กำลังโหลด...</span>
                        <span className="font-mono font-bold">{Math.floor(progress)}%</span>
                    </motion.div>
                </div>

                {/* Floating Tips */}
                <motion.div
                    className="text-center text-sm text-blue-300/50 italic"
                    animate={{
                        opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    💡 คุณสามารถดูรายละเอียดอาวุธทั้งหมดได้ที่นี่
                </motion.div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-blue-500/30 rounded-tl-3xl" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-purple-500/30 rounded-br-3xl" />
        </motion.div>
    );
};

export function WeaponInfoModal({ open, onOpenChange, weaponId }: WeaponInfoModalProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 3000); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [open, weaponId]);

    const handleIframeLoad = () => {
        setIsLoading(false);

        // Try to inject CSS to hide unwanted elements
        try {
            const iframe = iframeRef.current;
            if (iframe?.contentWindow) {
                const style = iframe.contentWindow.document.createElement('style');
                style.textContent = `
                    aside {
                        display: none !important;
                    }
                    main, #content-wrapper {
                        margin-left: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    body {
                        overflow-x: hidden !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                `;
                iframe.contentWindow.document.head.appendChild(style);
            }
        } catch (e) {
            console.log('Cannot inject styles due to CORS policy');
        }
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setError('ไม่สามารถโหลดข้อมูลได้');
    };

    // If weaponId is provided, link to specific weapon, otherwise show all weapons
    const weaponUrl = weaponId
        ? `https://dna.interknot-network.com/#weapon/${encodeURIComponent(weaponId)}`
        : 'https://dna.interknot-network.com/#weapons';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] w-full h-[85vh] p-0 gap-0">
                <VisuallyHidden>
                    <DialogTitle>
                        {weaponId ? 'Weapon Details' : 'Weapons Database'}
                    </DialogTitle>
                </VisuallyHidden>

                <div className="relative w-full h-full overflow-hidden">
                    {/* Premium Loading Screen */}
                    <AnimatePresence>
                        {isLoading && <PremiumLoadingScreen />}
                    </AnimatePresence>

                    {error ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                            <p className="text-destructive mb-4">{error}</p>
                            <a
                                href={weaponUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-2"
                            >
                                เปิดในหน้าใหม่
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    ) : (
                        <div className="w-full h-full relative overflow-hidden bg-black/20">
                            <iframe
                                ref={iframeRef}
                                src={weaponUrl}
                                className="absolute inset-0 border-0 origin-top-left"
                                style={{
                                    marginLeft: `calc(-1 * ${SIDEBAR_WIDTH} * ${SCALE})`,
                                    width: `calc((100% / ${SCALE}) + ${SIDEBAR_WIDTH})`,
                                    height: `calc(100% / ${SCALE})`,
                                    transform: `scale(${SCALE})`,
                                }}
                                title="Weapon Information"
                                loading="lazy"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                                onLoad={handleIframeLoad}
                                onError={handleIframeError}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
