import React, { useState, useEffect } from 'react';
import { X, List, Music, Play } from 'lucide-react';

const QueueModal = ({ isOpen, onClose, token }) => {
    const [queue, setQueue] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchQueue();
        }
    }, [isOpen, token]);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            console.log("Fetching queue...");
            const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log("Queue data:", data);
            setQueue(data);
        } catch (error) {
            console.error("Error fetching queue:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            padding: '20px'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: '80vh',
                    background: 'var(--glass-background)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--border-radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <List size={24} color="var(--color-primary)" />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Queue</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        className="hover-bg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : queue ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Currently Playing */}
                            {queue.currently_playing && (
                                <div>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>
                                        Now Playing
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px',
                                        borderRadius: 'var(--border-radius-md)',
                                        background: 'var(--color-surface)',
                                        gap: '12px'
                                    }}>
                                        <img
                                            src={queue.currently_playing.album.images[0]?.url}
                                            alt={queue.currently_playing.name}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '4px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                color: 'var(--color-primary)',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {queue.currently_playing.name}
                                            </div>
                                            <div style={{
                                                color: 'var(--color-text-secondary)',
                                                fontSize: '0.9rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {queue.currently_playing.artists.map(a => a.name).join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Next Up */}
                            {queue.queue && queue.queue.length > 0 && (
                                <div>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>
                                        Next Up
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {queue.queue.map((track, index) => (
                                            <div
                                                key={`${track.id}-${index}`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    borderRadius: 'var(--border-radius-md)',
                                                    gap: '12px',
                                                    transition: 'background 0.2s ease'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{
                                                    color: 'var(--color-text-secondary)',
                                                    width: '20px',
                                                    textAlign: 'center',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <img
                                                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                                                    alt={track.name}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '4px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        color: 'var(--color-text-primary)',
                                                        fontWeight: '500',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {track.name}
                                                    </div>
                                                    <div style={{
                                                        color: 'var(--color-text-secondary)',
                                                        fontSize: '0.85rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {track.artists.map(a => a.name).join(', ')}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    color: 'var(--color-text-secondary)',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {formatDuration(track.duration_ms)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--color-text-secondary)',
                            gap: '16px'
                        }}>
                            <Music size={48} opacity={0.5} />
                            <p>Queue is empty</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--color-surface-hover);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default QueueModal;
