export const runtime = "edge"

// Helper function to get weather-based outfit recommendations
function getWeatherOutfitRecommendation(weather) {
  const temp = weather.temperature
  const condition = weather.main
  const description = weather.description
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const currentSeason = getSeason(currentMonth)

  let recommendation = ""
  let searchQuery = ""

  const weatherText =
    description &&
    description !== "undefined" &&
    description !== "null" &&
    description.toLowerCase() !== "undefined" &&
    description.trim() !== "" &&
    typeof description === "string"
      ? `${temp}°C and ${description}`
      : `${temp}°C`

  if (temp >= 30) {
    // Very hot weather (30°C and above)
    recommendation = `🔥 It's ${weatherText} in ${weather.location}! Ultra-hot weather calls for minimal, breathable pieces. Try linen shorts, a loose cotton tank, breathable sandals, and a wide-brim hat for sun protection!`
    searchQuery = "summer hot weather linen cotton minimal fashion outfits"
  } else if (temp >= 25 && temp < 30) {
    // Hot weather (25-29°C)
    recommendation = `☀️ It's ${weatherText} in ${weather.location}! Perfect for trendy summer pieces - try high-waisted shorts with a crop top, or a flowy midi dress with comfortable sneakers. Don't forget UV protection!`
    searchQuery = "summer warm weather fashion outfits crop tops midi dress"
  } else if (temp >= 20 && temp < 25) {
    // Warm weather (20-24°C)
    if (condition.includes("rain") || weather.humidity > 80) {
      recommendation = `🌦️ It's ${temp}°C with ${description || "rainy conditions"} in ${weather.location}. Perfect for layered spring looks! Try straight-leg jeans with a lightweight cardigan, white sneakers, and a stylish trench coat for rain protection.`
      searchQuery = "spring layered fashion outfits trench coat cardigan"
    } else {
      recommendation = `🌤️ Beautiful ${temp}°C weather in ${weather.location}! Ideal for ${currentSeason} transitional pieces - try wide-leg pants with a fitted tee, denim jacket, and platform sneakers for that effortless chic look.`
      searchQuery = "spring fashion outfits wide leg pants denim jacket"
    }
  } else if (temp >= 15 && temp < 20) {
    // Mild weather (15-19°C)
    recommendation = `🍃 It's ${weatherText} in ${weather.location}. Perfect for cozy-chic vibes! Try oversized blazers with straight jeans, chunky sneakers, and layered accessories. Add a crossbody bag for that trendy touch!`
    searchQuery = "fall mild weather fashion outfits oversized blazer"
  } else if (temp >= 10 && temp < 15) {
    // Cool weather (10-14°C)
    recommendation = `🍂 It's ${weatherText} in ${weather.location}. Time for stylish layering! Think turtleneck sweaters, tailored coats, ankle boots, and statement scarves. Perfect weather for rich autumn tones!`
    searchQuery = "fall cool weather fashion outfits turtleneck coat boots"
  } else if (temp >= 0 && temp < 10) {
    // Cold weather (0-9°C)
    recommendation = `❄️ It's ${weatherText} in ${weather.location}. Bundle up in style with puffer jackets, thermal layers, knee-high boots, and cozy beanies. Try monochromatic looks for a sleek winter aesthetic!`
    searchQuery = "winter cold weather fashion outfits puffer jacket boots"
  } else {
    // Very cold weather (below 0°C)
    recommendation = `🧊 Brr! It's ${weatherText} in ${weather.location}. Time for maximum warmth with style! Long wool coats, thermal base layers, insulated boots, and luxury accessories like cashmere scarves and leather gloves.`
    searchQuery = "winter very cold fashion outfits wool coat cashmere"
  }

  if (condition.includes("rain") || condition.includes("drizzle")) {
    recommendation += " Trending rain gear: clear umbrellas, waterproof trench coats, and stylish rain boots! 🌧️"
    searchQuery += " rain umbrella"
  } else if (condition.includes("snow")) {
    recommendation += " Snow day essentials: insulated boots, layered textures, and statement winter accessories! ❄️"
    searchQuery += " snow winter"
  } else if (condition.includes("wind") || weather.windSpeed > 5) {
    recommendation += " Windy weather tip: secure scarves, avoid flowy pieces, and opt for structured silhouettes! 💨"
    searchQuery += " structured"
  }

  const seasonalTrends = getSeasonalTrends(currentSeason)
  recommendation += ` ${seasonalTrends}`

  return { recommendation, searchQuery }
}

function getSeason(month) {
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "fall"
  return "winter"
}

function getSeasonalTrends(season) {
  const trends = {
    spring: " 🌸 Spring 2025 trends: pastel colors, floral prints, and sustainable fabrics!",
    summer: " 🌺 Summer 2025 trends: vibrant colors, cut-out details, and breathable materials!",
    fall: " 🍁 Fall 2025 trends: earth tones, textured fabrics, and statement outerwear!",
    winter: " ❄️ Winter 2025 trends: rich jewel tones, luxe textures, and oversized silhouettes!",
  }
  return trends[season] || ""
}

function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout)),
  ])
}

