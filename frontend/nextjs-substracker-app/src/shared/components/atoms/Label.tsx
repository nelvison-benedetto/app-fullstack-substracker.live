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

/*tailwind classes:
//a peer is an element that is a sibling of the current element (in this case, the input that the label is associated with)
peer-disabled:cursor-not-allowed  //if the input (peer) is disabled: THIS label cursor becomes 🚫
peer-disabled:opacity-70          //label becomes slightly faded
*/