import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE}/api/students`;

const tokenHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const client = axios.create({
  withCredentials: true,  // important for vercel + session auth
});

// CREATE student
export const createStudent = async (studentData: any) => {
  const res = await client.post(API_URL, studentData, {
    headers: tokenHeaders(),
  });
  return res.data;
};

// UPDATE student
export const updateStudent = async (studentId: string, updateData: any) => {
  const res = await client.patch(`${API_URL}/${studentId}`, updateData, {
    headers: tokenHeaders(),
  });
  return res.data;
};

// DELETE student
export const deleteStudent = async (studentId: string) => {
  const res = await client.delete(`${API_URL}/${studentId}`, {
    headers: tokenHeaders(),
  });
  return res.data;
};

// GET students by role
export const fetchStudentsByRole = async (role: string = "student") => {
  const res = await client.get(`${API_URL}/role/${role}`, {
    headers: tokenHeaders(),
  });
  return res.data;
};

// GET student under parent
export const fetchStudentForParent = async (studentId: string) => {
  const res = await client.get(`${API_URL}/parent/${studentId}`, {
    headers: tokenHeaders(),
  });
  return res.data;
};

// LINK student to parent
export const linkStudentToParent = async (parentId: string, studentId: string) => {
  const res = await client.post(
    `${API_URL}/parent/${parentId}/link/${studentId}`,
    {},
    { headers: tokenHeaders() }
  );
  return res.data;
};

// UNLINK student
export const unlinkStudentFromParent = async (parentId: string, studentId: string) => {
  const res = await client.delete(
    `${API_URL}/parent/${parentId}/unlink/${studentId}`,
    { headers: tokenHeaders() }
  );
  return res.data;
};

export const studentAPI = {
  createStudent,
  updateStudent,
  deleteStudent,
  fetchStudentsByRole,
  fetchStudentForParent,
  linkStudentToParent,
  unlinkStudentFromParent,
};
