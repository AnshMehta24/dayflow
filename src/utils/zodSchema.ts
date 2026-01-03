import z from "zod";

export const signUpSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    companyLogo: z.string().min(1, "Company logo is required").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
