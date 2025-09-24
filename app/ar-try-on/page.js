"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AR Try-On (UI-first) — Live camera preview + draggable/transformable overlay
 * Works as a standalone page. Uses getUserMedia with graceful fallback.
 * Tailwind-friendly classes; if you don’t use Tailwind, replace classNames with your styles.
 */
export default function Page() {
  const videoRef = useRef(null);
  const [camErr, setCamErr] = useState("");
  const [facing, setFacing] = useState("environment"); // "user" | "environment"
  const [ready, setReady] = useState(false);

  // Overlay state (pretend garment)
  const [overlay, setOverlay] = useState({
    x: 0, // px offset from center
    y: 40,
    scale: 1.1,
    rotate: 0,
    opacity: 0.9,
    item: "tee", // "tee" | "pants" | "shoes"
    color: "#ffffff",
  });

  // Simple inline SVGs (transparent “garment” masks)
  const svgs = {
    tee: (c) =>
      `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
            </filter>
          </defs>
          <g filter="url(#shadow)">
            <path d="M150 120c40-30 160-30 200 0l50 45-40 45-30-23v233c0 10-8 18-18 18H188c-10 0-18-8-18-18V187l-30 23-40-45 50-45z"
              fill="${c}" fill-opacity="0.86" stroke="black" stroke-opacity="0.08" stroke-width="2"/>
          </g>
        </svg>
      `)}`,
    pants: (c) =>
      `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
            </filter>
          </defs>
          <g filter="url(#shadow)" fill="${c}" fill-opacity="0.88" stroke="black" stroke-opacity="0.08" stroke-width="2">
            <path d="M170 90h160l20 90-35 230h-65l-15-145-15 145h-65l-35-230 20-90z"/>
          </g>
        </svg>
      `)}`,
    shoes: (c) =>
      `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.25"/>
            </filter>
          </defs>
          <g filter="url(#shadow)" fill="${c}" fill-opacity="0.9" stroke="black" stroke-opacity="0.08" stroke-width="2">
            <path d="M60 190c40-20 90-40 170-40 40 0 80 10 120 35l20 15c8 6 11 15 8 24-4 12-16 20-28 20H90c-33 0-47-40-30-54z"/>
            <rect x="210" y="155" width="70" height="15" rx="7"/>
          </g>
        </svg>
      `)}`,
  };

  // Camera setup
  useEffect(() => {
    let stream;
    const open = async () => {
      setCamErr("");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing, // try rear camera by default
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        setCamErr(e?.message || "Unable to access camera.");
        setReady(false);
      }
    };
    open();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facing]);

  // Helpers for overlay updates
  const upd = (patch) => setOverlay((o) => ({ ...o, ...patch }));

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <button
            onClick={() => history.back()}
            className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            ← Back
          </button>
          <h1 className="text-lg md:text-2xl font-extrabold tracking-tight">
            Outfitly <span className="text-pink-400">AR Try-On</span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFacing((f) => (f === "user" ? "environment" : "user"))
              }
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
              title="Switch camera"
            >
              🔄 Camera
            </button>
          </div>
        </div>
      </div>

      {/* Camera stage */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          {/* Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="block w-full h-[70vh] object-cover"
          />
          {!ready && (
            <div className="absolute inset-0 grid place-items-center bg-black/70">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <p className="text-sm opacity-80">
                  {camErr ? camErr : "Opening camera…"}
                </p>
              </div>
            </div>
          )}

          {/* Overlay (the “garment”) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <img
              src={svgs[overlay.item](overlay.color)}
              alt=""
              style={{
                transform: `translate(${overlay.x}px, ${overlay.y}px) scale(${overlay.scale}) rotate(${overlay.rotate}deg)`,
                opacity: overlay.opacity,
                transition: "transform 120ms ease",
              }}
              className="select-none"
            />
          </div>

          {/* Bottom control dock */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 p-3">
              <div className="grid md:grid-cols-5 gap-3">
                {/* Item picker */}
                <div className="md:col-span-2 flex items-center gap-2">
                  {[
                    { id: "tee", label: "Top" },
                    { id: "pants", label: "Bottom" },
                    { id: "shoes", label: "Shoes" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => upd({ item: b.id })}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition ${
                        overlay.item === b.id
                          ? "bg-pink-500 text-white ring-pink-400"
                          : "bg-white/5 text-white ring-white/20 hover:bg-white/10"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={overlay.color}
                    onChange={(e) => upd({ color: e.target.value })}
                    className="ml-2 h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    title="Color"
                  />
                </div>

                {/* Sliders */}
                <div className="flex items-center gap-2">
                  <label className="text-xs opacity-80 w-14">Scale</label>
                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.01"
                    value={overlay.scale}
                    onChange={(e) => upd({ scale: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs opacity-80 w-14">Rotate</label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={overlay.rotate}
                    onChange={(e) => upd({ rotate: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs opacity-80 w-14">Opacity</label>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.01"
                    value={overlay.opacity}
                    onChange={(e) =>
                      upd({ opacity: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Position controls */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-80 w-6">X</span>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={overlay.x}
                    onChange={(e) => upd({ x: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-80 w-6">Y</span>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="1"
                    value={overlay.y}
                    onChange={(e) => upd({ y: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() =>
                      setOverlay((o) => ({
                        ...o,
                        x: 0,
                        y: 40,
                        scale: 1.1,
                        rotate: 0,
                        opacity: 0.9,
                      }))
                    }
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      // Mock capture — you can wire this to canvas later
                      alert("Captured! (demo)");
                    }}
                    className="rounded-xl bg-pink-500 px-3 py-2 text-sm font-semibold hover:bg-pink-600"
                  >
                    Capture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mx-auto mt-4 max-w-6xl rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/90">
          <div className="flex flex-wrap items-center gap-4">
            <span className="opacity-80">Tip:</span>
            <span>Switch camera with “🔄 Camera”.</span>
            <span>Use sliders to align the overlay to your body.</span>
            <span>Change color with the color picker.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
