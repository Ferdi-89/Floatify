import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const args = new URLSearchParams(window.location.search);
    const code = args.get('code');
    const storedToken = window.localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
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
            window.localStorage.setItem("token", response.access_token);
            setToken(response.access_token);
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

  const login = async () => {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim();
    const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI?.trim();
    const SCOPES = import.meta.env.VITE_SPOTIFY_SCOPES?.trim();

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

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("verifier");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
