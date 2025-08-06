"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch("/wardrobe_named.json")
      .then((res) => res.json())
      .then((data) => setWardrobe(data));
  }, []);

  const tagVector = (selectedTags) => {
    return allTags.map((tag) =>
      selectedTags.includes(tag.toLowerCase()) ? 1 : 0
    );
  };

  const generateOutfits = () => {
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
          const combinedTags = [...top.style, ...bottom.style, ...shoe.style];
          const comboVector = tagVector(combinedTags);
          const score = cosineSimilarity(userVector, comboVector);
          combinations.push({ top, bottom, shoes: shoe, score });
        }
      }
    }

    const sorted = combinations.sort((a, b) => b.score - a.score);
    setSuggestions(sorted.slice(0, Number(k)));
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        AI Outfit Recommender (KNN-style)
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Weather</label>
          <select
            className="w-full p-2 border rounded"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
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
            onChange={(e) => setOccasion(e.target.value)}
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
            onChange={(e) => setMood(e.target.value)}
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
            onChange={(e) => setK(e.target.value)}
            min={1}
            max={50}
          />
        </div>
      </div>

      <button
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 mb-6"
        onClick={generateOutfits}
      >
        Generate Outfit Suggestions
      </button>

      {suggestions.length > 0 && (
        <div>
          {suggestions.map((sug, index) => (
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
                  <strong>👟 Shoes:</strong> {sug.shoes.name} ({sug.shoes.color}
                  )
                </li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
