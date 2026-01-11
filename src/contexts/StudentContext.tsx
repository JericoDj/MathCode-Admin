import { createContext, useContext } from "react";

interface StudentContextType {
  students: any[];
  parents: any[];
  loading: boolean;

  refresh: () => Promise<void>;
  fetchStudents: () => Promise<void>;

  addStudent: (data: any) => Promise<void>;
  updateStudent: (id: string, data: any) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  linkToParent: (pid: string, sid: string) => Promise<void>;
  unlinkFromParent: (pid: string, sid: string) => Promise<void>;
}

export const StudentContext = createContext<StudentContextType | null>(null);

export const useStudentContext = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudentContext must be used within StudentProvider");
  return ctx;
};
