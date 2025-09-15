"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

// Helper function to convert FileList to data URLs for sending to the API
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
    const fileParts =
      files && files.length > 0 ? await convertFilesToDataURLs(files) : [];

    const newUserMessage = {
      id: Date.now().toString() + "-user", // Unique ID for user message
      role: "user",
      content: userMessageContent, // User message content is still a string
      data: { files: fileParts },
    };

    // Add user message to state immediately
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      console.log("Client: Sending message to API:", newUserMessage);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }), // Send all messages for context if needed by server
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const assistantResponse = await response.json(); // Expecting JSON response
      console.log("Client: Received API response:", assistantResponse);

      // Add assistant message to state
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
    } catch (err) {
      console.error("Client: API call error:", err);
      setError(err.message);
      // Optionally add an error message to the chat UI
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: [
            {
              type: "text",
              content: `Error: ${err.message}. Please try again.`,
            },
          ], // Error message as an array part
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Outfitly's Chatbot
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
                  : m.isError // Apply error styling if it's an error message
                  ? "bg-red-200 text-red-800 rounded-bl-none"
                  : "bg-gray-300 text-gray-800 rounded-bl-none"
              }`}
            >
              {/* Render content based on its type */}
              {Array.isArray(m.content) ? (
                m.content.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <p key={index} className="whitespace-pre-wrap">
                        {part.content}
                      </p>
                    );
                  } else if (part.type === "image") {
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
