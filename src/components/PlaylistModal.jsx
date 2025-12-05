import React, { useState, useEffect } from 'react';
import { X, Play, Music, ListMusic } from 'lucide-react';

const PlaylistModal = ({ isOpen, onClose, token, onPlay, mode = 'play', trackUri }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchPlaylists();
        }
    }, [isOpen, token]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPlaylists(data.items || []);
        } catch (error) {
            console.error("Error fetching playlists:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaylistClick = async (playlist) => {
        if (mode === 'add' && trackUri) {
            await addToPlaylist(playlist.id);
        } else {
            if (onPlay) {
                await onPlay(playlist.uri, true); // true indicates context_uri
                onClose();
            }
        }
    };

    const addToPlaylist = async (playlistId) => {
        try {
            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uris: [trackUri] })
            });
            // We could add a toast here if we passed a toast handler, but for now we'll just close
            onClose();
        } catch (error) {
            console.error("Error adding to playlist:", error);
        }
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
                    maxWidth: '800px',
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
                        <ListMusic size={24} color="var(--color-primary)" />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                            {mode === 'add' ? 'Add to Playlist' : 'Your Playlists'}
                        </h2>
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

                {/* Grid */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : playlists.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '24px'
                        }}>
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="playlist-card"
                                    onClick={() => handlePlaylistClick(playlist)}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        padding: '16px',
                                        borderRadius: 'var(--border-radius-md)',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%' }}>
                                        {playlist.images?.[0]?.url ? (
                                            <img
                                                src={playlist.images[0].url}
                                                alt={playlist.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '8px',
                                                background: 'var(--color-surface)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Music size={40} color="var(--color-text-secondary)" />
                                            </div>
                                        )}
                                        <div className="play-overlay" style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: 'var(--color-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                transform: 'translateY(8px)',
                                                transition: 'transform 0.2s ease'
                                            }} className="play-button">
                                                <Play size={24} fill="black" color="black" style={{ marginLeft: '4px' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            color: 'var(--color-text-primary)',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            marginBottom: '4px'
                                        }}>
                                            {playlist.name}
                                        </div>
                                        <div style={{
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '0.9rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {playlist.owner.display_name}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            <ListMusic size={48} opacity={0.5} />
                            <p>No playlists found</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        .playlist-card:hover .play-overlay {
          opacity: 1 !important;
        }
        .playlist-card:hover .play-button {
          transform: translateY(0) !important;
        }
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

export default PlaylistModal;
