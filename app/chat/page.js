

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";

// async function fileListToDataUrls(fileList) {
//   const files = Array.from(fileList || []);
//   return Promise.all(
//     files.map(
//       (file) =>
//         new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.onload = () =>
//             resolve({
//               type: "file",
//               mediaType: file.type,
//               url: reader.result, // data URL
//             });
//           reader.onerror = reject;
//           reader.readAsDataURL(file);
//         })
//     )
//   );
// }

// // ------------------------- Page -------------------------

// export default function ChatPage() {
//   const [messages, setMessages] = useState(() => [
//     {
//       id: "welcome",
//       role: "assistant",
//       parts: [{ type: "text", content: "👋 Hi there! I can help pick outfits based on weather, mood, and your current location!." }],
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [queuedFiles, setQueuedFiles] = useState([]);
//   const [sending, setSending] = useState(false);
//   const endRef = useRef(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, sending]);

//   async function onChooseFiles(e) {
//     const converted = await fileListToDataUrls(e.target.files);
//     setQueuedFiles(converted);
//   }

//   async function onSubmit(e) {
//     e.preventDefault();
//     const content = input.trim();
//     if (!content && queuedFiles.length === 0) return;

//     // Locally append the user bubble
//     const userMsg = {
//       id: Date.now() + "-u",
//       role: "user",
//       parts: [
//         ...(content ? [{ type: "text", content }] : []),
//         ...queuedFiles.map((f) => ({ type: "image", url: f.url, alt: "uploaded" })),
//       ],
//     };
//     setMessages((m) => [...m, userMsg]);
//     setInput("");
//     setSending(true);

//     const body = {
//       messages: [
//         {
//           role: "user",
//           content,
//           data: { files: queuedFiles }, // server can read these
//         },
//       ],
//     };

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//       // Expect { content: [...] }
//       const assistantMsg = {
//         id: Date.now() + "-a",
//         role: "assistant",
//         parts: Array.isArray(data.content) ? data.content : [{ type: "text", content: String(data.content || "") }],
//       };
//       setMessages((m) => [...m, assistantMsg]);
//     } catch (err) {
//       setMessages((m) => [
//         ...m,
//         {
//           id: Date.now() + "-err",
//           role: "assistant",
//           parts: [{ type: "text", content: "⚠️ Something went wrong. Please try again." }],
//         },
//       ]);
//       console.error(err);
//     } finally {
//       setSending(false);
//       setQueuedFiles([]); // clear selected files
//       // clear file input visually
//       const inputEl = document.getElementById("chat-file-input");
//       if (inputEl) inputEl.value = "";
//     }
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50">
//       <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
//         <div className="mx-auto flex max-w-4xl items-center justify-center p-4">
//           <h1 className="text-xl font-semibold">Outfitly&apos;s Chatbot</h1>
//         </div>
//       </header>

//       <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
//         <div className="space-y-5">
//           {messages.map((m) => (
//             <MessageBubble key={m.id} role={m.role} parts={m.parts} />
//           ))}

//           {sending && (
//             <MessageBubble
//               role="assistant"
//               parts={[{ type: "text", content: "Outfitly is thinking…" }]}
//             />
//           )}

//           <div ref={endRef} />
//         </div>
//       </main>

//       <MessageComposer
//         input={input}
//         setInput={setInput}
//         onSubmit={onSubmit}
//         onChooseFiles={onChooseFiles}
//         fileCount={queuedFiles.length}
//         sending={sending}
//       />
//     </div>
//   );
// }

// // ------------------------- UI Pieces -------------------------

// function Avatar({ who }) {
//   // You can swap these with your image URLs
//   const src =
//     who === "user"
//       ? "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=user"
//       : "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=stylist";
//   return (
//     <img
//       src={src}
//       alt={who}
//       className="h-8 w-8 rounded-full border object-cover bg-white"
//     />
//   );
// }

// function MessageBubble({ role, parts }) {
//   const isUser = role === "user";

