import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword,   //return true se ok, altrimenti...
  {  //l'errore viene assegnato al campo confirmPassword, mex per l'utente
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;  //deriva automaticamente il tipo TypeScript (LoginSchema) da questo schema!!
export type RegisterSchema = z.infer<typeof registerSchema>;
