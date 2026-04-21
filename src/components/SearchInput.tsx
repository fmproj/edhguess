import { useState } from "react";
import type { Card } from "../types/card";

type Props = {
  data: Card[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (card: Card) => void;
};

export default function SearchInput({
  data,
  value,
  onChange,
  onSelect,
}: Props) {
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filtered = data
    .filter((card) =>
      card.name.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 5);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      // Case 1: dropdown selection
      if (filtered.length > 0) {
        const selected = filtered[highlightIndex];
        if (selected) {
          onSelect(selected);
          setHighlightIndex(0);
          return;
        }
      }

      // Case 2: exact match
      const exact = data.find(
        (card) =>
          card.name.toLowerCase() === value.trim().toLowerCase()
      );

      if (exact) {
        onSelect(exact);
        setHighlightIndex(0);
      }
    }
  }

  return (
    <div className="relative w-72">
      <input
        className="w-full p-2 text-white border rounded"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlightIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter commander..."
      />

      {value && filtered.length > 0 && (
        <div className="absolute w-full bg-black text-white border mt-1 max-h-48 overflow-y-auto z-10 rounded shadow">
          {filtered.map((card, index) => (
            <div
              key={card.name}
              onClick={() => onSelect(card)}
              className={`p-2 cursor-pointer ${
                index === highlightIndex
                  ? "bg-gray-500"
                  : "hover:bg-gray-500"
              }`}
            >
              {card.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
