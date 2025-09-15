export const runtime = 'edge'; // Use edge runtime for this API route

export async function GET(req) {
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error('PEXELS_API_KEY is not set in environment variables.');
  return new Response(JSON.stringify({ error: 'PEXELS_API_KEY is not set in environment variables.' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

const { searchParams } = new URL(req.url);
const query = (searchParams.get('query') || 'fashion outfits') + ' people'; // Default query, now includes 'people'
const perPage = searchParams.get('per_page') || '3'; // Number of images to fetch

try {
  const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!pexelsResponse.ok) {
    const errorText = await pexelsResponse.text();
    console.error('Pexels API Error:', pexelsResponse.status, errorText);
    return new Response(JSON.stringify({ error: `Failed to fetch images from Pexels: ${pexelsResponse.statusText}. Raw error: ${errorText}` }), {
      status: pexelsResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await pexelsResponse.json();
  console.log('Pexels API raw response data:', JSON.stringify(data, null, 2)); // Log raw response

  // Ensure data.photos exists and is an array
  if (!data.photos || !Array.isArray(data.photos)) {
    console.error('Pexels API response did not contain photos array:', data);
    return new Response(JSON.stringify({ error: 'Invalid Pexels API response structure: missing photos array.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const images = data.photos.map(photo => {
    // Ensure photo.src and photo.src.medium exist
    if (!photo.src || !photo.src.medium) {
      console.warn('Pexels photo missing src.medium, skipping:', photo);
      return null; // Skip this photo
    }
    return {
      id: photo.id,
      src: photo.src.medium, // Using 'medium' size for display
      alt: photo.alt,
    };
  }).filter(Boolean); // Filter out null entries

  console.log('Pexels API processed images:', images); // Log processed images

  return new Response(JSON.stringify({ images }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

} catch (error) {
  console.error('Server Error fetching Pexels images:', error);
  return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred while fetching images.' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
}