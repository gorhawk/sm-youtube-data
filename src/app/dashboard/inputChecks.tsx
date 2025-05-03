import Spinner from "./Spinner";

export enum CheckState {
  Idle,
  Checking,
  Valid,
  Invalid,
}

export const CheckStateMap = {
  [CheckState.Idle]: { class: "text-gray-400", content: "n/a" },
  [CheckState.Checking]: { class: "text-slate-500", content: <Spinner /> },
  [CheckState.Valid]: { class: "text-green-600", content: "✔" },
  [CheckState.Invalid]: { class: "text-red-600", content: "invalid ✕" },
};
