type SeparatorProps = {
  className?: string;
};

export default function Separator({ className }: SeparatorProps) {
  return <hr className={`border-gray-200 dark:border-gray-800 ${className ?? "my-4"}`} />;
}
