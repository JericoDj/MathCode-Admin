// src/utils/package.api.ts
import axios from 'axios';

const API_URL = import.meta.env.PROD
  ? 'https://math-code-backend.vercel.app/api/packages'
  : 'http://localhost:4000/api/packages';

// Shared request helper
const apiRequest = async ({
  url,
  method,
  data,
  headers,
  params
}: {
  url: string;
  method: string;
  data?: any;
  headers?: any;
  params?: any;
}) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      params: params || {},
      headers: headers || {},
      withCredentials: true // important for sessions/cookies in prod
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('API request error:', error.response.data.message || 'Unknown error');
      throw new Error(error.response.data.message || 'Something went wrong');
    }
    console.error('Unknown error occurred:', error);
    throw new Error('Something went wrong');
  }
};

// =======================
// PACKAGE API FUNCTIONS
// =======================

// Fetch all packages
export const fetchPackages = async () => {
  const token = localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return apiRequest({
    url: API_URL,
    method: 'GET',
    headers
  });
};

// Create a package
export const createPackage = async (packageData: any) => {
  const token = localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return apiRequest({
    url: API_URL,
    method: 'POST',
    data: packageData,
    headers
  });
};

// Update a package
export const updatePackage = async (packageId: string, updatedData: any) => {
  const token = localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return apiRequest({
    url: `${API_URL}/${packageId}`,
    method: 'PATCH',
    data: updatedData,
    headers
  });
};

// Assign tutor
export const assignTutor = async (packageId: string, tutorId: string) => {
  const token = localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return apiRequest({
    url: `${API_URL}/${packageId}/assign-tutor`,
    method: 'PUT',
    data: { tutorId },
    headers
  });
};

// Delete package
export const deletePackage = async (packageId: string) => {
  const token = localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return apiRequest({
    url: `${API_URL}/${packageId}`,
    method: 'DELETE',
    headers
  });
};

// Fetch tutors (fix placeholder)
export const fetchTutors = async () => {
  const token = localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Adjust based on your backend (e.g. "/tutors")
  return apiRequest({
    url: `${API_URL}/tutors`,
    method: 'GET',
    headers
  });
};

export const packageAPI = {
  fetchPackages,
  createPackage,
  updatePackage,
  assignTutor,
  deletePackage,
  fetchTutors
};
