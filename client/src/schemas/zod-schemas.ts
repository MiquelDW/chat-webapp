// Zod is a TypeScript-first validation library that allows you to define schemas for your data and then validate that data against those schemas. It is often used to validate form data, API responses, or any kind of input that needs to adhere to a specific structure
import * as z from "zod";

export const addFriendFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field can't be empty" })
    .email({ message: "Please enter a valid email" }),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, { message: "This field can't be empty" }),
});

export const createGroupFormSchema = z.object({
  name: z.string().min(1, { message: "This field can't be empty" }),
  members: z
    .string()
    .array()
    .min(1, { message: "You must select at least 1 friend" }),
});
