import React, { useState } from 'react';
import { X, User, Mail, Globe, Music, Users, Copy, Check } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, profile }) => {
    if (!isOpen || !profile) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                width: '100%',
                maxWidth: '450px',
                padding: 'var(--spacing-xl)',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-lg)'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <X size={20} />
                </button>

                {/* Header Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                    {/* Profile Image */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid var(--color-surface)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                    }}>
                        {profile.images && profile.images.length > 0 ? (
                            <img
                                src={profile.images[0].url}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'var(--color-surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-secondary)'
                            }}>
                                <User size={48} />
                            </div>
                        )}
                    </div>

                    {/* Name & Badge */}
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            margin: 0,
                            color: 'var(--color-text-primary)'
                        }}>
                            {profile.display_name}
                        </h2>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: profile.product === 'premium' ? 'rgba(29, 185, 84, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            marginTop: '12px',
                            border: `1px solid ${profile.product === 'premium' ? 'rgba(29, 185, 84, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                        }}>
                            <span style={{
                                fontSize: '0.85rem',
                                color: profile.product === 'premium' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {profile.product === 'premium' ? 'Premium Plan' : 'Free Plan'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    width: '100%',
                    marginTop: '8px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <InfoItem
                            icon={<Globe size={18} />}
                            label="Country"
                            value={profile.country}
                        />
                        <InfoItem
                            icon={<Users size={18} />}
                            label="Followers"
                            value={profile.followers?.total?.toLocaleString()}
                        />
                    </div>

                    <InfoItem
                        icon={<Mail size={18} />}
                        label="Email"
                        value={profile.email}
                    />

                    <InfoItem
                        icon={<Music size={18} />}
                        label="User ID"
                        value={profile.id}
                        copyable
                    />
                </div>

            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, copyable }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (copyable && value) {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            style={{
                background: 'var(--color-surface)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative',
                transition: 'background-color 0.2s',
                cursor: copyable ? 'pointer' : 'default'
            }}
            onMouseEnter={e => copyable && (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
            onMouseLeave={e => copyable && (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
            onClick={handleCopy}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                {icon}
                <span>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    color: 'var(--color-text-primary)',
                    wordBreak: 'break-all'
                }}>
                    {value}
                </span>
                {copyable && (
                    <div style={{ color: copied ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
