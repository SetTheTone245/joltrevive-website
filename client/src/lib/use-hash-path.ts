import { useState, useEffect, useCallback } from "react";

// Custom hash-location hook for wouter.
//
// Returns the FULL hash location (path + query), e.g. "/repair/track?number=JR-10287".
// Returning the full string (not just the path) means query-only changes — like
// navigating from /finder to /finder?type=E-Bike — still trigger a re-render, which
// pages need because they read query params directly from window.location.hash.
//
// Route matching is done manually in AppRouter by stripping the query, so query-bearing
// paths match their route (wouter's built-in Route matching would fail on the query).
export function useHashPath(): [string, (to: string) => void] {
  const get = () => window.location.hash.replace(/^#/, "") || "/";
  const [loc, setLoc] = useState(get);

  useEffect(() => {
    const onHash = () => setLoc(get());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to.startsWith("#") ? to : to;
  }, []);

  return [loc, navigate];
}
