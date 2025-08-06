"use client";
import { useEffect, useState, useRef } from "react";
import cosineSimilarity from "compute-cosine-similarity";

const allTags = [
  "hot",
  "cold",
  "rainy",
  "casual",
  "formal",
  "party",
  "minimal",
  "bold",
  "neutral",
];

export default function Recommend() {
  const [wardrobe, setWardrobe] = useState([]);
  const [weather, setWeather] = useState("Cold");
  const [occasion, setOccasion] = useState("Formal");
  const [mood, setMood] = useState("Bold");
  const [k, setK] = useState(3);
  const [suggestions, setSuggestions] = useState([]);
  const [baseCombos, setBaseCombos] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const lastInputRef = useRef("");

  useEffect(() => {
    fetch("/wardrobe_named.json")
      .then((res) => res.json())
      .then((data) => setWardrobe(data));
  }, []);

  const tagVector = (tags) =>
    allTags.map((tag) => (tags.includes(tag.toLowerCase()) ? 1 : 0));

  const getInputKey = () => `${weather}-${occasion}-${mood}-${k}`;

  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateOrReshuffle = () => {
    const inputKey = getInputKey();

    // If input is the same, reshuffle
    if (inputKey === lastInputRef.current && baseCombos.length > 0) {
      setSuggestions(shuffle(baseCombos).slice(0, Number(k)));
    } else {
      // New input: regenerate
      const userTags = [
        weather.toLowerCase(),
        occasion.toLowerCase(),
        mood.toLowerCase(),
      ];
      const userVector = tagVector(userTags);

      const tops = wardrobe.filter((i) => i.type === "top");
      const bottoms = wardrobe.filter((i) => i.type === "bottom");
      const shoes = wardrobe.filter((i) => i.type === "shoes");

      const combinations = [];

      for (const top of tops) {
        for (const bottom of bottoms) {
          for (const shoe of shoes) {
            const comboTags = [...top.style, ...bottom.style, ...shoe.style];
            const comboVector = tagVector(comboTags);
            const score =
              cosineSimilarity(userVector, comboVector) + Math.random() * 0.001;
            combinations.push({ top, bottom, shoes: shoe, score });
          }
        }
      }

      const sorted = combinations.sort((a, b) => b.score - a.score);
      const topCombos = sorted.slice(0, 30);

      setBaseCombos(topCombos);
      setSuggestions(shuffle(topCombos).slice(0, Number(k)));
      lastInputRef.current = inputKey;
    }

    setHasGenerated(true);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setHasGenerated(false); // Reset button text
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Outfit Recommender</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Weather</label>
          <select
            className="w-full p-2 border rounded"
            value={weather}
            onChange={handleInputChange(setWeather)}
          >
            <option>Hot</option>
            <option>Cold</option>
            <option>Rainy</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Occasion</label>
          <select
            className="w-full p-2 border rounded"
            value={occasion}
            onChange={handleInputChange(setOccasion)}
          >
            <option>Casual</option>
            <option>Formal</option>
            <option>Party</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Mood</label>
          <select
            className="w-full p-2 border rounded"
            value={mood}
            onChange={handleInputChange(setMood)}
          >
            <option>Minimal</option>
            <option>Bold</option>
            <option>Neutral</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Number of Suggestions
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={k}
            onChange={handleInputChange(setK)}
            min={1}
            max={50}
          />
        </div>
      </div>

      <div className="flex justify-start mb-6">
        <button
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          onClick={generateOrReshuffle}
        >
          {hasGenerated
            ? "Not My Style – Suggest Another"
            : "Generate Outfit Suggestions"}
        </button>
      </div>

      {suggestions.length > 0 &&
        suggestions.map((sug, index) => (
          <div key={index} className="mb-6 border p-4 rounded shadow">
            <h2 className="font-semibold text-lg mb-2">
              Suggestion #{index + 1} (Score: {sug.score.toFixed(3)})
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>🧥 Top:</strong> {sug.top.name} ({sug.top.color})
              </li>
              <li>
                <strong>👖 Bottom:</strong> {sug.bottom.name} (
                {sug.bottom.color})
              </li>
              <li>
                <strong>👟 Shoes:</strong> {sug.shoes.name} ({sug.shoes.color})
              </li>
            </ul>
          </div>
        ))}
    </main>
  );
}
