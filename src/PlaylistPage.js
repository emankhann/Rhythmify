import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PlaylistPage.css";

function PlaylistPage({ playTrack, setRecentlyPlayed }) {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState({});
  const [openPlaylistId, setOpenPlaylistId] = useState(null); // Track which playlist is open
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function fetchPlaylists() {
      const res = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data.items);
    }
    fetchPlaylists();
  }, []);

  const fetchTracks = async (playlistId) => {
    // If clicking the already open playlist, close it
    if (openPlaylistId === playlistId) {
      setOpenPlaylistId(null);
      return;
    }

    // Otherwise fetch tracks and open the playlist
    const res = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTracks((prev) => ({ ...prev, [playlistId]: res.data.items }));
    setOpenPlaylistId(playlistId);
  };

  const handleTrackPlay = async (trackUri) => {
    const deviceId = localStorage.getItem("device_id");
    if (!token || !deviceId) return;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        { uris: [trackUri] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const trackId = trackUri.split(":").pop();
      const res = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTrack = res.data;
      setRecentlyPlayed((prev) => {
        const deduped = prev.filter((item) => item.track?.id !== newTrack.id);
        return [{ track: newTrack }, ...deduped].slice(0, 10);
      });
    } catch (error) {
      console.error("❌ Error playing track:", error);
    }
  };

  return (
    <div className="playlist-page">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="playlist-section">
          <div
            className={`playlist-header color${playlist.id.charCodeAt(0) % 3 + 1}`}
            onClick={() => fetchTracks(playlist.id)}
          >
            <img
              src={playlist.images[0]?.url}
              alt=""
              className="playlist-cover"
            />
            <div>
              <p className="public-label">Public Playlist</p>
              <h1>{playlist.name}</h1>
              <p className="owner">{playlist.owner.display_name}</p>
            </div>
          </div>

          {openPlaylistId === playlist.id && tracks[playlist.id] && (
            <table className="playlist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Album</th>
                  <th>Date Added</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tracks[playlist.id].map((item, idx) => (
                  <tr
                    key={item.track.id}
                    onClick={() => handleTrackPlay(item.track.uri)}
                    className="clickable-row"
                  >
                    <td>{idx + 1}</td>
                    <td>
                      <div className="track-title">
                        <img
                          src={item.track.album.images[0]?.url}
                          alt=""
                          className="track-img"
                        />
                        <div>
                          <div>{item.track.name}</div>
                          <div className="muted">
                            {item.track.artists[0].name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{item.track.album.name}</td>
                    <td>{new Date(item.added_at).toDateString()}</td>
                    <td>
                      {Math.floor(item.track.duration_ms / 60000)}:
                      {String(
                        Math.floor((item.track.duration_ms % 60000) / 1000)
                      ).padStart(2, "0")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default PlaylistPage;