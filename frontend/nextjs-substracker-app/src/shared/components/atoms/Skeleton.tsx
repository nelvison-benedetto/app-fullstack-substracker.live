type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className ?? "h-4 w-full"}`}
    />
  );
}
{/*x gray block while is loading the content in the page*/}