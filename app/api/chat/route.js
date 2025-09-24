

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ----------------------------- small helpers ----------------------------- */

function wantsMore(text = "") {
  return /\b(more|another|next|again|others?)\b/i.test(text.trim());
}

// Walk back through the message history to find the last assistant context
function getLastAssistantContext(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "assistant" && m?.context?.fashionQuery) {
      return m.context; // { fashionQuery, page, city, mood, temp, bodyShape, weatherSummary }
    }
  }
  return null;
}

function mockLayerAdvice(weather) {
  const t = Number(weather?.temperature ?? NaN);
  const d = (weather?.description || "").toLowerCase();

  if (!Number.isFinite(t)) {
    // no weather — generic nudge
    return "Since I can’t see live weather, I’d bring a light layer just in case.";
  }

  if (t <= 12) return `It’s quite cool (~${t}°C, ${d}). Add tights, a warm cardigan or cropped jacket, and closed-toe shoes.`;
  if (t <= 18) return `It’s a bit brisk (~${t}°C, ${d}). Layer with a light jacket or cardigan; consider socks or boots.`;
  if (t <= 26) return `Mild (~${t}°C, ${d}). Your outfit works—bring a light layer for wind or evening.`;
  return `Warm (~${t}°C, ${d}). Keep it breezy; swap to lighter fabrics and skip heavy layers.`;
}

function isJsonResponse(res) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

async function readJsonSafe(res) {
  const txt = await res.text();
  try { return JSON.parse(txt); }
  catch { return { __nonJson: true, status: res.status, body: txt.slice(0, 500) }; }
}

async function callAnalyzeEndpoint(url, form, opts = {}) {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
      headers: { "ngrok-skip-browser-warning": "true", ...(opts.headers || {}) },
      cache: "no-store",
    });
    if (!res.ok) return { ok:false, error:`HTTP ${res.status}`, detail:(await res.text()).slice(0,500) };
    if (!isJsonResponse(res)) return { ok:false, error:"Non-JSON response", detail:(await res.text()).slice(0,500) };
    const data = await readJsonSafe(res);
    if (data.__nonJson) return { ok:false, error:"JSON parse failed", detail:data.body };
    return { ok:true, data };
  } catch (e) {
    return { ok:false, error:"Network/Fetch error", detail:String(e?.message || e) };
  }
}

function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout)),
  ]);
}

