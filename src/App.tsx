import { useEffect, useState } from "react";
import type { Card } from "./types/card";
import data from "./data/commanders";
import SearchInput from "./components/SearchInput";

const MAX_GUESSES = 7;

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
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [target, setTarget] = useState<Card | null>(null);
  const [guessInput, setGuessInput] = useState("");
  const [guesses, setGuesses] = useState<
    { card: Card; feedback: Feedback }[]
  >([]);

  function handleSelect(card: Card) {
    if (!target || gameStatus !== "playing") return;

    const feedback = compareCards(card, target);

    const newGuesses = [{ card, feedback }, ...guesses];
    setGuesses(newGuesses);

    if (card.name === target.name) {
      setGameStatus("won");
    }

    if (newGuesses.length >= MAX_GUESSES && card.name !== target.name) {
      setGameStatus("lost");
    }

    setGuessInput("");
  }

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

  function resetGame() {
    const random = data[Math.floor(Math.random() * data.length)];
    setTarget(random);
    setGuesses([]);
    setGuessInput("");
    setGameStatus("playing");
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
      {/* GUESS COUNTER */}
      <div className="mb-4 text-sm text-gray-300">
          Guesses: {guesses.length} / {MAX_GUESSES}
      </div>
      <div className="w-64 h-2 bg-gray-700 mb-4">
        <div
          className="h-2 bg-blue-500"
          style={{ width: `${(guesses.length / MAX_GUESSES) * 100}%` }}
        />
      </div>

      {/* INPUT */}
      <SearchInput
        data={data}
        value={guessInput}
        onChange={setGuessInput}
        onSelect={handleSelect}
        disabled={gameStatus !== "playing"}
      />

      {/* WON/LOST/AGAIN */}
      {gameStatus === "won" && (
        <div className="mb-4 text-green-400 font-bold">
          You guessed correctly!
        </div>
      )}

      {gameStatus === "lost" && target && (
        <div className="mb-4 text-red-400 font-bold">
          You lost! The correct answer was: {target.name}
        </div>
      )}

      {gameStatus !== "playing" && (
        <button
          onClick={resetGame}
          className="mb-4 px-4 py-2 bg-purple-600 text-white"
        >
          Play Again
        </button>
      )}

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
