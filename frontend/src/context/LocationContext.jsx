// src/context/LocationContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";

export const LocationContext = createContext({
  location: "",                 // City/area name ("" means "All")
  setLocation: () => {},        // Manually set location name
  coords: null,                 // { latitude, longitude } | null
  loading: false,               // Whether geolocation/reverse geocoding is in progress
  error: null,                  // Error message (if any)
  refreshGeolocation: () => {}, // Ask browser for location again
});

export const LocationProvider = ({ children }) => {
  const contactEmail =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_CONTACT_EMAIL) ||
    "";

  // Load saved location (Header also uses 'selectedLocation')
  const loadSavedLocation = () => {
    try {
      if (typeof window === "undefined") return "";
      const saved = window.localStorage.getItem("selectedLocation");
      if (saved) return saved === "All" ? "" : saved;
      // Optional default from env
      const def =
        (typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.VITE_DEFAULT_CITY) ||
        "";
      return def || "";
    } catch {
      return "";
    }
  };

  const [location, setLocationState] = useState(loadSavedLocation);
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [loading, setLoading] = useState(() => (loadSavedLocation() ? false : true));
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Persist and set location safely
  const setLocation = useCallback((name) => {
    const val = typeof name === "string" ? name.trim() : "";
    setLocationState(val);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("selectedLocation", val || "All");
      }
    } catch {}
  }, []);

  // Reverse geocode coords -> city using Nominatim (no custom headers to avoid CORS)
  const fetchCityFromCoords = useCallback(
    async (latitude, longitude) => {
      // Cancel previous fetch if any
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      setError(null);

      try {
        const emailParam = contactEmail
          ? `&email=${encodeURIComponent(contactEmail)}`
          : "";
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1${emailParam}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
        const data = await res.json();

        const addr = data?.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          addr.district ||
          addr.county ||
          addr.state ||
          "";

        if (city) {
          setLocation(city);
          setError(null);
        } else {
          setError("Unable to determine city from location");
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("❌ Reverse geocoding failed:", err?.message || err);
          setError("Failed to fetch city name from coordinates");
        }
      } finally {
        setLoading(false);
      }
    },
    [contactEmail, setLocation]
  );

  // Ask browser for user's location and reverse geocode it
  const refreshGeolocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("⚠️ Geolocation not supported by this browser.");
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords || {};
        if (typeof latitude !== "number" || typeof longitude !== "number") {
          setError("Invalid coordinates received");
          setLoading(false);
          return;
        }
        setCoords({ latitude, longitude });
        fetchCityFromCoords(latitude, longitude);
      },
      (err) => {
        console.warn("⚠️ Geolocation denied or unavailable:", err?.message || err);
        setError("Location access denied or unavailable");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchCityFromCoords]);

  // On mount: if no saved location, try geolocation once
  useEffect(() => {
    if (!location) {
      refreshGeolocation();
    } else {
      setLoading(false);
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    location,
    setLocation,
    coords,
    loading,
    error,
    refreshGeolocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

// Hook
export const useLocationContext = () => useContext(LocationContext);