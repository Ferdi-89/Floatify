import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto dismiss
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle size={20} className="text-red-400" />;
            case 'success': return <CheckCircle size={20} className="text-green-400" />;
            default: return <Info size={20} className="text-blue-400" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'error': return 'border-red-500/30 bg-red-950/80 text-red-100';
            case 'success': return 'border-green-500/30 bg-green-950/80 text-green-100';
            default: return 'border-blue-500/30 bg-blue-950/80 text-blue-100';
        }
    };

    // Render to document body to ensure it floats above everything
    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '-100%'})`,
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                border: '1px solid',
                maxWidth: '90vw',
                width: 'max-content',
                pointerEvents: 'auto',
                ...getStyleForType(type)
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIcon()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                    {type === 'error' ? 'Oops!' : type === 'success' ? 'Success' : 'Note'}
                </span>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    {message}
                </span>
            </div>

            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    marginLeft: '8px',
                    opacity: 0.7,
                    color: 'inherit',
                    display: 'flex'
                }}
            >
                <X size={16} />
            </button>
        </div>,
        document.body
    );
};

// Helper to get inline styles based on type (since we might not have Tailwind)
const getStyleForType = (type) => {
    switch (type) {
        case 'error':
            return {
                borderColor: 'rgba(248, 113, 113, 0.3)',
                backgroundColor: 'rgba(69, 10, 10, 0.9)',
                color: '#fecaca'
            };
        case 'success':
            return {
                borderColor: 'rgba(74, 222, 128, 0.3)',
                backgroundColor: 'rgba(5, 46, 22, 0.9)',
                color: '#bbf7d0'
            };
        default:
            return {
                borderColor: 'rgba(96, 165, 250, 0.3)',
                backgroundColor: 'rgba(23, 37, 84, 0.9)',
                color: '#bfdbfe'
            };
    }
};

export default Toast;
