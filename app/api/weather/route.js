
export const runtime = "edge"

export async function GET(req) {
  const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

  if (!WEATHER_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENWEATHER_API_KEY is not set in environment variables." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  let city = searchParams.get("city")

  const countryToCityMap = {
    india: "New Delhi,IN",
    "new dehli": "New Delhi,IN",
    "new delhi": "New Delhi,IN",
    delhi: "New Delhi,IN",
    mumbai: "Mumbai,IN",
    bangalore: "Bangalore,IN",
    kolkata: "Kolkata,IN",
    chennai: "Chennai,IN",
    usa: "New York,US",
    "united states": "New York,US",
    uk: "London,GB",
    "united kingdom": "London,GB",
    canada: "Toronto,CA",
    australia: "Sydney,AU",
    germany: "Berlin,DE",
    france: "Paris,FR",
    japan: "Tokyo,JP",
    china: "Beijing,CN",
    brazil: "São Paulo,BR",
    russia: "Moscow,RU",
    italy: "Rome,IT",
    spain: "Madrid,ES",
    mexico: "Mexico City,MX",
    thailand: "Bangkok,TH",
    singapore: "Singapore,SG",
    "south korea": "Seoul,KR",
    korea: "Seoul,KR",
    netherlands: "Amsterdam,NL",
  }

  if (city) {
    const normalizedCity = city.toLowerCase().trim()
    console.log(`[v0] Weather API: Original city: "${city}", Normalized: "${normalizedCity}"`)
    if (countryToCityMap[normalizedCity]) {
      const mappedCity = countryToCityMap[normalizedCity]
      console.log(`[v0] Weather API: Mapping "${normalizedCity}" to "${mappedCity}"`)
      city = mappedCity
    }
    console.log(`[v0] Weather API: Final city for API call: "${city}"`)
  }

  let weatherUrl
  if (lat && lon) {
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
  } else if (city) {
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
  } else {
    return new Response(JSON.stringify({ error: "Please provide either lat/lon coordinates or city name." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const weatherResponse = await fetch(weatherUrl)

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text()
      return new Response(
        JSON.stringify({ error: `Failed to fetch weather data: ${weatherResponse.statusText}. Details: ${errorText}` }),
        {
          status: weatherResponse.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const weatherData = await weatherResponse.json()

    // Extract relevant weather information
    const weather = {
      location: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      description: weatherData.weather[0].description,
      main: weatherData.weather[0].main.toLowerCase(),
      windSpeed: weatherData.wind.speed,
      icon: weatherData.weather[0].icon,
    }

    return new Response(JSON.stringify({ weather }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred while fetching weather data." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
