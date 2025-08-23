// Removed AI SDK imports as we are no longer using its streaming capabilities
// import { StreamingTextResponse } from 'ai';
 
export const runtime = 'edge';
 
export async function POST(req) {
  try {
    // Construct absolute base URL for internal API calls
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
 
    const { messages } = await req.json();
    console.log('API Route: Received messages from client:', JSON.stringify(messages, null, 2));
 
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";
    let replyParts = []; // This will now be an array of parts (text or image)
 
    // Generate a random page number for Pexels API to get different results
    const randomPage = Math.floor(Math.random() * 10) + 1; // Random page between 1 and 10
 
    if (lastMessage.includes("hi")) {
      replyParts.push({ type: 'text', content: "👋 Hi there! I'm Outfitly, your personal AI stylist. How can I help you today?" });
    } else if (lastMessage.includes("what should i wear today")) {
      replyParts.push({ type: 'text', content: "Tell me about the weather today! Is it hot, cold, sunny, or rainy?" });
    } else if (lastMessage.includes("hot") || lastMessage.includes("sunny")) {
      replyParts.push({ type: 'text', content: "☀️ For hot weather, try a light cotton dress or shorts with a breathable shirt!" });
      // Fetch images for hot weather using absolute path for internal API call
      const pexelsResponse = await fetch(`${baseUrl}/api/pexels?query=hot weather trendy 2025 fashion outfits people&per_page=3&page=${randomPage}`);
      if (pexelsResponse.ok) {
        const { images } = await pexelsResponse.json();
        if (images && images.length > 0) {
          replyParts.push({ type: 'text', content: "Here are some ideas:" });
          images.forEach(img => replyParts.push({ type: 'image', url: img.src, alt: img.alt }));
        }
      } else {
        console.error('Failed to fetch Pexels images for hot weather from internal API.');
      }
    } else if (lastMessage.includes("cold") || lastMessage.includes("rain")) {
      replyParts.push({ type: 'text', content: "🌧 For cold or rainy days, go with a long coat, boots, and layers!" });
      // Fetch images for cold/rainy weather using absolute path for internal API call
      const pexelsResponse = await fetch(`${baseUrl}/api/pexels?query=cold weather trendy 2025 fashion outfits people&per_page=3&page=${randomPage}`);
      if (pexelsResponse.ok) {
        const { images } = await pexelsResponse.json();
        if (images && images.length > 0) {
          replyParts.push({ type: 'text', content: "Here are some ideas:" });
          images.forEach(img => replyParts.push({ type: 'image', url: img.src, alt: img.alt }));
        }
      } else {
        console.error('Failed to fetch Pexels images for cold/rainy weather from internal API.');
      }
    } else if (lastMessage.includes("wedding")) {
      replyParts.push({ type: 'text', content: "💒 For a wedding, you could wear a formal dress or suit in neutral or pastel colors." });
      const pexelsResponse = await fetch(`${baseUrl}/api/pexels?query=wedding guest trendy 2025 fashion outfits people&per_page=3&page=${randomPage}`);
      if (pexelsResponse.ok) {
        const { images } = await pexelsResponse.json();
        if (images && images.length > 0) {
          replyParts.push({ type: 'text', content: "Here are some ideas:" });
          images.forEach(img => replyParts.push({ type: 'image', url: img.src, alt: img.alt }));
        }
      } else {
        console.error('Failed to fetch Pexels images for wedding from internal API.');
      }
    } else if (lastMessage.includes("school")) {
      replyParts.push({ type: 'text', content: "🎒 For school, keep it comfy — maybe jeans, a cute top, and sneakers!" });
      const pexelsResponse = await fetch(`${baseUrl}/api/pexels?query=school trendy 2025 fashion outfits people&per_page=3&page=${randomPage}`);
      if (pexelsResponse.ok) {
        const { images } = await pexelsResponse.json();
        if (images && images.length > 0) {
          replyParts.push({ type: 'text', content: "Here are some ideas:" });
          images.forEach(img => replyParts.push({ type: 'image', url: img.src, alt: img.alt }));
        }
      } else {
        console.error('Failed to fetch Pexels images for school from internal API.');
      }
    } else if (lastMessage.includes("party")) {
      replyParts.push({ type: 'text', content: "🎉 For a party, try a statement dress, bold earrings, and heels!" });
      const pexelsResponse = await fetch(`${baseUrl}/api/pexels?query=party trendy 2025 fashion outfits people&per_page=3&page=${randomPage}`);
      if (pexelsResponse.ok) {
        const { images } = await pexelsResponse.json();
        if (images && images.length > 0) {
          replyParts.push({ type: 'text', content: "Here are some ideas:" });
          images.forEach(img => replyParts.push({ type: 'image', url: img.src, alt: img.alt }));
        }
      } else {
        console.error('Failed to fetch Pexels images for party from internal API.');
      }
    } else {
      replyParts.push({ type: 'text', content: "👗 Hello! I'm your AI stylist. Ask me what to wear!" });
    }
 
    console.log('API Route: Generating simple response with parts:', replyParts);
 
    // Return a standard JSON response with an array of content parts
    return new Response(JSON.stringify({
      id: Date.now().toString(), // Unique ID for the message
      role: "assistant",
      content: replyParts // Now an array of objects
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
 
  } catch (error) {
    console.error('API Route Error:', error);
    // Return a more informative error response to the client
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
 
 

 