function getCulturalClothing(city, weather) {
  const culturalMap = {
    // India
    "new delhi": "indian",
    mumbai: "indian",
    bangalore: "indian",
    chennai: "indian",
    kolkata: "indian",
    hyderabad: "indian",
    pune: "indian",
    jaipur: "indian",
    ahmedabad: "indian",
    surat: "indian",
    india: "indian",

    // Japan
    tokyo: "japanese",
    osaka: "japanese",
    kyoto: "japanese",
    hiroshima: "japanese",
    nagoya: "japanese",
    yokohama: "japanese",
    kobe: "japanese",
    fukuoka: "japanese",
    japan: "japanese",

    // Korea
    seoul: "korean",
    busan: "korean",
    incheon: "korean",
    daegu: "korean",
    korea: "korean",
    "south korea": "korean",

    // China
    beijing: "chinese",
    shanghai: "chinese",
    guangzhou: "chinese",
    shenzhen: "chinese",
    chengdu: "chinese",
    hangzhou: "chinese",
    wuhan: "chinese",
    xian: "chinese",
    china: "chinese",

    // Vietnam
    "ho chi minh": "vietnamese",
    hanoi: "vietnamese",
    "da nang": "vietnamese",
    vietnam: "vietnamese",

    // Thailand
    bangkok: "thai",
    "chiang mai": "thai",
    phuket: "thai",
    pattaya: "thai",
    thailand: "thai",

    // Indonesia
    jakarta: "indonesian",
    surabaya: "indonesian",
    bandung: "indonesian",
    medan: "indonesian",
    bali: "indonesian",
    indonesia: "indonesian",

    // Malaysia
    "kuala lumpur": "malaysian",
    "george town": "malaysian",
    "johor bahru": "malaysian",
    malaysia: "malaysian",

    // Singapore
    singapore: "singaporean",

    // Philippines
    manila: "filipino",
    "quezon city": "filipino",
    cebu: "filipino",
    davao: "filipino",
    philippines: "filipino",

    // Middle East
    dubai: "arabic",
    "abu dhabi": "arabic",
    riyadh: "arabic",
    jeddah: "arabic",
    doha: "arabic",
    kuwait: "arabic",
    manama: "arabic",
    muscat: "arabic",
    amman: "arabic",
    beirut: "arabic",
    baghdad: "arabic",
    tehran: "persian",
    isfahan: "persian",
    istanbul: "turkish",
    ankara: "turkish",
    izmir: "turkish",

    // Africa
    lagos: "african",
    cairo: "african",
    kinshasa: "african",
    johannesburg: "african",
    "cape town": "african",
    nairobi: "african",
    casablanca: "african",
    addis: "african",
    accra: "african",
    dakar: "african",
    tunis: "african",
    algiers: "african",
    morocco: "african",
    egypt: "egyptian",
    nigeria: "nigerian",
    "south africa": "southafrican",
    kenya: "kenyan",
    ghana: "ghanaian",
    ethiopia: "ethiopian",

    // Europe
    london: "british",
    manchester: "british",
    birmingham: "british",
    glasgow: "british",
    "united kingdom": "british",
    england: "british",
    scotland: "british",

    paris: "french",
    marseille: "french",
    lyon: "french",
    toulouse: "french",
    france: "french",

    berlin: "german",
    munich: "german",
    hamburg: "german",
    cologne: "german",
    germany: "german",

    rome: "italian",
    milan: "italian",
    naples: "italian",
    turin: "italian",
    italy: "italian",

    madrid: "spanish",
    barcelona: "spanish",
    valencia: "spanish",
    seville: "spanish",
    spain: "spanish",

    amsterdam: "dutch",
    rotterdam: "dutch",
    "the hague": "dutch",
    netherlands: "dutch",

    moscow: "russian",
    "st petersburg": "russian",
    novosibirsk: "russian",
    yekaterinburg: "russian",
    russia: "russian",

    athens: "greek",
    thessaloniki: "greek",
    greece: "greek",

    stockholm: "scandinavian",
    gothenburg: "scandinavian",
    sweden: "swedish",

    oslo: "scandinavian",
    bergen: "scandinavian",
    norway: "norway",

    copenhagen: "scandinavian",
    aarhus: "scandinavian",
    denmark: "danish",

    helsinki: "scandinavian",
    espoo: "scandinavian",
    finland: "finnish",

    // Americas
    "new york": "american",
    "los angeles": "american",
    chicago: "american",
    houston: "american",
    phoenix: "american",
    philadelphia: "american",
    "san antonio": "american",
    "san diego": "american",
    dallas: "american",
    "san jose": "american",
    miami: "american",
    atlanta: "american",
    boston: "american",
    seattle: "american",
    "las vegas": "american",
    "united states": "american",
    usa: "american",
    america: "american",

    toronto: "canadian",
    montreal: "canadian",
    vancouver: "canadian",
    calgary: "canadian",
    ottawa: "canadian",
    canada: "canadian",

    "mexico city": "mexican",
    guadalajara: "mexican",
    monterrey: "mexican",
    puebla: "mexican",
    mexico: "mexican",

    "sao paulo": "brazilian",
    "rio de janeiro": "brazilian",
    brasilia: "brazilian",
    salvador: "brazilian",
    fortaleza: "brazilian",
    brazil: "brazilian",

    "buenos aires": "argentinian",
    cordoba: "argentinian",
    rosario: "argentinian",
    argentina: "argentinian",

    lima: "peruvian",
    arequipa: "peruvian",
    peru: "peruvian",

    bogota: "colombian",
    medellin: "colombian",
    cali: "colombian",
    colombia: "colombian",

    santiago: "chilean",
    valparaiso: "chilean",
    chile: "chile",

    // Oceania
    sydney: "australian",
    melbourne: "australian",
    brisbane: "australian",
    perth: "australian",
    adelaide: "australian",
    australia: "australian",

    auckland: "newzealand",
    wellington: "newzealand",
    christchurch: "newzealand",
    "new zealand": "newzealand",
  }

  const cityKey = city.toLowerCase().replace(/,.*/, "").trim()
  const culture = culturalMap[cityKey]

  if (!culture) return null

  const temp = weather.temperature
  const culturalOutfits = {
    indian: {
      hot: {
        recommendation:
          "🇮🇳 Perfect weather for beautiful Indian summer wear! Try cotton kurtas with palazzo pants, lightweight sarees in breathable fabrics like cotton or linen, or trendy Indo-western crop tops with flowy skirts. Add juttis or kolhapuris for comfort!",
        searchQuery: "indian women kurta saree summer cotton girls fashion",
      },
      mild: {
        recommendation:
          "🇮🇳 Lovely weather for elegant Indian fusion! Consider silk kurtas with straight pants, georgette sarees with light jackets, or modern lehengas. Perfect for layering with dupattas and statement jewelry!",
        searchQuery: "indian women silk kurta lehenga fusion girls fashion",
      },
      cold: {
        recommendation:
          "🇮🇳 Cozy Indian winter fashion! Try velvet or wool kurtas with warm shawls, heavy silk sarees with jackets, or traditional salwar kameez with pashmina wraps. Add boots or closed mojaris for warmth!",
        searchQuery: "indian women winter kurta shawl velvet girls fashion",
      },
    },
    japanese: {
      hot: {
        recommendation:
          "🇯🇵 Perfect for Japanese summer elegance! Try lightweight cotton yukatas for beach walks, modern kimono-style cover-ups, or minimalist Japanese-inspired swimwear with clean lines. Add wooden geta sandals or modern slides!",
        searchQuery: "japanese women summer yukata beach kimono girls fashion", // Made more specific to Japanese beach wear
      },
      mild: {
        recommendation:
          "🇯🇵 Beautiful weather for Japanese sophistication! Consider haori jackets over simple dresses, modern kimono with obi belts, or Japanese-inspired layered looks with clean lines and neutral colors!",
        searchQuery: "japanese women haori kimono modern minimalist girls fashion",
      },
      cold: {
        recommendation:
          "🇯🇵 Cozy Japanese winter style! Try warm kimono with thick obi, layered haori over turtlenecks, or modern Japanese-inspired coats with minimalist accessories and muted colors!",
        searchQuery: "japanese women winter kimono haori minimalist girls fashion",
      },
    },
    korean: {
      hot: {
        recommendation:
          "🇰🇷 Perfect for Korean summer trends! Try hanbok-inspired crop tops with flowy skirts, modern jeogori with shorts, or K-fashion influenced outfits with pastel colors and cute accessories!",
        searchQuery: "korean women hanbok summer modern girls fashion",
      },
      mild: {
        recommendation:
          "🇰🇷 Great for Korean chic style! Consider modern hanbok with contemporary cuts, jeogori jackets over skinny jeans, or Korean street fashion with traditional elements!",
        searchQuery: "korean women hanbok modern jeogori girls fashion",
      },
      cold: {
        recommendation:
          "🇰🇷 Cozy Korean winter fashion! Try padded hanbok jackets, warm jeogori with thermal layers, or Korean-inspired winter coats with traditional patterns!",
        searchQuery: "korean women winter hanbok padded girls fashion",
      },
    },
    arabic: {
      hot: {
        recommendation:
          "🕌 Perfect for modest Arabic summer elegance! Try flowing abayas in light fabrics, kaftan dresses with beautiful embroidery, or modern modest wear with hijab styling. Add comfortable sandals!",
        searchQuery: "arabic women abaya kaftan modest summer girls fashion",
      },
      mild: {
        recommendation:
          "🕌 Beautiful for Arabic sophistication! Consider embellished abayas, elegant jalabiya dresses, or modern modest fashion with traditional accessories and hijab styling!",
        searchQuery: "arabic women abaya jalabiya modest girls fashion",
      },
      cold: {
        recommendation:
          "🕌 Warm Arabic winter style! Try thick abayas with warm linings, layered modest wear with beautiful scarves, or traditional winter cloaks with elegant embroidery!",
        searchQuery: "arabic women winter abaya modest warm girls fashion",
      },
    },
    thai: {
      hot: {
        recommendation:
          "🇹🇭 Perfect for Thai summer beauty! Try traditional Thai silk tops with modern bottoms, pha nung skirts with contemporary blouses, or Thai-inspired dresses with tropical prints!",
        searchQuery: "thai women traditional silk summer girls fashion",
      },
      mild: {
        recommendation:
          "🇹🇭 Great for Thai elegance! Consider Thai silk blouses with tailored pants, traditional sabai with modern skirts, or Thai-inspired fusion wear with gold accessories!",
        searchQuery: "thai women silk traditional sabai girls fashion",
      },
      cold: {
        recommendation:
          "🇹🇭 Cozy Thai style! Try layered Thai silk with light jackets, traditional wraps over modern wear, or Thai-inspired outfits with warm accessories!",
        searchQuery: "thai women silk layered traditional girls fashion",
      },
    },
    vietnamese: {
      hot: {
        recommendation:
          "🇻🇳 Perfect for Vietnamese summer beauty! Try modern ao dai with shorts, lightweight Vietnamese silk tops, or contemporary Vietnamese-inspired dresses with tropical prints!",
        searchQuery: "vietnamese women ao dai summer silk girls fashion",
      },
      mild: {
        recommendation:
          "🇻🇳 Great for Vietnamese elegance! Consider traditional ao dai with modern cuts, Vietnamese silk blouses with tailored pants, or Vietnamese-inspired fusion wear!",
        searchQuery: "vietnamese women ao dai silk traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇻🇳 Cozy Vietnamese style! Try layered ao dai with light jackets, traditional Vietnamese wraps over modern wear, or Vietnamese-inspired outfits with warm accessories!",
        searchQuery: "vietnamese women ao dai layered traditional girls fashion",
      },
    },
    chinese: {
      hot: {
        recommendation:
          "🇨🇳 Perfect for Chinese summer beauty! Try flowy qipaos with modern blouses, silk dresses with intricate embroidery, or contemporary Chinese-inspired outfits with vibrant colors!",
        searchQuery: "chinese women qipao summer silk girls fashion",
      },
      mild: {
        recommendation:
          "🇨🇳 Great for Chinese elegance! Consider traditional cheongsams with modern cuts, silk blouses with tailored pants, or Chinese-inspired fusion wear with delicate accessories!",
        searchQuery: "chinese women cheongsam silk traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇨🇳 Cozy Chinese style! Try layered cheongsams with light jackets, traditional Chinese wraps over modern wear, or Chinese-inspired outfits with warm accessories!",
        searchQuery: "chinese women cheongsam layered traditional girls fashion",
      },
    },
    singaporean: {
      hot: {
        recommendation:
          "🇸🇬 Perfect for Singaporean summer beauty! Try flowy maxi dresses with modern blouses, lightweight silk tops, or contemporary Singaporean-inspired outfits with vibrant colors!",
        searchQuery: "singaporean women maxi dress summer silk girls fashion",
      },
      mild: {
        recommendation:
          "🇸🇬 Great for Singaporean elegance! Consider traditional baju kurung with modern cuts, silk blouses with tailored pants, or Singaporean-inspired fusion wear with delicate accessories!",
        searchQuery: "singaporean women baju kurung silk traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇸🇬 Cozy Singaporean style! Try layered baju kurung with light jackets, traditional Singaporean wraps over modern wear, or Singaporean-inspired outfits with warm accessories!",
        searchQuery: "singaporean women baju kurung layered traditional girls fashion",
      },
    },
    malaysian: {
      hot: {
        recommendation:
          "🇲🇾 Perfect for Malaysian summer beauty! Try flowy maxi dresses with modern blouses, lightweight silk tops, or contemporary Malaysian-inspired outfits with vibrant colors!",
        searchQuery: "malaysian women maxi dress summer silk girls fashion",
      },
      mild: {
        recommendation:
          "🇲🇾 Great for Malaysian elegance! Consider traditional baju kurung with modern cuts, silk blouses with tailored pants, or Malaysian-inspired fusion wear with delicate accessories!",
        searchQuery: "malaysian women baju kurung silk traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇲🇾 Cozy Malaysian style! Try layered baju kurung with light jackets, traditional Malaysian wraps over modern wear, or Malaysian-inspired outfits with warm accessories!",
        searchQuery: "malaysian women baju kurung layered traditional girls fashion",
      },
    },
    indonesian: {
      hot: {
        recommendation:
          "🇮🇩 Perfect for Indonesian summer beauty! Try flowy maxi dresses with modern blouses, lightweight silk tops, or contemporary Indonesian-inspired outfits with vibrant colors!",
        searchQuery: "indonesian women maxi dress summer silk girls fashion",
      },
      mild: {
        recommendation:
          "🇮🇩 Great for Indonesian elegance! Consider traditional batik dresses with modern cuts, silk blouses with tailored pants, or Indonesian-inspired fusion wear with delicate accessories!",
        searchQuery: "indonesian women batik dress silk traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇮🇩 Cozy Indonesian style! Try layered batik dresses with light jackets, traditional Indonesian wraps over modern wear, or Indonesian-inspired outfits with warm accessories!",
        searchQuery: "indonesian women batik dress layered traditional girls fashion",
      },
    },
    african: {
      hot: {
        recommendation:
          "🌍 Perfect for African summer vibrancy! Try colorful dashiki tops with flowing skirts, ankara print dresses, or modern African-inspired outfits with bold patterns and head wraps!",
        searchQuery: "african women dashiki ankara summer girls fashion",
      },
      mild: {
        recommendation:
          "🌍 Beautiful for African elegance! Consider kente-inspired outfits, modern dashiki with tailored bottoms, or African print blazers with contemporary pieces!",
        searchQuery: "african women kente dashiki modern girls fashion",
      },
      cold: {
        recommendation:
          "🌍 Warm African winter style! Try layered African prints, warm kente wraps, or modern African-inspired coats with traditional accessories!",
        searchQuery: "african women winter kente warm girls fashion",
      },
    },

    persian: {
      hot: {
        recommendation:
          "🇮🇷 Perfect for Persian summer elegance! Try flowing tunics with wide-leg pants, lightweight scarves with beautiful patterns, or modern Persian-inspired dresses with intricate embroidery!",
        searchQuery: "persian women tunic summer elegant girls fashion",
      },
      mild: {
        recommendation:
          "🇮🇷 Beautiful for Persian sophistication! Consider embroidered vests over blouses, traditional Persian patterns in modern cuts, or elegant tunics with statement jewelry!",
        searchQuery: "persian women embroidered vest traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇮🇷 Warm Persian winter style! Try layered tunics with warm wraps, Persian-inspired coats with traditional patterns, or elegant winter scarves with rich textures!",
        searchQuery: "persian women winter tunic warm girls fashion",
      },
    },

    turkish: {
      hot: {
        recommendation:
          "🇹🇷 Perfect for Turkish summer beauty! Try flowing kaftans, lightweight Turkish cotton tops, or modern Ottoman-inspired dresses with geometric patterns!",
        searchQuery: "turkish women kaftan summer cotton girls fashion",
      },
      mild: {
        recommendation:
          "🇹🇷 Great for Turkish elegance! Consider traditional Turkish vests over modern pieces, Ottoman-inspired patterns, or Turkish silk scarves with contemporary outfits!",
        searchQuery: "turkish women vest ottoman silk girls fashion",
      },
      cold: {
        recommendation:
          "🇹🇷 Cozy Turkish style! Try layered Turkish textiles, warm Ottoman-inspired coats, or traditional Turkish patterns in winter fabrics!",
        searchQuery: "turkish women winter ottoman warm girls fashion",
      },
    },

    filipino: {
      hot: {
        recommendation:
          "🇵🇭 Perfect for Filipino summer vibrancy! Try modern barong-inspired tops, lightweight Filipino textiles, or tropical prints with contemporary cuts!",
        searchQuery: "filipino women barong summer tropical girls fashion",
      },
      mild: {
        recommendation:
          "🇵🇭 Great for Filipino elegance! Consider traditional Filipino embroidery on modern pieces, terno-inspired sleeves, or Filipino textile patterns in contemporary styles!",
        searchQuery: "filipino women terno embroidery traditional girls fashion",
      },
      cold: {
        recommendation:
          "🇵🇭 Cozy Filipino style! Try layered Filipino textiles, traditional patterns in warm fabrics, or Filipino-inspired wraps over modern wear!",
        searchQuery: "filipino women traditional layered warm girls fashion",
      },
    },

    british: {
      hot: {
        recommendation:
          "🇬🇧 Perfect for British summer charm! Try floral tea dresses, lightweight cardigans, classic trench coats for unpredictable weather, and comfortable flats!",
        searchQuery: "british women tea dress floral cardigan girls fashion",
      },
      mild: {
        recommendation:
          "🇬🇧 Great for British sophistication! Consider tweed blazers, pleated skirts, classic button-up shirts, and oxford shoes for that timeless British British style!",
        searchQuery: "british women tweed blazer oxford classic girls fashion",
      },
      cold: {
        recommendation:
          "🇬🇧 Cozy British winter style! Try wool coats, cashmere scarves, knee-high boots, and layered knitwear for that quintessential British elegance!",
        searchQuery: "british women wool coat cashmere winter girls fashion",
      },
    },

    french: {
      hot: {
        recommendation:
          "🇫🇷 Perfect for French summer chic! Try effortless midi dresses, lightweight blazers, espadrilles, and minimal jewelry for that Parisian je ne sais quoi!",
        searchQuery: "french women midi dress blazer parisian girls fashion",
      },
      mild: {
        recommendation:
          "🇫🇷 Great for French elegance! Consider classic trench coats, silk scarves, tailored pants, and ballet flats for timeless French sophistication!",
        searchQuery: "french women trench coat silk scarf ballet girls fashion",
      },
      cold: {
        recommendation:
          "🇫🇷 Cozy French winter style! Try wool berets, elegant coats, leather boots, and layered scarves for that chic Parisian winter look!",
        searchQuery: "french women beret wool coat leather girls fashion",
      },
    },

    italian: {
      hot: {
        recommendation:
          "🇮🇹 Perfect for Italian summer glamour! Try flowing sundresses, stylish sandals, oversized sunglasses, and lightweight scarves for that effortless Italian elegance!",
        searchQuery: "italian women sundress sandals glamour girls fashion",
      },
      mild: {
        recommendation:
          "🇮🇹 Great for Italian sophistication! Consider tailored blazers, designer handbags, pointed-toe shoes, and statement accessories for that Milano fashion week vibe!",
        searchQuery: "italian women blazer designer handbag milano girls fashion",
      },
      cold: {
        recommendation:
          "🇮🇹 Cozy Italian winter style! Try luxurious coats, leather gloves, stylish boots, and cashmere accessories for that high-fashion Italian winter look!",
        searchQuery: "italian women luxury coat leather cashmere girls fashion",
      },
    },

    spanish: {
      hot: {
        recommendation:
          "🇪🇸 Perfect for Spanish summer passion! Try vibrant flamenco-inspired dresses, espadrilles, colorful scarves, and bold accessories with Mediterranean flair!",
        searchQuery: "spanish women flamenco dress espadrilles colorful girls fashion",
      },
      mild: {
        recommendation:
          "🇪🇸 Great for Spanish elegance! Consider ruffled blouses, high-waisted pants, statement earrings, and Spanish-inspired patterns in modern cuts!",
        searchQuery: "spanish women ruffled blouse statement earrings girls fashion",
      },
      cold: {
        recommendation:
          "🇪🇸 Cozy Spanish winter style! Try layered Spanish textiles, warm mantillas, stylish boots, and rich colors inspired by Spanish culture!",
        searchQuery: "spanish women mantilla layered rich colors girls fashion",
      },
    },

    german: {
      hot: {
        recommendation:
          "🇩🇪 Perfect for German summer practicality! Try comfortable dirndl-inspired tops, breathable fabrics, practical sandals, and minimalist accessories!",
        searchQuery: "german women dirndl summer practical girls fashion",
      },
      mild: {
        recommendation:
          "🇩🇪 Great for German efficiency! Consider structured blazers, quality basics, comfortable shoes, and functional yet stylish accessories!",
        searchQuery: "german women structured blazer quality basics girls fashion",
      },
      cold: {
        recommendation:
          "🇩🇪 Cozy German winter style! Try warm wool coats, practical boots, layered knitwear, and functional winter accessories with German precision!",
        searchQuery: "german women wool coat practical boots girls fashion",
      },
    },

    dutch: {
      hot: {
        recommendation:
          "🇳🇱 Perfect for Dutch summer cycling! Try comfortable bike-friendly dresses, practical sandals, lightweight jackets, and functional bags for that Dutch lifestyle!",
        searchQuery: "dutch women bike friendly dress practical girls fashion",
      },
      mild: {
        recommendation:
          "🇳🇱 Great for Dutch practicality! Consider comfortable jeans, cozy sweaters, waterproof jackets, and comfortable shoes for the Dutch weather!",
        searchQuery: "dutch women cozy sweater waterproof practical girls fashion",
      },
      cold: {
        recommendation:
          "🇳🇱 Cozy Dutch winter style! Try warm parkas, waterproof boots, layered scarves, and practical winter wear for Dutch weather conditions!",
        searchQuery: "dutch women parka waterproof boots winter girls fashion",
      },
    },

    russian: {
      hot: {
        recommendation:
          "🇷🇺 Perfect for Russian summer elegance! Try flowing blouses with traditional patterns, comfortable skirts, and elegant accessories with Slavic influences!",
        searchQuery: "russian women blouse traditional patterns summer girls fashion",
      },
      mild: {
        recommendation:
          "🇷🇺 Great for Russian sophistication! Consider fur-trimmed jackets, elegant boots, traditional Russian patterns in modern cuts, and statement jewelry!",
        searchQuery: "russian women fur trim jacket elegant boots girls fashion",
      },
      cold: {
        recommendation:
          "🇷🇺 Cozy Russian winter style! Try luxurious fur coats, warm ushanka hats, high boots, and layered Russian textiles for ultimate winter warmth!",
        searchQuery: "russian women fur coat ushanka boots winter girls fashion",
      },
    },

    scandinavian: {
      hot: {
        recommendation:
          "🇸🇪 Perfect for Scandinavian summer minimalism! Try clean-lined dresses, comfortable sandals, natural fabrics, and minimal jewelry for that Nordic simplicity!",
        searchQuery: "scandinavian women minimalist dress natural nordic girls fashion",
      },
      mild: {
        recommendation:
          "🇸🇪 Great for Scandinavian hygge! Consider cozy knitwear, comfortable jeans, practical boots, and neutral colors for that Nordic comfort!",
        searchQuery: "scandinavian women hygge knitwear neutral girls fashion",
      },
      cold: {
        recommendation:
          "🇸🇪 Cozy Scandinavian winter style! Try warm parkas, thermal layers, waterproof boots, and functional Nordic winter wear with style!",
        searchQuery: "scandinavian women parka thermal nordic winter girls fashion",
      },
    },

    greek: {
      hot: {
        recommendation:
          "🇬🇷 Perfect for Greek summer goddess vibes! Try flowing white dresses, gold accessories, comfortable sandals, and Mediterranean-inspired patterns!",
        searchQuery: "greek women white dress gold accessories mediterranean girls fashion",
      },
      mild: {
        recommendation:
          "🇬🇷 Great for Greek elegance! Consider draped fabrics, ancient Greek-inspired silhouettes, gold jewelry, and comfortable yet elegant pieces!",
        searchQuery: "greek women draped fabric gold jewelry elegant girls fashion",
      },
      cold: {
        recommendation:
          "🇬🇷 Cozy Greek winter style! Try layered Mediterranean textiles, warm wraps, comfortable boots, and Greek-inspired patterns in winter fabrics!",
        searchQuery: "greek women mediterranean textile warm wraps girls fashion",
      },
    },

    american: {
      hot: {
        recommendation:
          "🇺🇸 Perfect for American summer casual! Try denim shorts, graphic tees, sneakers, baseball caps, and that effortless American casual style!",
        searchQuery: "american women denim shorts graphic tee sneakers girls fashion",
      },
      mild: {
        recommendation:
          "🇺🇸 Great for American versatility! Consider jeans with blazers, comfortable sneakers, crossbody bags, and that classic American preppy-casual mix!",
        searchQuery: "american women jeans blazer sneakers preppy girls fashion",
      },
      cold: {
        recommendation:
          "🇺🇸 Cozy American winter style! Try puffer jackets, warm boots, layered hoodies, and practical American winter wear with style!",
        searchQuery: "american women puffer jacket boots hoodie winter girls fashion",
      },
    },

    canadian: {
      hot: {
        recommendation:
          "🇨🇦 Perfect for Canadian summer outdoors! Try plaid shirts, comfortable shorts, hiking boots, and outdoor-ready Canadian casual style!",
        searchQuery: "canadian women plaid shirt shorts hiking outdoor girls fashion",
      },
      mild: {
        recommendation:
          "🇨🇦 Great for Canadian layering! Consider flannel shirts, comfortable jeans, practical boots, and that classic Canadian outdoor-ready style!",
        searchQuery: "canadian women flannel jeans practical outdoor girls fashion",
      },
      cold: {
        recommendation:
          "🇨🇦 Cozy Canadian winter style! Try heavy parkas, insulated boots, warm toques, and serious Canadian winter gear that's both warm and stylish!",
        searchQuery: "canadian women parka insulated boots toque winter girls fashion",
      },
    },

    mexican: {
      hot: {
        recommendation:
          "🇲🇽 Perfect for Mexican summer fiesta! Try colorful embroidered blouses, flowing skirts, comfortable sandals, and vibrant Mexican-inspired patterns!",
        searchQuery: "mexican women embroidered blouse colorful vibrant girls fashion",
      },
      mild: {
        recommendation:
          "🇲🇽 Great for Mexican elegance! Consider traditional Mexican embroidery on modern pieces, colorful scarves, and Mexican textile patterns in contemporary styles!",
        searchQuery: "mexican women traditional embroidery colorful textile girls fashion",
      },
      cold: {
        recommendation:
          "🇲🇽 Cozy Mexican winter style! Try layered Mexican textiles, warm rebozos, comfortable boots, and traditional patterns in winter fabrics!",
        searchQuery: "mexican women rebozo layered traditional winter girls fashion",
      },
    },

    brazilian: {
      hot: {
        recommendation:
          "🇧🇷 Perfect for Brazilian summer carnival! Try vibrant bikinis, flowing cover-ups, colorful accessories, and that Brazilian beach goddess style!",
        searchQuery: "brazilian women bikini cover up colorful beach girls fashion",
      },
      mild: {
        recommendation:
          "🇧🇷 Great for Brazilian chic! Consider form-fitting dresses, bold prints, statement jewelry, and that confident Brazilian street style!",
        searchQuery: "brazilian women form fitting dress bold prints girls fashion",
      },
      cold: {
        recommendation:
          "🇧🇷 Cozy Brazilian winter style! Try layered tropical prints, light jackets, comfortable boots, and Brazilian-inspired patterns in cooler fabrics!",
        searchQuery: "brazilian women tropical prints light jacket girls fashion",
      },
    },

    argentinian: {
      hot: {
        recommendation:
          "🇦🇷 Perfect for Argentinian summer tango! Try elegant dresses, comfortable heels, statement accessories, and that sophisticated Buenos Aires style!",
        searchQuery: "argentinian women elegant dress heels sophisticated girls fashion",
      },
      mild: {
        recommendation:
          "🇦🇷 Great for Argentinian elegance! Consider tailored pieces, leather accessories, stylish boots, and that classic Argentinian sophistication!",
        searchQuery: "argentinian women tailored leather boots sophisticated girls fashion",
      },
      cold: {
        recommendation:
          "🇦🇷 Cozy Argentinian winter style! Try warm coats, leather gloves, stylish boots, and elegant winter wear with Argentinian flair!",
        searchQuery: "argentinian women warm coat leather gloves winter girls fashion",
      },
    },

    australian: {
      hot: {
        recommendation:
          "🇦🇺 Perfect for Australian summer surf! Try bikinis with board shorts, sun hats, flip-flops, and that laid-back Australian beach style!",
        searchQuery: "australian women bikini board shorts sun hat beach girls fashion",
      },
      mild: {
        recommendation:
          "🇦🇺 Great for Australian casual! Consider comfortable jeans, casual tees, sneakers, and that relaxed Australian outdoor lifestyle!",
        searchQuery: "australian women jeans casual tee sneakers outdoor girls fashion",
      },
      cold: {
        recommendation:
          "🇦🇺 Cozy Australian winter style! Try layered casual wear, comfortable boots, light jackets, and practical Australian winter fashion!",
        searchQuery: "australian women layered casual boots light jacket girls fashion",
      },
    },

    newzealand: {
      hot: {
        recommendation:
          "🇳🇿 Perfect for New Zealand summer adventure! Try outdoor-ready dresses, hiking sandals, sun protection, and that Kiwi outdoor lifestyle!",
        searchQuery: "newzealand women outdoor dress hiking sandals adventure girls fashion",
      },
      mild: {
        recommendation:
          "🇳🇿 Great for New Zealand outdoor style! Consider merino wool layers, comfortable boots, practical jackets, and that Kiwi outdoor-ready fashion!",
        searchQuery: "newzealand women merino wool boots practical outdoor girls fashion",
      },
      cold: {
        recommendation:
          "🇳🇿 Cozy New Zealand winter style! Try warm outdoor gear, waterproof boots, layered merino wool, and practical Kiwi winter fashion!",
        searchQuery: "newzealand women outdoor gear waterproof merino winter girls fashion",
      },
    },
  }

  if (!culturalOutfits[culture]) return null

  let tempCategory = "mild"
  if (temp >= 25) tempCategory = "hot"
  else if (temp < 15) tempCategory = "cold"

  return culturalOutfits[culture][tempCategory]
}

