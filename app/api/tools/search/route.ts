import { NextResponse } from "next/server";

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

const TOPIC_ALLOWLIST = [
  "esp32",
  "arduino",
  "robotics",
  "sensors",
  "motors",
  "pwm",
  "line follower",
  "electronics",
];

const BLOCKED_DOMAINS = [
  "stackoverflow.com",
  "stackexchange.com",
  "reddit.com",
  "twitter.com",
  "tiktok.com",
  "facebook.com",
  "instagram.com",
  "quora.com",
  "medium.com",
  "youtube.com",
];

// A compact profanity blocklist (200+ terms) to sanitize snippets.
const PROFANITY_LIST = new Set([
  "anal",
  "anus",
  "arse",
  "arsehole",
  "ass",
  "assbag",
  "assbite",
  "assclown",
  "asscock",
  "asscracker",
  "asses",
  "assface",
  "assfucker",
  "assgoblin",
  "asshat",
  "asshead",
  "asshole",
  "asshopper",
  "assjacker",
  "asslick",
  "asslicker",
  "assmonkey",
  "assmunch",
  "assmuncher",
  "asspirate",
  "assshit",
  "assshole",
  "asssucker",
  "asswad",
  "asswipe",
  "axwound",
  "bastard",
  "bawdy",
  "beaner",
  "bitch",
  "bitchass",
  "bitches",
  "bitchy",
  "blowjob",
  "bollocks",
  "boner",
  "boob",
  "boobs",
  "bullshit",
  "bumblefuck",
  "butt",
  "buttbang",
  "buttfuck",
  "butthole",
  "buttmunch",
  "buttplug",
  "clit",
  "clitoris",
  "clusterfuck",
  "cock",
  "cockbite",
  "cockface",
  "cockfucker",
  "cockhead",
  "cockmonkey",
  "cockmunch",
  "cockmuncher",
  "cocks",
  "cocksucker",
  "cockwaffle",
  "coochie",
  "coochy",
  "coon",
  "cooter",
  "crap",
  "cum",
  "cumbubble",
  "cumdumpster",
  "cumguzzler",
  "cumjockey",
  "cumslut",
  "cumtart",
  "cunt",
  "cuntass",
  "cuntface",
  "cunthole",
  "cuntlick",
  "cuntlicker",
  "cuntrag",
  "cunts",
  "damn",
  "degenerate",
  "dick",
  "dickbag",
  "dickbeaters",
  "dickface",
  "dickfuck",
  "dickhead",
  "dickhole",
  "dickish",
  "dickless",
  "dickmilk",
  "dickpic",
  "dicks",
  "dickslap",
  "dickwad",
  "dickweed",
  "dildo",
  "dipshit",
  "dookie",
  "dope",
  "dumb",
  "dumbass",
  "dumbfuck",
  "dumbshit",
  "dumshit",
  "dweeb",
  "dyke",
  "fag",
  "faggot",
  "fanny",
  "fart",
  "fatass",
  "felch",
  "fellatio",
  "feltch",
  "fuck",
  "fuckass",
  "fuckbag",
  "fuckboy",
  "fuckbrain",
  "fuckbutt",
  "fucked",
  "fucker",
  "fuckers",
  "fuckface",
  "fuckhead",
  "fuckhole",
  "fuckin",
  "fucking",
  "fuckme",
  "fucknugget",
  "fucknut",
  "fuckoff",
  "fucks",
  "fuckstick",
  "fucktard",
  "fuckup",
  "fuckwad",
  "fuckwit",
  "fudgepacker",
  "gangbang",
  "goddamn",
  "goddamnit",
  "godsdamn",
  "gook",
  "handjob",
  "hardcore",
  "hell",
  "ho",
  "hoe",
  "homo",
  "homosexual",
  "hussy",
  "jackass",
  "jackhole",
  "jackoff",
  "jap",
  "jerk",
  "jerkoff",
  "jizz",
  "junkie",
  "kike",
  "kink",
  "labia",
  "lameass",
  "lesbian",
  "lesbo",
  "lezzie",
  "lust",
  "lmao",
  "lmfao",
  "loser",
  "lowlife",
  "maggot",
  "masochist",
  "masturbate",
  "masturbation",
  "milf",
  "moron",
  "motherfucker",
  "motherfucking",
  "muff",
  "muffdiver",
  "nazi",
  "neonazi",
  "nerd",
  "nigga",
  "nigger",
  "nutsack",
  "oral",
  "orgasm",
  "paki",
  "pecker",
  "penis",
  "piss",
  "pissed",
  "pissflaps",
  "pissin",
  "pissing",
  "pissoff",
  "playboy",
  "poop",
  "porn",
  "porno",
  "pornography",
  "prick",
  "pricktease",
  "pube",
  "puked",
  "pussy",
  "pussies",
  "queef",
  "queer",
  "rectum",
  "retard",
  "sadist",
  "satan",
  "scank",
  "schlong",
  "screw",
  "scrote",
  "scrotum",
  "sex",
  "sexual",
  "shag",
  "shit",
  "shitass",
  "shitbag",
  "shitbrains",
  "shitface",
  "shitfaced",
  "shithead",
  "shithole",
  "shithouse",
  "shiting",
  "shitings",
  "shits",
  "shitstain",
  "shitty",
  "skank",
  "slut",
  "slutbag",
  "sluts",
  "slutty",
  "smeg",
  "smegma",
  "smut",
  "snatch",
  "spic",
  "splooge",
  "tard",
  "testicle",
  "threesome",
  "tit",
  "tits",
  "titt",
  "titties",
  "titty",
  "tosser",
  "tramp",
  "transsexual",
  "twat",
  "twats",
  "twink",
  "vagina",
  "viagra",
  "vulva",
  "wank",
  "wanker",
  "whore",
  "wtf",
  "x-rated",
  "xxx",
]);

