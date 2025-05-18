import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import { getThreshold } from "./utility";

const MIN_VALUE = 0.001;
const MAX_VALUE = 5000;

function printMillions(mil: number) {
  if (mil >= 1) {
    return `${mil}M`;
  }
  if (mil >= 0 && mil < 1) {
    return `${mil * 1000}k`;
  }
}

type Props = {
  numbers: number[];
  setNumbers: (numbers: number[]) => void;
};

export default function ViewsMilestones({ numbers, setNumbers }: Props) {
  const [inputValue, setInputValue] = useState("");

  const addNumber = () => {
    const parsed = parseFloat(inputValue.trim());
    if (
      !isNaN(parsed) &&
      !numbers.includes(parsed) &&
      parsed > MIN_VALUE &&
      parsed < MAX_VALUE
    ) {
      const newNumbers = [...numbers, parsed].toSorted((a, b) => a - b);
      setNumbers(newNumbers);
      setInputValue("");
    }
  };

  const removeNumber = (num: number) => {
    setNumbers(numbers.filter((n) => n !== num));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addNumber();
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex gap-2">
        <input
          type="number"
          min={MIN_VALUE}
          max={MAX_VALUE}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Millió"
          className={clsx(
            "bg-gray-50 border border-gray-300 px-2 py-1 text-sm w-24 rounded",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "dark:bg-gray-200 dark:text-slate-700 dark:border-slate-500 dark:placeholder:text-slate-400"
          )}
        />
        <Button onClick={addNumber}>Hozzáad</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {numbers.map((num) => (
          <div
            key={num}
            className={clsx(
              "px-1.5 py-0.5 h-6 text-xs rounded-md shadow whitespace-nowrap box-border border border-solid hover:cursor-pointer border-slate-700 bg-transparent hover:line-through decoration-2",
              "hover:bg-slate-100 dark:hover:bg-slate-600 dark:border-slate-600"
            )}
            onClick={() => removeNumber(num)}
          >
            {printMillions(num)} (
            {printMillions(getThreshold(num * 1000000) / 1000000)})
          </div>
        ))}
      </div>
    </div>
  );
}
