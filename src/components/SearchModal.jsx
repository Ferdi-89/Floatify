import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Clock, Music, MoreVertical, ListPlus, ListMusic } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, token, onPlay, onAddToQueue, onAddToPlaylist }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // Track ID for open menu
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                searchTracks();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchTracks = async () => {
        if (!query || !token) return;
        setLoading(true);
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setResults(data.tracks?.items || []);
        } catch (error) {
            console.error("Error searching tracks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = async (trackUri) => {
        if (onPlay) {
            await onPlay(trackUri);
            onClose();
        }
    };

    const handleMenuClick = (e, trackId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === trackId ? null : trackId);
    };

    const handleAddToQueue = (e, trackUri) => {
        e.stopPropagation();
        if (onAddToQueue) onAddToQueue(trackUri);
        setActiveMenu(null);
    };

    const handleAddToPlaylist = (e, trackUri) => {
        e.stopPropagation();
        if (onAddToPlaylist) onAddToPlaylist(trackUri);
        setActiveMenu(null);
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
                    gap: '12px'
                }}>
                    <Search size={20} color="var(--color-text-secondary)" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="What do you want to listen to?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.1rem',
                            color: 'var(--color-text-primary)',
                            outline: 'none',
                            fontWeight: '500'
                        }}
                    />
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

                {/* Results */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {results.map((track) => (
                                <div
                                    key={track.id}
                                    className="track-item"
                                    onClick={() => handlePlay(track.uri)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px',
                                        borderRadius: 'var(--border-radius-md)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                        gap: '12px',
                                        position: 'relative'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                                        <img
                                            src={track.album.images[2]?.url || track.album.images[0]?.url}
                                            alt={track.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '4px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div className="play-overlay" style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            borderRadius: '4px'
                                        }}>
                                            <Play size={20} fill="white" color="white" />
                                        </div>
                                    </div>

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
                                            fontSize: '0.9rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {track.artists.map(a => a.name).join(', ')}
                                        </div>
                                    </div>

                                    <div style={{
                                        color: 'var(--color-text-secondary)',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        minWidth: '50px',
                                        justifyContent: 'flex-end'
                                    }}>
                                        {/* Duration (Hidden on hover to show menu) */}
                                        <span className="duration-text">{formatDuration(track.duration_ms)}</span>

                                        {/* More Menu Button */}
                                        <button
                                            onClick={(e) => handleMenuClick(e, track.id)}
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
                                            className="menu-btn hover-bg"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Context Menu */}
                                        {activeMenu === track.id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '40px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: 'var(--border-radius-md)',
                                                padding: '4px',
                                                zIndex: 10,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                minWidth: '160px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }} onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleAddToQueue(e, track.uri)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--color-text-primary)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        textAlign: 'left',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <ListPlus size={16} />
                                                    Add to Queue
                                                </button>
                                                <button
                                                    onClick={(e) => handleAddToPlaylist(e, track.uri)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--color-text-primary)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        textAlign: 'left',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <ListMusic size={16} />
                                                    Add to Playlist
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query ? (
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
                            <p>No results found for "{query}"</p>
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
                            <Search size={48} opacity={0.5} />
                            <p>Search for songs, artists, or albums</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        .track-item:hover .play-overlay {
          opacity: 1 !important;
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

export default SearchModal;
