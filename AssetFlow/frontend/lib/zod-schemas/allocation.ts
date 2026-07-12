import { z } from "zod";

export const CreateAllocationSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  holderId: z.string().min(1, "Holder ID is required"),
  holderType: z.enum(["Employee", "Department"]),
  expectedReturnDate: z.string().optional().nullable(),
});

export const ReturnAllocationSchema = z.object({
  checkInNotes: z.string().optional(),
  checkInCondition: z.enum(["New", "Good", "Fair", "Poor", "Damaged"]),
});

export const CreateTransferSchema = z.object({
  allocationId: z.string().min(1, "Allocation ID is required"),
  toHolderId: z.string().min(1, "New Holder ID is required"),
  toHolderType: z.enum(["Employee", "Department"]),
});

export const RejectTransferSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});