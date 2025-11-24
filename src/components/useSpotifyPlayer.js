import { useState, useEffect } from 'react';

const useSpotifyPlayer = (token) => {
    const [player, setPlayer] = useState(undefined);
    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setTrack] = useState(null);

    useEffect(() => {
        if (!token) return;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Floatify Mini Player',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize', message);
            });

            player.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate', message);
            });

            player.addListener('account_error', ({ message }) => {
                console.error('Failed to validate Spotify account', message);
            });

            player.addListener('playback_error', ({ message }) => {
                console.error('Failed to perform playback', message);
            });

            player.addListener('player_state_changed', (state => {
                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then(state => {
                    (!state) ? setActive(false) : setActive(true)
                });

            }));

            player.connect();
        };
    }, [token]);

    return { player, isPaused, isActive, currentTrack };
};

export default useSpotifyPlayer;
