import React from 'react';
import { X, User, Mail, Globe, Music, Users } from 'lucide-react';

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
                maxWidth: '400px',
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
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

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

                {/* Name */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{profile.display_name}</h2>
                    <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-primary)',
                        background: 'rgba(29, 185, 84, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        marginTop: '8px',
                        display: 'inline-block',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                    }}>
                        {profile.product === 'premium' ? 'Premium Plan' : 'Free Plan'}
                    </span>
                </div>

                {/* Details Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    width: '100%',
                    marginTop: '8px'
                }}>
                    <InfoItem icon={<Mail size={16} />} label="Email" value={profile.email} />
                    <InfoItem icon={<Globe size={16} />} label="Country" value={profile.country} />
                    <InfoItem icon={<Users size={16} />} label="Followers" value={profile.followers?.total?.toLocaleString()} />
                    <InfoItem icon={<Music size={16} />} label="ID" value={profile.id} truncate />
                </div>

            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, truncate }) => (
    <div style={{
        background: 'var(--color-surface)',
        padding: '12px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
            {icon}
            <span>{label}</span>
        </div>
        <span style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            whiteSpace: truncate ? 'nowrap' : 'normal',
            overflow: truncate ? 'hidden' : 'visible',
            textOverflow: truncate ? 'ellipsis' : 'clip'
        }}>
            {value}
        </span>
    </div>
);

export default ProfileModal;
