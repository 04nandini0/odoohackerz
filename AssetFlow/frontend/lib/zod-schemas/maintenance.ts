import { z } from "zod";

export const MaintenancePriorityEnum = z.enum(["Low", "Medium", "High", "Critical"]);
export const MaintenanceStatusEnum = z.enum(["Pending", "Approved", "Rejected", "TechnicianAssigned", "InProgress", "Resolved"]);

export const CreateMaintenanceRequestSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  issue: z.string().min(5, "Issue description must be at least 5 characters"),
  priority: MaintenancePriorityEnum.default("Medium"),
  photoUrls: z.array(z.string()).optional()
});

export const RejectMaintenanceRequestSchema = z.object({
  rejectionReason: z.string().min(3, "Rejection reason is required")
});

export const AssignTechnicianSchema = z.object({
  technicianId: z.string().min(1, "Technician is required")
});

export const ResolveMaintenanceSchema = z.object({
  resolutionNotes: z.string().min(5, "Resolution notes must be at least 5 characters")
});
