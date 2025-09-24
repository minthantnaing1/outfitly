// src/lib/wardrobeStore.js
const LS_KEY = "outfitly_user_items_v1";

export function getUserItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserItems(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function addUserItem(item) {
  const items = getUserItems();
  items.unshift({ id: crypto.randomUUID(), ...item, createdAt: Date.now() });
  saveUserItems(items);
  return items;
}

export function clearUserItems() {
  saveUserItems([]);
}

export function exportUserItems() {
  const dataStr = JSON.stringify(getUserItems(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "outfitly-user-items.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Accepts a File from <input type="file" />
export async function importUserItems(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("Invalid file format");
  saveUserItems(parsed);
  return parsed;
}
