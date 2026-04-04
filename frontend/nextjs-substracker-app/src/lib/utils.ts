import { clsx, type ClassValue } from "clsx";   //plugin installed, clsx is a utility for constructing className strings conditionally.
/*
e.g. <div className={`p-2 ${isActive ? "bg-blue-500" : ""} ${disabled && "opacity-50"}`} />  very messy!
//but w ith clsx  <div className= {clsx("p-2", isActive && "bg-blue-500", disabled && "opacity-50")} />  much cleaner and easier to read!
*/
import { twMerge } from "tailwind-merge";  //x resolver tailwindcss conflicts e.g. "p-2 p-4" which one should wins

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));  //clsx(inputs)converts all in 1 str. e.g. clsx("p-2", false, "bg-red-500") -> "p-2 bg-red-500"  then twMerge risolve i conflitti di tailwind e restituisce "p-4 bg-red-500"!!
}