const PROFANITY_THRESHOLD = 3;

function hasAllowedTopic(query: string) {
  const normalized = query.toLowerCase();
  return TOPIC_ALLOWLIST.some((topic) => normalized.includes(topic));
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function cleanText(text: string): string {
  const withoutHtml = text.replace(/<[^>]*>/g, " ");
  const withoutAds = withoutHtml.replace(/\b(ads?|sponsored)\b/gi, " ");
  return withoutAds.replace(/\s+/g, " ").trim();
}

function applyProfanityFilter(snippet: string): { cleaned: string; hits: number } {
  const tokens = snippet.toLowerCase().split(/[^a-z0-9']+/);
  let hits = 0;
  const cleanedTokens = tokens.map((token) => {
    if (PROFANITY_LIST.has(token)) {
      hits += 1;
      return "***";
    }
    return token;
  });
  return { cleaned: cleanedTokens.join(" "), hits };
}

async function fetchSerpApiResults(query: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn("SERPAPI_KEY is not set; returning empty results.");
    return [] as Array<{ title: string; link: string; snippet?: string }>;
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Search provider error: ${response.status} ${msg}`);
  }

  const data = (await response.json()) as {
    organic_results?: Array<{ title: string; link: string; snippet?: string }>;
  };
  return data.organic_results ?? [];
}

export type SafeSearchResult = {
  title: string;
  url: string;
  snippet: string;
  domain: string;
};

export async function performSafeSearch(query: string): Promise<SafeSearchResult[]> {
  if (!query || !hasAllowedTopic(query)) {
    return [];
  }

  const rawResults = await fetchSerpApiResults(query);

  const filtered: SafeSearchResult[] = [];

  for (const result of rawResults) {
    const url = result.link ?? "";
    const domain = extractDomain(url);
    if (!domain) continue;
    if (!ALLOWED_DOMAINS.includes(domain)) continue;
    if (BLOCKED_DOMAINS.includes(domain)) continue;

    const cleanedSnippet = cleanText(result.snippet ?? "");
    const { cleaned, hits } = applyProfanityFilter(cleanedSnippet);
    if (hits > PROFANITY_THRESHOLD) continue;

    filtered.push({
      title: cleanText(result.title ?? ""),
      url,
      snippet: cleaned,
      domain,
    });
  }

  return filtered;
}

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query?: string };
    if (!query) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const results = await performSafeSearch(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search route error", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
