import React from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

function SearchBar({ query, setQuery }) {
  const navigate = useNavigate();

  const handleInput = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="What do you want to play?"
      />
      {query && (
        <button className="clear-btn" onClick={() => setQuery("")}>
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
