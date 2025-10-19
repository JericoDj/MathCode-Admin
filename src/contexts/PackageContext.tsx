import { createContext, useContext } from "react";

// Minimal/controller-style context.
// You can extend the value shape later without changing this line.
export const PackageContext = createContext<any>(null);

// Optional: tiny helper to get nice runtime errors if provider is missing
export const usePackageContext = () => {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error("PackageContext must be used within a PackageProvider");
  return ctx;
};
