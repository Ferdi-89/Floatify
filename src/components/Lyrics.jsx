import React, { useEffect, useRef } from 'react';
import useLyrics from './useLyrics';
import { Loader2, Music } from 'lucide-react';

function Lyrics({ currentTrack, isPlaying, progress, isMini, settings }) {
    const lyricsContainerRef = useRef(null);
    const activeLineRef = useRef(null);
    const prevActiveIndexRef = useRef(null);

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
        // Only scroll if activeIndex actually changed (not just mode change)
        if (activeLineRef.current && lyricsContainerRef.current && activeIndex !== prevActiveIndexRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
        prevActiveIndexRef.current = activeIndex;
    }, [activeIndex]);

    // Force margin to be applied when mode changes
    useEffect(() => {
        console.log('🎵 Mode changed to:', isMini ? 'MINI' : 'MAIN WINDOW');

        // Use only marginLeft (no transform to avoid double offset)
        if (lyricsContainerRef.current) {
            lyricsContainerRef.current.style.marginLeft = isMini ? '0' : '200px';
            console.log('🎵 Applied marginLeft:', isMini ? '0' : '200px');
        }
    }, [isMini]);

    if (!currentTrack) return null;

    if (loading) {
        return (
            <div className="flex-center" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
                color: 'var(--color-text-secondary)',
            }}>
                <p style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)'
                }}>
                    Loading lyrics...
                </p>
            </div>
        );
    }

    if (!lyrics || lyrics.length === 0) {
        return (
            <div className="flex-center" style={{
                height: '100%',
                flexDirection: 'column',
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
                linePaddingRight: 'var(--spacing-sm)'
            };
        } else {
            // Main Window: LARGE FONT with balanced spacing
            return {
                fontSize: `${3.5 * sizeScale}rem`,
                spacing: 'var(--spacing-4_5xl)', // 300px vertical gap
                activeScale: 1.05,
                blurStrength: 2,
                fontWeight: '700',
                linePaddingTop: '50px',
                linePaddingBottom: '50px',
                linePaddingRight: 'var(--spacing-4_5xl)' // 300px right padding
            };
        }
    };

    const styles = getBaseStyles();

    return (
        <div
            key={`lyrics-${isMini ? 'mini' : 'main'}`}
            ref={lyricsContainerRef}
            style={{
                padding: isMini ? 'var(--spacing-xl)' : 'var(--spacing-2xl)',
                paddingBottom: '50vh',
                height: '100%',
                marginLeft: isMini ? '0' : '200px', // 200px left margin for Main Window
                overflowY: 'auto',
                textAlign: lyricsAlign,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
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

                return (
                    <p
                        key={index}
                        ref={isActive ? activeLineRef : null}
                        style={{
                            fontSize: styles.fontSize,
                            lineHeight: '1.3',
                            color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            fontWeight: fontWeight,
                            margin: `${styles.spacing} 0`,
                            paddingTop: styles.linePaddingTop,
                            paddingBottom: styles.linePaddingBottom,
                            paddingLeft: 'var(--spacing-sm)',
                            paddingRight: styles.linePaddingRight,
                            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease, filter 0.5s ease',
                            opacity: opacity,
                            filter: `blur(${blur}px)`,
                            transform: `scale(${scale})`,
                            transformOrigin: lyricsAlign === 'center' ? 'center' : 'left center',
                            cursor: 'default',
                            textShadow: isActive && !isMini ? '0 0 30px rgba(255,255,255,0.15)' : 'none'
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
