"use client";
 
import { useEffect, useState } from "react";
 
export default function Shop() {
  const [filters, setFilters] = useState({
    size: "All Sizes",
    color: "All Colors",
    price: "Price Range",
    availability: "Availability",
  });
 
  const [userLocation, setUserLocation] = useState(null);
 
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        console.log("📍 User location:", latitude, longitude);
      },
      (err) => {
        console.warn("Geolocation failed:", err.message);
      }
    );
  }, []);
 
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
 
  const shops = [
    {
      name: "Local Boutique",
      desc: "Handpicked pieces available near your location.",
      link: null,
      available: "Near Me",
    },
    {
      name: "Zalora",
      desc: "Trendy and affordable fashion. Ships nationwide.",
      link: "https://www.zalora.com",
      available: "Online",
    },
    {
      name: "Pomelo",
      desc: "Modern fashion with local pickup in Bangkok.",
      link: "https://www.pomelofashion.com",
      available: "Online",
    },
    {
      name: "ZARA",
      desc: "Chic and minimal fashion styles for all seasons.",
      link: "https://www.zara.com",
      available: "Online",
    },
    {
      name: "UNIQLO",
      desc: "Affordable basics and techwear clothing from Japan.",
      link: "https://www.uniqlo.com",
      available: "Online",
    },
    {
      name: "H&M",
      desc: "Stylish, sustainable fashion at budget-friendly prices.",
      link: "https://www2.hm.com",
      available: "Online",
    },
  ];
 
  const filteredShops = shops.filter((shop) => {
    if (filters.availability === "Availability") return true;
    return shop.available === filters.availability;
  });
 
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">🛍 Shop</h2>
 
      {/* Availability Filter */}
      <section className="mb-8 max-w-xs mx-auto">
        <select
          name="availability"
          className="p-2 border rounded w-full"
          value={filters.availability}
          onChange={handleFilterChange}
        >
          <option>Availability</option>
          <option>Online</option>
          <option>Near Me</option>
        </select>
      </section>
 
      {/* Shop Suggestions */}
      <section className="space-y-5">
        {filteredShops.map((shop, index) => (
          <div
            key={index}
            className="border border-gray-300 p-5 rounded-lg shadow-sm hover:shadow-md transition bg-white"
          >
            <h3 className="font-semibold text-lg text-gray-800">{shop.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{shop.desc}</p>
            {shop.link ? (
              <a
                href={shop.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline inline-block mt-2"
              >
                Visit Shop →
              </a>
            ) : (
              <p className="text-green-600 mt-2">Available near you</p>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}