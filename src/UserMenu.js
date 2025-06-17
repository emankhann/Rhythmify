import React, { useState, useRef, useEffect } from "react";
import "./UserMenu.css";
import defaultUserImg from "./UserIcon.png";

function UserMenu({ profile, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = () => setOpen(!open);

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <img
        src={profile?.images?.[0]?.url || defaultUserImg}        alt="User"
        className="user-avatar"
        onClick={toggleMenu}
      />

      {open && (
        <div className="menu-dropdown">
          <div className="menu-header">
            <strong>{profile?.display_name || "User"}</strong>
          </div>
          <div className="menu-item">
            Account <span className="external-icon">↗</span>
          </div>
          <div className="menu-item">
            Profile <span className="external-icon">↗</span>
          </div>
          <div className="menu-item">
            Support <span className="external-icon">↗</span>
          </div>
          <div className="menu-item">
            Download <span className="external-icon">↗</span>
          </div>
          <div className="menu-item">Settings</div>
          <hr />
          <div className="menu-item logout" onClick={onLogout}>
            Log out
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
