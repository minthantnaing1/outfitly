"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAllRecommendations, comboKey as makeKey } from "@/lib/outfitRules";
import outfitData from "@/public/outfit_test_data.json";
import Link from "next/link";

const clampK = (n) => Math.min(5, Math.max(1, Number(n || 1)));

async function postFeedback(comboKey, action, outfit, contextTags) {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ comboKey, action, outfit, contextTags }),
  }).catch(() => {});
}

async function getFeedbackStore() {
  try {
    const res = await fetch("/api/feedback", { cache: "no-store" });
    if (!res.ok) return { combos: {} };
    const json = await res.json();
    return json || { combos: {} };
  } catch {
    return { combos: {} };
  }
}

export default function Recommend() {
  // data
  const [wardrobe, setWardrobe] = useState([]);
  const [feedbackStore, setFeedbackStore] = useState({ combos: {} });

  // inputs
  const [weather, setWeather] = useState("Hot");
  const [occasion, setOccasion] = useState("Casual");
  const [mood, setMood] = useState("Minimal");
  const [k, setK] = useState(5);

  // UI/state
  const [suggestions, setSuggestions] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState({}); // { [comboKey]: "like"|"dislike"|undefined }

  const lastInputKeyRef = useRef("");

  useEffect(() => {
    setWardrobe(outfitData || []);
    (async () => setFeedbackStore(await getFeedbackStore()))();
  }, []);

  const inputTags = useMemo(
    () => [weather.toLowerCase(), occasion.toLowerCase(), mood.toLowerCase()],
    [weather, occasion, mood]
  );
  const currentInputKey = useMemo(
    () => `${weather}-${occasion}-${mood}-${clampK(k)}`,
    [weather, occasion, mood, k]
  );

  // Reset list when user changes inputs or k
  useEffect(() => {
    setHasGenerated(false);
    setSuggestions([]);
  }, [currentInputKey]);

  // Generate (feedback-aware, MMR-diverse, mild exploration)
  const generate = async () => {
    setIsLoading(true);
    const store = await getFeedbackStore();
    setFeedbackStore(store);

    // keep a rolling index per input
    if (!lastInputKeyRef.current.startsWith(currentInputKey)) {
      lastInputKeyRef.current = currentInputKey + "|0";
    }
    let [, offsetStr] = lastInputKeyRef.current.split("|");
    let offset = parseInt(offsetStr || "0", 10);

    const all = getAllRecommendations(wardrobe, inputTags, store, {
      k: 20, // fetch a bigger candidate pool
      wSim: 0.65,
      wFB: 0.35,
      alphaCtx: 0.7,
      mmrLambda: 0.8,
      exploreTau: 0.1,
    });

    // rotate through unseen windows of size k
    const start = offset * clampK(k);
    const topK = all.slice(start, start + clampK(k));

    if (topK.length === 0) {
      // reset cycle if we’ve exhausted
      offset = 0;
    }
    setSuggestions(topK);
    setHasGenerated(true);

    // save new offset
    lastInputKeyRef.current = `${currentInputKey}|${offset + 1}`;
    setIsLoading(false);
  };

  // Local toggle (re-rank happens on next Generate)
  const toggleLike = async (combo) => {
    const key = makeKey(combo);
    const prev = feedbackState[key];
    const next = prev === "like" ? undefined : "like";
    setFeedbackState((s) => ({ ...s, [key]: next }));

    if (prev === "dislike" && next === "like") {
      await postFeedback(key, "undislike", combo, inputTags);
      await postFeedback(key, "like", combo, inputTags);
    } else if (prev === "like" && next === undefined) {
      await postFeedback(key, "unlike", combo, inputTags);
    } else if (prev !== "like" && next === "like") {
      await postFeedback(key, "like", combo, inputTags);
    }
  };

  const toggleDislike = async (combo) => {
    const key = makeKey(combo);
    const prev = feedbackState[key];
    const next = prev === "dislike" ? undefined : "dislike";
    setFeedbackState((s) => ({ ...s, [key]: next }));

    if (prev === "like" && next === "dislike") {
      await postFeedback(key, "unlike", combo, inputTags);
      await postFeedback(key, "dislike", combo, inputTags);
    } else if (prev === "dislike" && next === undefined) {
      await postFeedback(key, "undislike", combo, inputTags);
    } else if (prev !== "dislike" && next === "dislike") {
      await postFeedback(key, "dislike", combo, inputTags);
    }
  };

  /* ------------------------------- UI (refined) ------------------------------ */

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
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
              Outfitly <span className="text-pink-600">Recommender</span>
            </h1>
          </div>

          <p className="mt-16 text-center text-gray-600 max-w-2xl mx-auto">
            Pick your vibe — we’ll curate looks and learn your style with every
            like and dislike.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Weather
              </label>
              <select
                className="w-full appearance-none rounded-xl border bg-white px-3 py-2 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
              >
                <option>Hot</option>
                <option>Cold</option>
                <option>Rainy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Occasion
              </label>
              <select
                className="w-full appearance-none rounded-xl border bg-white px-3 py-2 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              >
                <option>Casual</option>
                <option>Formal</option>
                <option>Party</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mood
              </label>
              <select
                className="w-full appearance-none rounded-xl border bg-white px-3 py-2 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                <option>Minimal</option>
                <option>Bold</option>
                <option>Neutral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                # Suggestions <span className="text-gray-400">(1–5)</span>
              </label>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={k}
                onChange={(e) => setK(clampK(e.target.value))}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={generate}
                className="w-full rounded-xl bg-pink-600 px-4 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-pink-700 disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading
                  ? "Finding looks…"
                  : hasGenerated
                  ? "♻️ Not My Style — Suggest Another"
                  : "🔍 Generate Outfit Suggestions"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {suggestions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((sug, idx) => {
              const key = makeKey(sug);
              const state = feedbackState[key]; // like | dislike | undefined
              const liked = state === "like";
              const disliked = state === "dislike";

              return (
                <article
                  key={`${key}-${idx}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  {/* top banner / score pill */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-rose-50 to-white">
                    <div className="text-xs font-medium text-gray-500">
                      Suggestion #{idx + 1}
                    </div>
                    <div className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-900 text-white">
                      Score {sug.score.toFixed(3)}
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-4">
                    {/* pseudo look tiles */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                        👕
                      </div>
                      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                        👖
                      </div>
                      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                        👟
                      </div>
                    </div>

                    {/* details */}
                    <div className="space-y-1.5 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold text-gray-900">
                          Top:
                        </span>{" "}
                        {sug.top.name} ({sug.top.color})
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Bottom:
                        </span>{" "}
                        {sug.bottom.name} ({sug.bottom.color})
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Shoes:
                        </span>{" "}
                        {sug.shoes.name} ({sug.shoes.color})
                      </div>
                      <div className="pt-1">
                        {(sug.tags || []).map((t) => (
                          <span
                            key={t}
                            className="mr-1.5 mb-1 inline-block rounded-full border px-2 py-0.5 text-[11px] text-gray-700 bg-rose-50 border-rose-100"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => toggleDislike(sug)}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm border ${
                          disliked
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                        }`}
                      >
                        {disliked ? "↩ Undo Dislike" : "👎 Dislike"}
                      </button>
                      <button
                        onClick={() => toggleLike(sug)}
                        className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm border ${
                          liked
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {liked ? "↩ Undo Like" : "👍 Like"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          hasGenerated && (
            <p className="text-gray-600 mt-6">
              No suggestions found for this input. Try a different
              mood/occasion.
            </p>
          )
        )}
      </section>
    </main>
  );
}
