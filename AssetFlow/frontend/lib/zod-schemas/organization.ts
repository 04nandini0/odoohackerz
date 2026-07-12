import { z } from "zod";

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, "Department Name is required.").trim(),
  parentDepartmentId: z.string().optional().nullable(),
  departmentHeadId: z.string().optional().nullable(),
});

export const UpdateDepartmentSchema = CreateDepartmentSchema.extend({
  status: z.enum(["Active", "Inactive"]),
});

export const CustomFieldDefinitionSchema = z.object({
  fieldName: z.string().min(1, "Field Name is required.").trim(),
  fieldType: z.enum(["text", "number", "date"]),
  required: z.boolean(),
});

export const CreateAssetCategorySchema = z.object({
  name: z.string().min(1, "Category Name is required.").trim(),
  customFields: z.array(CustomFieldDefinitionSchema),
});

export const UpdateAssetCategorySchema = CreateAssetCategorySchema;

export const PromoteEmployeeSchema = z.object({
  newRole: z.enum(["DepartmentHead", "AssetManager"]),
});

export const UpdateEmployeeStatusSchema = z.object({
  status: z.enum(["Active", "Inactive"]),
});

export type CreateDepartmentFormValues = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentFormValues = z.infer<typeof UpdateDepartmentSchema>;
export type CreateAssetCategoryFormValues = z.infer<typeof CreateAssetCategorySchema>;
export type PromoteEmployeeFormValues = z.infer<typeof PromoteEmployeeSchema>;
