import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

function Controls({ isPlaying, onControl, size = 'medium' }) {
    const iconSize = size === 'small' ? 20 : 24;
    const playSize = size === 'small' ? 32 : 48;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <button
                onClick={() => onControl('previous')}
                className="control-btn"
                style={{ color: 'var(--color-text-secondary)' }}
                title="Previous"
            >
                <SkipBack size={iconSize} />
            </button>

            <button
                onClick={() => onControl(isPlaying ? 'pause' : 'play')}
                style={{
                    width: playSize,
                    height: playSize,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-text-primary)',
                    color: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s ease',
                    border: 'none'
                }}
                className="play-btn"
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause size={iconSize} fill="currentColor" />
                ) : (
                    <Play size={iconSize} fill="currentColor" style={{ marginLeft: '2px' }} />
                )}
            </button>

            <button
                onClick={() => onControl('next')}
                className="control-btn"
                style={{ color: 'var(--color-text-secondary)' }}
                title="Next"
            >
                <SkipForward size={iconSize} />
            </button>

            <style>{`
        .control-btn:hover {
          color: var(--color-text-primary) !important;
          transform: scale(1.1);
        }
        .play-btn:hover {
          transform: scale(1.05) !important;
          opacity: 0.9;
        }
        .play-btn:active {
          transform: scale(0.95) !important;
        }
      `}</style>
        </div>
    );
}

export default Controls;
