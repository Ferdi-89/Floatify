import { useState, useEffect, useCallback } from 'react';

const useDocumentPiP = () => {
    const [pipWindow, setPipWindow] = useState(null);

    const requestPiP = useCallback(async (width = 300, height = 400) => {
        if (!window.documentPictureInPicture) {
            console.warn("Document Picture-in-Picture API is not supported.");
            return;
        }

        try {
            const pip = await window.documentPictureInPicture.requestWindow({
                width,
                height,
            });

            // Copy styles from main window to PiP window
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pip.document.head.appendChild(style);
                } catch (e) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = styleSheet.type;
                    link.media = styleSheet.media;
                    link.href = styleSheet.href;
                    pip.document.head.appendChild(link);
                }
            });

            // Copy CSS variables from root
            const rootStyles = getComputedStyle(document.documentElement);
            const pipRoot = pip.document.documentElement;
            for (let i = 0; i < rootStyles.length; i++) {
                const prop = rootStyles[i];
                if (prop.startsWith('--')) {
                    pipRoot.style.setProperty(prop, rootStyles.getPropertyValue(prop));
                }
            }

            // Ensure body has same background
            pip.document.body.style.backgroundColor = 'var(--color-background)';
            pip.document.body.style.color = 'var(--color-text-primary)';
            pip.document.body.style.fontFamily = 'var(--font-family)';
            pip.document.body.style.margin = '0';
            pip.document.body.style.overflow = 'hidden';

            pip.addEventListener('pagehide', () => {
                setPipWindow(null);
            });

            setPipWindow(pip);
        } catch (error) {
            console.error("Failed to open PiP window:", error);
        }
    }, []);

    const closePiP = useCallback(() => {
        if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
        }
    }, [pipWindow]);

    return { pipWindow, requestPiP, closePiP };
};

export default useDocumentPiP;
