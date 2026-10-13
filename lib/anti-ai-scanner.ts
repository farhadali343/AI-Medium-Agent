export const BANNED_AI_WORDS = [
  "delve",
  "unlock",
  "game-changer",
  "game changer",
  "fast-paced world",
  "testament",
  "beacon",
  "in conclusion",
  "tapestry",
  "realm",
  "spearhead",
  "revolutionize",
  "seamlessly",
  "furthermore",
  "moreover",
  "leverage",
  "vital",
  "vital role",
  "paramount",
  "in the digital age",
  "landscape",
  "navigate",
  "unleash",
  "demystify"
];

export function auditAntiAiText(text: string) {
  const detected: string[] = [];
  const lower = text.toLowerCase();

  for (const word of BANNED_AI_WORDS) {
    // Regex matching whole phrase / word
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) {
      detected.push(word);
    }
  }

  return {
    bannedWordsCount: detected.length,
    checkedWords: BANNED_AI_WORDS,
    status: (detected.length === 0 ? "pristine" : "contains_warnings") as "pristine" | "contains_warnings",
    detectedBannedWords: detected,
  };
}

export function calculateReadingStats(text: string) {
  const clean = text.replace(/[#*`_~[\]()]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  // Average adult reading speed on Medium: 225-250 wpm
  const minutes = Math.max(1, Math.ceil(words / 230));
  return {
    wordCount: words,
    readingTimeMinutes: minutes,
  };
}
