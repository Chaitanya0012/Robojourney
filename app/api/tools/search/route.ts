import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = [
  "arduino.cc",
  "espressif.com",
  "randomnerdtutorials.com",
  "wokwi.com",
  "circuitdigest.com",
  "electronicshub.org",
  "instructables.com",
  "digikey.com",
];

const ALLOWED_TOPICS = [
  "esp32",
  "arduino",
  "robotics",
  "sensors",
  "motors",
  "pwm",
  "line follower",
  "electronics",
];

const PROFANITY_LIST = ["badword1", "badword2", "badword3"];

function filterProfanity(text: string) {
  let hits = 0;
  let cleaned = text;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(word, "gi");
    cleaned = cleaned.replace(regex, () => {
      hits += 1;
      return "***";
    });
  }
  return { cleaned, hits };
}

function isTopicAllowed(query: string) {
  return ALLOWED_TOPICS.some((topic) => query.toLowerCase().includes(topic));
}

async function searchBing(query: string) {
  const key = process.env.BING_SEARCH_KEY;
  if (!key) return [];

  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
      },
    },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { webPages?: { value: Array<{ name: string; url: string; snippet: string }> } };
  return (
    data.webPages?.value
      ?.map((item) => {
        const domain = new URL(item.url).hostname.replace("www.", "");
        const { cleaned, hits } = filterProfanity(item.snippet || "");
        if (hits > 3) return null;
        if (!ALLOWED_DOMAINS.includes(domain)) return null;
        return { title: item.name, url: item.url, snippet: cleaned, domain };
      })
      .filter(Boolean) || []
  );
}

export async function POST(req: NextRequest) {
  const { query } = (await req.json()) as { query: string };

  if (!query || !isTopicAllowed(query)) {
    return NextResponse.json({ results: [], reason: "Query not allowed" }, { status: 400 });
  }

  const results = await searchBing(query);

  return NextResponse.json({ results });
}