//   const images = useMemo(
//     () =>
//       (parts || [])
//         .filter((p) => p.type === "image" && (p.url || p.src))
//         .map((p) => ({ src: p.url || p.src, alt: p.alt || "outfit" })),
//     [parts]
//   );
//   const texts = (parts || []).filter((p) => p.type === "text");

//   // Lightbox state must live inside a stable component (this one),
//   // not conditionally rendered.
//   const [lightbox, setLightbox] = useState({ open: false, index: 0 });

//   return (
//     <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
//       {!isUser && <Avatar who="assistant" />}
//       <div className={`max-w-[75%] ${isUser ? "" : ""}`}>
//         {/* TEXT: very light blue bg, rounded, small padding. Only renders if there is text. */}
//         {texts.length > 0 && (
//           <div
//             className={`rounded-2xl px-3 py-2 mb-2 ${
//               isUser ? "bg-pink-500 text-white" : "bg-[#eaf4ff] text-zinc-900"
//             }`}
//           >
//             <div className="space-y-2">
//               {texts.map((t, i) => (
//                 <p key={i} className="leading-relaxed whitespace-pre-wrap">
//                   {t.content}
//                 </p>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* IMAGES: compact, stacked portrait thumbnails (no colored bg behind them) */}
//       {images.length > 0 && (
//   <ImageStack
//     images={images}
//     onOpen={(idx) => setLightbox({ open: true, index: idx })}
//   />
// )}

//         {lightbox.open && (
//           <Lightbox
//             items={images}
//             index={lightbox.index}
//             onClose={() => setLightbox({ open: false, index: 0 })}
//             onIndex={(i) => setLightbox((s) => ({ ...s, index: i }))}
//           />
//         )}
//       </div>
//       {isUser && <Avatar who="user" />}
//     </div>
//   );
// }

// function ImageStack({ images, onOpen }) {
//   const count = images.length;
//   const visible = count <= 4 ? images : images.slice(0, 4);
//   const extra = Math.max(0, count - 4);

//   // fixed narrow “album” width to feel like IG DM
//   return (
//     <div className="w-[260px]">
//       {/* base grid; we’ll change spans per count */}
//       <div
//         className={`grid gap-2 ${
//           count === 1 ? "grid-cols-1" : "grid-cols-2"
//         }`}
//       >
//         {visible.map((img, idx) => {
//           // figure out shape for each cell
//           // We'll use aspect-ratio via padding trick for consistent tiles
//           //  - single: 4:5 (tall)
//           //  - two: both 4:5
//           //  - three: first two 1:1, last spans two cols with 4:5
//           //  - four+: all 1:1, last shows +N overlay if extra > 0
//           const isLast = idx === visible.length - 1;
//           const showOverlay = extra > 0 && isLast;

//           // grid spans
//           let span = "col-span-1";
//           if (count === 3 && idx === 2) span = "col-span-2";

//           // aspect wrapper
//           let padTop = "125%"; // default portrait-ish (4:5)
//           if (count === 3 && idx < 2) padTop = "100%"; // top two squares
//           if (count === 2) padTop = "125%";
//           if (count >= 4) padTop = "100%"; // 2x2 squares

//           return (
//             <button
//               key={idx}
//               type="button"
//               onClick={() => onOpen(idx)}
//               className={`relative ${span} overflow-hidden rounded-2xl border bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10`}
//               title="Open"
//             >
//               <div className="relative w-full" style={{ paddingTop: padTop }}>
//                 <img
//                   src={img.src}
//                   alt={img.alt || "outfit"}
//                   loading="lazy"
//                   className="absolute inset-0 h-full w-full object-cover"
//                 />
//               </div>

//               {showOverlay && (
//                 <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
//                   <span className="text-white text-lg font-semibold">+{extra}</span>
//                 </div>
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function Lightbox({ items, index, onClose, onIndex }) {
//   const overlayRef = useRef(null);
//   const img = items[index];

//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
//       if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
//     }
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [index, items.length, onClose, onIndex]);

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

