import { useEffect } from "react";

function SpotifyPlayer({ accessToken }) {
  useEffect(() => {
    if (!accessToken) return;

    // Inject Spotify SDK only once
    const existingScript = document.querySelector("#spotify-sdk");
    if (!existingScript) {
      const scriptTag = document.createElement("script");
      scriptTag.id = "spotify-sdk";
      scriptTag.src = "https://sdk.scdn.co/spotify-player.js";
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }

    // Define the SDK init callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("🎧 Spotify SDK loaded");

      const player = new window.Spotify.Player({
        name: "Rhythmify Web Player",
        getOAuthToken: cb => cb(accessToken),
        volume: 0.5,
      });

      // Store player globally for use in other components
      window.spotifyPlayer = player;

      player.addListener("ready", ({ device_id }) => {
        console.log("✅ Player ready. Device ID:", device_id);
        localStorage.setItem("device_id", device_id);
      });

      player.addListener("initialization_error", ({ message }) =>
        console.error("Init error:", message)
      );
      player.addListener("authentication_error", ({ message }) =>
        console.error("Auth error:", message)
      );
      player.addListener("account_error", ({ message }) =>
        console.error("Account error:", message)
      );
      player.addListener("playback_error", ({ message }) =>
        console.error("Playback error:", message)
      );

      player.addListener("player_state_changed", (state) => {
        console.log("🎵 Playback state changed:", state);
        window.spotifyPlaybackState = state; // optional: can store state for UI
      });

      player.connect().then(success => {
        if (success) {
          console.log("🎶 Spotify Player connected");
        } else {
          console.error("❌ Connection failed");
        }
      });
    };

    return () => {
      delete window.onSpotifyWebPlaybackSDKReady;
    };
  }, [accessToken]);

  return null;
}

export default SpotifyPlayer;
