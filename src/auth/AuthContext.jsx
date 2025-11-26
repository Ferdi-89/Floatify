import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const args = new URLSearchParams(window.location.search);
    const code = args.get('code');
    const storedToken = window.localStorage.getItem("token");
    const storedRefreshToken = window.localStorage.getItem("refresh_token");
    const storedExpiresAt = window.localStorage.getItem("expires_at");

    // Check if token is expired
    const isExpired = storedExpiresAt && Date.now() > parseInt(storedExpiresAt);

    if (storedToken && !isExpired) {
      setToken(storedToken);
    } else if (storedRefreshToken) {
      // Try to refresh token
      refreshAccessToken(storedRefreshToken);
    }

    if (code) {
      const getToken = async () => {
        const verifier = window.localStorage.getItem("verifier");
        const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim();
        const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI?.trim();

        const payload = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
          }),
        };

        try {
          const body = await fetch("https://accounts.spotify.com/api/token", payload);
          const response = await body.json();

          if (response.access_token) {
            handleTokenResponse(response);
            // Clean URL
            window.history.replaceState({}, document.title, "/");
          } else {
            console.error("Token exchange failed", response);
          }
        } catch (e) {
          console.error("Error fetching token", e);
        }
      };

      getToken();
    }
  }, []);

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("verifier");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("expires_at");
  };

  const handleTokenResponse = (response) => {
    const { access_token, refresh_token, expires_in } = response;
    const expiresAt = Date.now() + expires_in * 1000;

    window.localStorage.setItem("token", access_token);
    window.localStorage.setItem("expires_at", expiresAt);
    if (refresh_token) {
      window.localStorage.setItem("refresh_token", refresh_token);
    }

    setToken(access_token);
  };

  const refreshAccessToken = async (refreshToken) => {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim();

    try {
      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID
        })
      };

      const body = await fetch("https://accounts.spotify.com/api/token", payload);
      const response = await body.json();

      if (response.access_token) {
        handleTokenResponse(response);
      } else {
        console.error("Failed to refresh token", response);
        logout(); // Force logout if refresh fails
      }
    } catch (e) {
      console.error("Error refreshing token", e);
      logout();
    }
  };

  const login = async () => {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim();
    const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI?.trim();

    // Default valid scopes - fallback if env var not set
    const DEFAULT_SCOPES = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';
    const SCOPES = import.meta.env.VITE_SPOTIFY_SCOPES?.trim() || DEFAULT_SCOPES;

    console.log('🔍 Debug - CLIENT_ID:', CLIENT_ID ? 'SET' : 'MISSING');
    console.log('🔍 Debug - REDIRECT_URI:', REDIRECT_URI);
    console.log('🔍 Debug - SCOPES:', SCOPES);

    const generateRandomString = (length) => {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    const generateCodeChallenge = async (codeVerifier) => {
      const data = new TextEncoder().encode(codeVerifier);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    const verifier = generateRandomString(128);
    window.localStorage.setItem("verifier", verifier);

    const challenge = await generateCodeChallenge(verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    console.log('🔗 Authorization URL:', `https://accounts.spotify.com/authorize?${params.toString()}`);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, setManualToken: handleTokenResponse }}>
      {children}
    </AuthContext.Provider>
  );
};