// function MessageComposer({ input, setInput, onSubmit, onChooseFiles, fileCount, sending }) {
//   return (
//     <form onSubmit={onSubmit} className="fixed inset-x-0 bottom-0 z-30 border-t bg-white">
//       <div className="mx-auto flex max-w-4xl gap-3 p-3">
//         <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm">
//           <input
//             id="chat-file-input"
//             type="file"
//             accept="image/*"
//             multiple
//             className="hidden"
//             onChange={onChooseFiles}
//           />
//           📸 Choose Files
//           {!!fileCount && <span className="text-zinc-500">({fileCount})</span>}
//         </label>

//         <input
//           className="flex-1 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10"
//           placeholder="Ask Outfitly what to wear..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />

//         <button
//           disabled={sending}
//           className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
//         >
//           {sending ? "Sending…" : "Send"}
//         </button>
//       </div>
//     </form>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Compact chat UI:
 * - Assistant/user bubbles with avatars
 * - Very light blue background ONLY behind assistant text (not images)
 * - Images shown as small portrait thumbnails stacked vertically
 * - Click any thumbnail to open a lightbox with prev/next + keyboard nav
 * - Sends the latest user message (plus optional images) to /api/chat
 */

// ------------------------- Utils -------------------------

async function fileListToDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              type: "file",
              mediaType: file.type,
              url: reader.result, // data URL
            });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

// ------------------------- Page -------------------------

export default function ChatPage() {
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "assistant",
      parts: [
        {
          type: "text",
          content:
            "👋 Hi there! I can help pick outfits based on weather, mood, and your current location!.",
        },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function onChooseFiles(e) {
    const converted = await fileListToDataUrls(e.target.files);
    setQueuedFiles(converted);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content && queuedFiles.length === 0) return;

    // Locally append the user bubble
    const userMsg = {
      id: Date.now() + "-u",
      role: "user",
      parts: [
        ...(content ? [{ type: "text", content }] : []),
        ...queuedFiles.map((f) => ({ type: "image", url: f.url, alt: "uploaded" })),
      ],
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    const body = {
      messages: [
        {
          role: "user",
          content,
          data: { files: queuedFiles }, // server can read these
        },
      ],
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      // Expect { content: [...] }
      const assistantMsg = {
        id: Date.now() + "-a",
        role: "assistant",
        parts: Array.isArray(data.content)
          ? data.content
          : [{ type: "text", content: String(data.content || "") }],
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + "-err",
          role: "assistant",
          parts: [{ type: "text", content: "⚠️ Something went wrong. Please try again." }],
        },
      ]);
      console.error(err);
    } finally {
      setSending(false);
      setQueuedFiles([]); // clear selected files
      // clear file input visually
      const inputEl = document.getElementById("chat-file-input");
      if (inputEl) inputEl.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
          {/* Back button ← Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            aria-label="Back to Home"
          >
            <span aria-hidden>←</span>
            <span className="hidden sm:inline">Home</span>
          </Link>

          <h1 className="text-xl font-semibold">Outfitly&apos;s Chatbot</h1>

          {/* spacer to balance layout */}
          <span className="w-[72px] sm:w-[86px]" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
        <div className="space-y-5">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} parts={m.parts} />
          ))}

          {sending && (
            <MessageBubble
              role="assistant"
              parts={[{ type: "text", content: "Outfitly is thinking…" }]}
            />
          )}

          <div ref={endRef} />
        </div>
      </main>

      <MessageComposer
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        onChooseFiles={onChooseFiles}
        fileCount={queuedFiles.length}
        sending={sending}
      />
    </div>
  );
}

// ------------------------- UI Pieces -------------------------

function Avatar({ who }) {
  // You can swap these with your image URLs
  const src =
    who === "user"
      ? "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=user"
      : "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=stylist";
  return (
    <img
      src={src}
      alt={who}
      className="h-8 w-8 rounded-full border object-cover bg-white"
    />
  );
}

