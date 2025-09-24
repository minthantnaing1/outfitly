"use client";
import { useEffect, useMemo, useState } from "react";
import wardrobeData from "../data/wardrobe_data.json";
import Link from "next/link";

const LS_KEY = "wardrobe_user_items_v1";

// helpers for localStorage (client only)
function loadUserItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveUserItems(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}
function removeUserItem(id) {
  const items = loadUserItems().filter((it) => it.id !== id);
  saveUserItems(items);
  return items;
}

export default function WardrobePage() {
  // base items + user items
  const [base] = useState(wardrobeData);
  const [userItems, setUserItems] = useState([]);

  // keep your existing 'items' for all UI & generator
  const items = useMemo(() => [...base, ...userItems], [base, userItems]);

  const [form, setForm] = useState({
    weather: "",
    occasion: "",
    mood: "",
    k: 3,
  });

  const [outfits, setOutfits] = useState([]);

  // ---------- NEW: load user items once on mount ----------
  useEffect(() => {
    setUserItems(loadUserItems());
  }, []);

  // ---------- unchanged: your existing handlers ----------
  const handleDelete = (id) => {
    // If it's a user-added item, also remove from localStorage
    const wasUser = userItems.some((u) => u.id === id);
    if (wasUser) {
      const updated = removeUserItem(id);
      setUserItems(updated);
    } else {
      // base items can't be persisted deleted (will come back on refresh),
      // but we still hide them in the current view by filtering from base.
      // To avoid mutating your imported JSON, we just shadow-hide via state.
      // (Lightweight: maintain a hidden set)
      setHiddenBase((prev) => new Set([...prev, id]));
    }
  };

  const [hiddenBase, setHiddenBase] = useState(new Set());
  const visibleItems = useMemo(() => {
    if (hiddenBase.size === 0) return items;
    return items.filter((it) => !hiddenBase.has(it.id));
  }, [items, hiddenBase]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "k" ? parseInt(e.target.value) : e.target.value,
    }));
  };

  const generateOutfits = () => {
    const tops = visibleItems.filter((item) => item.type === "Top");
    const bottoms = visibleItems.filter((item) => item.type === "Bottom");
    const shoes = visibleItems.filter((item) => item.type === "Shoes");

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

  // ---------- NEW: uploader state & handlers ----------
  const [uForm, setUForm] = useState({
    type: "Top", // Top | Bottom | Shoes
    color: "",
    tagsCsv: "",
    imageFile: null,
  });
  const [uploadBusy, setUploadBusy] = useState(false);
  const [preview, setPreview] = useState(null);

  function onUChange(e) {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      const file = files?.[0] || null;
      setUForm((p) => ({ ...p, imageFile: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setUForm((p) => ({ ...p, [name]: value }));
    }
  }

  function csvToTags(csv) {
    return csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!uForm.imageFile) return alert("Please choose an image.");
    setUploadBusy(true);
    try {
      const dataURL = await fileToDataURL(uForm.imageFile);
      const newItem = {
        id: `user-${crypto?.randomUUID?.() || Date.now()}`,
        type: uForm.type, // "Top" | "Bottom" | "Shoes"
        color: uForm.color || "",
        tags: csvToTags(uForm.tagsCsv), // array of strings
        image: dataURL, // base64 data URL
        source: "user",
      };
      const updated = [newItem, ...loadUserItems()];
      saveUserItems(updated);
      setUserItems(updated);

      // reset
      setUForm({ type: "Top", color: "", tagsCsv: "", imageFile: null });
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to read image.");
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="flex items-center justify-between">
            {/* Back button - left aligned */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <span className="text-lg">←</span> Back
            </Link>

            {/* Title - centered with flex-grow trick */}
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 text-center">
              Outfitly <span className="text-pink-600">Wardrobe</span>
            </h1>
          </div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto bg-pink-50 p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {" "}
          Get Outfit Suggestions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select
            name="weather"
            value={form.weather}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Weather</option>
            <option value="Summer">Summer</option>
            <option value="Winter">Winter</option>
            <option value="Rainy">Rainy</option>
            <option value="Cold">Cold</option>
            <option value="Warm">Warm</option>
          </select>

          <select
            name="occasion"
            value={form.occasion}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Occasion</option>
            <option value="Casual">Casual</option>
            <option value="Party">Party</option>
            <option value="Formal">Formal</option>
            <option value="Date">Date</option>
          </select>

          <select
            name="mood"
            value={form.mood}
            onChange={handleChange}
            className="border p-2 rounded"
          >
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
          <h2 className="text-2xl font-semibold text-center mb-6 text-pink-600">
            {" "}
            Suggested Outfits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {outfits.map((set, i) => (
              <div key={i} className="border rounded p-4 shadow-md">
                <p className="mb-2 font-semibold">
                  Outfit #{i + 1} (Score: {set.score})
                </p>
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

      {/* NEW: UPLOAD FORM */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-center mb-4 text-pink-600">
          ➕ Add New Wardrobe Item
        </h2>
        <form
          onSubmit={handleUpload}
          className="border rounded-lg p-4 shadow-sm bg-white grid gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              name="type"
              value={uForm.type}
              onChange={onUChange}
              className="border p-2 rounded"
            >
              <option value="Top">Top</option>
              <option value="Bottom">Bottom</option>
              <option value="Shoes">Shoes</option>
            </select>
            <input
              name="color"
              value={uForm.color}
              onChange={onUChange}
              className="border p-2 rounded"
              placeholder="Color (e.g., Pink)"
            />
            <input
              name="tagsCsv"
              value={uForm.tagsCsv}
              onChange={onUChange}
              className="border p-2 rounded"
              placeholder="Tags CSV (e.g., Summer,Casual,Happy)"
            />
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              onChange={onUChange}
              className="border p-2 rounded"
            />
          </div>

          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="preview"
                className="h-28 w-28 object-cover rounded border"
              />
            </div>
          )}

          <button
            disabled={uploadBusy}
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 w-full sm:w-auto"
            type="submit"
          >
            {uploadBusy ? "Saving..." : "Add Item"}
          </button>
          <p className="text-xs text-gray-500">
            Your uploads are saved locally in your browser and merged with the JSON
            items when the page loads.
          </p>
        </form>
      </div>

      {/* CURRENT WARDROBE DISPLAY */}
      <h2 className="text-2xl font-semibold text-center mb-6 text-pink-600">
        🚪 My Wardrobe
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {visibleItems.map((item) => (
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