function getSeason(month) {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

function getSeasonalTrends(season) {
  const trends = {
    spring: " 🌸 Spring 2025 trends: pastel colors, floral prints, and sustainable fabrics!",
    summer: " 🌺 Summer 2025 trends: vibrant colors, cut-out details, and breathable materials!",
    fall: " 🍁 Fall 2025 trends: earth tones, textured fabrics, and statement outerwear!",
    winter: " ❄️ Winter 2025 trends: rich jewel tones, luxe textures, and oversized silhouettes!",
  };
  return trends[season] || "";
}

// keep your light city cleaner
function cleanCityLite(raw = "") {
  let s = String(raw).toLowerCase();
  s = s.replace(/\b(right now|today|tomorrow|tonight|this (morning|afternoon|evening))\b/g, "");
  s = s.replace(/\band\b.*$/, "");
  s = s.split(",")[0];
  s = s.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ----------------------- weather outfit recommendation ----------------------- */

function getWeatherOutfitRecommendation(weather = {}) {
  const temp = typeof weather.temperature === "number" ? weather.temperature : 22;
  const condition = (weather.main || "").toLowerCase();
  const description = (weather.description || "").toLowerCase();
  const humidity = typeof weather.humidity === "number" ? weather.humidity : 50;
  const windSpeed = typeof weather.windSpeed === "number" ? weather.windSpeed : 0;
  const location = weather.location || "";
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = getSeason(currentMonth);

  let recommendation = "";
  let searchQuery = "";

  const weatherText =
    description &&
    description !== "undefined" &&
    description !== "null" &&
    description.trim() !== ""
      ? `${temp}°C and ${description}`
      : `${temp}°C`;

  if (temp >= 30) {
    recommendation = `🔥 It's ${weatherText} in ${location}! Ultra-hot weather calls for minimal, breathable pieces. Try linen shorts, a loose cotton tank, breathable sandals, and a wide-brim hat for sun protection!`;
    searchQuery = "summer hot weather linen cotton minimal fashion outfits";
  } else if (temp >= 25 && temp < 30) {
    recommendation = `☀️ It's ${weatherText} in ${location}! Perfect for trendy summer pieces - try high-waisted shorts with a crop top, or a flowy midi dress with comfortable sneakers. Don't forget UV protection!`;
    searchQuery = "summer warm weather fashion outfits crop tops midi dress";
  } else if (temp >= 20 && temp < 25) {
    if (condition.includes("rain") || humidity > 80) {
      recommendation = `🌦️ It's ${temp}°C with ${description || "rainy conditions"} in ${location}. Perfect for layered spring looks! Try straight-leg jeans with a lightweight cardigan, white sneakers, and a stylish trench coat for rain protection.`;
      searchQuery = "spring layered fashion outfits trench coat cardigan";
    } else {
      recommendation = `🌤️ Beautiful ${temp}°C weather in ${location}! Ideal for ${currentSeason} transitional pieces - try wide-leg pants with a fitted tee, denim jacket, and platform sneakers for that effortless chic look.`;
      searchQuery = "spring fashion outfits wide leg pants denim jacket";
    }
  } else if (temp >= 15 && temp < 20) {
    recommendation = `🍃 It's ${weatherText} in ${location}. Perfect for cozy-chic vibes! Try oversized blazers with straight jeans, chunky sneakers, and layered accessories. Add a crossbody bag for that trendy touch!`;
    searchQuery = "fall mild weather fashion outfits oversized blazer";
  } else if (temp >= 10 && temp < 15) {
    recommendation = `🍂 It's ${weatherText} in ${location}. Time for stylish layering! Think turtleneck sweaters, tailored coats, ankle boots, and statement scarves. Perfect weather for rich autumn tones!`;
    searchQuery = "fall cool weather fashion outfits turtleneck coat boots";
  } else if (temp >= 0 && temp < 10) {
    recommendation = `❄️ It's ${weatherText} in ${location}. Bundle up in style with puffer jackets, thermal layers, knee-high boots, and cozy beanies. Try monochromatic looks for a sleek winter aesthetic!`;
    searchQuery = "winter cold weather fashion outfits puffer jacket boots";
  } else {
    recommendation = `🧊 Brr! It's ${weatherText} in ${location}. Time for maximum warmth with style! Long wool coats, thermal base layers, insulated boots, and luxury accessories like cashmere scarves and leather gloves.`;
    searchQuery = "winter very cold fashion outfits wool coat cashmere";
  }

  if (condition.includes("rain") || condition.includes("drizzle")) {
    recommendation += " Trending rain gear: clear umbrellas, waterproof trench coats, and stylish rain boots! 🌧️";
    searchQuery += " rain umbrella";
  } else if (condition.includes("snow")) {
    recommendation += " Snow day essentials: insulated boots, layered textures, and statement winter accessories! ❄️";
    searchQuery += " snow winter";
  } else if (condition.includes("wind") || windSpeed > 5) {
    recommendation += " Windy weather tip: secure scarves, avoid flowy pieces, and opt for structured silhouettes! 💨";
    searchQuery += " structured";
  }

  const seasonalTrends = getSeasonalTrends(currentSeason);
  recommendation += ` ${seasonalTrends}`;

  return { recommendation, searchQuery };
}

/* --------------------------------- themes --------------------------------- */

function detectThemes(message) {
  const themes = {
    y2k: ["y2k", "2000s", "millennium", "cyber", "metallic", "holographic"],
    vintage: ["vintage", "retro", "classic", "old school", "throwback", "antique"],
    cottagecore: ["cottagecore", "cottage", "rural", "countryside", "pastoral", "prairie"],
    dark_academia: ["dark academia", "academia", "scholarly", "bookish", "preppy", "ivy league"],
    soft_girl: ["soft girl", "kawaii", "cute", "pastel", "sweet", "girly"],
    grunge: ["grunge", "edgy", "punk", "alternative", "rock", "rebellious"],
    minimalist: ["minimalist", "minimal", "simple", "clean", "basic", "neutral"],
    boho: ["boho", "bohemian", "hippie", "free spirit", "flowy", "earthy"],
    beach: ["beach", "seaside", "coastal", "tropical", "vacation", "resort"],
    festival: ["festival", "coachella", "music festival", "concert", "rave"],
    date: ["date", "romantic", "dinner date", "first date", "anniversary"],
    brunch: ["brunch", "breakfast", "morning", "cafe", "casual dining"],
    gym: ["gym", "workout", "fitness", "athletic", "sporty", "activewear"],
    travel: ["travel", "airport", "vacation", "tourist", "sightseeing"],
    preppy: ["preppy", "ivy", "collegiate", "tennis", "country club"],
    streetwear: ["streetwear", "urban", "hip hop", "casual", "sneaker"],
    elegant: ["elegant", "sophisticated", "classy", "refined", "luxurious"],
    casual: ["casual", "relaxed", "comfortable", "everyday", "laid back"],
    formal: ["formal", "dressy", "black tie", "gala", "cocktail"],
  };

  const detectedThemes = [];
  const lowerMessage = (message || "").toLowerCase();

  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detectedThemes.push(theme);
    }
  }
  return detectedThemes;
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
  };

  const primaryTheme = themes[0];
  if (themeRecommendations[primaryTheme]) {
    return themeRecommendations[primaryTheme];
  }
  return null;
}



/* --------------------------- keyword + mood detect --------------------------- */

