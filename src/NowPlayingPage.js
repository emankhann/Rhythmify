// NowPlayingPage.js
import React from "react";
import "./NowPlayingPage.css";

function NowPlayingPage({ currentTrack }) {
  if (!currentTrack) return null;

  return (
    <div className="now-playing-page">
      <h1 className="track-name">{currentTrack.name}</h1>
      <img
        className="track-image"
        src={currentTrack.album.images[0]?.url}
        alt={currentTrack.name}
      />
    </div>
  );
}

export default NowPlayingPage;
