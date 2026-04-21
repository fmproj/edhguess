import { useState, useRef, useEffect } from "react";
import type { Card } from "../types/card";

type Props = {
  data: Card[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (card: Card) => void;
  disabled?: boolean;
  guessed: string[];
};

export default function SearchInput({
  data,
  value,
  onChange,
  onSelect,
  disabled,
  guessed,
}: Props) {
  const [highlightIndex, setHighlightIndex] = useState(0);

  // refs for scrolling
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const guessedSet = new Set(guessed.map((g) => g.toLowerCase()));

  const filtered = data
    .filter((card) =>
      card.name.toLowerCase().includes(value.toLowerCase())
    )
    .filter((card) => !guessedSet.has(card.name.toLowerCase()));

  // scroll highlighted item into view
  useEffect(() => {
    const el = itemRefs.current[highlightIndex];
    if (el) {
      el.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightIndex]);

  // prevent index going out of bounds when filtering changes
  useEffect(() => {
    if (highlightIndex >= filtered.length) {
      setHighlightIndex(0);
    }
  }, [filtered.length, highlightIndex]);

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
      // ❗ prevent Enter when input is empty
      if (!value.trim()) return;

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
        disabled={disabled}
      />

      {value && filtered.length > 0 && (
        <div className="absolute w-full bg-black text-white border mt-1 max-h-48 overflow-y-auto z-10 rounded shadow">
          {filtered.map((card, index) => (
            <div
              key={card.name}
              ref={(el) => (itemRefs.current[index] = el)}
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
