export interface Billing {
  _id: string;
  userId: string;
  userName: string;
  childName?: string;
  package: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  description?: string;
  dueDate?: string;
  billingDate?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}
