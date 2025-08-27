import cosineSimilarity from "compute-cosine-similarity";

/** Tag vocabulary (one-hot) */
export const TAG_VOCAB = [
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

export function toVector(tags = []) {
  const lower = (tags || []).map((t) => String(t).toLowerCase());
  return TAG_VOCAB.map((tag) => (lower.includes(tag) ? 1 : 0));
}

/** Stable unique id for an outfit combo (name+color avoids collisions) */
export function comboKey(of) {
  const t = of?.top || {};
  const b = of?.bottom || {};
  const s = of?.shoes || {};
  return `${t.name}|${t.color}__${b.name}|${b.color}__${s.name}|${s.color}`;
}

/* ------------------------- NEW: smarter ranking bits ------------------------ */

const DEFAULTS = {
  // feedback blending
  p0: 0.55, // prior like-rate
  m: 4, // prior strength
  alphaCtx: 0.7, // context vs global blend

  // scoring weights
  wSim: 0.65,
  wFB: 0.35,

  // soft propagation from similar liked combos
  propSharedPiecesBoost: 0.02, // share ≥2 of (top,bottom,shoes)
  propSharedTagsBoost: 0.01, // share ≥2 tags

  // diversity (MMR)
  mmrLambda: 0.8,

  // exploration (set exploreTau <= 0 to disable)
  exploreTau: 0.1, // softmax temperature for 1 exploratory slot
};

function lowerTags(arr = []) {
  return (arr || []).map((x) => String(x).toLowerCase());
}

function sameContextTags(a = [], b = []) {
  // exact match for (weather, occasion, mood) triplet
  const A = lowerTags(a);
  const B = lowerTags(b);
  if (A.length !== B.length) return false;
  for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
  return true;
}

function decayFactor(ts, now = Date.now()) {
  if (!ts) return 1;
  const ageDays = (now - ts) / (1000 * 60 * 60 * 24);
  // ~2-month half-life feel
  return Math.exp(-ageDays / 60);
}

function bayesRate(likes, dislikes, p0, m) {
  const n = likes + dislikes;
  return (likes + m * p0) / (n + m);
}

function stableHashUnit(str) {
  // FNV-ish
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return ((h >>> 0) % 100000) / 100000; // 0..1
}

function pairwiseSim(a, b) {
  // components overlap (top/bottom/shoes)
  const sameTop =
    a.top?.name === b.top?.name && a.top?.color === b.top?.color ? 1 : 0;
  const sameBottom =
    a.bottom?.name === b.bottom?.name && a.bottom?.color === b.bottom?.color
      ? 1
      : 0;
  const sameShoes =
    a.shoes?.name === b.shoes?.name && a.shoes?.color === b.shoes?.color
      ? 1
      : 0;
  const compOverlap = (sameTop + sameBottom + sameShoes) / 3;

  // tag Jaccard
  const A = new Set(lowerTags(a.tags));
  const B = new Set(lowerTags(b.tags));
  const inter = [...A].filter((t) => B.has(t)).length;
  const union = new Set([...A, ...B]).size || 1;
  const tagJac = inter / union;

  return 0.6 * compOverlap + 0.4 * tagJac;
}

function rerankMMR(candidates, K, lambda = 0.8) {
  const picked = [];
  const pool = candidates.slice();

  while (picked.length < Math.min(K, pool.length)) {
    let best = null;
    let bestVal = -Infinity;
    for (const c of pool) {
      const divPenalty = picked.length
        ? Math.max(...picked.map((p) => pairwiseSim(p.of, c.of)))
        : 0;
      const val = lambda * c.score - (1 - lambda) * divPenalty;
      if (val > bestVal) {
        bestVal = val;
        best = c;
      }
    }
    picked.push(best);
    pool.splice(pool.indexOf(best), 1);
  }
  return { picked, rest: pool.sort((a, b) => b.score - a.score) };
}

function softmaxPick(items, tau = 0.1) {
  if (!items.length || tau <= 0) return null;
  const m = Math.max(...items.map((x) => x.score));
  const exps = items.map((x) => Math.exp((x.score - m) / tau));
  const sum = exps.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= exps[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function collectContextLikes(feedbackStore, contextTags) {
  // returns array of history entries {top,bottom,shoes,tags}
  const res = [];
  const combos = feedbackStore?.combos || {};
  for (const entry of Object.values(combos)) {
    const hist = Array.isArray(entry?.history) ? entry.history : [];
    for (let i = hist.length - 1; i >= 0; i--) {
      const h = hist[i];
      const act = String(h?.action || "").toLowerCase();
      if (act !== "like") continue;
      if (!sameContextTags(h?.tags, contextTags)) continue;
      // include if not immediately undone afterward
      // (quick pass: if there exists a later 'unlike' for same ctx, skip)
      const later = hist.slice(i + 1);
      const undone = later.some(
        (x) => sameContextTags(x?.tags, contextTags) && x?.action === "unlike"
      );
      if (!undone && (h?.top || h?.bottom || h?.shoes)) res.push(h);
    }
  }
  return res.slice(0, 6); // small cap for perf
}

/**
 * Compute ALL recommendations with feedback-aware re-ranking.
 * Returns an array sorted by score (desc). If options.k is provided,
 * the TOP-K segment is re-ordered using MMR, and the first slot may include
 * a mild exploratory pick based on softmax.
 */
export function getAllRecommendations(
  outfitList,
  inputTags,
  feedbackStore,
  options = {}
) {
  const {
    p0,
    m,
    alphaCtx,
    wSim,
    wFB,
    propSharedPiecesBoost,
    propSharedTagsBoost,
    mmrLambda,
    exploreTau,
    k: K = 5,
  } = { ...DEFAULTS, ...options };

  const inputVec = toVector(inputTags);
  const now = Date.now();

  // Precompute context/global decayed counts for each combo
  const combos = feedbackStore?.combos || {};
  const ctxCounts = new Map(); // key -> {likes, dislikes}
  const globCounts = new Map(); // key -> {likes, dislikes}

  for (const [key, entry] of Object.entries(combos)) {
    let cLike = 0,
      cDis = 0,
      gLike = 0,
      gDis = 0;
    const hist = Array.isArray(entry?.history) ? entry.history : [];
    for (const h of hist) {
      const act = String(h?.action || "").toLowerCase();
      const df = decayFactor(h?.ts, now);
      const isCtx = sameContextTags(h?.tags, inputTags);

      if (act === "like") {
        gLike += df;
        if (isCtx) cLike += df;
      } else if (act === "dislike") {
        gDis += df;
        if (isCtx) cDis += df;
      } else if (act === "unlike") {
        gLike = Math.max(0, gLike - df);
        if (isCtx) cLike = Math.max(0, cLike - df);
      } else if (act === "undislike") {
        gDis = Math.max(0, gDis - df);
        if (isCtx) cDis = Math.max(0, cDis - df);
      }
    }
    ctxCounts.set(key, { likes: cLike, dislikes: cDis });
    globCounts.set(key, { likes: gLike, dislikes: gDis });
  }

  // For propagation: recent liked combos in this context (from history)
  const likedCtxHistory = collectContextLikes(feedbackStore, inputTags);

  function propagationBoost(candidate) {
    let boost = 0;
    for (const h of likedCtxHistory) {
      let sharedPieces = 0;
      if (
        candidate.top?.name === h.top?.name &&
        candidate.top?.color === h.top?.color
      )
        sharedPieces++;
      if (
        candidate.bottom?.name === h.bottom?.name &&
        candidate.bottom?.color === h.bottom?.color
      )
        sharedPieces++;
      if (
        candidate.shoes?.name === h.shoes?.name &&
        candidate.shoes?.color === h.shoes?.color
      )
        sharedPieces++;

      if (sharedPieces >= 2) boost += propSharedPiecesBoost;

      const A = new Set(lowerTags(candidate.tags));
      const B = new Set(lowerTags(h.tags));
      let overlap = 0;
      A.forEach((t) => B.has(t) && overlap++);
      if (overlap >= 2) boost += propSharedTagsBoost;
    }
    return boost;
  }

  const scored = (outfitList || []).map((of) => {
    const key = comboKey(of);
    const base = cosineSimilarity(inputVec, toVector(of.tags)) || 0;

    const ctx = ctxCounts.get(key) || { likes: 0, dislikes: 0 };
    const glob = globCounts.get(key) || { likes: 0, dislikes: 0 };

    const ctxRate = bayesRate(ctx.likes, ctx.dislikes, p0, m);
    const globRate = bayesRate(glob.likes, glob.dislikes, p0, m);
    const fb = alphaCtx * ctxRate + (1 - alphaCtx) * globRate;

    const prop = propagationBoost(of);

    const jitter = (stableHashUnit(key) - 0.5) * 1e-4; // stable tiebreak

    const score = wSim * base + wFB * fb + prop + jitter;
    return { of, key, rawScore: base, fbRate: fb, score };
  });

  // Hide heavily disliked (global) — optional: threshold ~3 effective dislikes
  const filtered = scored.filter((x) => {
    const g = globCounts.get(x.key) || { likes: 0, dislikes: 0 };
    return g.dislikes < 3.0;
  });

  // If K specified, re-order top-K with MMR and optionally inject 1 exploratory pick
  const { picked, rest } = rerankMMR(filtered, K, mmrLambda);

  if (exploreTau > 0 && rest.length > 0) {
    const exploratory = softmaxPick(rest, exploreTau);
    if (exploratory) {
      // replace the last slot if exploratory is different & not already picked
      const exists = picked.some((p) => p.key === exploratory.key);
      if (!exists) picked[picked.length - 1] = exploratory;
    }
  }

  const finalOrder = [...picked, ...rest];
  // Return same shape as before: array of outfit objects with score fields
  return finalOrder.map((x) => ({
    ...x.of,
    rawScore: x.rawScore,
    score: x.score,
  }));
}