function detectThemes(message) {
  const themes = {
    // Aesthetic themes
    y2k: ["y2k", "2000s", "millennium", "cyber", "metallic", "holographic"],
    vintage: ["vintage", "retro", "classic", "old school", "throwback", "antique"],
    cottagecore: ["cottagecore", "cottage", "rural", "countryside", "pastoral", "prairie"],
    dark_academia: ["dark academia", "academia", "scholarly", "bookish", "preppy", "ivy league"],
    soft_girl: ["soft girl", "kawaii", "cute", "pastel", "sweet", "girly"],
    grunge: ["grunge", "edgy", "punk", "alternative", "rock", "rebellious"],
    minimalist: ["minimalist", "minimal", "simple", "clean", "basic", "neutral"],
    boho: ["boho", "bohemian", "hippie", "free spirit", "flowy", "earthy"],

    // Occasion themes
    beach: ["beach", "seaside", "coastal", "tropical", "vacation", "resort"],
    festival: ["festival", "coachella", "music festival", "concert", "rave"],
    date: ["date", "romantic", "dinner date", "first date", "anniversary"],
    brunch: ["brunch", "breakfast", "morning", "cafe", "casual dining"],
    gym: ["gym", "workout", "fitness", "athletic", "sporty", "activewear"],
    travel: ["travel", "airport", "vacation", "tourist", "sightseeing"],

    // Style themes
    preppy: ["preppy", "ivy", "collegiate", "tennis", "country club"],
    streetwear: ["streetwear", "urban", "hip hop", "casual", "sneaker"],
    elegant: ["elegant", "sophisticated", "classy", "refined", "luxurious"],
    casual: ["casual", "relaxed", "comfortable", "everyday", "laid back"],
    formal: ["formal", "dressy", "black tie", "gala", "cocktail"],
  }

  const detectedThemes = []
  const lowerMessage = message.toLowerCase()

  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detectedThemes.push(theme)
    }
  }

  return detectedThemes
}

