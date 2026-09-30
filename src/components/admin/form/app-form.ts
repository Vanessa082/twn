import { createFormHook } from "@tanstack/react-form";
import { ImageField, TextField, VisibilityField } from "./fields";
import { fieldContext, formContext } from "./form-context";
import { SaveBar } from "./form-parts";

/**
 * The admin's form kit. Every dashboard form gets the same pre-bound fields
 * (labels, errors, counters) and the same save bar from here.
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, ImageField, VisibilityField },
  formComponents: { SaveBar },
});
