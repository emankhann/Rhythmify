import React, { useState } from "react";
import "./BottomPlayer.css";

function BottomPlayer({ track, position, duration, isPlaying, currentTracks }) {
  const [showQueue, setShowQueue] = useState(false);

  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const handlePlayPause = () => {
    if (window.spotifyPlayer) window.spotifyPlayer.togglePlay();
  };

  const handlePrev = () => {
    if (window.spotifyPlayer) window.spotifyPlayer.previousTrack();
  };

  const handleNext = () => {
    if (window.spotifyPlayer) window.spotifyPlayer.nextTrack();
  };

  const handleSeek = (e) => {
    const pos = Number(e.target.value);
    if (window.spotifyPlayer) window.spotifyPlayer.seek(pos);
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value) / 100;
    if (window.spotifyPlayer) window.spotifyPlayer.setVolume(vol);
  };

  return (
    <div className="bottom-player">
      <div className="left">
        <div className="track-info">
          <div className="track-title">{track?.name || "No Track"}</div>
          <div className="track-artist">
            {track?.artists?.map((a) => a.name).join(", ") || "Unknown Artist"}
          </div>
        </div>
      </div>

      <div className="center">
        <div className="player-controls">
          <button className="player-btn" onClick={handlePrev}>⏮</button>
          <button className="player-btn" onClick={handlePlayPause}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="player-btn" onClick={handleNext}>⏭</button>
        </div>
        <div className="progress-bar">
          <span className="time">{formatTime(position)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={position}
            onChange={handleSeek}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="right">
        <button className="queue-btn" onClick={() => setShowQueue(!showQueue)}>
          📃
        </button>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          defaultValue="50"
          onChange={handleVolumeChange}
        />
        {showQueue && currentTracks?.length > 0 && (
          <div className="queue-popup">
            <h4>Up Next</h4>
            <ul>
              {currentTracks.slice(1).map((item) => (
                <li key={item.track.id} className="queue-item">
                  {item.track.name} – {item.track.artists[0].name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default BottomPlayer;