function detectKeywords(message) {
  const detected = {
    cities: [],
    weather: [],
    occasions: [],
    themes: [],
    temperatures: [],
  }

  const lowerMessage = message.toLowerCase()

  // Pattern 1: "I'm in/I am in [city]"
  const cityMatch1 = lowerMessage.match(
    /(?:i'm in |im in |i am in |location:\s*)([a-zA-Z\s,]+?)(?:\s+(?:for|to|at|in|on|during|because|since|while|when|where|with|without|about|after|before|until|through)\s|$)/i,
  )
  if (cityMatch1) {
    detected.cities.push(cityMatch1[1].trim())
  }

  // Pattern 2: "in [city]" at the end or before common words
  const cityMatch2 = lowerMessage.match(
    /\bin\s+([a-zA-Z\s,]+?)(?:\s+(?:for|to|at|on|during|because|since|while|when|where|with|without|about|after|before|until|through|today|tomorrow|now|soon|later)\s|[.!?]|$)/i,
  )
  if (cityMatch2 && !cityMatch1) {
    // Only use if first pattern didn't match
    const city = cityMatch2[1].trim()
    // Filter out common words that aren't cities
    const commonWords = [
      "the",
      "a",
      "an",
      "my",
      "your",
      "his",
      "her",
      "our",
      "their",
      "this",
      "that",
      "these",
      "those",
      "some",
      "any",
      "all",
      "many",
      "much",
      "few",
      "little",
      "more",
      "most",
      "other",
      "another",
      "such",
      "what",
      "which",
      "who",
      "when",
      "where",
      "why",
      "how",
      "here",
      "there",
      "now",
      "then",
      "today",
      "tomorrow",
      "yesterday",
      "morning",
      "afternoon",
      "evening",
      "night",
      "time",
      "place",
      "way",
      "case",
      "point",
      "fact",
      "thing",
      "work",
      "life",
      "day",
      "week",
      "month",
      "year",
      "world",
      "country",
      "state",
      "city",
      "town",
      "home",
      "house",
      "room",
      "office",
      "school",
      "university",
      "college",
      "hospital",
      "hotel",
      "restaurant",
      "store",
      "shop",
      "market",
      "park",
      "beach",
      "mountain",
      "river",
      "lake",
      "sea",
      "ocean",
      "street",
      "road",
      "avenue",
      "building",
      "floor",
      "door",
      "window",
      "car",
      "bus",
      "train",
      "plane",
      "ship",
      "bike",
      "walk",
      "run",
      "go",
      "come",
      "see",
      "look",
      "watch",
      "listen",
      "hear",
      "speak",
      "talk",
      "say",
      "tell",
      "ask",
      "answer",
      "think",
      "know",
      "understand",
      "remember",
      "forget",
      "learn",
      "teach",
      "study",
      "read",
      "write",
      "draw",
      "paint",
      "sing",
      "dance",
      "play",
      "game",
      "sport",
      "music",
      "movie",
      "book",
      "story",
      "news",
      "information",
      "data",
      "number",
      "letter",
      "word",
      "sentence",
      "question",
      "problem",
      "solution",
      "answer",
      "result",
      "effect",
      "cause",
      "reason",
      "purpose",
      "goal",
      "plan",
      "idea",
      "thought",
      "feeling",
      "emotion",
      "love",
      "hate",
      "like",
      "dislike",
      "want",
      "need",
      "have",
      "get",
      "give",
      "take",
      "make",
      "do",
      "be",
      "become",
      "seem",
      "appear",
      "look",
      "sound",
      "feel",
      "taste",
      "smell",
      "good",
      "bad",
      "great",
      "terrible",
      "nice",
      "awful",
      "beautiful",
      "ugly",
      "big",
      "small",
      "large",
      "little",
      "long",
      "short",
      "tall",
      "high",
      "low",
      "wide",
      "narrow",
      "thick",
      "thin",
      "heavy",
      "light",
      "strong",
      "weak",
      "fast",
      "slow",
      "quick",
      "easy",
      "difficult",
      "hard",
      "soft",
      "smooth",
      "rough",
      "clean",
      "dirty",
      "new",
      "old",
      "young",
      "fresh",
      "hot",
      "cold",
      "warm",
      "cool",
      "dry",
      "wet",
      "bright",
      "dark",
      "clear",
      "cloudy",
      "sunny",
      "rainy",
      "snowy",
      "windy",
      "calm",
      "quiet",
      "loud",
      "silent",
      "busy",
      "free",
      "full",
      "empty",
      "open",
      "closed",
      "public",
      "private",
      "personal",
      "social",
      "political",
      "economic",
      "financial",
      "legal",
      "medical",
      "educational",
      "cultural",
      "religious",
      "spiritual",
      "physical",
      "mental",
      "emotional",
      "psychological",
      "biological",
      "chemical",
      "technical",
      "scientific",
      "mathematical",
      "historical",
      "geographical",
      "environmental",
      "natural",
      "artificial",
      "real",
      "fake",
      "true",
      "false",
      "right",
      "wrong",
      "correct",
      "incorrect",
      "proper",
      "improper",
      "appropriate",
      "inappropriate",
      "suitable",
      "unsuitable",
      "possible",
      "impossible",
      "probable",
      "improbable",
      "certain",
      "uncertain",
      "sure",
      "unsure",
      "clear",
      "unclear",
      "obvious",
      "hidden",
      "visible",
      "invisible",
      "available",
      "unavailable",
      "present",
      "absent",
      "here",
      "there",
      "everywhere",
      "nowhere",
      "somewhere",
      "anywhere",
      "always",
      "never",
      "sometimes",
      "often",
      "rarely",
      "usually",
      "normally",
      "generally",
      "specifically",
      "particularly",
      "especially",
      "mainly",
      "mostly",
      "partly",
      "completely",
      "totally",
      "fully",
      "entirely",
      "absolutely",
      "definitely",
      "certainly",
      "probably",
      "possibly",
      "maybe",
      "perhaps",
      "hopefully",
      "unfortunately",
      "luckily",
      "surprisingly",
      "interestingly",
      "importantly",
      "significantly",
      "seriously",
      "honestly",
      "frankly",
      "obviously",
      "clearly",
      "simply",
      "basically",
      "essentially",
      "actually",
      "really",
      "truly",
      "indeed",
      "certainly",
      "definitely",
      "absolutely",
      "completely",
      "totally",
      "entirely",
      "fully",
      "quite",
      "very",
      "extremely",
      "incredibly",
      "amazingly",
      "surprisingly",
      "remarkably",
      "particularly",
      "especially",
      "specifically",
      "exactly",
      "precisely",
      "approximately",
      "roughly",
      "about",
      "around",
      "nearly",
      "almost",
      "just",
      "only",
      "even",
      "still",
      "yet",
      "already",
      "soon",
      "later",
      "earlier",
      "before",
      "after",
      "during",
      "while",
      "until",
      "since",
      "from",
      "to",
      "into",
      "onto",
      "upon",
      "over",
      "under",
      "above",
      "below",
      "beside",
      "between",
      "among",
      "through",
      "across",
      "along",
      "around",
      "behind",
      "in front of",
      "next to",
      "near",
      "far",
      "close",
      "distant",
      "inside",
      "outside",
      "within",
      "without",
      "against",
      "towards",
      "away",
      "up",
      "down",
      "left",
      "right",
      "north",
      "south",
      "east",
      "west",
      "forward",
      "backward",
      "ahead",
      "back",
      "front",
      "rear",
      "top",
      "bottom",
      "side",
      "center",
      "middle",
      "edge",
      "corner",
      "end",
      "beginning",
      "start",
      "finish",
      "first",
      "last",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "ninth",
      "tenth",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
      "hundred",
      "thousand",
      "million",
      "billion",
      "trillion",
    ]
    if (!commonWords.includes(city.toLowerCase()) && city.length > 2) {
      detected.cities.push(city)
    }
  }

  // Weather detection
  const weatherKeywords = {
    hot: ["hot", "sunny", "warm", "blazing", "scorching", "sweltering"],
    cold: ["cold", "freezing", "chilly", "icy", "frigid", "winter"],
    rainy: ["rain", "rainy", "drizzle", "shower", "wet", "stormy"],
    windy: ["windy", "breezy", "gusty", "wind"],
    humid: ["humid", "muggy", "sticky", "damp"],
    dry: ["dry", "arid", "desert"],
  }

  for (const [condition, keywords] of Object.entries(weatherKeywords)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detected.weather.push(condition)
    }
  }

  // Temperature detection
  const tempMatch = lowerMessage.match(/(\d+)\s*(?:degrees?|°|celsius|fahrenheit|c|f)/i)
  if (tempMatch) {
    detected.temperatures.push(Number.parseInt(tempMatch[1]))
  }

  // Occasion detection
  const occasions = {
    wedding: ["wedding", "marriage", "ceremony", "reception"],
    party: ["party", "celebration", "birthday", "night out"],
    work: ["work", "office", "professional", "business", "meeting"],
    school: ["school", "university", "college", "class", "study"],
    date: ["date", "romantic", "dinner", "first date"],
    beach: ["beach", "pool", "swimming", "vacation"],
    gym: ["gym", "workout", "exercise", "fitness"],
    travel: ["travel", "flight", "airport", "vacation", "trip"],
  }

  for (const [occasion, keywords] of Object.entries(occasions)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detected.occasions.push(occasion)
    }
  }

  // Theme detection
  detected.themes = detectThemes(message)

  return detected
}

