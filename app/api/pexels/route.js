export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return Response.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&category=fashion&min_width=400&min_height=400&per_page=6&safesearch=true`,
    )

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`)
    }

    const data = await response.json()

    const images = data.hits.map((hit) => ({
      id: hit.id,
      url: hit.webformatURL,
      alt: hit.tags,
      photographer: hit.user,
      photographer_url: hit.pageURL,
    }))

    return Response.json({ images })
  } catch (error) {
    console.error("Pixabay API error:", error)
    return Response.json({ error: "Failed to fetch images from Pixabay" }, { status: 500 })
  }
}
