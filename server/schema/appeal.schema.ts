import { z } from "zod";

export const createAppealSchema = z.object({
  type: z.enum(["ban_appeal", "general_inquiry", "bug_report", "other"]),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(20, "Message must be at least 20 characters").max(2000),
  relatedBanId: z.string().optional(), // Optional: link to specific ban
});

export const updateAppealStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "resolved", "rejected"]),
  adminResponse: z.string().optional(),
});

export type CreateAppealInput = z.infer<typeof createAppealSchema>;
export type UpdateAppealStatusInput = z.infer<typeof updateAppealStatusSchema>;
