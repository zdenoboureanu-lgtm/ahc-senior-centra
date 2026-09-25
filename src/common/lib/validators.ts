import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Zadejte jméno"),
  email: z.string().email("Neplatný e-mail"),
  phone: z.string().optional(),
  message: z.string().min(10, "Zpráva je příliš krátká"),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;
