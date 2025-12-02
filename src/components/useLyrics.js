import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000';

const useLyrics = (trackName, artistName, albumName, durationMs, trackIsrc, preferredSource = 'auto') => {
    const [lyrics, setLyrics] = useState([]);
    const [synced, setSynced] = useState(false);
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState(null); // 'musixmatch' or 'lrclib'

    useEffect(() => {
        if (!trackName || !artistName) return;

        // Include preferredSource in cache key to invalidate when setting changes
        const cacheKey = `lyrics_mxm_${trackName}_${artistName}_${preferredSource}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            const { lyrics: cachedLyrics, synced: cachedSynced, source: cachedSource } = JSON.parse(cachedData);
            setLyrics(cachedLyrics);
            setSynced(cachedSynced);
            setSource(cachedSource || 'lrclib');
            setLoading(false);
            return;
        }

        const fetchLyrics = async () => {
            setLoading(true);
            setLyrics([]);
            setSynced(false);
            setSource(null);

            try {
                let newLyrics = [];
                let isSynced = false;
                let lyricSource = null;

                const tryMusixmatch = preferredSource === 'auto' || preferredSource === 'musixmatch';
                const tryLrclib = preferredSource === 'auto' || preferredSource === 'lrclib';

                // --- MUSIXMATCH STRATEGY ---
                if (tryMusixmatch) {
                    // 1. Try richsync with ISRC
                    if (trackIsrc) {
                        try {
                            const richsyncRes = await axios.get(`${BACKEND_URL}/richsync`, {
                                params: { track_isrc: trackIsrc }
                            });

                            if (richsyncRes.data?.message?.body?.richsync?.richsync_body) {
                                const richsyncBody = richsyncRes.data.message.body.richsync.richsync_body;
                                newLyrics = parseRichsync(richsyncBody);
                                isSynced = true;
                                lyricSource = 'musixmatch';
                            }
                        } catch (richsyncError) {
                            console.log("Musixmatch richsync not available, trying search...");
                        }
                    }

                    // 2. If no ISRC richsync, search track and try richsync/lyrics by ID
                    if (newLyrics.length === 0) {
                        try {
                            const searchQuery = `${trackName} ${artistName}`;
                            const searchRes = await axios.get(`${BACKEND_URL}/search`, {
                                params: { q: searchQuery }
                            });

                            const trackList = searchRes.data?.message?.body?.track_list;
                            if (trackList && trackList.length > 0) {
                                const firstTrack = trackList[0].track;
                                const trackId = firstTrack.track_id;

                                // Try richsync with track_id
                                try {
                                    const richsyncRes = await axios.get(`${BACKEND_URL}/richsync`, {
                                        params: { track_id: trackId }
                                    });

                                    if (richsyncRes.data?.message?.body?.richsync?.richsync_body) {
                                        const richsyncBody = richsyncRes.data.message.body.richsync.richsync_body;
                                        newLyrics = parseRichsync(richsyncBody);
                                        isSynced = true;
                                        lyricSource = 'musixmatch';
                                    }
                                } catch (richsyncError) {
                                    console.log("Musixmatch richsync not available for this track");
                                }

                                // Fall back to plain lyrics if richsync failed
                                if (newLyrics.length === 0) {
                                    const lyricsRes = await axios.get(`${BACKEND_URL}/lyrics`, {
                                        params: { track_id: trackId }
                                    });

                                    const lyricsBody = lyricsRes.data?.message?.body?.lyrics?.lyrics_body;
                                    if (lyricsBody) {
                                        newLyrics = [{ time: 0, text: lyricsBody }];
                                        isSynced = false;
                                        lyricSource = 'musixmatch';
                                    }
                                }
                            }
                        } catch (mxmError) {
                            console.log("Musixmatch search failed");
                        }
                    }
                }

                // --- LRCLIB STRATEGY ---
                // Fallback to lrclib if Musixmatch returned nothing OR if preferredSource is lrclib
                if (tryLrclib && newLyrics.length === 0) {
                    console.log("Trying lrclib...");
                    try {
                        const response = await axios.get('https://lrclib.net/api/get', {
                            params: {
                                track_name: trackName,
                                artist_name: artistName,
                                album_name: albumName,
                                duration: durationMs / 1000,
                            }
                        });

                        if (response.data && response.data.syncedLyrics) {
                            newLyrics = parseLrc(response.data.syncedLyrics);
                            isSynced = true;
                            lyricSource = 'lrclib';
                        } else if (response.data && response.data.plainLyrics) {
                            newLyrics = [{ time: 0, text: response.data.plainLyrics }];
                            isSynced = false;
                            lyricSource = 'lrclib';
                        } else {
                            // lrclib search fallback
                            const searchRes = await axios.get('https://lrclib.net/api/search', {
                                params: { q: `${trackName} ${artistName}` }
                            });

                            if (searchRes.data && searchRes.data.length > 0) {
                                const firstMatch = searchRes.data[0];
                                if (firstMatch.syncedLyrics) {
                                    newLyrics = parseLrc(firstMatch.syncedLyrics);
                                    isSynced = true;
                                    lyricSource = 'lrclib';
                                } else if (firstMatch.plainLyrics) {
                                    newLyrics = [{ time: 0, text: firstMatch.plainLyrics }];
                                    isSynced = false;
                                    lyricSource = 'lrclib';
                                }
                            }
                        }
                    } catch (lrclibError) {
                        console.error("lrclib also failed:", lrclibError);
                    }
                }

                if (newLyrics.length > 0) {
                    setLyrics(newLyrics);
                    setSynced(isSynced);
                    setSource(lyricSource);
                    // Save to cache with source
                    localStorage.setItem(cacheKey, JSON.stringify({ lyrics: newLyrics, synced: isSynced, source: lyricSource }));
                } else {
                    setLyrics([{ time: 0, text: "Lyrics not found." }]);
                }

            } catch (error) {
                console.error("Error fetching lyrics:", error);
                setLyrics([{ time: 0, text: "Unable to load lyrics." }]);
            } finally {
                setLoading(false);
            }
        };

        fetchLyrics();
    }, [trackName, artistName, albumName, durationMs, trackIsrc, preferredSource]);

    return { lyrics, synced, loading, source };
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

const parseRichsync = (richsyncString) => {
    try {
        const richsyncData = JSON.parse(richsyncString);
        const result = [];

        for (const item of richsyncData) {
            if (item.l && item.ts !== undefined) {
                // item.l is the lyric line
                // item.ts is the timestamp in seconds
                const text = item.l.map(word => word.c).join('');
                const time = parseFloat(item.ts);
                if (text.trim()) {
                    result.push({ time, text: text.trim() });
                }
            }
        }

        return result;
    } catch (error) {
        console.error("Error parsing richsync:", error);
        return [];
    }
};

export default useLyrics;
