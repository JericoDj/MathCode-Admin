// src/utils/package.api.ts
import axios from 'axios';

// Define the base URL for the API (replace with your actual backend URL)
const API_URL = 'http://localhost:4000/api/packages';

// Helper function to handle HTTP requests and responses
const apiRequest = async ({ url, method, data, headers, params }: {
  url: string;
  method: string;
  data?: any;
  headers?: any;
  params?: any;
}) => {
  try {
    // Include headers and params in the request if provided, else use empty objects
    const response = await axios({
      url,
      method,
      data,
      headers: headers || {}, // Default to empty object if no headers are provided
      params: params || {},   // Default to empty object if no params are provided
    });

    // Return the data from the response
    return response.data;
  } catch (error: unknown) {
    // Error handling when the error is of type unknown
    if (axios.isAxiosError(error) && error.response) {
      // Axios error structure
      console.error('API request error:', error.response.data.message || 'Unknown error');
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      // If the error is not an Axios error, handle it as a generic unknown error
      console.error('Unknown error occurred:', error);
      throw new Error('Something went wrong');
    }
  }
};

// Package API functions

// Fetch all packages
export const fetchPackages = async () => {
  const token = localStorage.getItem('adminToken');
  const headers = token
    ? {
        Authorization: `Bearer ${token}`, // Adding the token to Authorization header
      }
    : {};
  const data = await apiRequest({
    url: API_URL,
    method: 'GET',
    headers: headers, 
  });

  return data;
};

// Create a new package
export const createPackage = async (packageData: any) => {
  const token = localStorage.getItem('adminToken');
  const headers = token
    ? {
        Authorization: `Bearer ${token}`, // Adding the token to Authorization header
      }
    : {};

  return apiRequest({
    url: API_URL,
    method: 'POST',
    data: packageData,  // Pass package data in the object
    headers: headers,
  });
};

// Update an existing package
export const updatePackage = async (packageId: string, updatedData: any) => {
  const url = `${API_URL}/${packageId}`;
  const token = localStorage.getItem('adminToken');
  const headers = token
    ? {
        Authorization: `Bearer ${token}`, // Adding the token to Authorization header
      }
    : {};

  return apiRequest({
    url: url,
    method: 'PATCH',
    data: updatedData, // Pass updated data in the object
    headers: headers,
  });
};

// Assign a tutor to a package
export const assignTutor = async (packageId: string, tutorId: string) => {
  const url = `${API_URL}/${packageId}/assign-tutor`;
  const data = { tutorId };
  const token = localStorage.getItem('adminToken');
  const headers = token
    ? {
        Authorization: `Bearer ${token}`, // Adding the token to Authorization header
      }
    : {};

  return apiRequest({
    url: url,
    method: 'PUT',
    data: data,  // Pass data in the object
    headers: headers,
  });
};

// Optionally, delete a package (if required)
export const deletePackage = async (packageId: string) => {
  const url = `${API_URL}/${packageId}`;
  const token = localStorage.getItem('adminToken');
  const headers = token
    ? {
        Authorization: `Bearer ${token}`, // Adding the token to Authorization header
      }
    : {};

  return apiRequest({
    url: url,
    method: 'DELETE',
    headers: headers, // No data for DELETE request, just headers
  });
};

// Fetch tutors (for assigning a tutor to a package)
export const fetchTutors = async () => {
  const url = `http://localhost:4000/api/packages/{}`; // Adjust as needed
  const token = localStorage.getItem('adminToken');
  const headers = token
    ? {
        Authorization: `Bearer ${token}`, // Adding the token to Authorization header
      }
    : {};

  return apiRequest({
    url: url,
    method: 'GET',
    headers: headers, // No data, just headers
  });
};

// Export all the packageAPI methods as a single object
export const packageAPI = {
  fetchPackages,
  createPackage,
  updatePackage,
  assignTutor,
  deletePackage,
  fetchTutors,
};