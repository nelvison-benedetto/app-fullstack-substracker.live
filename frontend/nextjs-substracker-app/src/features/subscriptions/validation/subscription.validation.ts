import { z } from "zod";

export const subscriptionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;

export const BILLING_CYCLES = [
  "Mensile",
  "Annuale",
  "Settimanale",
  "Trimestrale",
  "Semestrale",
] as const;

export const CATEGORIES = [
  "Streaming",
  "Musica",
  "Gaming",
  "Produttività",
  "Notizie",
  "Cloud",
  "Fitness",
  "Educazione",
  "Altro",
] as const;
