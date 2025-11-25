import React from 'react';
import { X, Check } from 'lucide-react';

const THEME_COLORS = [
    { name: 'Spotify Green', value: '#1db954' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
];

const TEXT_SIZES = [
    { name: 'Small', value: '1rem' },
    { name: 'Medium', value: '1.5rem' },
    { name: 'Large', value: '2rem' },
];

const ALIGNMENTS = [
    { name: 'Left', value: 'left' },
    { name: 'Center', value: 'center' },
];

function SettingsModal({ isOpen, onClose, settings, updateSettings }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '90%',
                maxWidth: '400px',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--border-radius-lg)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Settings</h2>
                    <button onClick={onClose} style={{ color: 'var(--color-text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Theme Color */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Accent Color</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        {THEME_COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => updateSettings('themeColor', color.value)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: color.value,
                                    border: settings.themeColor === color.value ? '2px solid white' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {settings.themeColor === color.value && <Check size={16} color="white" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Mode */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Theme Mode</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', background: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--border-radius-full)' }}>
                        <button
                            onClick={() => updateSettings('themeMode', 'dark')}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: 'var(--border-radius-full)',
                                border: 'none',
                                background: settings.themeMode === 'dark' ? 'var(--color-primary)' : 'transparent',
                                color: settings.themeMode === 'dark' ? '#000' : 'var(--color-text-secondary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Dark
                        </button>
                        <button
                            onClick={() => updateSettings('themeMode', 'light')}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: 'var(--border-radius-full)',
                                border: 'none',
                                background: settings.themeMode === 'light' ? 'var(--color-primary)' : 'transparent',
                                color: settings.themeMode === 'light' ? '#000' : 'var(--color-text-secondary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Light
                        </button>
                    </div>
                </div>

                {/* Dynamic Background Toggle */}
                <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Dynamic Background</label>
                    <button
                        onClick={() => updateSettings('dynamicBackground', !settings.dynamicBackground)}
                        style={{
                            width: '48px',
                            height: '24px',
                            backgroundColor: settings.dynamicBackground ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                            borderRadius: 'var(--border-radius-full)',
                            position: 'relative',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: settings.dynamicBackground ? '26px' : '2px',
                            transition: 'left 0.2s'
                        }} />
                    </button>
                </div>

                {/* Hide Player Controls Toggle */}
                <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Hide Player Controls</label>
                    <button
                        onClick={() => updateSettings('hideControls', !settings.hideControls)}
                        style={{
                            width: '48px',
                            height: '24px',
                            background: settings.hideControls ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                            borderRadius: '12px',
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#fff',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: settings.hideControls ? '26px' : '2px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                    </button>
                </div>

                {/* Lyrics Size */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Lyrics Size</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', background: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--border-radius-md)' }}>
                        {TEXT_SIZES.map((size) => (
                            <button
                                key={size.value}
                                onClick={() => updateSettings('lyricsSize', size.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: 'var(--border-radius-sm)',
                                    backgroundColor: settings.lyricsSize === size.value ? 'var(--color-surface-hover)' : 'transparent',
                                    color: settings.lyricsSize === size.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {size.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lyrics Alignment */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Lyrics Alignment</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', background: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--border-radius-md)' }}>
                        {ALIGNMENTS.map((align) => (
                            <button
                                key={align.value}
                                onClick={() => updateSettings('lyricsAlign', align.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: 'var(--border-radius-sm)',
                                    backgroundColor: settings.lyricsAlign === align.value ? 'var(--color-surface-hover)' : 'transparent',
                                    color: settings.lyricsAlign === align.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {align.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
