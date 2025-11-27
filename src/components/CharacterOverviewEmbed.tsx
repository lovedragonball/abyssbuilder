'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2 } from 'lucide-react';

interface CharacterOverviewEmbedProps {
    characterName: string;
}

// Keep the embed proportions consistent with the reference layout while hiding the site sidebar.
const SIDEBAR_WIDTH = 'clamp(240px, 22vw, 300px)';
const MIN_HEIGHT = 720;
const MAX_HEIGHT = 960;
const SCALE = 0.85; // Scale down to fit content better

export function CharacterOverviewEmbed({ characterName }: CharacterOverviewEmbedProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [characterName]);

    const handleIframeLoad = () => {
        setIsLoading(false);

        // Try to inject CSS to hide unwanted elements (may fail due to CORS)
        try {
            const iframe = iframeRef.current;
            if (iframe?.contentWindow) {
                const style = iframe.contentWindow.document.createElement('style');
                style.textContent = `
                    /* Hide sidebar navigation and footer */
                    aside {
                        display: none !important;
                    }
                    
                    /* Adjust main content to take full width */
                    main,
                    #content-wrapper {
                        margin-left: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    
                    /* Hide any other navigation/footer elements */
                    .site-header,
                    .site-footer,
                    header:not(.char-header),
                    footer:not(.mobile-footer),
                    .navigation:not(.content-nav),
                    .sidebar,
                    .mobile-toggle-nav,
                    .mobile-burger-menu {
                        display: none !important;
                    }
                    
                    /* Focus on content */
                    body {
                        overflow-x: hidden !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    #content {
                        margin: 0 !important;
                        padding: 20px !important;
                    }
                `;
                iframe.contentWindow.document.head.appendChild(style);
            }
        } catch (e) {
            // CORS will prevent this, but that's okay
            console.log('Cannot inject styles due to CORS policy');
        }
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setError('ไม่สามารถโหลดข้อมูลได้');
    };

    const overviewUrl = `https://dna.interknot-network.com/#character/${encodeURIComponent(characterName)}/overview`;

    return (
        <div className="relative w-full h-[calc(100vh-200px)] min-h-[2000px] overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            )}

            {error ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <p className="text-destructive mb-4">{error}</p>
                    <a
                        href={overviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                        เปิดในหน้าใหม่
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            ) : (
                <div className="w-full h-full relative overflow-hidden">
                    {/* Iframe with negative margin to shift content left and scaled to fit */}
                    <iframe
                        ref={iframeRef}
                        src={overviewUrl}
                        className="absolute inset-0 border-0 origin-top-left"
                        style={{
                            marginLeft: `calc(-1 * ${SIDEBAR_WIDTH} * ${SCALE})`,
                            width: `calc((100% / ${SCALE}) + ${SIDEBAR_WIDTH})`,
                            height: `calc(100% / ${SCALE})`,
                            transform: `scale(${SCALE})`,
                        }}
                        title={`${characterName} Overview`}
                        loading="lazy"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                </div>
            )}
        </div>
    );
}
