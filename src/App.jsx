import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './auth/AuthContext';
import Player from './components/Player';
import Lyrics from './components/Lyrics';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import useSpotifyCurrentTrack from './components/useSpotifyCurrentTrack';
import useDocumentPiP from './components/useDocumentPiP';
import useLyrics from './components/useLyrics';
import Toast from './components/Toast';
import SearchModal from './components/SearchModal';
import PlaylistModal from './components/PlaylistModal';
import QueueModal from './components/QueueModal';
import { Settings, ExternalLink, Minimize2, LogOut, Maximize2, User, Music, Cast, Download, Search, ListMusic, List, Sun, Moon } from 'lucide-react';


import { FastAverageColor } from 'fast-average-color';

const fac = new FastAverageColor();

function App() {
  const { token, login, logout } = useAuth();
  const { currentTrack, progress, isPlaying } = useSpotifyCurrentTrack(token, logout);
  const { pipWindow, requestPiP, closePiP } = useDocumentPiP();

  // Settings State (Moved up to be available for useLyrics)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('floatify_settings');
    const defaults = {
      themeColor: '#1db954',
      lyricsSize: '1.5rem',
      lyricsAlign: 'left',
      dynamicBackground: false,
      themeMode: 'dark',
      hideControls: false,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      glowEnabled: true,
      lyricSpacing: 'compact',
      lyricsSource: 'auto' // Default to auto (hybrid)
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  // Fetch lyrics at App level to share state and source info
  const { lyrics, synced, loading: lyricsLoading, source: lyricsSource } = useLyrics(
    currentTrack?.name,
    currentTrack?.artists?.[0]?.name,
    currentTrack?.album?.name,
    currentTrack?.duration_ms,
    currentTrack?.external_ids?.isrc,
    settings.lyricsSource // Pass preferred source
  );

  // UI State
  const [isMini, setIsMini] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [toast, setToast] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playlistMode, setPlaylistMode] = useState('play'); // 'play' or 'add'
  const [trackToAdd, setTrackToAdd] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bgColor, setBgColor] = useState('#09090b');

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Cast Sender Logic
  const handleCast = async () => {
    if (window.PresentationRequest) {
      const request = new PresentationRequest(['/']);
      try {
        const connection = await request.start();
        setToast({ message: "Connected to display!", type: 'success' });

        // Send auth token to receiver immediately
        if (connection && connection.state === 'connected') {
          connection.send(JSON.stringify({ type: 'AUTH_TOKEN', token }));
        }

        connection.onconnect = () => {
          connection.send(JSON.stringify({ type: 'AUTH_TOKEN', token }));
        };

      } catch (error) {
        if (error.name !== 'NotFoundError' && error.name !== 'AbortError') {
          console.error("Cast failed", error);
          setToast({ message: "Cast failed. Try using browser menu.", type: 'error' });
        }
      }
    } else {
      setToast({ message: "Casting not supported in this browser.", type: 'error' });
    }
  };

  // Cast Receiver Logic
  useEffect(() => {
    if (navigator.presentation && navigator.presentation.receiver) {
      navigator.presentation.receiver.connectionList.then(list => {
        list.connections.map(connection => {
          connection.addEventListener('message', event => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'AUTH_TOKEN' && data.token) {
                // Manually set token and reload/re-init if needed
                if (!token) {
                  localStorage.setItem('spotify_access_token', data.token);
                  window.location.reload();
                }
              }
            } catch (e) {
              console.error("Error parsing cast message", e);
            }
          });
        });
      });
    }
  }, [token]);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('floatify_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerHeight < window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Profile
  useEffect(() => {
    if (token) {
      fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [token]);

  // Apply Theme Color
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', settings.themeColor);
  }, [settings.themeColor]);

  // Handle Dynamic Background
  useEffect(() => {
    const isLight = settings.themeMode === 'light';
    const defaultBg = isLight ? '#ffffff' : '#09090b';

    if (settings.dynamicBackground && currentTrack?.album?.images[0]?.url) {
      const imageUrl = currentTrack.album.images[0].url;
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        try {
          const color = fac.getColor(img);
          let r, g, b;
          if (isLight) {
            r = Math.floor(color.value[0] * 0.1 + 255 * 0.9);
            g = Math.floor(color.value[1] * 0.1 + 255 * 0.9);
            b = Math.floor(color.value[2] * 0.1 + 255 * 0.9);
          } else {
            r = Math.floor(color.value[0] * 0.2);
            g = Math.floor(color.value[1] * 0.2);
            b = Math.floor(color.value[2] * 0.2);
          }
          setBgColor(`rgb(${r}, ${g}, ${b})`);
        } catch (e) {
          console.error("Error extracting color", e);
          setBgColor(defaultBg);
        }
      };
    } else {
      setBgColor(defaultBg);
    }
  }, [settings.dynamicBackground, settings.themeMode, currentTrack?.album?.images]);

  // Apply Background & Theme Variables
  useEffect(() => {
    const isLight = settings.themeMode === 'light';
    document.documentElement.style.setProperty('--color-background', bgColor);

    if (isLight) {
      document.documentElement.style.setProperty('--color-surface', `color-mix(in srgb, ${bgColor}, black 5%)`);
      document.documentElement.style.setProperty('--color-surface-hover', `color-mix(in srgb, ${bgColor}, black 10%)`);
      document.documentElement.style.setProperty('--color-text-primary', '#000000');
      document.documentElement.style.setProperty('--color-text-secondary', '#52525b');
      document.documentElement.style.setProperty('--color-text-muted', '#71717a');
      document.documentElement.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.8)');
      document.documentElement.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
    } else {
      document.documentElement.style.setProperty('--color-surface', `color-mix(in srgb, ${bgColor}, white 5%)`);
      document.documentElement.style.setProperty('--color-surface-hover', `color-mix(in srgb, ${bgColor}, white 10%)`);
      document.documentElement.style.setProperty('--color-text-primary', '#ffffff');
      document.documentElement.style.setProperty('--color-text-secondary', '#a1a1aa');
      document.documentElement.style.setProperty('--color-text-muted', '#71717a');
      document.documentElement.style.setProperty('--glass-background', 'rgba(24, 24, 27, 0.95)');
      document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.08)');
    }
  }, [bgColor, settings.themeMode]);

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleControl = async (command) => {
    if (!token) return;
    let endpoint = '';
    let method = 'POST';

    switch (command) {
      case 'next': endpoint = 'https://api.spotify.com/v1/me/player/next'; break;
      case 'previous': endpoint = 'https://api.spotify.com/v1/me/player/previous'; break;
      case 'play': endpoint = 'https://api.spotify.com/v1/me/player/play'; method = 'PUT'; break;
      case 'pause': endpoint = 'https://api.spotify.com/v1/me/player/pause'; method = 'PUT'; break;
      default: return;
    }

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        setToast({ message: "Premium required for playback control.", type: 'error' });
      }
    } catch (error) {
      console.error("Error controlling playback:", error);
    }
  };

  const handlePlayTrack = async (uri, isContext = false) => {
    if (!token) return;
    try {
      const body = isContext ? { context_uri: uri } : { uris: [uri] };
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (error) {
      console.error("Error playing track:", error);
      setToast({ message: "Failed to play track", type: 'error' });
    }
  };

  const handleAddToQueue = async (uri) => {
    if (!token) return;
    try {
      await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setToast({ message: "Added to queue", type: 'success' });
    } catch (error) {
      console.error("Error adding to queue:", error);
      setToast({ message: "Failed to add to queue", type: 'error' });
    }
  };

  const openAddToPlaylist = (uri) => {
    setTrackToAdd(uri);
    setPlaylistMode('add');
    setIsPlaylistOpen(true);
  };

  const openPlaylist = () => {
    setPlaylistMode('play');
    setTrackToAdd(null);
    setIsPlaylistOpen(true);
  };

  const togglePiP = () => {
    if (pipWindow) {
      closePiP();
    } else {
      requestPiP(350, 500);
    }
  };

  // Auto-minimize when PiP is active
  useEffect(() => {
    if (pipWindow) {
      setIsMini(true);
    }
  }, [pipWindow]);

  // Content for both Main Window and PiP Window
  const PlayerContent = (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      position: 'relative'
    }}>
      {(isMini || pipWindow) ? (
        !currentTrack ? (
          /* Idle View for PiP/Mini */
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-background)',
            color: 'var(--color-text-secondary)',
            gap: 'var(--spacing-md)',
            textAlign: 'center',
            padding: 'var(--spacing-lg)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--spacing-sm)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <Music size={40} color="var(--color-primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Floatify</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Ready to play</p>
            </div>
            <button
              onClick={() => handleControl('play')}
              style={{
                marginTop: 'var(--spacing-md)',
                padding: '8px 24px',
                borderRadius: 'var(--border-radius-full)',
                background: 'var(--color-primary)',
                color: '#000',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Resume Spotify
            </button>
          </div>
        ) : (
          <>
            {/* Top Bar: Track Info (Album Art + Text) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '16px',
              paddingRight: '60px', // Added padding to avoid overlap with Exit button
              background: 'transparent', // No dark shadow
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <img
                src={currentTrack?.album.images[0]?.url}
                alt="Album Art"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--border-radius-sm)',
                  objectFit: 'cover'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack?.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack?.artists.map(a => a.name).join(', ')}
                </span>
              </div>
            </div>

            {/* Mini/PiP Layout: Lyrics fill screen */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              zIndex: 1,
              paddingTop: '60px', // Space for top bar
              paddingBottom: '100px' // Space for floating player
            }}>
              <Lyrics
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                progress={progress}
                isMini={true}
                settings={settings}
                lyrics={lyrics}
                synced={synced}
                loading={lyricsLoading}
                source={lyricsSource}
              />
            </div>

            {/* Floating Player Bar (Controls Only) */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              visibility: settings.hideControls ? 'hidden' : 'visible',
              opacity: settings.hideControls ? 0 : 1,
              transition: 'opacity 0.3s ease, visibility 0.3s ease',
              width: 'max-content', // Ensure width fits content
              padding: '10px' // Add padding to container to prevent shadow clipping
            }}>
              <div className="glass-panel" style={{
                borderRadius: 'var(--border-radius-full)',
                padding: '8px 24px',
                boxShadow: settings.themeMode === 'light' ? '0 8px 32px rgba(0,0,0,0.15)' : '0 8px 32px rgba(0,0,0,0.5)', // Softer shadow
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--glass-background)' // Use variable for Light Mode support
              }}>
                <Player
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  isMini={true}
                  onControl={handleControl}
                  showInfo={false} // Hide info in the bottom bar
                />
              </div>
            </div>
          </>
        )
      ) : (
        <>
          {/* Main Window Layout */}
          {isMobile ? (
            isLandscape ? (
              /* Mobile Landscape Layout: Side-by-Side */
              <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                {/* Left Panel: Info & Controls (40%) */}
                <div style={{
                  width: '40%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 'var(--spacing-md)',
                  zIndex: 10,
                  background: 'var(--glass-background)', // Use variable
                  backdropFilter: 'blur(10px)'
                }}>
                  <img
                    src={currentTrack?.album.images[0]?.url}
                    alt="Album Art"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: 'var(--border-radius-md)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      objectFit: 'cover',
                      marginBottom: 'var(--spacing-md)'
                    }}
                  />
                  <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', width: '100%' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentTrack?.name}
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentTrack?.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>

                  <div style={{
                    visibility: settings.hideControls ? 'hidden' : 'visible',
                    opacity: settings.hideControls ? 0 : 1,
                    transition: 'all 0.3s ease'
                  }}>
                    <Player
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      isMini={false}
                      onControl={handleControl}
                      showInfo={false}
                    />
                  </div>
                </div>

                {/* Right Panel: Lyrics (60%) */}
                <div style={{
                  width: '60%',
                  height: '100%',
                  position: 'relative',
                }}>
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Lyrics
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      progress={progress}
                      isMini={false}
                      settings={settings}
                      lyrics={lyrics}
                      synced={synced}
                      loading={lyricsLoading}
                      source={lyricsSource}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Mobile Portrait Layout: Info Top, Lyrics Middle, Controls Bottom */
              <>
                {/* Lyrics Area */}
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Lyrics
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    progress={progress}
                    isMini={false}
                    settings={settings}
                    lyrics={lyrics}
                    synced={synced}
                    loading={lyricsLoading}
                    source={lyricsSource}
                  />
                </div>

                {/* Mobile Bottom Bar: Controls Only */}
                <div style={{
                  padding: 'var(--spacing-md)',
                  paddingBottom: 'var(--spacing-xl)',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: settings.hideControls ? 'hidden' : 'visible',
                  opacity: settings.hideControls ? 0 : 1,
                  transition: 'all 0.3s ease'
                }}>
                  <Player
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    isMini={false}
                    onControl={handleControl}
                    showInfo={false}
                  />
                </div>
              </>
            )
          ) : (
            /* Desktop Layout: Lyrics Fill, Player Bottom with Info */
            <>
              <div style={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Lyrics
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  progress={progress}
                  isMini={false}
                  settings={settings}
                  lyrics={lyrics}
                  synced={synced}
                  loading={lyricsLoading}
                  source={lyricsSource}
                />
              </div>

              {/* Player at Bottom */}
              <div style={{
                padding: 'var(--spacing-md)',
                borderTop: '1px solid var(--color-border)',
                visibility: settings.hideControls ? 'hidden' : 'visible',
                opacity: settings.hideControls ? 0 : 1,
                transition: 'all 0.3s ease'
              }}>
                <Player
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  isMini={false}
                  onControl={handleControl}
                  showInfo={true}
                />
              </div>
            </>
          )}
        </>
      )}
    </main>
  );

  return (
    <div className="app-container" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text-primary)',
      overflow: 'hidden',
      transition: 'background-color 0.5s ease'
    }}>
      {/* Header (Only in Main Window, Non-Mini Mode, Desktop Only) */}
      {!isMini && !pipWindow && !isMobile && (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 50,
          background: 'var(--color-background)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Floatify</h1>
            {lyricsSource && (
              <div style={{
                padding: '4px 10px',
                borderRadius: 'var(--border-radius-full)',
                background: lyricsSource === 'musixmatch' ? 'rgba(255, 107, 0, 0.15)' : 'rgba(29, 185, 84, 0.15)',
                border: `1px solid ${lyricsSource === 'musixmatch' ? 'rgba(255, 107, 0, 0.3)' : 'rgba(29, 185, 84, 0.3)'}`,
                fontSize: '0.65rem',
                fontWeight: '700',
                color: lyricsSource === 'musixmatch' ? '#ff6b00' : '#1db954',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginLeft: '8px'
              }}>
                {lyricsSource === 'musixmatch' ? 'Musixmatch' : 'LRCLib'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {token && (
              <>
                {/* Profile Button */}
                <button onClick={() => setIsProfileOpen(true)} title="Profile" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  {profile?.images?.[0]?.url ? (
                    <img src={profile.images[0].url} alt="Profile" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <button onClick={handleCast} title="Cast to TV/Screen" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <Cast size={20} />
                </button>

                {deferredPrompt && (
                  <button onClick={handleInstallClick} title="Install App" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                    <Download size={20} />
                  </button>
                )}

                <button onClick={() => setIsSearchOpen(true)} title="Search Songs" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <Search size={20} />
                </button>

                <button onClick={() => setIsQueueOpen(true)} title="Queue" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <List size={20} />
                </button>

                <button onClick={openPlaylist} title="Your Playlists" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <ListMusic size={20} />
                </button>

                <button onClick={() => setIsSettingsOpen(true)} title="Settings" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <Settings size={20} />
                </button>

                <button
                  onClick={togglePiP}
                  title={pipWindow ? "Close Pop-out" : "Pop-out Player"}
                  style={{ padding: '8px', color: 'var(--color-text-secondary)' }}
                >
                  <ExternalLink size={20} />
                </button>

                <button onClick={() => setIsMini(true)} title="Mini Mode" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <Minimize2 size={20} />
                </button>

                <button
                  onClick={() => updateSettings('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')}
                  title={settings.themeMode === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  style={{ padding: '8px', color: 'var(--color-text-secondary)' }}
                >
                  {settings.themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 var(--spacing-xs)' }}></div>

                <button onClick={logout} title="Logout" style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>
                  <LogOut size={20} />
                </button>
              </>
            )}
          </div>
        </header>
      )}

      {/* Mobile Header (Unified) */}
      {isMobile && !isMini && !pipWindow && token && (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-md)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)'
        }}>
          {/* Track Info (Left) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <img
              src={currentTrack?.album.images[0]?.url}
              alt="Album Art"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--border-radius-sm)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                objectFit: 'cover'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                {currentTrack?.name || 'Floatify'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentTrack?.artists?.[0]?.name || 'Ready to play'}
              </span>
            </div>
          </div>

          {/* Controls (Right) */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Settings size={18} />
            </button>
            <button
              onClick={() => setIsMini(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Minimize2 size={18} />
            </button>
            <button
              onClick={logout}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(4px)'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
      )}

      {/* Mini Mode Exit Button */}
      {isMini && !pipWindow && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 50 }}>
          <button
            onClick={() => setIsMini(false)}
            className="glass-panel"
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-primary)',
              background: settings.themeMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)',
              border: settings.themeMode === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: settings.themeMode === 'light' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Maximize2 size={20} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: isMobile ? '0' : 'var(--spacing-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {!token ? (
          <div className="login-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, gap: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center' }}>Music that floats<br />with you.</h2>
            <button
              onClick={login}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'black',
                padding: '14px 32px',
                borderRadius: 'var(--border-radius-full)',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(29, 185, 84, 0.3)',
                transform: 'scale(1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Login with Spotify
            </button>
          </div>
        ) : (
          <>
            {pipWindow ? (
              createPortal(
                <div style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family, sans-serif)'
                }}>
                  <style>{`
                    :root {
                      --color-background: ${bgColor};
                      --color-surface: color-mix(in srgb, ${bgColor}, white 5%);
                      --color-surface-hover: color-mix(in srgb, ${bgColor}, white 10%);
                      --color-primary: ${settings.themeColor};
                      --color-text-primary: #ffffff;
                      --color-text-secondary: #a1a1aa;
                      --color-text-muted: #71717a;
                      --glass-background: #18181b;
                      --glass-border: rgba(255, 255, 255, 0.08);
                      --glass-blur: 0px;
                      --spacing-sm: 8px;
                      --spacing-md: 16px;
                      --spacing-lg: 24px;
                      --spacing-xl: 32px;
                      --spacing-2xl: 48px;
                      --border-radius-sm: 6px;
                    }
                    html, body { height: 100%; margin: 0; overflow: hidden; background: var(--color-background); color: var(--color-text-primary); }
                    ::-webkit-scrollbar { width: 4px; }
                    ::-webkit-scrollbar-thumb { background: var(--color-surface-hover); border-radius: 4px; }
                    .glass-panel { background: rgba(24, 24, 27, 0.95); border: 1px solid var(--glass-border); }
                  `}</style>
                  {PlayerContent}
                </div>,
                pipWindow.document.body
              )
            ) : (
              PlayerContent
            )}

            {pipWindow && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', gap: 'var(--spacing-md)' }}>
                <ExternalLink size={48} style={{ opacity: 0.5 }} />
                <p>Playing in Pop-out Window</p>
                <button
                  onClick={closePiP}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--border-radius-full)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  Restore Player
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        logout={logout}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        token={token}
        onPlay={handlePlayTrack}
        onAddToQueue={handleAddToQueue}
        onAddToPlaylist={openAddToPlaylist}
      />

      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        token={token}
        onPlay={handlePlayTrack}
        mode={playlistMode}
        trackUri={trackToAdd}
      />

      {/* Queue Modal */}
      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        token={token}
      />
    </div>
  );
}

export default App;
