import { useState, useEffect } from 'react';
import axios from 'axios';

const useLyrics = (trackName, artistName, albumName, durationMs) => {
    const [lyrics, setLyrics] = useState([]);
    const [synced, setSynced] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!trackName || !artistName) return;

        const cacheKey = `lyrics_${trackName}_${artistName}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            const { lyrics: cachedLyrics, synced: cachedSynced } = JSON.parse(cachedData);
            setLyrics(cachedLyrics);
            setSynced(cachedSynced);
            setLoading(false);
            return; // Use cache and skip fetch
        }

        const fetchLyrics = async () => {
            setLoading(true);
            setLyrics([]);
            setSynced(false);

            try {
                // Try to get synced lyrics from LRCLIB
                const response = await axios.get('https://lrclib.net/api/get', {
                    params: {
                        track_name: trackName,
                        artist_name: artistName,
                        album_name: albumName,
                        duration: durationMs / 1000,
                    }
                });

                let newLyrics = [];
                let isSynced = false;

                if (response.data && response.data.syncedLyrics) {
                    newLyrics = parseLrc(response.data.syncedLyrics);
                    isSynced = true;
                } else if (response.data && response.data.plainLyrics) {
                    newLyrics = [{ time: 0, text: response.data.plainLyrics }];
                    isSynced = false;
                } else {
                    // Fallback search if exact match fails
                    const searchRes = await axios.get('https://lrclib.net/api/search', {
                        params: { q: `${trackName} ${artistName}` }
                    });

                    if (searchRes.data && searchRes.data.length > 0) {
                        const firstMatch = searchRes.data[0];
                        if (firstMatch.syncedLyrics) {
                            newLyrics = parseLrc(firstMatch.syncedLyrics);
                            isSynced = true;
                        } else {
                            newLyrics = [{ time: 0, text: firstMatch.plainLyrics }];
                            isSynced = false;
                        }
                    }
                }

                if (newLyrics.length > 0) {
                    setLyrics(newLyrics);
                    setSynced(isSynced);
                    // Save to cache
                    localStorage.setItem(cacheKey, JSON.stringify({ lyrics: newLyrics, synced: isSynced }));
                } else {
                    setLyrics([{ time: 0, text: "Lyrics not found." }]);
                }

            } catch (error) {
                console.error("Error fetching lyrics:", error);
                setLyrics([{ time: 0, text: "Lyrics not found." }]);
            } finally {
                setLoading(false);
            }
        };

        fetchLyrics();
    }, [trackName, artistName, albumName, durationMs]);

    return { lyrics, synced, loading };
};

const parseLrc = (lrcString) => {
    const lines = lrcString.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = line.replace(timeRegex, '').trim();
            if (text) {
                result.push({ time, text });
            }
        }
    }
    return result;
};

export default useLyrics;
