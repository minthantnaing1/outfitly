export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const weather = searchParams.get("weather")
  const temp = searchParams.get("temp")

  if (!query) {
    return Response.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Use multiple free sources for fashion images
    const sources = [
      {
        name: "pixabay",
        url: `/api/pixabay?query=${encodeURIComponent(query + " fashion outfit")}`,
      },
      {
        name: "pexels",
        url: `/api/pexels?query=${encodeURIComponent(query + " fashion style")}`,
      },
    ]

    const imagePromises = sources.map(async (source) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${source.url}`)
        if (response.ok) {
          const data = await response.json()
          return { source: source.name, images: data.images || [] }
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error)
      }
      return { source: source.name, images: [] }
    })

    const results = await Promise.all(imagePromises)

    // Combine and shuffle images from all sources
    const allImages = results.flatMap((result) => result.images.map((img) => ({ ...img, source: result.source })))

    // Shuffle and limit to 6 images
    const shuffledImages = allImages.sort(() => Math.random() - 0.5).slice(0, 6)

    return Response.json({ images: shuffledImages })
  } catch (error) {
    console.error("Fashion AI API error:", error)
    return Response.json({ error: "Failed to fetch fashion images" }, { status: 500 })
  }
}
