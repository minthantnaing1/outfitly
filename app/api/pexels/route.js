// export async function GET(request) {
//   const { searchParams } = new URL(request.url)
//   const query = searchParams.get("query")

//   if (!query) {
//     return Response.json({ error: "Query parameter is required" }, { status: 400 })
//   }

//   try {
//     const response = await fetch(
//       `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&category=fashion&min_width=400&min_height=400&per_page=6&safesearch=true`,
//     )

//     if (!response.ok) {
//       throw new Error(`Pixabay API error: ${response.status}`)
//     }

//     const data = await response.json()

//     const images = data.hits.map((hit) => ({
//       id: hit.id,
//       url: hit.webformatURL,
//       alt: hit.tags,
//       photographer: hit.user,
//       photographer_url: hit.pageURL,
//     }))

//     return Response.json({ images })
//   } catch (error) {
//     console.error("Pixabay API error:", error)
//     return Response.json({ error: "Failed to fetch images from Pixabay" }, { status: 500 })
//   }
// }

// app/api/pexels/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let query = (searchParams.get("query") || "").trim();
    const per_page = Number(searchParams.get("per_page") || 6);
    const page = Number(searchParams.get("page") || 1);

    if (!query) {
      // Keep the chat flow running even if query was empty
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const PEXELS_KEY = process.env.PEXELS_API_KEY || process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    if (!PEXELS_KEY) {
      console.error("[pexels] Missing PEXELS_API_KEY");
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Portrait bias works better for outfit shots
    const url =
      `https://api.pexels.com/v1/search` +
      `?query=${encodeURIComponent(query)}` +
      `&per_page=${per_page}` +
      `&page=${page}` +
      `&orientation=portrait`;

    const resp = await fetch(url, {
      headers: { Authorization: PEXELS_KEY },
      cache: "no-store",
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error(`[pexels] ${resp.status}: ${t}`);
      // Return empty set (not error) so the caller can continue with other sources
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();

    // UNIFIED SHAPE: always { src, alt }
    const images = (data?.photos || [])
      .map((p) => ({
        src: p?.src?.medium || p?.src?.large || p?.src?.original || p?.url || "",
        alt: p?.alt || "",
      }))
      .filter((x) => x.src);

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[pexels] route failure:", e);
    // Keep it non-fatal for the chat flow
    return new Response(JSON.stringify({ images: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}