function detectKeywords(message) {
  const detected = {
    cities: [],
    weather: [],
    occasions: [],
    themes: [],
    temperatures: [],
  };

  const lowerMessage = (message || "").toLowerCase();

  // "I'm in ..." / "location: ..."
  const cityMatch1 = lowerMessage.match(
    /(?:i'm in |im in |i am going to| i am in |location:\s*)([a-zA-Z\s,]+?)(?:\s+(?:for|to|at|in|on|during|because|since|while|when|where|with|without|about|after|before|until|through)\s|$)/i
  );
  if (cityMatch1) {
    const c = cleanCityLite(cityMatch1[1]);
    if (c && c.length > 2) detected.cities.push(c);
  }

  // "in [city]" fallback
  const cityMatch2 = lowerMessage.match(
    /\bin\s+([a-zA-Z\s,]+?)(?:\s+(?:for|to|at|on|during|because|since|while|when|where|with|without|about|after|before|until|through|today|tomorrow|now|soon|later)\s|[.!?]|$)/i
  );
  if (cityMatch2 && !cityMatch1) {
    const cleaned = cleanCityLite(cityMatch2[1].trim());
    const commonWords = [
      "the","a","an","my","your","his","her","our","their","this","that","these","those","some","any","all",
      "many","much","few","little","more","most","other","another","such","what","which","who","when","where",
      "why","how","here","there","now","then","today","tomorrow","yesterday","morning","afternoon","evening",
      "night","time","place","world","country","state","city","town","home","house","room","office","school",
      "university","college","hospital","hotel","restaurant","store","shop","market","park","beach","mountain",
      "river","lake","sea","ocean","street","road","avenue","building","north","south","east","west"
    ];
    if (cleaned && cleaned.length > 2 && !commonWords.includes(cleaned.toLowerCase())) {
      detected.cities.push(cleaned);
    }
  }

  // de-dupe
  if (detected.cities.length > 1) {
    const seen = new Set();
    detected.cities = detected.cities.filter((c) => {
      const k = c.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  // weather words
  const weatherKeywords = {
    hot: ["hot", "sunny", "warm", "blazing", "scorching", "sweltering"],
    cold: ["cold", "freezing", "chilly", "icy", "frigid", "winter"],
    rainy: ["rain", "rainy", "drizzle", "shower", "wet", "stormy"],
    windy: ["windy", "breezy", "gusty", "wind"],
    humid: ["humid", "muggy", "sticky", "damp"],
    dry: ["dry", "arid", "desert"],
  };
  for (const [cond, keys] of Object.entries(weatherKeywords)) {
    if (keys.some((k) => lowerMessage.includes(k))) detected.weather.push(cond);
  }

  // temperature
  const tempMatch = lowerMessage.match(/(\d+)\s*(?:degrees?|°|celsius|fahrenheit|c|f)/i);
  if (tempMatch) detected.temperatures.push(parseInt(tempMatch[1], 10));

  // occasions
  const occasions = {
    wedding: ["wedding", "marriage", "ceremony", "reception"],
    party: ["party", "celebration", "birthday", "night out"],
    work: ["work", "office", "professional", "business", "meeting"],
    school: ["school", "university", "college", "class", "study"],
    date: ["date", "romantic", "dinner", "first date"],
    beach: ["beach", "pool", "swimming", "vacation"],
    gym: ["gym", "workout", "exercise", "fitness"],
    travel: ["travel", "flight", "airport", "vacation", "trip"],
  };
  for (const [occ, keys] of Object.entries(occasions)) {
    if (keys.some((k) => lowerMessage.includes(k))) detected.occasions.push(occ);
  }

  detected.themes = detectThemes(message);
  return detected;
}

function detectMood(message = "") {
  const m = (message || "").toLowerCase().replace(/[’']/g, "'");

  const MOOD_KEYWORDS = {
    sad: ["sad", "depressed", "unhappy", "miserable", "down", "blue", "low", "tear", "upset", "😭", "😢", "😞"],
    anxious: ["anxious", "anxiety", "nervous", "worried", "overthinking", "panic", "panicky"],
    stressed: ["stressed", "stress", "stressing", "stressful", "overwhelmed", "burnt out", "burned out", "under pressure"],
    tired: ["tired", "exhausted", "sleepy", "fatigued", "drained", "low energy", "sleep deprived"],
    unmotivated: ["unmotivated", "no motivation", "can't focus", "cant focus", "dont want", "don’t want", "no energy", "can't be bothered"],
    lonely: ["lonely", "alone", "isolated"],
    confident: ["confident", "powerful", "boss", "on top of", "slay"],
    happy: ["happy", "good mood", "joy", "cheerful", "excited", "😊", "😄"],
    romantic: ["romantic", "date", "flirty", "in love", "💘", "💖"],
    cozy: ["cozy", "comfort", "snug", "soft", "stay in"],
    edgy: ["edgy", "bold", "punk", "grunge", "statement"],
    productive: ["productive", "focused", "get things done", "work mode"],
    celebratory: ["celebrate", "party", "win", "promotion", "birthday", "🎉"],
  };

  for (const [mood, list] of Object.entries(MOOD_KEYWORDS)) {
    if (list.some((k) => m.includes(k))) return mood;
  }
  return null;
}

/* ---------------------- image bias + allow/deny filter ---------------------- */

function ensureWomenFashionQuery(q = "") {
  const base = (q || "").trim();
  if (/\b(women|woman|ladies|female)\b/i.test(base)) return base + " outfit fashion";
  return base + " women outfit fashion clothing street style lookbook";
}

// RELAXED: allow if URL looks like an image even when alt/tags are empty.
// This is the tiny fix that stops 0 → 0 when providers give sparse tags.
function isAllowedWomenFashionImage(img) {
  const alt = (img?.alt || img?.tags || "").toLowerCase();
  const url = (img?.src || img?.url || "").toLowerCase();
  const isLikelyImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

  const BLOCK = /\b(baby|newborn|kid|child|toddler|infant|boy|men|man|male|groom|father|family|couple|wedding|bridal|pregnancy|pregnant|nursery)\b/i;
  const ALLOW = /\b(women|woman|female|ladies|girl|fashion|outfit|street\s*style|lookbook|model|runway|ootd|dress|skirt|blazer|jeans|trousers|pants|top|blouse|cardigan|hoodie|sneakers|heels|boots|coat|jacket|sweater)\b/i;

  if (BLOCK.test(alt) || BLOCK.test(url)) return false;
  if (alt && alt.trim() !== "") {
    return ALLOW.test(alt) || /\/(women|woman)\//i.test(url) || /\b(women|woman)\b/.test(url);
  }
  return isLikelyImage;
}

/* -------------------- image fetch (multi-source, merged) -------------------- */

async function fetchOutfitImages(searchQuery, culturalQuery = null, baseUrl, randomPage) {
  const imageSources = [
    { name: "pexels",    endpoint: "/api/pexels",    extra: "" },
    { name: "pixabay",   endpoint: "/api/pixabay",   extra: "&category=fashion" },
    { name: "fashion-ai",endpoint: "/api/fashion-ai",extra: "" },
  ];

  // Bias to women's fashion
  let womenQuery = ensureWomenFashionQuery(searchQuery);

  // safe clamp for Pixabay's 100-char "q" limit (route trims too, but keep it safe)
  if (womenQuery.length > 96) womenQuery = womenQuery.slice(0, 96);

  let allImages = [];

  for (const src of imageSources) {
    try {
      console.log(`[v0] Trying to fetch from ${src.name} with query: ${womenQuery}`);
      const res = await fetchWithTimeout(
        `${baseUrl}${src.endpoint}?query=${encodeURIComponent(womenQuery)}&per_page=6&page=${randomPage}${src.extra || ""}`,
        {},
        8000
      );
      if (!res.ok) {
        console.log(`[v0] ${src.name} status: ${res.status}`);
        continue;
      }
      const data = await res.json();

      // -------- tiny fix: accept p.src as STRING too --------
      const imgs = (data?.images || data?.photos || data?.hits || [])
        .map((p) => {
          const srcStr =
            (typeof p.src === "string" ? p.src : (p.src?.medium || p.src?.original)) ||
            p.webformatURL ||
            p.largeImageURL ||
            p.url ||
            p.image_url;

          return {
            src: srcStr,
            alt: p.alt || p.tags || p.description || "",
          };
        })
        .filter((x) => x.src && typeof x.src === "string");

      const filtered = imgs.filter(isAllowedWomenFashionImage);
      console.log(`[v0] ${src.name}: ${imgs.length} → ${filtered.length} after women filter`);
      allImages.push(...filtered);
    } catch (e) {
      console.error(`[v0] Error fetching ${src.name}:`, e?.message || e);
    }
  }

  // de-dupe by URL
  const seen = new Set();
  allImages = allImages.filter((img) => {
    const key = img.src;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // cap to 5
  allImages = allImages.slice(0, 5);

  // optional cultural lead image
  if (culturalQuery && allImages.length > 0) {
    let cq = ensureWomenFashionQuery(culturalQuery);
    if (cq.length > 96) cq = cq.slice(0, 96);

    for (const src of imageSources) {
      try {
        console.log(`[v0] Trying cultural from ${src.name} with query: ${cq}`);
        const res = await fetchWithTimeout(
          `${baseUrl}${src.endpoint}?query=${encodeURIComponent(cq)}&per_page=2&page=${randomPage}${src.extra || ""}`,
          {},
          8000
        );
        if (!res.ok) continue;

        const data = await res.json();
        const imgs = (data?.images || data?.photos || data?.hits || [])
          .map((p) => {
            const srcStr =
              (typeof p.src === "string" ? p.src : (p.src?.medium || p.src?.original)) ||
              p.webformatURL ||
              p.largeImageURL ||
              p.url ||
              p.image_url;
            return {
              src: srcStr,
              alt: p.alt || p.tags || p.description || "",
            };
          })
          .filter((x) => x.src && typeof x.src === "string");

        const filtered = imgs.filter(isAllowedWomenFashionImage);
        if (filtered.length) {
          const culturalImage = filtered[0];
          allImages = [culturalImage, ...allImages.slice(0, 4)];
          break;
        }
      } catch (e) {
        console.error(`[v0] Cultural fetch ${src.name} failed:`, e?.message || e);
      }
    }
  }

  console.log("[v0] Final mixed images (women only):", allImages.length);
  return allImages;
}

/* --------------------------- cultural clothing map --------------------------- */

function getCulturalClothing(city, weather) {
  // (keeping your big map as-is)
  const culturalMap = {
    "new delhi": "indian", mumbai: "indian", bangalore: "indian", chennai: "indian", kolkata: "indian", hyderabad: "indian", pune: "indian", jaipur: "indian", ahmedabad: "indian", surat: "indian", india: "indian",
    tokyo: "japanese", osaka: "japanese", kyoto: "japanese", hiroshima: "japanese", nagoya: "japanese", yokohama: "japanese", kobe: "japanese", fukuoka: "japanese", japan: "japanese",
    seoul: "korean", busan: "korean", incheon: "korean", daegu: "korean", korea: "korean", "south korea": "korean",
    beijing: "chinese", shanghai: "chinese", guangzhou: "chinese", shenzhen: "chinese", chengdu: "chinese", hangzhou: "chinese", wuhan: "chinese", xian: "chinese", china: "chinese",
    "ho chi minh": "vietnamese", hanoi: "vietnamese", "da nang": "vietnamese", vietnam: "vietnamese",
    bangkok: "thai", "chiang mai": "thai", phuket: "thai", pattaya: "thai", thailand: "thai",
    jakarta: "indonesian", surabaya: "indonesian", bandung: "indonesian", medan: "indonesian", bali: "indonesian", indonesia: "indonesian",
    "kuala lumpur": "malaysian", "george town": "malaysian", "johor bahru": "malaysian", malaysia: "malaysian",
    singapore: "singaporean",
    manila: "filipino", "quezon city": "filipino", cebu: "filipino", davao: "filipino", philippines: "filipino",
    dubai: "arabic", "abu dhabi": "arabic", riyadh: "arabic", jeddah: "arabic", doha: "arabic", kuwait: "arabic", manama: "arabic", muscat: "arabic", amman: "arabic", beirut: "arabic", baghdad: "arabic", tehran: "persian", isfahan: "persian", istanbul: "turkish", ankara: "turkish", izmir: "turkish",
    lagos: "african", cairo: "african", kinshasa: "african", johannesburg: "african", "cape town": "african", nairobi: "african", casablanca: "african", addis: "african", accra: "african", dakar: "african", tunis: "african", algiers: "african", morocco: "african", egypt: "egyptian", nigeria: "nigerian", "south africa": "southafrican", kenya: "kenyan", ghana: "ghanaian", ethiopia: "ethiopian",
    london: "british", manchester: "british", birmingham: "british", glasgow: "british", "united kingdom": "british", england: "british", scotland: "british",
    paris: "french", marseille: "french", lyon: "french", toulouse: "french", france: "french",
    berlin: "german", munich: "german", hamburg: "german", cologne: "german", germany: "german",
    rome: "italian", milan: "italian", naples: "italian", turin: "italian", italy: "italian",
    madrid: "spanish", barcelona: "spanish", valencia: "spanish", seville: "spanish", spain: "spanish",
    amsterdam: "dutch", rotterdam: "dutch", "the hague": "dutch", netherlands: "dutch",
    moscow: "russian", "st petersburg": "russian", novosibirsk: "russian", yekaterinburg: "russian", russia: "russian",
    athens: "greek", thessaloniki: "greek", greece: "greek",
    stockholm: "scandinavian", gothenburg: "scandinavian", sweden: "swedish",
    oslo: "scandinavian", bergen: "scandinavian", norway: "norway",
    copenhagen: "scandinavian", aarhus: "scandinavian", denmark: "danish",
    helsinki: "scandinavian", espoo: "scandinavian", finland: "finnish",
    "new york": "american", "los angeles": "american", chicago: "american", houston: "american", phoenix: "american", philadelphia: "american", "san antonio": "american", "san diego": "american", dallas: "american", "san jose": "american", miami: "american", atlanta: "american", boston: "american", seattle: "american", "las vegas": "american", "united states": "american", usa: "american", america: "american",
    toronto: "canadian", montreal: "canadian", vancouver: "canadian", calgary: "canadian", ottawa: "canadian", canada: "canadian",
    "mexico city": "mexican", guadalajara: "mexican", monterrey: "mexican", puebla: "mexican", mexico: "mexican",
    "sao paulo": "brazilian", "rio de janeiro": "brazilian", brasilia: "brazilian", salvador: "brazilian", fortaleza: "brazilian", brazil: "brazilian",
    "buenos aires": "argentinian", cordoba: "argentinian", rosario: "argentinian", argentina: "argentinian",
    lima: "peruvian", arequipa: "peruvian", peru: "peruvian",
    bogota: "colombian", medellin: "colombian", cali: "colombian", colombia: "colombian",
    santiago: "chilean", valparaiso: "chilean", chile: "chile",
    sydney: "australian", melbourne: "australian", brisbane: "australian", perth: "australian", adelaide: "australian", australia: "australian",
    auckland: "newzealand", wellington: "newzealand", christchurch: "newzealand", "new zealand": "newzealand",
  };

  const cityKey = (city || "").toLowerCase().replace(/,.*/, "").trim();
  const culture = culturalMap[cityKey];
  if (!culture) return null;

  const temp = weather?.temperature;
  let tempCategory = "mild";
  if (typeof temp === "number") {
    if (temp >= 25) tempCategory = "hot";
    else if (temp < 15) tempCategory = "cold";
  }

  const outfits = {
    // (keeping your big culturalOutfits object exactly as you had it)
    // trimmed here for brevity; re-use yours verbatim
  };

  return outfits[culture]?.[tempCategory] || null;
}

/* --------------------------------- main POST -------------------------------- */
function getMoodOutfitRecommendation(mood, weather) {
  const temp = weather?.temperature ?? null
  const wx = (weather?.description || "").toLowerCase()

  const addWeatherTail = () => {
    if (!weather) return ""
    const t = typeof temp === "number" ? `${temp}°C` : ""
    const d = wx ? (t ? ` and ${wx}` : wx) : ""
    return t || d ? ` Suitable for ${t}${d}.` : ""
  }

  const recs = {
    sad: {
      text:
        "🤍 Let’s go gentle and comforting. Soft textures and easy silhouettes help mood lift: a cozy knit cardigan or hoodie, relaxed-fit jeans or a flowy midi skirt, and cushy sneakers. Pick calming colors (cream, heather grey, dusty blue). Add a tiny sparkle (stud earrings) for a quiet boost.",
      query:
        "women cozy knit cardigan relaxed jeans midi skirt cushioned sneakers neutral",
    },
    anxious: {
      text:
        "🌿 Clean, anchored pieces reduce decision fatigue: a monochrome set (tee + wide-leg trousers), low-contrast trainers, and a light layer you can remove. Smooth fabrics and elastic waists keep stress down.",
      query:
        "women monochrome outfit wide leg trousers minimalist sneakers light jacket",
    },
    stressed: {
      text:
        "🫶 Wear a ‘hug’: soft sweatshirt, jersey dress, or knit co-ord with slip-on sneakers. Keep hardware and fuss low. A cap or claw clip tidies hair fast.",
      query:
        "women jersey dress knit co ord soft sweatshirt slip on sneakers minimal",
    },
    tired: {
      text:
        "😴 Low-effort polish: ribbed tank, oversized shirt as layer, pull-on pants, and chunky sneakers. Add tinted balm and small hoops—done in 2 minutes.",
      query:
        "women oversized shirt pull on pants chunky sneakers ribbed tank easy outfit",
    },
    unmotivated: {
      text:
        "⚡ One-and-done: jumpsuit or simple midi dress with white sneakers and a crossbody. Zero styling, looks finished.",
      query:
        "women jumpsuit simple midi dress white sneakers crossbody minimal",
    },
    lonely: {
      text:
        "💛 Color therapy + touchable textures: pastel cardigan over slip skirt, soft tee, dainty necklace. Friendly, approachable vibe.",
      query:
        "women pastel cardigan slip skirt soft tee dainty necklace spring outfits",
    },
    confident: {
      text:
        "🔥 Power fit: structured blazer, straight jeans or tailored pants, square-toe or platform shoes. Add a statement belt.",
      query:
        "women structured blazer straight jeans tailored trousers platform shoes statement belt",
    },
    happy: {
      text:
        "🌈 Play! A bright knit or printed skirt, fun sunnies, and retro sneakers. Lean into color blocking.",
      query:
        "women colorful knit printed skirt retro sneakers color block outfit",
    },
    romantic: {
      text:
        "💐 Soft and feminine: slip or wrap dress, kitten heels or Mary Janes, delicate jewelry, mini bag.",
      query:
        "women slip dress wrap dress kitten heels mary jane mini bag",
    },
    cozy: {
      text:
        "🧣 Lounge-core: cashmere-feel sweater, leggings or rib pants, socks + sneakers or comfy mules.",
      query:
        "women cozy sweater rib pants leggings ugg mule casual outfit",
    },
    edgy: {
      text:
        "🖤 Edge it up: leather (or faux) jacket, dark straight jeans, chunky boots, layered chain.",
      query:
        "women leather jacket straight jeans chunky boots layered chain grunge",
    },
    productive: {
      text:
        "📈 Sharp but comfy: knit polo or tee, pleated trousers, sleek trainers, minimal tote. Focus gear.",
      query:
        "women pleated trousers knit polo sleek sneakers minimal tote work outfits",
    },
    celebratory: {
      text:
        "🎉 Shine: satin cami + jeans or sequin skirt + tee, strappy heels, small shoulder bag.",
      query:
        "women satin cami jeans sequin skirt strappy heels party outfit",
    },
  }

  const chosen = recs[mood]
  if (!chosen) return null

  // Weather-aware query tweaks
  let adjustedQuery = chosen.query
  if (/\brain|drizzle|shower|storm|thunder/.test(wx))
    adjustedQuery += " trench coat rain friendly"
  if (typeof temp === "number" && temp >= 28)
    adjustedQuery += " linen cotton breathable"
  if (typeof temp === "number" && temp <= 12)
    adjustedQuery += " coat sweater tights boots"

  return {
    recommendation: `${chosen.text}${addWeatherTail()}`,
    searchQuery: adjustedQuery,
  }
}

// export async function POST(req) {
//   const replyParts = [];
//   let messages;

//   try {
//     const body = await req.json();
//     messages = body.messages;
//   } catch (err) {
//     console.error("❌ Failed to parse JSON body", err);
//     return new Response(JSON.stringify({ error: "Invalid JSON" }), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   const lastUserMessage = messages[messages.length - 1];
//   const uploadedFiles = lastUserMessage?.data?.files || [];
//   let lastImageForm = null;

//   if (uploadedFiles.length > 0) {
//     for (const file of uploadedFiles) {
//       if (file.type === "file" && file.mediaType.startsWith("image/")) {
//         try {
//           const base64Data = file.url.split(",")[1];
//           const buffer = Buffer.from(base64Data, "base64");
//           const blob = new Blob([buffer], { type: file.mediaType });

//           const form = new FormData();
//           form.append("image", blob, "outfit.jpg");
//           lastImageForm = form;

//           const resp1 = await callAnalyzeEndpoint(
//             process.env.ANALYZE_URL || "https://d38fb44458dc.ngrok-free.app/analyze",
//             form
//           );

//           if (resp1.ok) {
//             const d = resp1.data || {};
//             const items = d.items || d.detected_items || [];
//             replyParts.push({
//               type: "text",
//               content: items.length
//                 ? `📸 Based on your image, I detected: ${items.join(", ")}`
//                 : "I analyzed your image but couldn’t detect items confidently.",
//             });
//           } else {
//             console.error("Analyze (ngrok) failed:", resp1.error, resp1.detail);
//           }
//         } catch (error) {
//           console.error("Image analysis error (analyze-outfit):", error);
//           replyParts.push({ type: "text", content: "⚠️ Image analysis failed." });
//         }
//       }
//     }
//   }

//   if (process.env.NODE_ENV === "development" && lastImageForm) {
//     try {
//       const resp2 = await callAnalyzeEndpoint(
//         process.env.LOCAL_ANALYZE_URL || "http://127.0.0.1:5001/analyze-outfit",
//         lastImageForm
//       );
//       if (resp2.ok) {
//         const d2 = resp2.data || {};
//         const items2 = d2.items || d2.detected_items || [];
//         if (items2.length) {
//           replyParts.push({ type: "text", content: `🎯 Extra analysis: ${items2.join(", ")}` });
//         }
//       } else {
//         console.error("Analyze (local) failed:", resp2.error, resp2.detail);
//       }
//     } catch (error) {
//       console.error("Image analysis error (analyze):", error);
//       replyParts.push({ type: "text", content: "⚠️ Sorry, secondary analysis failed." });
//     }
//   }

//   const lastMessage = (lastUserMessage?.content || "").toLowerCase();
//   const userLocation = lastUserMessage?.location;
//   const host = req.headers.get("host");
//   const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
//   const baseUrl = `${protocol}://${host}`;
//   const randomPage = Math.floor(Math.random() * 10) + 1;

//   const detectedKeywords = detectKeywords(lastMessage);
//   let weatherData = null;

//   /* ---------------------------- mood-first branch ---------------------------- */
//   {
//     const mood = detectMood(lastMessage);
//     if (mood) {
//       let city = detectedKeywords.cities?.[0] || null;
//       if (!city && userLocation) {
//         if (typeof userLocation === "string") city = userLocation;
//         else if (typeof userLocation === "object" && userLocation.city) city = userLocation.city;
//       }

//       if (city) {
//         try {
//           const weatherResponse = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
//           if (weatherResponse.ok) {
//             const weatherJson = await weatherResponse.json();
//             weatherData = weatherJson.weather;
//           }
//         } catch (err) {
//           console.error("🌤️ Weather fetch (mood-first) failed:", err);
//         }
//       }

//       const moodRec = getMoodOutfitRecommendation(mood, weatherData);
//       if (moodRec) {
//         const cityTail = city ? ` (based on ${city} weather)` : "";
//         replyParts.push({
//           type: "text",
//           content: `I hear you — you’re feeling ${mood}. ${moodRec.recommendation}${cityTail}`,
//         });

//         const images = await fetchOutfitImages(moodRec.searchQuery, null, baseUrl, randomPage);
//         if (images.length > 0) {
//           replyParts.push({ type: "text", content: "Here are some ideas that match your mood + weather:" });
//           images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }));
//         } else {
//           replyParts.push({ type: "text", content: "I couldn’t pull images right now, but those pieces will work well together." });
//         }

//         return new Response(
//           JSON.stringify({ id: Date.now().toString(), role: "assistant", content: replyParts }),
//           { status: 200, headers: { "Content-Type": "application/json" } }
//         );
//       }
//     }
//   }

//   /* ------------------------------ greeting branch ----------------------------- */
//   if (lastMessage.includes("hi") || lastMessage.includes("hello") || lastMessage.includes("hey")) {
//     replyParts.push({
//       type: "text",
//       content:
//         "👋 Hi there! I'm Outfitly, your AI stylist. I can help pick outfits based on weather, occasions, or even your photos. How can I help you today?",
//     });
//   } else if (
//     detectedKeywords.cities.length > 0 ||
//     detectedKeywords.weather.length > 0 ||
//     detectedKeywords.occasions.length > 0 ||
//     detectedKeywords.themes.length > 0
//   ) {
//     if (detectedKeywords.cities.length > 0) {
//       try {
//         const city = detectedKeywords.cities[0];
//         const weatherResponse = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
//         if (weatherResponse.ok) {
//           const weatherJson = await weatherResponse.json();
//           weatherData = weatherJson.weather;
//         }
//       } catch (err) {
//         console.error("🌤️ Weather fetch failed:", err);
//       }
//     }

//     let recommendation = "";
//     let searchQuery = "";

//     if (detectedKeywords.themes.length > 0) {
//       const themeRec = getThemeOutfitRecommendation(detectedKeywords.themes, weatherData);
//       if (themeRec) {
//         recommendation = themeRec.recommendation;
//         searchQuery = themeRec.searchQuery;
//         if (weatherData) {
//           recommendation += ` Suitable for ${weatherData.temperature}°C and ${weatherData.description}`;
//         }
//       }
//     } else if (detectedKeywords.occasions.length > 0) {
//       const occ = detectedKeywords.occasions[0];
//       // keep your old occasion functions if you had them; falling back to weather rec otherwise
//       const rec = getWeatherOutfitRecommendation(weatherData || { temperature: 22, description: "mild" });
//       recommendation = rec.recommendation;
//       searchQuery = rec.searchQuery;
//     } else if (detectedKeywords.weather.length > 0 || weatherData) {
//       const weather = weatherData || { temperature: 22, description: detectedKeywords.weather.join(", ") };
//       const rec = getWeatherOutfitRecommendation(weather);
//       recommendation = rec.recommendation;
//       searchQuery = rec.searchQuery;
//     }

//     const images = await fetchOutfitImages(searchQuery, null, baseUrl, randomPage);
//     if (images.length > 0) {
//       replyParts.push({ type: "text", content: recommendation });
//       replyParts.push({ type: "text", content: "Here are some outfit inspirations for you:" });
//       images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }));
//     } else {
//       replyParts.push({ type: "text", content: `${recommendation}\n\nNo outfit images available right now. Try again later!` });
//     }
//   } else {
//     replyParts.push({ type: "text", content: `🧠 I didn’t catch a specific theme, weather, or city. You can also upload an image!` });
//   }

  
//   return new Response(
//     JSON.stringify({ id: Date.now().toString(), role: "assistant", content: replyParts }),
//     { status: 200, headers: { "Content-Type": "application/json" } }
//   );
// }

export async function POST(req) {
  const replyParts = [];
  let messages;

  try {
    const body = await req.json();
    messages = body.messages;
  } catch (err) {
    console.error("❌ Failed to parse JSON body", err);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const lastUserMessage = messages[messages.length - 1];
  const uploadedFiles = lastUserMessage?.data?.files || [];
  let lastImageForm = null;

  // ---------- optional image analysis (kept intact) ----------
  if (uploadedFiles.length > 0) {
    for (const file of uploadedFiles) {
      if (file.type === "file" && file.mediaType.startsWith("image/")) {
        try {
          const base64Data = file.url.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const blob = new Blob([buffer], { type: file.mediaType });

          const form = new FormData();
          form.append("image", blob, "outfit.jpg");
          lastImageForm = form;

          const resp1 = await callAnalyzeEndpoint(
            process.env.ANALYZE_URL || "https://d38fb44458dc.ngrok-free.app/analyze",
            form
          );

          if (resp1.ok) {
            const d = resp1.data || {};
            const items = d.items || d.detected_items || [];
            replyParts.push({
              type: "text",
              content: items.length
                ? `📸 Based on your image, I detected: ${items.join(", ")}`
                : "I analyzed your image but couldn’t detect items confidently.",
            });
          } else {
            console.error("Analyze (ngrok) failed:", resp1.error, resp1.detail);
          }
        } catch (error) {
          console.error("Image analysis error (analyze-outfit):", error);
          replyParts.push({ type: "text", content: "⚠️ Image analysis failed." });
        }
      }
    }
  }

  if (process.env.NODE_ENV === "development" && lastImageForm) {
    try {
      const resp2 = await callAnalyzeEndpoint(
        process.env.LOCAL_ANALYZE_URL || "http://127.0.0.1:5001/analyze-outfit",
        lastImageForm
      );
      if (resp2.ok) {
        const d2 = resp2.data || {};
        const items2 = d2.items || d2.detected_items || [];
        if (items2.length) {
          replyParts.push({ type: "text", content: `🎯 Extra analysis: ${items2.join(", ")}` });
        }
      } else {
        console.error("Analyze (local) failed:", resp2.error, resp2.detail);
      }
    } catch (error) {
      console.error("Image analysis error (analyze):", error);
      replyParts.push({ type: "text", content: "⚠️ Sorry, secondary analysis failed." });
    }
  }

  // ---------- common request context ----------
  const lastMessage = (lastUserMessage?.content || "").toLowerCase();
  const userLocation = lastUserMessage?.location;
  const host = req.headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const randomPage = Math.floor(Math.random() * 10) + 1;

  const detectedKeywords = detectKeywords(lastMessage);
  let weatherData = null;

  /* ----------------- MOCK: “Can I wear this in <city>?” quick answer -----------------
     This does NOT actually detect garments; we mock a denim short dress + sneakers,
     fetch weather for the city, add advice, and send a few inspo images.
  ------------------------------------------------------------------------------- */
  {
    // Find city from text or saved location
    let city = detectedKeywords.cities?.[0] || null;
    if (!city && userLocation) {
      if (typeof userLocation === "string") city = userLocation;
      else if (typeof userLocation === "object" && userLocation.city) city = userLocation.city;
    }

    // trigger phrases
    const askedCanIWear = /\b(can\s+i\s+wear|is\s+this\s+okay|fit\s+for)\b/i.test(
      lastUserMessage?.content || ""
    );

    if (city && askedCanIWear) {
      // Best-effort weather
      try {
        const weatherRes = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
        if (weatherRes.ok) {
          const weatherJson = await weatherRes.json();
          weatherData = weatherJson.weather;
        }
      } catch (err) {
        console.error("🌤️ Mock branch weather fetch failed:", err);
      }

      // ⚠️ Mock outfit (no CV)
      const mockItems = ["denim short dress", "sneakers"];

      replyParts.push({
        type: "text",
        content: `You're planning to wear a **${mockItems[0]}** with **${mockItems[1]}** in **${city}**.`,
      });

      replyParts.push({
        type: "text",
        content: `My take: ${mockLayerAdvice(weatherData)}`,
      });

      replyParts.push({
        type: "text",
        content:
          "Style tip: add a crossbody bag and simple jewelry; if it’s windy or rainy, swap sneakers for water-resistant shoes.",
      });

      // a few inspo images to match the vibe
      const q = `${city} layered denim street style women`;
      const images = await fetchOutfitImages(q, null, baseUrl, Math.floor(Math.random() * 5) + 1);
      images.slice(0, 4).forEach((img, i) =>
        replyParts.push({ type: "image", url: img.src || img.url, alt: `outfit inspo ${i + 1}` })
      );

      return new Response(
        JSON.stringify({ id: Date.now().toString(), role: "assistant", content: replyParts }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  /* ---------------------------- mood-first branch (kept) ---------------------------- */
  {
    const mood = detectMood(lastMessage);
    if (mood) {
      let city = detectedKeywords.cities?.[0] || null;
      if (!city && userLocation) {
        if (typeof userLocation === "string") city = userLocation;
        else if (typeof userLocation === "object" && userLocation.city) city = userLocation.city;
      }

      if (city) {
        try {
          const weatherResponse = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
          if (weatherResponse.ok) {
            const weatherJson = await weatherResponse.json();
            weatherData = weatherJson.weather;
          }
        } catch (err) {
          console.error("🌤️ Weather fetch (mood-first) failed:", err);
        }
      }

      const moodRec = getMoodOutfitRecommendation(mood, weatherData);
      if (moodRec) {
        const cityTail = city ? ` (based on ${city} weather)` : "";
        replyParts.push({
          type: "text",
          content: `I hear you — you’re feeling ${mood}. ${moodRec.recommendation}${cityTail}`,
        });

        const images = await fetchOutfitImages(moodRec.searchQuery, null, baseUrl, randomPage);
        if (images.length > 0) {
          replyParts.push({ type: "text", content: "Here are some ideas that match your mood + weather:" });
          images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }));
        } else {
          replyParts.push({ type: "text", content: "I couldn’t pull images right now, but those pieces will work well together." });
        }

        return new Response(
          JSON.stringify({ id: Date.now().toString(), role: "assistant", content: replyParts }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  /* ------------------------------ greeting/keywords (kept) ----------------------------- */
  if (lastMessage.includes("hi") || lastMessage.includes("hello") || lastMessage.includes("hey")) {
    replyParts.push({
      type: "text",
      content:
        "👋 Hi there! I'm Outfitly, your AI stylist. I can help pick outfits based on weather, occasions, or even your photos. How can I help you today?",
    });
  } else if (
    detectedKeywords.cities.length > 0 ||
    detectedKeywords.weather.length > 0 ||
    detectedKeywords.occasions.length > 0 ||
    detectedKeywords.themes.length > 0
  ) {
    if (detectedKeywords.cities.length > 0) {
      try {
        const city = detectedKeywords.cities[0];
        const weatherResponse = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
        if (weatherResponse.ok) {
          const weatherJson = await weatherResponse.json();
          weatherData = weatherJson.weather;
        }
      } catch (err) {
        console.error("🌤️ Weather fetch failed:", err);
      }
    }

    let recommendation = "";
    let searchQuery = "";

    if (detectedKeywords.themes.length > 0) {
      const themeRec = getThemeOutfitRecommendation(detectedKeywords.themes, weatherData);
      if (themeRec) {
        recommendation = themeRec.recommendation;
        searchQuery = themeRec.searchQuery;
        if (weatherData) {
          recommendation += ` Suitable for ${weatherData.temperature}°C and ${weatherData.description}`;
        }
      }
    } else if (detectedKeywords.occasions.length > 0) {
      const rec = getWeatherOutfitRecommendation(weatherData || { temperature: 22, description: "mild" });
      recommendation = rec.recommendation;
      searchQuery = rec.searchQuery;
    } else if (detectedKeywords.weather.length > 0 || weatherData) {
      const weather = weatherData || { temperature: 22, description: detectedKeywords.weather.join(", ") };
      const rec = getWeatherOutfitRecommendation(weather);
      recommendation = rec.recommendation;
      searchQuery = rec.searchQuery;
    }

    const images = await fetchOutfitImages(searchQuery, null, baseUrl, randomPage);
    if (images.length > 0) {
      replyParts.push({ type: "text", content: recommendation });
      replyParts.push({ type: "text", content: "Here are some outfit inspirations for you:" });
      images.forEach((img) => replyParts.push({ type: "image", url: img.src || img.url, alt: img.alt }));
    } else {
      replyParts.push({ type: "text", content: `${recommendation}\n\nNo outfit images available right now. Try again later!` });
    }
  } else {
    replyParts.push({ type: "text", content: `🧠 I didn’t catch a specific theme, weather, or city. You can also upload an image!` });
  }

  return new Response(
    JSON.stringify({ id: Date.now().toString(), role: "assistant", content: replyParts }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}