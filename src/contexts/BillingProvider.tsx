import React, { useState, useEffect } from "react";
import { BillingContext } from "../contexts/BillingContext";
import type { Billing } from "../types/Billing";
import { billingApi } from "../utils/billing.api.tsx";


interface BillingProviderProps {
  children: React.ReactNode;
}

export const BillingProvider: React.FC<BillingProviderProps> = ({ children }) => {
 const token = localStorage.getItem("token");
  const [billings, setBillings] = useState<Billing[]>([]);
 const [loading, setLoading] = useState<boolean>(false);

  const fetchBillings = async () => {
    setLoading(true);
    const data = await billingApi.getAll();
    setBillings(data);
    setLoading(false);
  };

  const createBilling = async (data: Partial<Billing>) => {
    const newBilling = await billingApi.create(data,);
    setBillings((prev) => [newBilling, ...prev]);
  };

  const updateBillingStatus = async (id: string, status: string) => {
    const updated = await billingApi.updateStatus(id, status,);
    setBillings((prev) => prev.map((b) => (b._id === id ? updated : b)));
  };

  const deleteBilling = async (id: string) => {
    await billingApi.delete(id,);
    setBillings((prev) => prev.filter((b) => b._id !== id));
  };

    useEffect(() => {
    if (token) fetchBillings();
  }, []);

  return (
    <BillingContext.Provider
      value={{
        billings,
        loading,
        fetchBillings,
        createBilling,
        updateBillingStatus,
        deleteBilling,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
