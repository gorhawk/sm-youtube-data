import Spinner from "./Spinner";

export enum CheckState {
  Idle,
  Checking,
  Valid,
  Invalid,
}

export const CheckStateMap = {
  [CheckState.Idle]: {
    class: "text-gray-400 dark:text-gray-500",
    content: "n/a",
  },
  [CheckState.Checking]: {
    class: "text-slate-500 dark:text-slate-400",
    content: <Spinner />,
  },
  [CheckState.Valid]: {
    class: "text-green-600 dark: text-teal-500",
    content: "✔",
  },
  [CheckState.Invalid]: {
    class: "text-red-600 dark:text-red-500",
    content: "invalid ✕",
  },
};
