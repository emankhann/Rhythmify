import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomePage.css";

function HomePage({ playlists, recentlyPlayed, playTrack }) {
  const [popularAlbums, setPopularAlbums] = useState([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function fetchPopularAlbums() {
      try {
        const res = await axios.get(
          "https://api.spotify.com/v1/browse/new-releases?limit=10",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPopularAlbums(res.data.albums.items);
      } catch (err) {
        console.error("❌ Failed to fetch popular albums:", err);
      }
    }

    fetchPopularAlbums();
  }, [playlists, token]);

  const handlePlayAlbum = async (albumId) => {
    try {
      const res = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const uris = res.data.tracks.items.map(track => track.uri);
      playTrack(uris);
    } catch (err) {
      console.error("❌ Error playing album:", err);
    }
  };

  return (
    <div className="home-page">
      <section className="section">
        <h2>Recently played</h2>
        <div className="card-grid">
          {recentlyPlayed.map((item, index) => {
            const track = item.track || item;
            const key = `${track.id}-${index}`;
            return (
              <div
                key={key}
                className="card clickable"
                onClick={() => playTrack(track.uri)}
              >
                <img src={track.album.images[0]?.url} alt={track.name} />
                <p>{track.name}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Popular Albums and Singles</h2>
        <div className="card-grid">
          {popularAlbums.map((album) => (
            <div
              key={album.id}
              className="card clickable"
              onClick={() => handlePlayAlbum(album.id)}
            >
              <img src={album.images[0]?.url} alt={album.name} />
              <p>{album.name}</p>
              <p className="muted">
                {album.artists.map(a => a.name).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
