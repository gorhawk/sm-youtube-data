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
        !isActive && "bg-white text-slate-700 hover:bg-slate-100",
        isActive && "bg-slate-700 text-white hover:bg-slate-600"
      )}
      onClick={onClick}
    >
      {title}
    </button>
  );
}
