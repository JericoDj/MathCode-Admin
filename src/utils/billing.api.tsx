import type { Billing } from "../types/Billing";

const BASE_URL = "https://math-code-backend.vercel.app/api/billing";

const getToken = () => localStorage.getItem("adminToken") || "";



export const billingApi = {
  getAll: async (): Promise<Billing[]> => {

    const res = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    console.log("Fetched billings:", res);


    return res.json();
  },

  create: async (data: Partial<Billing>): Promise<Billing> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    console.log("Updated billing status:", res);
    return res.json();
  },

  delete: async (id: string) => {
    await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },
};