function getThemeOutfitRecommendation(themes, weather = null) {
  const themeRecommendations = {
    y2k: {
      recommendation:
        "✨ Y2K vibes! Try metallic fabrics, low-rise jeans, crop tops, platform shoes, and holographic accessories. Think futuristic meets nostalgic!",
      searchQuery: "y2k fashion women metallic crop tops platform shoes girls",
    },
    vintage: {
      recommendation:
        "🕰️ Vintage elegance! Go for high-waisted pieces, midi skirts, blouses with bow ties, pearl accessories, and classic pumps. Timeless sophistication!",
      searchQuery: "vintage fashion women retro midi skirt blouse girls",
    },
    cottagecore: {
      recommendation:
        "🌻 Cottagecore dreams! Try flowy midi dresses, cardigans, floral prints, wicker accessories, and comfortable flats. Embrace that countryside charm!",
      searchQuery: "cottagecore fashion women floral dress cardigan girls",
    },
    beach: {
      recommendation:
        "🏖️ Beach babe ready! Try flowy cover-ups, bikinis, wide-brim hats, sandals, and lightweight fabrics. Don't forget sunglasses and SPF!",
      searchQuery: "beach fashion women swimwear cover up sandals girls",
    },
    boho: {
      recommendation:
        "🌙 Boho chic! Try flowy maxi dresses, fringe details, layered jewelry, ankle boots, and earthy tones. Free-spirited and effortless!",
      searchQuery: "boho fashion women maxi dress fringe jewelry girls",
    },
    grunge: {
      recommendation:
        "🖤 Grunge goddess! Try ripped jeans, band tees, leather jackets, combat boots, and dark makeup. Edgy and rebellious!",
      searchQuery: "grunge fashion women leather jacket boots edgy girls",
    },
    minimalist: {
      recommendation:
        "⚪ Minimalist chic! Try clean lines, neutral colors, simple silhouettes, quality basics, and understated accessories. Less is more!",
      searchQuery: "minimalist fashion women neutral clean simple girls",
    },
    preppy: {
      recommendation:
        "🎾 Preppy perfection! Try blazers, pleated skirts, polo shirts, loafers, and classic patterns like plaid or stripes. Ivy League vibes!",
      searchQuery: "preppy fashion women blazer pleated skirt polo girls",
    },
  }

  // Return the first detected theme's recommendation
  const primaryTheme = themes[0]
  if (themeRecommendations[primaryTheme]) {
    return themeRecommendations[primaryTheme]
  }

  return null
}

