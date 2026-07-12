import { z } from "zod";

export const AssetConditionEnum = z.enum(["New", "Good", "Fair", "Poor", "Damaged"]);

export const BaseAssetSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional().nullable(),
  acquisitionDate: z.string().or(z.date()).transform(val => new Date(val)),
  acquisitionCost: z.number().min(0, "Cost must be a positive number"),
  condition: AssetConditionEnum,
  location: z.string().min(1, "Location is required").trim(),
  isBookable: z.boolean().default(false),
});

export const UpdateAssetSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  condition: AssetConditionEnum,
  location: z.string().min(1, "Location is required").trim(),
  // customFieldValues built dynamically
});

export function buildCustomFieldSchema(categoryFields: Array<{ fieldName: string; fieldType: string; required: boolean }>) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of categoryFields) {
    let fieldSchema: z.ZodTypeAny;

    if (field.fieldType === "number") {
      fieldSchema = field.required 
        ? z.string().min(1, "Required").refine(val => !isNaN(Number(val)), "Must be a number")
        : z.string().refine(val => !val || !isNaN(Number(val)), "Must be a number").optional();
    } else if (field.fieldType === "date") {
      fieldSchema = field.required
        ? z.string().min(1, "Required").refine(val => !isNaN(Date.parse(val)), "Must be a valid date")
        : z.string().refine(val => !val || !isNaN(Date.parse(val)), "Must be a valid date").optional();
    } else {
      fieldSchema = field.required ? z.string().min(1, "Required").trim() : z.string().trim().optional();
    }

    shape[field.fieldName] = fieldSchema;
  }

  return z.object(shape);
}

// Helper to create the full registration schema dynamically
export function buildRegistrationSchema(categoryFields: Array<{ fieldName: string; fieldType: string; required: boolean }>) {
  return BaseAssetSchema.extend({
    customFieldValues: buildCustomFieldSchema(categoryFields)
  });
}

// Helper to create the full update schema dynamically
export function buildFullUpdateSchema(categoryFields: Array<{ fieldName: string; fieldType: string; required: boolean }>) {
  return UpdateAssetSchema.extend({
    customFieldValues: buildCustomFieldSchema(categoryFields)
  });
}