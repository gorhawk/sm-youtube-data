import clsx from "clsx";
import { InputHTMLAttributes } from "react";

type Props = {} & InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({
  type,
  className,
  ...additionalInputProps
}: Props) {
  return (
    <input
      type="text"
      className={clsx(
        "bg-gray-50 border border-gray-300 px-2 py-1 text-sm w-full rounded",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "dark:bg-gray-200 dark:text-slate-700 dark:border-slate-500 dark:placeholder:text-slate-400",
        className
      )}
      {...additionalInputProps}
    />
  );
}