async function fetchOutfitImages(searchQuery, culturalQuery = null, baseUrl, randomPage) {
  const imageSources = [
    { name: "pexels", endpoint: "/api/pexels" },
    { name: "pixabay", endpoint: "/api/pixabay" },
    { name: "fashion-ai", endpoint: "/api/fashion-ai" },
  ]

  let allImages = []

  // First, try to get 5+ regular outfit images
  for (const source of imageSources) {
    try {
      console.log(`[v0] Trying to fetch from ${source.name} with query: ${searchQuery}`)
      const response = await fetchWithTimeout(
        `${baseUrl}${source.endpoint}?query=${encodeURIComponent(searchQuery)}&per_page=6&page=${randomPage}`,
        {},
        8000,
      )

      if (response.ok) {
        const data = await response.json()
        const { images } = data
        if (images && images.length > 0) {
          console.log(`[v0] Successfully fetched ${images.length} regular images from ${source.name}`)
          allImages = images.slice(0, 5) // Take up to 5 regular images
          break
        }
      } else {
        console.log(`[v0] ${source.name} returned status: ${response.status}`)
      }
    } catch (error) {
      console.error(`[v0] Error fetching from ${source.name}:`, error.message)
      continue
    }
  }

  // If we have regular images and a cultural query, try to get exactly 1 cultural image
  if (culturalQuery && allImages.length > 0) {
    for (const source of imageSources) {
      try {
        console.log(`[v0] Trying to fetch cultural images from ${source.name} with query: ${culturalQuery}`)
        const response = await fetchWithTimeout(
          `${baseUrl}${source.endpoint}?query=${encodeURIComponent(culturalQuery)}&per_page=1&page=${randomPage}`,
          {},
          8000,
        )

        if (response.ok) {
          const data = await response.json()
          const { images } = data
          if (images && images.length > 0) {
            console.log(`[v0] Successfully fetched 1 cultural image from ${source.name}`)
            const culturalImage = images[0]
            // Add 1 cultural image at the beginning, keep 4 regular images
            allImages = [culturalImage, ...allImages.slice(0, 4)]
            break
          }
        }
      } catch (error) {
        console.error(`[v0] Error fetching cultural images from ${source.name}:`, error.message)
        continue
      }
    }
  }

  console.log("[v0] Final mixed images count:", allImages.length)
  return allImages
}

