import axios from "axios";

const API_URL = "http://localhost:4000/api/students";

const tokenHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// CREATE student
export const createStudent = async (studentData: any) => {
  return axios.post(API_URL, studentData, { headers: tokenHeaders() })
    .then(res => res.data);
};

// UPDATE student
export const updateStudent = async (studentId: string, updateData: any) => {
  return axios.patch(`${API_URL}/${studentId}`, updateData, {
    headers: tokenHeaders(),
  }).then(res => res.data);
};

// DELETE student
export const deleteStudent = async (studentId: string) => {
  return axios.delete(`${API_URL}/${studentId}`, {
    headers: tokenHeaders(),
  }).then(res => res.data);
};

// GET students by role
export const fetchStudentsByRole = async (role: string = "student") => {
  return axios.get(`${API_URL}/role/${role}`, {
    headers: tokenHeaders(),
  }).then(res => res.data);
};

// GET student under parent
export const fetchStudentForParent = async (studentId: string) => {
  return axios.get(`${API_URL}/parent/${studentId}`, {
    headers: tokenHeaders(),
  }).then(res => res.data);
};

// LINK student to parent
export const linkStudentToParent = async (parentId: string, studentId: string) => {
  return axios.post(`${API_URL}/parent/${parentId}/link/${studentId}`, {}, {
    headers: tokenHeaders(),
  }).then(res => res.data);
};

// UNLINK student
export const unlinkStudentFromParent = async (parentId: string, studentId: string) => {
  return axios.delete(`${API_URL}/parent/${parentId}/unlink/${studentId}`, {
    headers: tokenHeaders(),
  }).then(res => res.data);
};

// Export API object
export const studentAPI = {
  createStudent,
  updateStudent,
  deleteStudent,
  fetchStudentsByRole,
  fetchStudentForParent,
  linkStudentToParent,
  unlinkStudentFromParent,
};
