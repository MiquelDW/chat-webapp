// clsx is a utility for constructing className strings conditionally. It takes in various arguments (which can be strings, objects, arrays, etc.) and combines them into a single string of class names
// clsx(inputs): Combines the class names from 'inputs' into a single string
import { clsx, type ClassValue } from "clsx";
// twMerge ensures that later classes in the list take precedence over the earlier ones when there are tailwind classname conflicts
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(num: number) {
  // Create a Date object from the milliseconds timestamp
  const date = new Date(num);

  // Extract hours and minutes from the Date object
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Format hours and minutes with leading zeros if necessary
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  // Return the formatted time in HH:MM format
  return `${formattedHours}:${formattedMinutes}`;
}