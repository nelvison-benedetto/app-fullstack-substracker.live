import { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      {...props}
      className={`text-gray-700 dark:text-gray-300 ${className ?? ""}`}
    >
      {children}
    </label>
  );
}