// src/context/LocationContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState("");       // City/area name
  const [coords, setCoords] = useState(null);         // { latitude, longitude }
  const [loading, setLoading] = useState(true);       // Whether fetching location
  const [error, setError] = useState(null);           // Error message (if any)

  // ✅ Fetch city name from coordinates using OpenStreetMap Nominatim API
  const fetchCityFromCoords = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "food-delivery-app/1.0 (example@example.com)", // recommended by Nominatim
          },
        }
      );
      const data = await res.json();

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.district ||
        data.address?.county ||
        "";

      setLocation(city);
    } catch (err) {
      console.error("❌ Reverse geocoding failed:", err);
      setError("Failed to fetch city name from coordinates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("⚠️ Geolocation not supported by this browser.");
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    // ✅ Ask browser for user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setCoords({ latitude, longitude });
        fetchCityFromCoords(latitude, longitude);
      },
      (err) => {
        console.warn("⚠️ Geolocation denied or unavailable:", err.message);
        setError("Location access denied or unavailable");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, coords, loading, error }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// ✅ Custom hook for using LocationContext easily
export const useLocationContext = () => useContext(LocationContext);