function MessageBubble({ role, parts }) {
  const isUser = role === "user";

  const images = useMemo(
    () =>
      (parts || [])
        .filter((p) => p.type === "image" && (p.url || p.src))
        .map((p) => ({ src: p.url || p.src, alt: p.alt || "outfit" })),
    [parts]
  );
  const texts = (parts || []).filter((p) => p.type === "text");

  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <Avatar who="assistant" />}
      <div className={`max-w-[75%] ${isUser ? "" : ""}`}>
        {/* TEXT */}
        {texts.length > 0 && (
          <div
            className={`rounded-2xl px-3 py-2 mb-2 ${
              isUser ? "bg-pink-500 text-white" : "bg-[#eaf4ff] text-zinc-900"
            }`}
          >
            <div className="space-y-2">
              {texts.map((t, i) => (
                <p key={i} className="leading-relaxed whitespace-pre-wrap">
                  {t.content}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* IMAGES */}
        {images.length > 0 && (
          <ImageStack
            images={images}
            onOpen={(idx) => setLightbox({ open: true, index: idx })}
          />
        )}

        {lightbox.open && (
          <Lightbox
            items={images}
            index={lightbox.index}
            onClose={() => setLightbox({ open: false, index: 0 })}
            onIndex={(i) => setLightbox((s) => ({ ...s, index: i }))}
          />
        )}
      </div>
      {isUser && <Avatar who="user" />}
    </div>
  );
}

function ImageStack({ images, onOpen }) {
  const count = images.length;
  const visible = count <= 4 ? images : images.slice(0, 4);
  const extra = Math.max(0, count - 4);

  return (
    <div className="w-[260px]">
      <div className={`grid gap-2 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {visible.map((img, idx) => {
          const isLast = idx === visible.length - 1;
          const showOverlay = extra > 0 && isLast;

          let span = "col-span-1";
          if (count === 3 && idx === 2) span = "col-span-2";

          let padTop = "125%"; // portrait-ish
          if (count === 3 && idx < 2) padTop = "100%"; // top two squares
          if (count === 2) padTop = "125%";
          if (count >= 4) padTop = "100%"; // 2x2 squares

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onOpen(idx)}
              className={`relative ${span} overflow-hidden rounded-2xl border bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10`}
              title="Open"
            >
              <div className="relative w-full" style={{ paddingTop: padTop }}>
                <img
                  src={img.src}
                  alt={img.alt || "outfit"}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              {showOverlay && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                  <span className="text-white text-lg font-semibold">+{extra}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Lightbox({ items, index, onClose, onIndex }) {
  const overlayRef = useRef(null);
  const img = items[index];

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 rounded-full bg-white/20 px-3 py-1 text-white hover:bg-white/30"
        >
          Close ✕
        </button>

        <div className="overflow-hidden rounded-2xl bg-black">
          <div className="relative w-full" style={{ paddingTop: "100%" }}>
            <img
              src={img.src}
              alt={img.alt || ""}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        </div>

        {items.length > 1 && (
          <div className="mt-3 flex items-center justify-between text-white/90">
            <button
              onClick={() => onIndex((index - 1 + items.length) % items.length)}
              className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
            >
              ← Prev
            </button>
            <div className="text-sm">
              {index + 1} / {items.length}
            </div>
            <button
              onClick={() => onIndex((index + 1) % items.length)}
              className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageComposer({ input, setInput, onSubmit, onChooseFiles, fileCount, sending }) {
  return (
    <form onSubmit={onSubmit} className="fixed inset-x-0 bottom-0 z-30 border-t bg-white">
      <div className="mx-auto flex max-w-4xl gap-3 p-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm">
          <input
            id="chat-file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onChooseFiles}
          />
          📸 Choose Files
          {!!fileCount && <span className="text-zinc-500">({fileCount})</span>}
        </label>

        <input
          className="flex-1 rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10"
          placeholder="Ask Outfitly what to wear..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          disabled={sending}
          className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}