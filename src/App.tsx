import { useEffect, useState } from "react";
import data from "./data/commanders.json";

type Card = {
  name: string;
  colors: string[];
  manaValue: number;
  types: string[];
};

type Feedback = {
  name: boolean;
  colors: "correct" | "partial" | "wrong";
  mana: "correct" | "higher" | "lower";
  types: "correct" | "partial" | "wrong";
};

function compareCards(guess: Card, target: Card): Feedback {
  const colorMatch =
    JSON.stringify(guess.colors.sort()) ===
    JSON.stringify(target.colors.sort());

  const partialColor =
    guess.colors.some((c) => target.colors.includes(c)) && !colorMatch;

  const manaValueMatch = guess.manaValue === target.manaValue;

  const manaValueHigher = guess.manaValue > target.manaValue;

  const typeMatch = guess.types.join() === target.types.join();

  const partialType =
    guess.types.some((t) => target.types.includes(t)) && !typeMatch;

  return {
    name: guess.name === target.name,
    colors: colorMatch ? "correct" : partialColor ? "partial" : "wrong",
    mana: manaValueMatch ? "correct" : manaValueHigher ? "higher" : "lower",
    types: typeMatch ? "correct" : partialType ? "partial" : "wrong",
  };
}

export default function App() {
  const [target, setTarget] = useState<Card | null>(null);
  const [guessInput, setGuessInput] = useState("");
  const [guesses, setGuesses] = useState<
    { card: Card; feedback: Feedback }[]
  >([]);

  useEffect(() => {
    const random = data[Math.floor(Math.random() * data.length)];
    setTarget(random);
    console.log("TARGET:", random);
  }, []);

  function handleGuess() {
    if (!target) return;

    const found = data.find(
      (c) => c.name.toLowerCase() === guessInput.toLowerCase()
    );

    if (!found) return;

    const feedback = compareCards(found, target);

    setGuesses([{ card: found, feedback }, ...guesses]);
    setGuessInput("");
  }

  function getColorClass(state: string) {
    if (state === "correct") return "bg-green-500";
    if (state === "partial") return "bg-yellow-500";
    return "bg-gray-500";
  }

  function getManaClass(state: string) {
    if (state === "correct") return "bg-green-500";
    return "bg-gray-700";
  }

  function getManaDisplay(state: string, value: number) {
    if (state === "higher") return `⬇ ${value}`;
    if (state === "lower") return `⬆ ${value}`;
    return value;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Guess the Commander</h1>

      {/* INPUT */}
      <div className="mb-6">
        <input
          className="p-2 text-white w-64"
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
          placeholder="Enter commander..."
        />
        <button
          onClick={handleGuess}
          className="ml-2 px-4 py-2 bg-blue-600"
        >
          Guess
        </button>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-4 gap-2 font-bold mb-2">
        <div>Name</div>
        <div>Colors</div>
        <div>Mana</div>
        <div>Type</div>
      </div>

      {/* GUESSES */}
      {guesses.map((g, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          <div
            className={`p-2 ${g.feedback.name ? "bg-green-500" : "bg-gray-700"}`}
          >
            {g.card.name}
          </div>

          <div className={`p-2 ${getColorClass(g.feedback.colors)}`}>
            {g.card.colors.join(",")}
          </div>

          <div className={`p-2 ${getManaClass(g.feedback.mana)}`}>
            {getManaDisplay(g.feedback.mana, g.card.manaValue)}
          </div>

          <div className={`p-2 ${getColorClass(g.feedback.types)}`}>
            {g.card.types.join(",")}
          </div>
        </div>
      ))}
    </div>
  );
}
