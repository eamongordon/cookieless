import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Work_Sans } from 'next/font/google'

const workSans = Work_Sans({ subsets: ['latin'] });
export const workSansClassName = workSans.className;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}