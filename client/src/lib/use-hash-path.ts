import { useState, useEffect, useCallback } from "react";

// Custom hash-location hook for wouter that returns the PATH ONLY (query stripped).
// The default wouter useHashLocation returns the full hash including "?query",
// which breaks route matching for routes like /repair/track?number=JR-10287.
// Pages read query params directly from window.location.hash, so stripping here
// is safe and fixes route matching.
export function useHashPath(): [string, (to: string) => void] {
  const [path, setPath] = useState(() => {
    const h = window.location.hash.replace(/^#/, "");
    return (h.split("?")[0] || "/").replace(/\s+/g, "");
  });

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace(/^#/, "");
      setPath((h.split("?")[0] || "/").replace(/\s+/g, ""));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to.startsWith("#") ? to : to;
  }, []);

  return [path, navigate];
}
