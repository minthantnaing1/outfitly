
"use client";
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

// Helper function to convert FileList to data URLs for sending to the API
async function convertFilesToDataURLs(files) {
  return Promise.all(
    Array.from(files).map(
      file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: 'file',
              mediaType: file.type,
              url: reader.result,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState(undefined);
  const [messages, setMessages] = useState([]); // Manually manage messages state
  const [isLoading, setIsLoading] = useState(false); // Manually manage loading state
  const [error, setError] = useState(null); // Manually manage error state
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("Client: Current messages state:", messages); // Log messages state
  }, [messages]);

  // Log to confirm client-side component is rendering
  useEffect(() => {
    console.log("Client: Chat component mounted and rendering.");
  }, []);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() && !files) return;

    setIsLoading(true);
    setError(null); // Clear previous errors

    const userMessageContent = input;
    const fileParts = files && files.length > 0
      ? await convertFilesToDataURLs(files)
      : [];

    const newUserMessage = {
      id: Date.now().toString() + '-user', // Unique ID for user message
      role: 'user',
      content: userMessageContent, // User message content is still a string
      data: { files: fileParts },
    };

    // Add user message to state immediately
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setInput('');
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      console.log("Client: Sending message to API:", newUserMessage);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }), // Send all messages for context if needed by server
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const assistantResponse = await response.json(); // Expecting JSON response
      console.log("Client: Received API response:", assistantResponse);

      // Add assistant message to state
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);

    } catch (err) {
      console.error("Client: API call error:", err);
      setError(err.message);
      // Optionally add an error message to the chat UI
      setMessages((prevMessages) => [...prevMessages, {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: [{ type: 'text', content: `Error: ${err.message}. Please try again.` }], // Error message as an array part
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Outfitly's Chatbot</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-lg shadow-inner">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                m.role === 'user'
                  ? 'bg-pink-500 text-white rounded-br-none'
                  : m.isError // Apply error styling if it's an error message
                    ? 'bg-red-200 text-red-800 rounded-bl-none'
                    : 'bg-gray-300 text-gray-800 rounded-bl-none'
              }`}
            >
              {/* Render content based on its type */}
              {Array.isArray(m.content) ? (
                m.content.map((part, index) => {
                  if (part.type === 'text') {
                    return <p key={index} className="whitespace-pre-wrap">{part.content}</p>;
                  } else if (part.type === 'image') {
                    console.log("Rendering image with URL:", part.url); // Log URL before rendering
                    return (
                      <div key={index} className="mt-2">
                        <Image
                          src={part.url || "/placeholder.svg"}
                          width={200}
                          height={200}
                          alt={part.alt || `Outfit image ${index}`}
                          className="rounded-md object-cover"
                        />
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                // Fallback for old string content (user messages)
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}

              {/* File rendering for user-uploaded images (separate from Pexels images) */}
              {m.data?.files?.map((filePart, index) => {
                if (filePart.type === 'file' && filePart.mediaType?.startsWith('image/')) {
                  return (
                    <div key={index} className="mt-2">
                      <Image
                        src={filePart.url || "/placeholder.svg"}
                        width={200}
                        height={200}
                        alt={filePart.filename || `Uploaded image ${index}`}
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
        {error && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-red-200 text-red-800 rounded-bl-none">
              <p>Client Error: {error}</p>
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
            placeholder={files ? "Add a message with your image..." : "Ask Outfitly what to wear..."}
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


// "use client";
// import { useEffect, useMemo, useRef, useState } from "react";

// /**
//  * Chat UI:
//  * - Stacked, IG-style image cards per assistant message
//  * - Click to open lightbox with prev/next + keyboard nav
//  * - Sends ONLY the latest user message to /api/chat
//  * - Optional file upload -> passes to data.files for your API
//  */

// export default function ChatPage() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [files, setFiles] = useState([]);
//   const [isSending, setIsSending] = useState(false);

//   // Lightbox
//   const [lightbox, setLightbox] = useState({ open: false, items: [], index: 0 });

//   // Optional: initial system message (not sent to API)
//   useEffect(() => {
//     setMessages([
//       {
//         id: "welcome",
//         role: "assistant",
//         parts: [{ type: "text", content: "👋 Ask me what to wear or share a photo." }],
//       },
//     ]);
//   }, []);

//   const onChooseFiles = async (e) => {
//     const list = Array.from(e.target.files || []);
//     if (!list.length) return;

//     // Turn images into base64 data URLs so API can read them (like your previous client)
//     const asDataUrls = await Promise.all(
//       list.map(
//         (file) =>
//           new Promise((resolve) => {
//             const reader = new FileReader();
//             reader.onload = () =>
//               resolve({
//                 type: "file",
//                 mediaType: file.type,
//                 url: reader.result,
//               });
//             reader.readAsDataURL(file);
//           })
//       )
//     );
//     setFiles(asDataUrls);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     const content = input.trim();
//     if (!content && files.length === 0) return;

//     // append user bubble locally
//     const userMsg = {
//       id: Date.now() + "-u",
//       role: "user",
//       parts: [
//         ...(content ? [{ type: "text", content }] : []),
//         ...files.map((f) => ({ type: "image", url: f.url, alt: "uploaded" })),
//       ],
//     };
//     setMessages((m) => [...m, userMsg]);
//     setInput("");
//     setIsSending(true);

//     // Build API body: ONLY latest user message (what the server expects)
//     const apiBody = {
//       messages: [
//         {
//           role: "user",
//           content,
//           data: {
//             files, // array of { type:"file", mediaType:"image/*", url:"data:image/..;base64,..." }
//           },
//         },
//       ],
//     };

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(apiBody),
//       });
//       const data = await res.json();

//       // Your API returns { content: replyParts[] }
//       const assistantMsg = {
//         id: Date.now() + "-a",
//         role: "assistant",
//         parts: data.content || [],
//       };
//       setMessages((m) => [...m, assistantMsg]);
//     } catch (err) {
//       console.error(err);
//       setMessages((m) => [
//         ...m,
//         {
//           id: Date.now() + "-err",
//           role: "assistant",
//           parts: [{ type: "text", content: "⚠️ Something went wrong sending your message." }],
//         },
//       ]);
//     } finally {
//       setIsSending(false);
//       setFiles([]); // clear queued uploads
//     }
//   };

//   return (
//     <div className="min-h-screen bg-zinc-50">
//       <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
//         <div className="mx-auto flex max-w-5xl items-center justify-center p-4">
//           <h1 className="text-xl font-semibold">Outfitly&apos;s Chatbot</h1>
//         </div>
//       </header>

//       <main className="mx-auto max-w-5xl px-4 pb-32 pt-6">
//         <div className="space-y-6">
//           {messages.map((m) => (
//             <MessageBubble
//               key={m.id}
//               role={m.role}
//               parts={m.parts}
//               onOpenLightbox={(items, index) => setLightbox({ open: true, items, index })}
//             />
//           ))}
//         </div>
//       </main>

//       <form onSubmit={onSubmit} className="fixed inset-x-0 bottom-0 z-30 border-t bg-white">
//         <div className="mx-auto flex max-w-5xl gap-3 p-3">
//           <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm">
//             <input type="file" accept="image/*" multiple className="hidden" onChange={onChooseFiles} />
//             📸 Upload
//             {!!files.length && <span className="text-zinc-500">({files.length})</span>}
//           </label>

//           <input
//             className="flex-1 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10"
//             placeholder="Ask Outfitly what to wear..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//           />

//           <button
//             disabled={isSending}
//             className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
//           >
//             {isSending ? "Sending…" : "Send"}
//           </button>
//         </div>
//       </form>

//       {lightbox.open && (
//         <Lightbox
//           items={lightbox.items}
//           index={lightbox.index}
//           onClose={() => setLightbox((s) => ({ ...s, open: false }))}
//           onIndex={(i) => setLightbox((s) => ({ ...s, index: i }))}
//         />
//       )}
//     </div>
//   );
// }

// function MessageBubble({ role, parts, onOpenLightbox }) {
//   const images = useMemo(
//     () =>
//       (parts || [])
//         .filter((p) => p.type === "image" && (p.url || p.src))
//         .map((p) => ({ src: p.url || p.src, alt: p.alt || "" })),
//     [parts]
//   );
//   const texts = (parts || []).filter((p) => p.type === "text");

//   const isUser = role === "user";

//   return (
//     <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
//       <div
//         className={`max-w-[80%] rounded-2xl ${
//           isUser ? "bg-pink-500 text-white" : "bg-white text-zinc-900 border"
//         } shadow-sm`}
//       >
//         <div className="space-y-3 p-3">
//           {texts.map((t, i) => (
//             <p key={i} className="leading-relaxed whitespace-pre-wrap">
//               {t.content}
//             </p>
//           ))}

//           {!!images.length && (
//             <ImageStack images={images} onOpenLightbox={onOpenLightbox} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function ImageStack({ images, onOpenLightbox }) {
//   return (
//     <div className="space-y-3">
//       {images.map((img, idx) => (
//         <button
//           key={idx}
//           type="button"
//           onClick={() => onOpenLightbox(images, idx)}
//           className="block w-full overflow-hidden rounded-2xl border bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
//         >
//           {/* Portrait-ish aspect like Instagram (4:5 ~ 80%); here 125% to look tall */}
//           <div className="relative w-full" style={{ paddingTop: "125%" }}>
//             <img
//               src={img.src}
//               alt={img.alt || "outfit inspiration"}
//               loading="lazy"
//               className="absolute inset-0 h-full w-full object-cover"
//             />
//           </div>
//         </button>
//       ))}
//     </div>
//   );
// }

// function Lightbox({ items, index, onClose, onIndex }) {
//   const overlayRef = useRef(null);

//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
//       if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
//     }
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [index, items.length, onClose, onIndex]);

//   const img = items[index];

//   return (
//     <div
//       ref={overlayRef}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
//       role="dialog"
//       aria-modal="true"
//       onClick={(e) => {
//         if (e.target === overlayRef.current) onClose();
//       }}
//     >
//       <div className="relative w-full max-w-3xl">
//         <button
//           onClick={onClose}
//           className="absolute -top-10 right-0 rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30"
//         >
//           Close ✕
//         </button>

//         <div className="overflow-hidden rounded-2xl bg-black">
//           <div className="relative w-full" style={{ paddingTop: "100%" }}>
//             <img
//               src={img.src}
//               alt={img.alt || ""}
//               className="absolute inset-0 h-full w-full object-contain"
//             />
//           </div>
//         </div>

//         {items.length > 1 && (
//           <div className="mt-3 flex items-center justify-between text-white/90">
//             <button
//               onClick={() => onIndex((index - 1 + items.length) % items.length)}
//               className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
//             >
//               ← Prev
//             </button>
//             <div className="text-sm">
//               {index + 1} / {items.length}
//             </div>
//             <button
//               onClick={() => onIndex((index + 1) % items.length)}
//               className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
//             >
//               Next →
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
