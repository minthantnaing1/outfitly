// export async function GET(request) {
//   const { searchParams } = new URL(request.url)
//   const query = searchParams.get("query")
//   const per_page = searchParams.get("per_page") || "3"

//   if (!query) {
//     return Response.json({ error: "Query parameter is required" }, { status: 400 })
//   }

//   if (!process.env.PIXABAY_API_KEY) {
//     console.error("PIXABAY_API_KEY not found in environment variables")
//     return Response.json({ error: "Pixabay API key not configured" }, { status: 500 })
//   }

//   try {
//     const apiUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=vertical&category=people&min_width=300&min_height=400&per_page=${per_page}&safesearch=true&editors_choice=false`

//     console.log(`[v0] Pixabay API URL: ${apiUrl}`)

//     const response = await fetch(apiUrl)

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error(`Pixabay API error: ${response.status} - ${errorText}`)
//       throw new Error(`Pixabay API error: ${response.status}`)
//     }

//     const data = await response.json()
//     console.log(`[v0] Pixabay API returned ${data.hits?.length || 0} images`)

//     const images = data.hits.map((hit) => ({
//       id: hit.id,
//       src: hit.webformatURL,
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

// app/api/pixabay/route.js


// app/api/pixabay/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let query = (searchParams.get("query") || "").trim();
    const per_page = Number(searchParams.get("per_page") || 6);
    const page = Number(searchParams.get("page") || 1);
    // default "fashion" works well; caller can override with &category=
    const category = (searchParams.get("category") || "fashion").trim();

    if (!query) {
      // Keep the chat flow running even if query was empty
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const PIXABAY_KEY = process.env.PIXABAY_API_KEY || process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
    if (!PIXABAY_KEY) {
      console.error("[pixabay] Missing PIXABAY_API_KEY");
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pixabay hard limit: "q" must be <= 100 chars. Keep a bit lower for safety.
    if (query.length > 96) query = query.slice(0, 96);

    const url =
      `https://pixabay.com/api/` +
      `?key=${PIXABAY_KEY}` +
      `&q=${encodeURIComponent(query)}` +
      `&image_type=photo` +
      `&orientation=vertical` +
      `&category=${encodeURIComponent(category)}` +
      `&min_width=300&min_height=400` +
      `&per_page=${per_page}` +
      `&page=${page}` +
      `&safesearch=true&editors_choice=false`;

    console.log(`[pixabay] URL: ${url.replace(PIXABAY_KEY, "***")}`);

    const resp = await fetch(url, { cache: "no-store" });

    if (!resp.ok) {
      const t = await resp.text();
      console.error(`[pixabay] ${resp.status}: ${t}`);
      // Return empty set (not error) so the caller can continue with other sources
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();

    // UNIFIED SHAPE: always { src, alt }
    const images = (data?.hits || [])
      .map((h) => ({
        src: h?.webformatURL || h?.largeImageURL || "",
        alt: h?.tags || "",
      }))
      .filter((x) => x.src);

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[pixabay] route failure:", e);
    // Keep it non-fatal for the chat flow
    return new Response(JSON.stringify({ images: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}