const base = "cursor-pointer font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50";

export const variants: Record<string, string> = {
  default: `${base} bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-700 dark:hover:bg-gray-200`,
  outline: `${base} border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800`,
  ghost:   `${base} rounded-md hover:bg-gray-100 dark:hover:bg-gray-800`,
  danger:  `${base} bg-red-500 text-white rounded-md hover:bg-red-600 dark:hover:bg-red-600`,
};

export const sizes: Record<string, string> = {
  xs:   "text-xs px-2 py-1",
  sm:   "text-sm px-3 py-1.5",
  base: "text-base px-4 py-2",
  lg:   "text-lg px-5 py-2.5",
};