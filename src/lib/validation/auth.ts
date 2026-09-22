import { z } from "zod";

const baseFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  schoolId: z.string().cuid("Select a valid school"),
};

export const studentRegisterSchema = z
  .object({
    ...baseFields,
    gradeYear: z.string().min(1, "Grade/Year is required"),
    subjectIds: z.array(z.string().cuid()).min(1, "Select at least one subject"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const teacherRegisterSchema = z
  .object({
    ...baseFields,
    subjectIds: z.array(z.string().cuid()).min(1, "Select at least one subject"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const schoolAdminRegisterSchema = z
  .object({
    ...baseFields,
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
