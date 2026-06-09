import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui class merge helper. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an IDR amount as a compact, idiomatic string e.g. "Rp 17.000". */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Short form used on chips: 17000 -> "17rb", 40000 -> "40rb". */
export function formatRibu(amount: number): string {
  if (amount >= 1000) return `${Math.round(amount / 1000)}rb`;
  return `${amount}`;
}
