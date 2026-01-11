import { createContext, useContext } from "react";
import type { Billing } from "../types/Billing";

export interface BillingContextProps {
  billings: Billing[];
  loading: boolean;
  fetchBillings: () => void;
  createBilling: (data: Partial<Billing>) => Promise<void>;
  updateBillingStatus: (id: string, status: string) => Promise<void>;
  deleteBilling: (id: string) => Promise<void>;
}

export const BillingContext = createContext<BillingContextProps | null>(null);

export const useBilling = () => useContext(BillingContext)!;
