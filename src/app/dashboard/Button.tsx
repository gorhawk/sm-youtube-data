import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type Props = {} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  className,
  ...additionalButtonProps
}: Props) {
  return (
    <button
      className={clsx(
        "px-4 py-1 bg-slate-700 text-white text-sm font-bold rounded-md shadow border-2 border-solid border-slate-700 whitespace-nowrap",
        "hover:cursor-pointer hover:bg-slate-600 hover:border-slate-600",
        "dark:bg-slate-300 dark:text-slate-700 dark:border-slate-300 dark:hover:bg-slate-100 dark:hover:border-slate-100",

        className
      )}
      {...additionalButtonProps}
    >
      {children}
    </button>
  );
}
