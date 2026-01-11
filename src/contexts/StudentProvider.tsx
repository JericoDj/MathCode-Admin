import React, { useState, useEffect } from "react";
import { studentAPI } from "../utils/student.api";
import { StudentContext } from "./StudentContext";

interface Props {
  children: React.ReactNode;
}

export const StudentProvider: React.FC<Props> = ({ children }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsData, parentsData] = await Promise.all([
        studentAPI.fetchStudentsByRole("student"),
       studentAPI.fetchStudentsByRole("parent")
      ]);

      setStudents(studentsData || []);
      setParents(parentsData || []);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (data: any) => {
    await studentAPI.createStudent(data);
    await fetchData();
  };

  const updateStudent = async (id: string, data: any) => {
    await studentAPI.updateStudent(id, data);
    await fetchData();
  };

  const removeStudent = async (id: string) => {
    await studentAPI.deleteStudent(id);
    await fetchData();
  };

  const linkToParent = async (pid: string, sid: string) => {
    await studentAPI.linkStudentToParent(pid, sid);
    await fetchData();
  };

  const unlinkFromParent = async (pid: string, sid: string) => {
    await studentAPI.unlinkStudentFromParent(pid, sid);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <StudentContext.Provider
      value={{
        students,
        parents,
        loading,

        refresh: fetchData,
        fetchStudents: fetchData,
        addStudent,
        updateStudent,
        removeStudent,
        linkToParent,
        unlinkFromParent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};
