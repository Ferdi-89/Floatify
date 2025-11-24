import React from 'react';
import Controls from './Controls';

function Player({ currentTrack, isPlaying, isMini, onControl, showInfo = true }) {
    if (!currentTrack) {
        return (
            <div className="flex-center" style={{ height: '100%', color: 'var(--color-text-muted)' }}>
                <p>Not playing</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: showInfo ? '1fr auto 1fr' : '1fr', // Adjust grid based on content
            alignItems: 'center',
            width: '100%',
            height: '100%',
            gap: 'var(--spacing-sm)'
        }}>
            {/* Left: Album Art & Track Info */}
            {showInfo && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    minWidth: 0,
                    overflow: 'hidden'
                }}>
                    <img
                        src={currentTrack.album.images[0]?.url}
                        alt="Album Art"
                        style={{
                            width: isMini ? '40px' : '56px',
                            height: isMini ? '40px' : '56px',
                            borderRadius: 'var(--border-radius-full)', // Circle for modern look
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            objectFit: 'cover',
                            animation: isPlaying ? 'spin 10s linear infinite' : 'none' // Optional: Spin effect
                        }}
                    />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minWidth: 0
                    }}>
                        <div style={{
                            fontSize: isMini ? '0.85rem' : '0.95rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--color-text-primary)',
                        }}>
                            {currentTrack.name}
                        </div>
                        <div style={{
                            fontSize: isMini ? '0.7rem' : '0.8rem',
                            color: 'var(--color-text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {currentTrack.artists.map(a => a.name).join(', ')}
                        </div>
                    </div>
                </div>
            )}

            {/* Center: Controls */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Controls
                    isPlaying={isPlaying}
                    onControl={onControl}
                    size={isMini ? 'small' : 'medium'}
                />
            </div>

            {/* Right: Empty (for balance) or Extra Actions */}
            {showInfo && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {/* Placeholder for future features like Like/Queue */}
                </div>
            )}

            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

export default Player;
