import { z } from "zod";

export const BaseBookingSchema = z.object({
  resourceAssetId: z.string().min(1, "Resource is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().optional(),
});

export const CreateBookingSchema = BaseBookingSchema.superRefine((data, ctx) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const now = new Date();

  if (start < new Date(now.getTime() - 5 * 60000)) { // 5 mins grace period
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start time cannot be in the past",
      path: ["startTime"]
    });
  }

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["endTime"]
    });
  }
});

export const RescheduleBookingSchema = z.object({
  newStartTime: z.string().min(1, "New start time is required"),
  newEndTime: z.string().min(1, "New end time is required"),
}).superRefine((data, ctx) => {
  const start = new Date(data.newStartTime);
  const end = new Date(data.newEndTime);
  const now = new Date();

  if (start < new Date(now.getTime() - 5 * 60000)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start time cannot be in the past",
      path: ["newStartTime"]
    });
  }

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["newEndTime"]
    });
  }
});