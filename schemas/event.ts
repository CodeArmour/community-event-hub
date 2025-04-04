import * as z from "zod";

export const EventSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  date: z.string().min(1, {
    message: "Date is required",
  }),
  time: z.string().min(1, {
    message: "Time is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
  image: z.string().optional(),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  capacity: z.coerce.number().min(1, {
    message: "Capacity must be at least 1",
  }),
});