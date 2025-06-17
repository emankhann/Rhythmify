// App.js
import React, { useEffect, useState } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import BottomPlayer from "./BottomPlayer";
import UserMenu from "./UserMenu";
import SpotifyPlayer from "./SpotifyPlayer";
import SearchBar from "./SearchBar";
import HomePage from "./HomePage";
import PlaylistPage from "./PlaylistPage";
import NowPlayingPage from "./NowPlayingPage"; 
import "./App.css";

function App() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [currentTracks, setCurrentTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenReady, setTokenReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      alert("Logged in! Access Token stored.");
      window.location.href = "/";
    } else {
      const existingToken = localStorage.getItem("access_token");
      if (existingToken) setTokenReady(true);
      else setLoading(false);
    }
  }, [location]);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/refresh_token?refresh_token=${refreshToken}`
      );
      const newToken = res.data.access_token;
      if (newToken) {
        localStorage.setItem("access_token", newToken);
        return newToken;
      }
      return null;
    } catch (err) {
      console.error("❌ Error refreshing token:", err);
      return null;
    }
  };

  const fetchWithAuthRetry = async (url, setDataFunc) => {
    let token = localStorage.getItem("access_token");
    if (!token) return setLoading(false);
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDataFunc(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const retry = await axios.get(url, {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          setDataFunc(retry.data);
          return;
        }
        localStorage.clear();
        alert("Session expired. Please login again.");
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

  

  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:5000/login";
  };

  const handleLogout = () => {
    localStorage.clear();
    setProfile(null);
    setPlaylists([]);
    alert("Logged out successfully!");
  };

  const fetchTracksFromPlaylist = async (playlistId) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentTracks(res.data.items);
    } catch (err) {
      console.error("❌ Error fetching tracks:", err);
    }
  };

  const playTrack = async (trackUris) => {
    const token = localStorage.getItem("access_token");
    const deviceId = localStorage.getItem("device_id");
    if (!token || !deviceId) return;

    const uris = Array.isArray(trackUris) ? trackUris : [trackUris];

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        { uris },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(
        `https://api.spotify.com/v1/tracks/${extractTrackId(uris[0])}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTrack = res.data;
      setRecentlyPlayed((prev) => {
        const deduped = prev.filter((item) => item.track?.id !== newTrack.id);
        return [{ track: newTrack }, ...deduped].slice(0, 10);
      });
    } catch (error) {
      console.error("❌ Error playing track(s):", error);
    }
  };

  const handleSearch = async (e) => {
  const q = e.target.value;
  setSearchQuery(q);

  if (!q) return setSearchResults([]);

  const token = localStorage.getItem("access_token");
  const res = await axios.get("https://api.spotify.com/v1/search", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q,
      type: "track",
      limit: 10,
    },
  });
  setSearchResults(res.data.tracks.items);
};

  const extractTrackId = (uri) => uri?.split(":").pop();

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/player", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        if (data) {
          setCurrentTrack(data.item);
          setIsPlaying(data.is_playing);
          setPosition(data.progress_ms);
          setDuration(data.item?.duration_ms || 0);
        }
      } catch (err) {
        console.error("🛑 Failed to fetch playback state:", err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <SpotifyPlayer accessToken={localStorage.getItem("access_token")} />
        {profile && <UserMenu profile={profile} onLogout={handleLogout} />}

  <div className="search-bar-container">
  <div className="search-bar">
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearch}
      placeholder="What do you want to play?"
    />
  </div>
</div>

{searchResults.length > 0 && (
  <div className="search-results">
    <h2>Songs</h2>
    {searchResults.map((track) => (
      <div
        key={track.id}
        className="search-result-item"
        onClick={() => playTrack(track.uri)}
      >
        <img src={track.album.images[0]?.url} alt={track.name} />
        <div className="track-info">
        <div className="search-track-name">{track.name}</div>
          <div className="track-artist">{track.artists.map(a => a.name).join(", ")}</div>
        </div>
        <div className="track-duration">
          {Math.floor(track.duration_ms / 60000)}:
          {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
        </div>
      </div>
    ))}
  </div>
)}


        {loading && <p className="loading">Loading profile...</p>}
        {!loading && !profile && (
          <div className="centered">
            <button onClick={handleLogin} className="btn green">
              Login with Spotify
            </button>
          </div>
        )}

        {!loading && profile && (
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  playlists={playlists}
                  recentlyPlayed={recentlyPlayed}
                  playTrack={playTrack}
                />
              }
            />
            <Route
              path="/playlists"
              element={
                <PlaylistPage
                  playTrack={playTrack}
                  setRecentlyPlayed={setRecentlyPlayed}
                />
              }
            />
            <Route
              path="/now-playing"
              element={<NowPlayingPage currentTrack={currentTrack} />}
            />
          </Routes>
           
        )}
      </main>

      <BottomPlayer
        track={currentTrack}
        position={position}
        duration={duration}
        isPlaying={isPlaying}
        currentTracks={currentTracks}
      />
    </div>
  );
}

export default App;
