import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Rethink_Sans } from 'next/font/google'

const rethinkSans = Rethink_Sans({ subsets: ['latin'] });
export const rethinkSansClassName = rethinkSans.className;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}