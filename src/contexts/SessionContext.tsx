import { createContext, useContext } from "react";

// Minimal/controller-style context.
// You can extend the value shape later without changing this line.
export const SessionContext = createContext<any>(null);

// Optional: tiny helper to get nice runtime errors if provider is missing
export const useSessionContext = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("SessionContext must be used within a SessionProvider");
  return ctx;
};
