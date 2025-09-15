"use client";

import { useEffect, useState } from "react";
import shops from "../../data/shopData.js"; // adjust path if your folder is different

export default function Shop() {
  const [filters, setFilters] = useState({
    availability: "Near Me",
    category: "All",
    search: "",
    showFavorites: false,
  });

  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favoriteShops");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favoriteShops", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (name) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  // Filtering logic
  const filteredShops = shops.filter((shop) => {
    const matchAvailability =
      filters.availability === "All" || shop.available === filters.availability;

    const matchCategory =
      filters.category === "All" || shop.category === filters.category;

    const matchSearch =
      filters.search === "" ||
      shop.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      shop.desc.toLowerCase().includes(filters.search.toLowerCase());

    const matchFavorites =
      !filters.showFavorites || favorites.includes(shop.name);

    return matchAvailability && matchCategory && matchSearch && matchFavorites;
  });

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Page Title */}
      <h2 className="text-2xl font-semibold mb-6 text-center">
        <img
          src="https://twemoji.maxcdn.com/v/latest/svg/1f6cd.svg"
          alt="Shop"
          className="inline-block w-6 h-6 mr-1"
        />
        Shop
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 justify-center">
        {/* Search bar */}
        <input
          type="text"
          placeholder="🔍 Search shops..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          className="w-full md:w-1/2 px-3 py-2 border rounded-lg"
        />

        {/* Category dropdown */}
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
          className="px-3 py-2 border rounded-lg"
        >
          <option value="All">All Categories</option>
          <option value="Casual">Casual</option>
          <option value="Thrift">Thrift</option>
          <option value="Indie">Indie</option>
          <option value="Basics">Basics</option>
          <option value="Trendy">Trendy</option>
          <option value="Fast Fashion">Fast Fashion</option>
        </select>

        {/* Availability buttons */}
        <div className="flex gap-2">
          {["Near Me", "Online"].map((option) => (
            <button
              key={option}
              onClick={() =>
                setFilters((prev) => ({ ...prev, availability: option }))
              }
              className={`px-4 py-2 rounded-lg border ${
                filters.availability === option
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              showFavorites: !prev.showFavorites,
            }))
          }
          className={`px-4 py-2 rounded-lg border ${
            filters.showFavorites
              ? "bg-pink-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          {filters.showFavorites ? "❤️ Showing Favorites" : "🤍 Show Favorites Only"}
        </button>
      </div>

      {/* Shop Cards */}
      <section className="space-y-5">
        {filteredShops.map((shop, index) => (
          <div
            key={index}
            className="border border-gray-300 p-5 rounded-lg shadow-sm bg-white relative flex items-center gap-4 animate-fadeUp hover:scale-[1.02] hover:shadow-lg transition-transform"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Favorite button */}
            <button
              onClick={() => toggleFavorite(shop.name)}
              className="absolute top-3 right-3 text-xl"
            >
              {favorites.includes(shop.name) ? "❤️" : "🤍"}
            </button>

            {/* Logo with fallback */}
            <img
              src={shop.logo || "https://img.icons8.com/color/96/shopping-bag.png"}
              alt={shop.name}
              className="w-14 h-14 object-contain rounded-md border bg-gray-50"
            />

            {/* Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                {shop.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{shop.desc}</p>
              {shop.link && (
                <a
                  href={shop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline inline-block mt-2"
                >
                  Visit Shop →
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredShops.length === 0 && (
          <p className="text-center text-gray-500">No shops found.</p>
        )}
      </section>
    </main>
  );
}