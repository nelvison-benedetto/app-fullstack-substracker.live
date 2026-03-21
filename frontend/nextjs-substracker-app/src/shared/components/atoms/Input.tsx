import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  type = "text",
  className,
  ...props
}: InputProps) {

  const styles = {
    checkbox:
      "rounded border-gray-300 text-gray-700 bg-white dark:bg-gray-950 dark:text-gray-500 shadow-sm",
    file: 'file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:opacity-50 file:dark:text-gray-400',
    default:
      "w-full rounded-md shadow-sm border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-950",
  };

  const baseStyle = type === "checkbox" ? styles.checkbox : styles.default;

  return (
    <input
      type={type}
      {...props}
      className={`${baseStyle} ${className ?? ""}`}
    />
  );
}