"use client";
import { useState } from "react";
import wardrobeData from "../data/wardrobe_data.json";

export default function WardrobePage() {
  const [items, setItems] = useState(wardrobeData);

  const [form, setForm] = useState({
    weather: "",
    occasion: "",
    mood: "",
    k: 3,
  });

  const [outfits, setOutfits] = useState([]);

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.name === "k" ? parseInt(e.target.value) : e.target.value,
    }));
  };

  const generateOutfits = () => {
    const tops = items.filter((item) => item.type === "Top");
    const bottoms = items.filter((item) => item.type === "Bottom");
    const shoes = items.filter((item) => item.type === "Shoes");

    const combinations = [];

    for (const t of tops) {
      for (const b of bottoms) {
        for (const s of shoes) {
          let score = 0;
          [t, b, s].forEach((piece) => {
            if (piece.tags.includes(form.weather)) score++;
            if (piece.tags.includes(form.occasion)) score++;
            if (piece.tags.includes(form.mood)) score++;
          });
          combinations.push({ top: t, bottom: b, shoes: s, score });
        }
      }
    }

    const sorted = combinations.sort((a, b) => b.score - a.score);
    setOutfits(sorted.slice(0, form.k));
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
        Wardrobe Suggestion
        
      </h1>

      {/* FORM */}
      <div className="max-w-3xl mx-auto bg-pink-50 p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4 text-center"> Get Outfit Suggestions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select name="weather" value={form.weather} onChange={handleChange} className="border p-2 rounded">
            <option value="">Select Weather</option>
            <option value="Summer">Summer</option>
            <option value="Winter">Winter</option>
            <option value="Rainy">Rainy</option>
            <option value="Cold">Cold</option>
            <option value="Warm">Warm</option>
          </select>

          <select name="occasion" value={form.occasion} onChange={handleChange} className="border p-2 rounded">
            <option value="">Select Occasion</option>
            <option value="Casual">Casual</option>
            <option value="Party">Party</option>
            <option value="Formal">Formal</option>
            <option value="Date">Date</option>
          </select>

          <select name="mood" value={form.mood} onChange={handleChange} className="border p-2 rounded">
            <option value="">Select Mood</option>
            <option value="Happy">Happy</option>
            <option value="Active">Active</option>
            <option value="Cool">Cool</option>
          </select>

          <input
            name="k"
            type="number"
            min={1}
            value={form.k}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Number of outfits"
          />
        </div>
        <button
          onClick={generateOutfits}
          className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 w-full"
        >
          Generate Outfits
        </button>
      </div>

      {/* OUTFIT SUGGESTIONS */}
      {outfits.length > 0 && (
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6 text-pink-600"> Suggested Outfits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {outfits.map((set, i) => (
              <div key={i} className="border rounded p-4 shadow-md">
                <p className="mb-2 font-semibold">Outfit #{i + 1} (Score: {set.score})</p>
                <div className="flex justify-around">
                  {[set.top, set.bottom, set.shoes].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <img
                        src={item.image}
                        alt={item.type}
                        className="w-[80px] h-[100px] object-cover mb-1"
                      />
                      <span className="font-medium">{item.type}</span>
                      <span className="text-sm text-gray-500">{item.color}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CURRENT WARDROBE DISPLAY */}
      <h2 className="text-2xl font-semibold text-center mb-6 text-pink-600">🚪 My Wardrobe</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 shadow-sm flex flex-col items-center"
          >
            <img
              src={item.image}
              alt={item.type}
              className="w-[120px] h-[140px] object-cover rounded mb-2"
            />
            <p className="font-semibold">{item.type}</p>
            <p className="text-sm text-gray-500">{item.color}</p>
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <button
                className="text-red-500 hover:underline"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
              <button className="text-blue-500 hover:underline">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
