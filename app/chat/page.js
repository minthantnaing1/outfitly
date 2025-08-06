"use client";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const respond = (text) => {
    text = text.toLowerCase();
    if (text.includes("wedding"))
      return "Try a formal shirt, trousers, and black shoes.";
    if (text.includes("rain"))
      return "Wear something waterproof like a jacket or hoodie.";
    if (text.includes("hot")) return "Stay cool with a T-shirt and shorts!";
    if (text.includes("party"))
      return "Go bold with black jeans and a statement top!";
    return "Try asking about wedding, rain, party, or weather!";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: "you", text: input };
    const botMsg = { from: "bot", text: respond(input) };
    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Style Chat Assistant</h2>
      <div className="border p-4 h-80 overflow-y-auto mb-4 bg-gray-50 rounded">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${
              msg.from === "you" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-1 rounded ${
                msg.from === "you" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Ask me what to wear..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </main>
  );
}
