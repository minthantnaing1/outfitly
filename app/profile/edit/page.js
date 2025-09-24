"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: "",
    gender: "",
    age: "",
    bodyShape: "",
    style: "",
  });

  const router = useRouter();

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("Profile saved successfully!");
    router.push("/profile"); // redirect back after save
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">✏️ Edit Profile</h2>

      <form className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Body Shape */}
        <div>
          <label className="block text-sm font-medium mb-1">Body Shape</label>
          <select
            name="bodyShape"
            value={profile.bodyShape}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="rectangle">Rectangle</option>
            <option value="triangle">Triangle</option>
            <option value="hourglass">Hourglass</option>
            <option value="round">Round</option>
            <option value="inverted-triangle">Inverted Triangle</option>
          </select>
        </div>

        {/* Style Preference */}
        <div>
          <label className="block text-sm font-medium mb-1">Style Preference</label>
          <select
            name="style"
            value={profile.style}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="casual">Casual</option>
            <option value="streetwear">Streetwear</option>
            <option value="formal">Formal</option>
            <option value="luxury">Luxury</option>
            <option value="bohemian">Bohemian</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Save Profile
          </button>
        </div>
      </form>
    </main>
  );
}