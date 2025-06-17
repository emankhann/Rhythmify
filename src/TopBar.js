import React from "react";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import "./TopBar.css";

function TopBar({ query, setQuery, onSearch, profile, onLogout }) {
  return (
    <div className="top-bar">
      <div className="spacer" /> {/* keeps layout balanced */}
      <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />
      <UserMenu profile={profile} onLogout={onLogout} />
    </div>
  );
}

export default TopBar;