export async function POST(req) {
  try {
    // Construct absolute base URL for internal API calls
    const host = req.headers.get("host")
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
    const baseUrl = `${protocol}://${host}`

    const { messages } = await req.json()
    console.log("[v0] API Route: Received messages from client:", JSON.stringify(messages, null, 2))

    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || ""
    const userLocation = messages?.[messages.length - 1]?.location
    const replyParts = [] // This will now be an array of parts (text or image)

    console.log("[v0] Processing message:", lastMessage)
    console.log("[v0] User location from frontend:", userLocation)

    // Generate a random page number for Pexels API to get different results
    const randomPage = Math.floor(Math.random() * 10) + 1 // Random page between 1 and 10

    const detectedKeywords = detectKeywords(lastMessage)
    console.log("[v0] Detected keywords:", detectedKeywords)

    if (lastMessage.includes("hi") || lastMessage.includes("hello")) {
      replyParts.push({
        type: "text",
        content:
          "Hi there! I'm Outfitly, your personal AI stylist with weather intelligence! I can help you choose the perfect outfit based on your local weather, occasions, and style themes. What would you like to wear today?",
      })
    } else if (
      detectedKeywords.cities.length > 0 ||
      detectedKeywords.weather.length > 0 ||
      detectedKeywords.occasions.length > 0 ||
      detectedKeywords.themes.length > 0
    ) {
      let weatherData = null
      let recommendation = ""
      let searchQuery = ""

      // Handle city/location
      if (detectedKeywords.cities.length > 0) {
        const city = detectedKeywords.cities[0]
        console.log("[v0] Detected city:", city) // Added debug logging
        try {
          const weatherResponse = await fetchWithTimeout(
            `${baseUrl}/api/weather?city=${encodeURIComponent(city)}`,
            {},
            8000,
          )
          if (weatherResponse.ok) {
            const data = await weatherResponse.json()
            weatherData = data.weather
            console.log("[v0] Weather data received:", weatherData) // Added debug logging
          } else {
            console.log("[v0] Weather API failed with status:", weatherResponse.status) // Added debug logging
          }
        } catch (error) {
          console.error("[v0] Weather fetch error:", error)
        }
      }

      // Handle themes first (they're more specific)
      if (detectedKeywords.themes.length > 0) {
        const themeRec = getThemeOutfitRecommendation(detectedKeywords.themes, weatherData)
        if (themeRec) {
          recommendation = themeRec.recommendation
          searchQuery = themeRec.searchQuery

          // Add weather context if available
          if (weatherData) {
            recommendation += ` Perfect for ${weatherData.temperature}°C${weatherData.description && weatherData.description !== "undefined" && weatherData.description !== "null" ? ` and ${weatherData.description}` : ""} weather in ${weatherData.location}!`
          }
        }
      }
      // Handle occasions
      else if (detectedKeywords.occasions.length > 0) {
        const occasion = detectedKeywords.occasions[0]
        if (occasion === "wedding") {
          recommendation =
            "💒 For a wedding, you'll look stunning! Try elegant midi or maxi dresses in pastels or jewel tones. Avoid white and overly flashy pieces. Add heels and delicate jewelry!"
          searchQuery = "women wedding guest dress elegant fashion girls"
        } else if (occasion === "party") {
          recommendation =
            "🎉 Party time! Try bodycon dresses, bold accessories, strappy heels, and metallic accents. Don't forget a cute clutch!"
          searchQuery = "women party night out dress heels girls fashion"
        } else if (occasion === "work") {
          recommendation =
            "💼 Professional chic! Try blazers with tailored pants, blouses, comfortable heels, and structured handbags."
          searchQuery = "women professional fashion blazer girls work"
        }
        // Add more occasions as needed
      }
      // Handle weather conditions
      else if (detectedKeywords.weather.length > 0 || weatherData) {
        const weather = weatherData || {
          temperature: detectedKeywords.weather.includes("hot")
            ? 28
            : detectedKeywords.weather.includes("cold")
              ? 5
              : 20,
          main: detectedKeywords.weather.includes("rainy") ? "rain" : "clear",
          description: detectedKeywords.weather.join(", "),
          location: "your area",
        }
        const weatherRec = getWeatherOutfitRecommendation(weather)
        recommendation = weatherRec.recommendation
        searchQuery = weatherRec.searchQuery
      }

      // Add cultural suggestions if city detected (even without weather data)
      if (detectedKeywords.cities.length > 0) {
        const city = detectedKeywords.cities[0]
        console.log("[v0] Processing city:", city)

        // Try to get cultural outfit suggestions
        const culturalOutfit = getCulturalClothing(city, weatherData || { temperature: 20, condition: "clear" })

        if (culturalOutfit) {
          const weatherInfo = weatherData
            ? `🌤️ It's ${weatherData.temperature}°C${weatherData.condition && weatherData.condition !== "undefined" && weatherData.condition !== "null" ? ` and ${weatherData.condition}` : ""} in ${weatherData.location}! `
            : `🌍 For your trip to ${city}: `

          recommendation = `${weatherInfo}${culturalOutfit.recommendation}\n\nAlso great: ${recommendation}`

          // Mix cultural and regular images (1 cultural + 4 regular = 5 total)
          const images = await fetchOutfitImages(searchQuery, culturalOutfit.searchQuery, baseUrl, randomPage)
          console.log("[v0] Fetched images count:", images.length)

          if (images.length > 0) {
            replyParts.push({ type: "text", content: recommendation })
            replyParts.push({ type: "text", content: "Here are some outfit ideas for you:" })
            images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }))
          } else {
            replyParts.push({
              type: "text",
              content: `${recommendation}\n\nSorry, I couldn't find any related outfit suggestions with images right now. Please try a different style or location!`,
            })
          }
        } else {
          // No cultural outfit, but still show weather and regular images
          const weatherInfo = weatherData
            ? `🌤️ It's ${weatherData.temperature}°C${weatherData.condition && weatherData.condition !== "undefined" && weatherData.condition !== "null" ? ` and ${weatherData.condition}` : ""} in ${weatherData.location}! `
            : `🌍 For your trip to ${city}: `

          recommendation = `${weatherInfo}${recommendation}`
          replyParts.push({ type: "text", content: recommendation })

          const images = await fetchOutfitImages(searchQuery, null, baseUrl, randomPage)
          console.log("[v0] Fetched regular images count:", images.length)

          if (images.length > 0) {
            replyParts.push({ type: "text", content: "Here are some outfit ideas for you:" })
            images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }))
          } else {
            replyParts.push({
              type: "text",
              content: `${recommendation}\n\nSorry, I couldn't find any related outfit suggestions with images right now. Please try a different theme or be more specific!`,
            })
          }
        }
      } else {
        // No city detected, show regular recommendation
        replyParts.push({ type: "text", content: recommendation })
        const images = await fetchOutfitImages(searchQuery, null, baseUrl, randomPage)
        if (images.length > 0) {
          replyParts.push({ type: "text", content: "Here are some outfit ideas for you:" })
          images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }))
        } else {
          replyParts.push({
            type: "text",
            content: `${recommendation}\n\nSorry, I couldn't find any related outfit suggestions with images right now. Please try a different theme or be more specific!`,
          })
        }
      }
    } else {
      replyParts.push({
        type: "text",
        content:
          "Hello! I'm your AI stylist specializing in women's fashion with weather intelligence! Tell me about your location, weather, occasion, or style theme.",
      })
    }

    console.log("[v0] API Route: Generating response with parts:", replyParts)

    // Return a standard JSON response with an array of content parts
    return new Response(
      JSON.stringify({
        id: Date.now().toString(), // Unique ID for the message
        role: "assistant",
        content: replyParts, // Now an array of objects
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("[v0] API Route Error:", error)
    // Return a more informative error response to the client
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred on the server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
