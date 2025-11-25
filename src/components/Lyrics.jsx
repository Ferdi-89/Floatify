import React, { useEffect, useRef, useState } from 'react';
import useLyrics from './useLyrics';
import { Loader2, Music } from 'lucide-react';

function Lyrics({ currentTrack, isPlaying, progress, isMini, settings }) {
    const lyricsContainerRef = useRef(null);
    const activeLineRef = useRef(null);
    const prevActiveIndexRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Default settings if not provided
    const { lyricsSize = '2.25rem', lyricsAlign = 'left' } = settings || {};

    // Fetch real lyrics using the custom hook
    const { lyrics, synced, loading } = useLyrics(
        currentTrack?.name,
        currentTrack?.artists[0]?.name,
        currentTrack?.album?.name,
        currentTrack?.duration_ms
    );

    // Convert progress (ms) to seconds for comparison with lyric timestamps
    const currentSeconds = progress / 1000;

    // Find active lyric index
    const activeIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        return currentSeconds >= line.time && (!nextLine || currentSeconds < nextLine.time);
    });

    useEffect(() => {
        if (activeLineRef.current && lyricsContainerRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex, settings.lyricsSize, settings.fontFamily, settings.lyricsAlign, settings.fontStyle, isMini, isMobile]);

    if (!currentTrack) return null;

    if (loading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderLeftColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!lyrics || lyrics.length === 0) {
        return (
            <div className="flex-center" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-md)',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--spacing-xl)'
            }}>
                <Music size={48} style={{ opacity: 0.3 }} />
                <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>No Lyrics Found</p>
                    <p style={{ fontSize: '0.85rem' }}>Enjoy the instrumental vibes</p>
                </div>
            </div>
        );
    }

    // Determine base size and spacing based on mode (Main vs Mini)
    const getBaseStyles = () => {
        const sizeScale = settings?.lyricsSize === '1rem' ? 0.8 : settings?.lyricsSize === '2rem' ? 1.3 : 1;
        const isCenter = lyricsAlign === 'center';

        if (isMini) {
            // Pop-out / Mini Mode
            return {
                fontSize: `${1.5 * sizeScale}rem`,
                spacing: 'var(--spacing-2xl)',
                activeScale: 1.05,
                blurStrength: 2,
                fontWeight: '700',
                linePaddingTop: '0',
                linePaddingBottom: '0',
                linePaddingRight: 'var(--spacing-sm)',
                marginLeft: '0'
            };
        } else {
            // Main Window logic
            if (isMobile) {
                // Mobile View (Responsive)
                return {
                    fontSize: `${2 * sizeScale}rem`, // Smaller font for mobile
                    spacing: 'var(--spacing-2xl)',   // Reduced spacing
                    activeScale: 1.05,
                    blurStrength: 0, // Disable blur on mobile for performance
                    fontWeight: '700',
                    linePaddingTop: '20px',
                    linePaddingBottom: '20px',
                    linePaddingRight: 'var(--spacing-md)',
                    marginLeft: '0'
                };
            }

            // Desktop Main Window: LARGE FONT with balanced spacing
            return {
                fontSize: `${3.5 * sizeScale}rem`,
                spacing: 'var(--spacing-4_5xl)', // 300px vertical gap
                activeScale: 1.05,
                blurStrength: 2,
                fontWeight: '700',
                linePaddingTop: '50px',
                linePaddingBottom: '50px',
                linePaddingRight: isCenter ? '10vw' : '15vw', // Responsive padding
                marginLeft: isCenter ? '0' : '10vw' // Responsive margin
            };
        }
    };

    const styles = getBaseStyles();

    return (
        <div
            key={`lyrics-${isMini ? 'mini' : 'main'}`}
            ref={lyricsContainerRef}
            style={{
                padding: isMini || isMobile ? 'var(--spacing-xl)' : 'var(--spacing-2xl)',
                paddingTop: '50vh', // Center first line vertically
                paddingBottom: '50vh',
                height: '100%',
                marginLeft: styles.marginLeft, // Dynamic margin
                overflowY: 'auto',
                textAlign: lyricsAlign,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS/Android
                scrollBehavior: 'smooth'
            }}
            className="lyrics-container"
        >
            {lyrics.map((line, index) => {
                const isActive = index === activeIndex;
                const distance = Math.abs(index - activeIndex);

                const opacity = isActive ? 1 : Math.max(0.2, 1 - distance * 0.4);
                const blur = isActive ? 0 : Math.min(styles.blurStrength, distance * 1.5);
                const scale = isActive ? styles.activeScale : 0.95;
                const fontWeight = isActive ? styles.fontWeight : '500';

                // Glow Logic
                let textShadow = 'none';
                // Disable heavy glow on mobile for performance
                if (isActive && !isMini && settings?.glowEnabled && !isMobile) {
                    if (settings.themeMode === 'light') {
                        // Light Mode: Subtle dark glow/shadow for contrast
                        textShadow = '0 0 12px rgba(0,0,0,0.2), 0 0 24px rgba(0,0,0,0.1)';
                    } else {
                        // Dark Mode: Strong white/primary glow
                        textShadow = '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2)';
                    }
                } else if (isActive && !isMini) {
                    // Default subtle shadow if glow is disabled or on mobile (lightweight)
                    textShadow = settings.themeMode === 'light' ? 'none' : '0 0 10px rgba(255,255,255,0.1)';
                }

                return (
                    <p
                        key={index}
                        ref={isActive ? activeLineRef : null}
                        style={{
                            fontSize: styles.fontSize,
                            lineHeight: '1.3',
                            color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            fontWeight: fontWeight,
                            fontFamily: settings?.fontFamily === 'Mono' ? 'monospace' : settings?.fontFamily === 'Serif' ? 'serif' : settings?.fontFamily || 'inherit',
                            fontStyle: settings?.fontStyle || 'normal',
                            margin: `${styles.spacing} 0`,
                            paddingTop: styles.linePaddingTop,
                            paddingBottom: styles.linePaddingBottom,
                            paddingLeft: 'var(--spacing-sm)',
                            paddingRight: styles.linePaddingRight,
                            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease, filter 0.5s ease, text-shadow 0.3s ease, font-variation-settings 0.3s ease',
                            opacity: opacity,
                            filter: `blur(${blur}px)`,
                            transform: `scale(${scale})`,
                            transformOrigin: lyricsAlign === 'center' ? 'center' : 'left center',
                            cursor: 'default',
                            textShadow: textShadow,
                            willChange: 'transform, opacity, filter', // Hint for GPU acceleration
                            maxWidth: '100%',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word'
                        }}
                    >
                        {line.text}
                    </p>
                );
            })}
            <style>{`
        .lyrics-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}

export default Lyrics;
