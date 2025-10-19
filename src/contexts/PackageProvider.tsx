import React, { useState, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PackageContext } from "./PackageContext";
import { packageAPI } from "../utils/package.api";
import PackagesDialog from "../components/PackageDetailsDialog/PackagesDialog";
import type { Package, Tutor } from "../types";

interface PackageProviderProps {
  children: ReactNode;
  isTeacher?: boolean;
}

export const PackageProvider: React.FC<PackageProviderProps> = ({
  children,
  isTeacher = true,
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePackage, setActivePackage] = useState<Package | null>(null);

  const getPackages = async () => {
    setIsLoading(true);
    try {
      const data = await packageAPI.fetchPackages();
      console.log("Fetched packages:", data.items);
      setPackages(data.items || []);
    } catch (e) {
      console.error("Error fetching packages:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getTutors = async () => {
    setIsLoading(true);
    try {
      const data = await packageAPI.fetchTutors();
      setTutors(data);
    } catch (e) {
      console.error("Error fetching tutors:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = useCallback((packageOrId?: string | Package) => {
    // Avoid unnecessary re-renders by checking if the package is already active
    if (typeof packageOrId === "string") {
      const found = packages.find(p => p.id === packageOrId) || null;
      if (found !== activePackage) {  // Only set if package has changed
        setActivePackage(found);
      }
    } else if (packageOrId) {
      if (packageOrId !== activePackage) {  // Only set if package has changed
        setActivePackage(packageOrId);
      }
    } else {
      setActivePackage(null); // Reset package
    }
    setDialogOpen(true);  // Always open the dialog when invoked
  }, [packages, activePackage]); // Only change if packages or activePackage change

  const closeDialog = () => {
    setDialogOpen(false);
    setActivePackage(null); // Reset active package when dialog closes
  };

  return (
    <PackageContext.Provider
      value={{
        openDialog,
        closeDialog,
        dialogOpen,
        activePackage,
        packages,
        tutors,
        isLoading,
        getPackages,
        getTutors,
        createPackage: packageAPI.createPackage,
        updatePackage: packageAPI.updatePackage,
        assignTutorToPackage: packageAPI.assignTutor,
        isTeacher,
      }}
    >
      {children}

      {dialogOpen &&
        createPortal(
          <div id="global-dialog-root" style={{ position: 'fixed', inset: 0, zIndex: 2147483647 }}>
            <PackagesDialog open onClose={closeDialog} />
          </div>,
          document.body
        )
      }
    </PackageContext.Provider>
  );
};