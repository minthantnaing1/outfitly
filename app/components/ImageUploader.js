// src/components/ImageUploader.js
"use client";
import { useState } from "react";
import { addUserItem, exportUserItems, importUserItems, getUserItems } from "@/lib/wardrobeStore";

export default function ImageUploader({ onAdded }) {
  const [form, setForm] = useState({
    name: "",
    part: "top", // top | bottom | shoes
    color: "",
    tags: { weather: [], occasion: [], mood: [] }
  });
  const [filePreview, setFilePreview] = useState(null);
  const [busy, setBusy] = useState(false);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function setTagField(field, csv) {
    const arr = csv.split(",").map(s => s.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, tags: { ...prev.tags, [field]: arr } }));
  }

  async function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const file = e.target.image.files?.[0];
    if (!file) return alert("Please choose an image.");
    setBusy(true);
    try {
      const dataURL = await fileToDataURL(file);
      const newItem = {
        name: form.name || file.name,
        part: form.part,              // 'top' | 'bottom' | 'shoes'
        color: form.color || "",
        image: dataURL,               // <= stored as base64
        tags: form.tags,              // { weather:[], occasion:[], mood:[] }
        source: "user"
      };
      const updated = addUserItem(newItem);
      onAdded?.(updated);
      // reset form
      setForm({
        name: "",
        part: "top",
        color: "",
        tags: { weather: [], occasion: [], mood: [] }
      });
      setFilePreview(null);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to read image.");
    } finally {
      setBusy(false);
    }
  }

  function handlePreview(e) {
    const f = e.target.files?.[0];
    if (!f) return setFilePreview(null);
    const url = URL.createObjectURL(f);
    setFilePreview(url);
  }

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Add Item (Upload Image)</h3>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          name="name"
          placeholder="Name (e.g., Pink Blouse)"
          className="border rounded px-3 py-2"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        <div className="grid grid-cols-3 gap-3">
          <select
            className="border rounded px-3 py-2"
            value={form.part}
            onChange={(e) => setField("part", e.target.value)}
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="shoes">Shoes</option>
          </select>
          <input
            placeholder="Color (e.g., Pink)"
            className="border rounded px-3 py-2"
            value={form.color}
            onChange={(e) => setField("color", e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handlePreview}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Simple CSV inputs for tags */}
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Weather (csv)" className="border rounded px-3 py-2"
                 onChange={(e)=>setTagField("weather", e.target.value)} />
          <input placeholder="Occasion (csv)" className="border rounded px-3 py-2"
                 onChange={(e)=>setTagField("occasion", e.target.value)} />
          <input placeholder="Mood (csv)" className="border rounded px-3 py-2"
                 onChange={(e)=>setTagField("mood", e.target.value)} />
        </div>

        {filePreview && (
          <div className="mt-2">
            <img src={filePreview} alt="preview" className="h-28 rounded border object-cover" />
          </div>
        )}

        <button
          disabled={busy}
          className="bg-black text-white rounded px-4 py-2 mt-1 disabled:opacity-60"
          type="submit"
        >
          {busy ? "Saving..." : "Add Item"}
        </button>
      </form>

      <div className="flex gap-3 mt-4">
        <button
          className="border rounded px-3 py-2"
          onClick={()=>exportUserItems()}
        >
          Export My Items (.json)
        </button>
        <label className="border rounded px-3 py-2 cursor-pointer">
          Import .json
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={async (e)=>{
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                await importUserItems(f);
                onAdded?.(getUserItems());
                alert("Imported!");
              } catch {
                alert("Invalid file.");
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
