// "use client";
// import { useEffect, useState } from "react";
// import cosineSimilarity from "compute-cosine-similarity";

// const allTags = [
//   "hot",
//   "cold",
//   "rainy",
//   "casual",
//   "formal",
//   "party",
//   "minimal",
//   "bold",
//   "neutral",
// ];

// export default function Recommend() {
//   const [wardrobe, setWardrobe] = useState([]);
//   const [weather, setWeather] = useState("Cold");
//   const [occasion, setOccasion] = useState("Formal");
//   const [mood, setMood] = useState("Bold");
//   const [k, setK] = useState(3);
//   const [suggestions, setSuggestions] = useState([]);

//   useEffect(() => {
//     fetch("/wardrobe_named.json")
//       .then((res) => res.json())
//       .then((data) => setWardrobe(data));
//   }, []);

//   const tagVector = (selectedTags) => {
//     return allTags.map((tag) =>
//       selectedTags.includes(tag.toLowerCase()) ? 1 : 0
//     );
//   };

//   const generateOutfits = () => {
//     const userTags = [
//       weather.toLowerCase(),
//       occasion.toLowerCase(),
//       mood.toLowerCase(),
//     ];
//     const userVector = tagVector(userTags);

//     const tops = wardrobe.filter((i) => i.type === "top");
//     const bottoms = wardrobe.filter((i) => i.type === "bottom");
//     const shoes = wardrobe.filter((i) => i.type === "shoes");

//     const combinations = [];

//     for (const top of tops) {
//       for (const bottom of bottoms) {
//         for (const shoe of shoes) {
//           const combinedTags = [...top.style, ...bottom.style, ...shoe.style];
//           const comboVector = tagVector(combinedTags);
//           const score = cosineSimilarity(userVector, comboVector);
//           combinations.push({ top, bottom, shoes: shoe, score });
//         }
//       }
//     }

//     const sorted = combinations.sort((a, b) => b.score - a.score);
//     setSuggestions(sorted.slice(0, Number(k)));
//   };

//   return (
//     <main className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">
//         AI Outfit Recommender (KNN-style)
//       </h1>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         <div>
//           <label className="block font-medium mb-1">Weather</label>
//           <select
//             className="w-full p-2 border rounded"
//             value={weather}
//             onChange={(e) => setWeather(e.target.value)}
//           >
//             <option>Hot</option>
//             <option>Cold</option>
//             <option>Rainy</option>
//           </select>
//         </div>
//         <div>
//           <label className="block font-medium mb-1">Occasion</label>
//           <select
//             className="w-full p-2 border rounded"
//             value={occasion}
//             onChange={(e) => setOccasion(e.target.value)}
//           >
//             <option>Casual</option>
//             <option>Formal</option>
//             <option>Party</option>
//           </select>
//         </div>
//         <div>
//           <label className="block font-medium mb-1">Mood</label>
//           <select
//             className="w-full p-2 border rounded"
//             value={mood}
//             onChange={(e) => setMood(e.target.value)}
//           >
//             <option>Minimal</option>
//             <option>Bold</option>
//             <option>Neutral</option>
//           </select>
//         </div>
//         <div>
//           <label className="block font-medium mb-1">
//             Number of Suggestions
//           </label>
//           <input
//             type="number"
//             className="w-full p-2 border rounded"
//             value={k}
//             onChange={(e) => setK(e.target.value)}
//             min={1}
//             max={50}
//           />
//         </div>
//       </div>

//       <button
//         className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 mb-6"
//         onClick={generateOutfits}
//       >
//         Generate Outfit Suggestions
//       </button>

//       {suggestions.length > 0 && (
//         <div>
//           {suggestions.map((sug, index) => (
//             <div key={index} className="mb-6 border p-4 rounded shadow">
//               <h2 className="font-semibold text-lg mb-2">
//                 Suggestion #{index + 1} (Score: {sug.score.toFixed(3)})
//               </h2>
//               <ul className="list-disc pl-5 space-y-1">
//                 <li>
//                   <strong>🧥 Top:</strong> {sug.top.name} ({sug.top.color})
//                 </li>
//                 <li>
//                   <strong>👖 Bottom:</strong> {sug.bottom.name} (
//                   {sug.bottom.color})
//                 </li>
//                 <li>
//                   <strong>👟 Shoes:</strong> {sug.shoes.name} ({sug.shoes.color}
//                   )
//                 </li>
//               </ul>
//             </div>
//           ))}
//         </div>
//       )}
//     </main>
//   );
// }
"use client";
import { useChat } from "@ai-sdk/react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

// Helper function to convert FileList to data URLs for sending to the AI model
async function convertFilesToDataURLs(files) {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: "file",
              mediaType: file.type,
              url: reader.result,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState(undefined);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // IMPORTANT: For this simplified version, we need to tell useChat to expect a plain text stream.
  // If you later switch back to a full AI model, you'll need to remove this 'transport' option
  // and ensure your API route returns result.toUIMessageStreamResponse().
  const { messages, append, isLoading, error } = useChat({
    api: "/api/chat",
    // Use TextStreamChatTransport for plain text responses from the server
    transport: new (require("ai").TextStreamChatTransport)({
      api: "/api/chat",
    }),
  });

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("Client: Current messages state:", messages); // Log messages state
  }, [messages]);

  // Log to confirm client-side component is rendering
  useEffect(() => {
    console.log("Client: Chat component mounted and rendering.");
  }, []);

  // Log any errors from the useChat hook
  useEffect(() => {
    if (error) {
      console.error("Client: useChat error:", error);
    }
  }, [error]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() && !files) return;

    const fileParts =
      files && files.length > 0 ? await convertFilesToDataURLs(files) : [];

    console.log(
      "Client: Sending message with content:",
      input,
      "and files:",
      fileParts
    );

    append({
      role: "user",
      content: input,
      // For this basic NLP, file data won't be processed by the server, but we keep it for consistency
      data: { files: fileParts },
    });

    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="flex flex-col h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        AI Stylist Chat
      </h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-inner">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-pink-500 text-white rounded-br-none"
                  : "bg-gray-300 text-gray-800 rounded-bl-none"
              }`}
            >
              {/* Render text content directly for this simplified version */}
              <p className="whitespace-pre-wrap">{m.content}</p>

              {/* File rendering is still here, but server won't process it for basic NLP */}
              {m.data?.files?.map((filePart, index) => {
                if (
                  filePart.type === "file" &&
                  filePart.mediaType?.startsWith("image/")
                ) {
                  return (
                    <div key={index} className="mt-2">
                      <Image
                        src={filePart.url || "/placeholder.svg"}
                        width={200}
                        height={200}
                        alt={`Uploaded image ${index}`}
                        className="rounded-md object-cover"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-300 text-gray-800 rounded-bl-none">
              <p>Outfitly is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="mt-4 flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <div className="flex gap-2">
          <input
            className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={input}
            placeholder={
              files
                ? "Add a message with your image..."
                : "Ask Outfitly what to wear..."
            }
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || (!input.trim() && !files)}
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
