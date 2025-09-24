"use client";
<<<<<<< HEAD
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




// "use client";
// import { useChat } from '@ai-sdk/react';
// import { useRef, useState, useEffect } from 'react';
// import Image from 'next/image';

// // Helper function to convert FileList to data URLs for sending to the AI model
// async function convertFilesToDataURLs(files) {
//   return Promise.all(
//     Array.from(files).map(
//       file =>
//         new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.onload = () => {
//             resolve({
//               type: 'file',
//               mediaType: file.type,
//               url: reader.result,
//             });
//           };
//           reader.onerror = reject;
//           reader.readAsDataURL(file);
//         }),
//     ),
//   );
// }

// export default function Chat() {
//   const [input, setInput] = useState('');
//   const [files, setFiles] = useState(undefined);
//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null); // Ref for auto-scrolling

//   // IMPORTANT: For this simplified version, we need to tell useChat to expect a plain text stream.
//   // If you later switch back to a full AI model, you'll need to remove this 'transport' option
//   // and ensure your API route returns result.toUIMessageStreamResponse().
//   const { messages, append, isLoading, error } = useChat({
//     api: '/api/chat',
//     // Use TextStreamChatTransport for plain text responses from the server
//     transport: new (require('ai').TextStreamChatTransport)({
//       api: '/api/chat',
//     }),
//   });

//   // Scroll to the bottom of the chat when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     console.log("Client: Current messages state:", messages); // Log messages state
//   }, [messages]);

//   // Log to confirm client-side component is rendering
//   useEffect(() => {
//     console.log("Client: Chat component mounted and rendering.");
//   }, []);

//   // Log any errors from the useChat hook
//   useEffect(() => {
//     if (error) {
//       console.error("Client: useChat error:", error);
//     }
//   }, [error]);

//   const handleSend = async (event) => {
//     event.preventDefault();
//     if (!input.trim() && !files) return;

//     const fileParts = files && files.length > 0
//       ? await convertFilesToDataURLs(files)
//       : [];

//     console.log("Client: Sending message with content:", input, "and files:", fileParts);

//     append({
//       role: 'user',
//       content: input,
//       // For this basic NLP, file data won't be processed by the server, but we keep it for consistency
//       data: { files: fileParts },
//     });

//     setInput('');
//     setFiles(undefined);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <main className="flex flex-col h-screen p-4 bg-gray-100">
//       <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">AI Stylist Chat</h2>
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-inner">
//         {messages.map((m) => (
//           <div
//             key={m.id}
//             className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`max-w-[70%] p-3 rounded-lg ${
//                 m.role === 'user'
//                   ? 'bg-pink-500 text-white rounded-br-none'
//                   : 'bg-gray-300 text-gray-800 rounded-bl-none'
//               }`}
//             >
//               {/* Render text content directly for this simplified version */}
//               <p className="whitespace-pre-wrap">{m.content}</p>

//               {/* File rendering is still here, but server won't process it for basic NLP */}
//               {m.data?.files?.map((filePart, index) => {
//                 if (filePart.type === 'file' && filePart.mediaType?.startsWith('image/')) {
//                   return (
//                     <div key={index} className="mt-2">
//                       <Image
//                         src={filePart.url || "/placeholder.svg"}
//                         width={200}
//                         height={200}
//                         alt={`Uploaded image ${index}`}
//                         className="rounded-md object-cover"
//                       />
//                     </div>
//                   );
//                 }
//                 return null;
//               })}
//             </div>
//           </div>
//         ))}
//         {isLoading && (
//           <div className="flex justify-start">
//             <div className="max-w-[70%] p-3 rounded-lg bg-gray-300 text-gray-800 rounded-bl-none">
//               <p>Outfitly is thinking...</p>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>
//       <form onSubmit={handleSend} className="mt-4 flex flex-col gap-2">
//         <input
//           type="file"
//           accept="image/*"
//           className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
//           onChange={(event) => {
//             if (event.target.files) {
//               setFiles(event.target.files);
//             }
//           }}
//           multiple
//           ref={fileInputRef}
//         />
//         <div className="flex gap-2">
//           <input
//             className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//             value={input}
//             placeholder={files ? "Add a message with your image..." : "Ask Outfitly what to wear..."}
//             onChange={(e) => setInput(e.target.value)}
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={isLoading || (!input.trim() && !files)}
//           >
//             Send
//           </button>
//         </div>
//       </form>
//     </main>
//   );
// }
=======

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
                    {/* hero outfit image (if provided) */}
                    {sug.images?.outfit && (
                      <img
                        src={sug.images.outfit}
                        alt="Outfit preview"
                        loading="lazy"
                        className="w-full aspect-[16/9] object-cover rounded-xl mb-3"
                      />
                    )}

                    {/* piece thumbnails with fallback to emojis */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {["top", "bottom", "shoes"].map((part, i) => {
                        const src = sug.images?.[part];
                        const fallback = ["👕", "👖", "👟"][i];
                        return src ? (
                          <img
                            key={part}
                            src={src}
                            alt={`${part} image`}
                            loading="lazy"
                            className="aspect-square object-cover rounded-xl border"
                          />
                        ) : (
                          <div
                            key={part}
                            className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-2xl"
                          >
                            {fallback}
                          </div>
                        );
                      })}
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
>>>>>>> origin/AllMerged
