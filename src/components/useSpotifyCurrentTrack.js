import { useState, useEffect } from 'react';

const useSpotifyCurrentTrack = (token, logout) => {
    const [currentTrack, setTrack] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchTrack = async () => {
            try {
                const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    console.warn("Token expired, logging out...");
                    if (logout) logout();
                    return;
                }

                if (response.status === 204 || response.status > 400) {
                    return;
                }

                const data = await response.json();

                if (data.item) {
                    setTrack(data.item);
                    setProgress(data.progress_ms);
                    setIsPlaying(data.is_playing);
                }
            } catch (error) {
                console.error("Error fetching current track:", error);
            }
        };

        // Initial fetch
        fetchTrack();

        // Poll every 1 second
        const interval = setInterval(fetchTrack, 1000);

        return () => clearInterval(interval);
    }, [token, logout]);

    return { currentTrack, progress, isPlaying };
};

export default useSpotifyCurrentTrack;
