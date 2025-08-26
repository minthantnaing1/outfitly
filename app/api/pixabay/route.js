export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const per_page = searchParams.get("per_page") || "3"

  if (!query) {
    return Response.json({ error: "Query parameter is required" }, { status: 400 })
  }

  if (!process.env.PIXABAY_API_KEY) {
    console.error("PIXABAY_API_KEY not found in environment variables")
    return Response.json({ error: "Pixabay API key not configured" }, { status: 500 })
  }

  try {
    const apiUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=vertical&category=people&min_width=300&min_height=400&per_page=${per_page}&safesearch=true&editors_choice=false`

    console.log(`[v0] Pixabay API URL: ${apiUrl}`)

    const response = await fetch(apiUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Pixabay API error: ${response.status} - ${errorText}`)
      throw new Error(`Pixabay API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] Pixabay API returned ${data.hits?.length || 0} images`)

    const images = data.hits.map((hit) => ({
      id: hit.id,
      src: hit.webformatURL,
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
