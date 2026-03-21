import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ type = "text", className, ...props }: InputProps) {
  const base =
    "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

  const styles = {
    checkbox: `${base} h-4 w-4 rounded border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900`,
    file: `${base} w-full text-sm text-gray-700 dark:text-gray-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground`,
    default: `${base} w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500`,
  };

  const style =
    type === "checkbox" ? styles.checkbox : type === "file" ? styles.file : styles.default;

  return <input type={type} {...props} className={`${style} ${className ?? ""}`} />;
}
