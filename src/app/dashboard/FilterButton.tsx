import clsx from "clsx";

type FilterButtonProps = {
  title: string;
  onClick: any;
  isActive?: boolean;
};

export function FilterButton({ title, onClick, isActive }: FilterButtonProps) {
  return (
    <button
      className={clsx(
        "px-1.5 py-0.5 h-6 text-xs rounded-md shadow whitespace-nowrap hover:cursor-pointer box-border border border-solid border-slate-700",
        !isActive &&
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-600 dark:border-slate-600",
        isActive &&
          "bg-slate-700 text-white hover:bg-slate-600 dark:bg-slate-300 dark:text-slate-700 dark:border-slate-300 dark:hover:bg-slate-400 dark:hover:border-slate-400"
      )}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
