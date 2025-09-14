import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toUTCISOString(dateStr: string, timeStr: string) {
  if (!dateStr || !timeStr) return "";
  const dateParts = dateStr.split("-");
  const timeParts = timeStr.split(":");
  if (dateParts.length !== 3 || timeParts.length !== 2) return "";
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);
  const hour = Number(timeParts[0]);
  const minute = Number(timeParts[1]);
  if ([year, month, day, hour, minute].some(isNaN)) return "";
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return d.toISOString();
}
