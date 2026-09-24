import { z } from "zod";

const baseFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  schoolId: z.string().cuid("Select a valid school"),
};

// Student: picks an existing school, then a class from that school.
// Level/grade is derived from the class — never typed manually.
// They are auto-enrolled in every subject their school offers.
export const studentRegisterSchema = z
  .object({
    ...baseFields,
    classId: z.string().cuid("Select a valid class"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Teacher: picks an existing school, ONE predefined subject, and one or
// more classes they teach at that school — all selected, never typed.
export const teacherRegisterSchema = z
  .object({
    ...baseFields,
    subjectId: z.string().cuid("Select a subject"),
    classIds: z.array(z.string().cuid()).min(1, "Select at least one class"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// School admin: creates their OWN school as part of registration — never
// selects an existing one. Name + optional code.
export const schoolAdminRegisterSchema = z
  .object({
    name: baseFields.name,
    email: baseFields.email,
    password: baseFields.password,
    confirmPassword: baseFields.confirmPassword,
    schoolName: z.string().min(2, "School name is required"),
    schoolCode: z.string().optional(),
    position: z.string().min(2, "Position is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type TeacherRegisterInput = z.infer<typeof teacherRegisterSchema>;
export type SchoolAdminRegisterInput = z.infer<typeof schoolAdminRegisterSchema>;
