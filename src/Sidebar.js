// Sidebar.js
import { Link } from "react-router-dom";
import React from "react";
import "./Sidebar.css";
import AudioWavesIcon from "./AudioWavesIcon.png";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src={AudioWavesIcon} alt="Logo" className="logo-icon" />
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/playlists">Your Playlists</Link>
        <Link to="/now-playing">Now Playing</Link>
      </div>
    </div>
  );
}

export default Sidebar;
