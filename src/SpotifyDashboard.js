import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import SpotifyPlayer from "./SpotifyPlayer"; // Import the player

function App() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      console.log("🔐 Storing tokens from URL");
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      alert("Logged in! Access Token stored.");
      window.location.href = "/";
    } else {
      const existingToken = localStorage.getItem("access_token");
      if (existingToken) {
        setTokenReady(true);
      } else {
        setLoading(false);
      }
    }
  }, [location]);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/refresh_token?refresh_token=${refreshToken}`
      );
      const newAccessToken = response.data.access_token;
      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      return null;
    }
  };

  const fetchWithAuthRetry = async (url, setDataFunc) => {
    let token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDataFunc(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          try {
            const retryResponse = await axios.get(url, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            setDataFunc(retryResponse.data);
            return;
          } catch (retryError) {
            console.error("❌ Retry failed:", retryError);
          }
        }
        localStorage.clear();
        alert("Session expired. Please login again.");
        setProfile(null);
        setPlaylists([]);
      } else {
        console.error("❌ Fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenReady) {
      const token = localStorage.getItem("access_token");
      if (token) {
        fetchWithAuthRetry("https://api.spotify.com/v1/me", setProfile);
      }
    }
  }, [tokenReady]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (profile && token) {
      fetchWithAuthRetry("https://api.spotify.com/v1/me/playlists", (data) => {
        setPlaylists(data.items);
      });
    }
  }, [profile]);

  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:5000/login";
  };

  const handleLogout = () => {
    localStorage.clear();
    setProfile(null);
    setPlaylists([]);
    alert("Logged out successfully!");
  };

  const handlePlay = async (playlistUri) => {
    const token = localStorage.getItem("access_token");
    const deviceId = localStorage.getItem("device_id");

    if (!token || !deviceId) {
      alert("Spotify player not ready. Try again in a few seconds.");
      return;
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          context_uri: playlistUri,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("▶️ Playback started");
    } catch (error) {
      console.error("❌ Error starting playback:", error.response || error);
      alert("Could not start playback.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🎵 Rhythmify</h1>
      <SpotifyPlayer accessToken={localStorage.getItem("access_token")} />

      {loading && <p>Loading profile...</p>}

      {!loading && !profile && (
        <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
          Login with Spotify
        </button>
      )}

      {!loading && profile && (
        <div style={{ marginTop: "30px" }}>
          <h2>Welcome, {profile.display_name}!</h2>
          {profile.images?.[0]?.url && (
            <img
              src={profile.images[0].url}
              alt="Profile"
              style={{
                width: "150px",
                borderRadius: "50%",
                marginTop: "15px",
              }}
            />
          )}
          <p>Country: {profile.country}</p>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>

          {playlists.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h2>Your Playlists</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {playlists.map((playlist) => (
                  <li key={playlist.id} style={{ marginBottom: "20px" }}>
                    {playlist.images?.[0]?.url && (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                    <p>{playlist.name}</p>
                    <button
                      onClick={() => handlePlay(playlist.uri)}
                      style={{
                        marginTop: "10px",
                        padding: "8px 16px",
                        backgroundColor: "#1db954",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ▶️ Play
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
