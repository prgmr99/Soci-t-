import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(200).toLowerCase(),
  role: z.string().trim().min(1).max(80),
  industry: z.string().trim().min(1).max(60),
});

export const step2Schema = z.object({
  essayValues: z.string().trim().min(400).max(3000),
});

export const step3Schema = z.object({
  essayGrowth: z.string().trim().min(300).max(3000),
});

export const step4Schema = z.object({
  referral: z.string().trim().max(200).optional().or(z.literal("")),
});

export const fullSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .extend({
    _hp: z.string().max(0).optional(), // honeypot: must be empty
  });

export type ApplicationInput = z.infer<typeof fullSchema>;
