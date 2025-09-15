import cosineSimilarity from "compute-cosine-similarity";

const TAGS = [
  "hot",
  "cold",
  "rainy",
  "casual",
  "formal",
  "party",
  "minimal",
  "bold",
  "neutral",
];

function toVector(tags) {
  return TAGS.map((tag) => (tags.includes(tag) ? 1 : 0));
}

export function getTopKRecommendations(wardrobe, inputTags, k = 3) {
  const tops = wardrobe.filter((i) => i.type === "top");
  const bottoms = wardrobe.filter((i) => i.type === "bottom");
  const shoes = wardrobe.filter((i) => i.type === "shoes");

  const inputVector = toVector(inputTags);
  const seenCombos = new Set();
  const combos = [];

  for (const t of tops) {
    for (const b of bottoms) {
      for (const s of shoes) {
        const comboKey = `${t.id}-${b.id}-${s.id}`;
        if (seenCombos.has(comboKey)) continue;
        seenCombos.add(comboKey);

        const allTags = [...t.style, ...b.style, ...s.style];
        const comboVector = toVector(allTags);
        const score = cosineSimilarity(inputVector, comboVector);

        combos.push({
          top: t,
          bottom: b,
          shoes: s,
          score: score + Math.random() * 0.001, // slight randomness to break ties
        });
      }
    }
  }

  combos.sort((a, b) => b.score - a.score);
  return combos.slice(0, k);
}
