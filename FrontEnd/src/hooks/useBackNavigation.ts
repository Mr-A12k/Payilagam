import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function hasPreviousAppEntry(state: unknown): boolean {
  if (!state || typeof state !== "object" || !("idx" in state)) return false;
  return typeof state.idx === "number" && Number.isInteger(state.idx) && state.idx > 0;
}

export function useBackNavigation(fallback: string = "/") {
  const navigate = useNavigate();
  return useCallback(() => {
    // Router indices exclude unrelated browser history and survive page reloads.
    if (hasPreviousAppEntry(window.history.state)) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
