import { z } from "zod";

export const NotificationTypeEnum = z.enum([
  "AssetAssigned",
  "MaintenanceApproved",
  "MaintenanceRejected",
  "BookingConfirmed",
  "BookingCancelled",
  "BookingReminder",
  "TransferApproved",
  "OverdueReturnAlert",
  "AuditDiscrepancyFlagged"
]);

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeEnum,
  message: z.string(),
  entityType: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  read: z.boolean(),
  createdAt: z.string()
});