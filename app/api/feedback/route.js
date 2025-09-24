import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs"; // <— ensure Node, not Edge
export const dynamic = "force-dynamic"; // <— do not cache this route
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_PATH = path.join(DATA_DIR, "feedback.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FEEDBACK_PATH);
  } catch {
    await fs.writeFile(
      FEEDBACK_PATH,
      JSON.stringify({ combos: {} }, null, 2),
      "utf-8"
    );
  }
}
async function readFeedback() {
  await ensureFile();
  const raw = await fs.readFile(FEEDBACK_PATH, "utf-8");
  return raw ? JSON.parse(raw) : { combos: {} };
}
async function writeFeedback(json) {
  await ensureFile();
  await fs.writeFile(FEEDBACK_PATH, JSON.stringify(json, null, 2), "utf-8");
}

export async function GET() {
  try {
    const data = await readFeedback();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("GET /api/feedback error:", e);
    return NextResponse.json(
      { error: e?.message || "read error" },
      { status: 500 }
    );
  }
}

/** Body: { comboKey, action: "like"|"unlike"|"dislike"|"undislike", outfit?, contextTags? } */
export async function POST(req) {
  try {
    const body = await req.json();
    const { comboKey, action, outfit, contextTags } = body || {};
    const ALLOWED = new Set(["like", "unlike", "dislike", "undislike"]);
    if (!comboKey || !ALLOWED.has(action)) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const store = await readFeedback();
    const entry = (store.combos[comboKey] = store.combos[comboKey] || {
      likes: 0,
      dislikes: 0,
      history: [],
    });

    if (action === "like") entry.likes += 1;
    if (action === "unlike") entry.likes = Math.max(0, entry.likes - 1);
    if (action === "dislike") entry.dislikes += 1;
    if (action === "undislike")
      entry.dislikes = Math.max(0, entry.dislikes - 1);

    entry.history.push({
      action,
      ts: Date.now(),
      tags: Array.isArray(contextTags) ? contextTags : [],
      top: outfit?.top,
      bottom: outfit?.bottom,
      shoes: outfit?.shoes,
    });

    await writeFeedback(store);
    return NextResponse.json(store, { status: 200 });
  } catch (e) {
    console.error("POST /api/feedback error:", e);
    return NextResponse.json(
      { error: e?.message || "write error" },
      { status: 500 }
    );
  }
}
