"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Back button pinned far left */}
      <div className="absolute top-4 left-4">
        <Link
            href="/"
            className="text-base bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
            ← Home
        </Link>
        </div>

      <main className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">🪪 My Profile</h2>

        {profile ? (
          <div className="bg-white shadow-lg rounded-xl p-6 text-center border">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-4xl font-bold text-pink-600">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </div>
            </div>

            {/* User Info */}
            <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>

            <div className="grid grid-cols-2 gap-4 text-left mt-6">
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{profile.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{profile.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Body Shape</p>
                <p className="font-medium capitalize">{profile.bodyShape}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Style</p>
                <p className="font-medium capitalize">{profile.style}</p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-6">
              <Link
                href="/profile/edit"
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No profile data found.</p>
            <Link
              href="/profile/edit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Setup Profile
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}