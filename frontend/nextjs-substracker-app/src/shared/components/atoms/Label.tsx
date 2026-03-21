import { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={`text-sm font-medium leading-none text-gray-700 dark:text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className ?? ""}`}
    >
      {children}
    </label>
  );
}
