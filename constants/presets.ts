export interface PresetTopic {
  title: string;
  audience: string;
  category: string;
  redditFocus: string;
}

export const PRESET_TOPICS: PresetTopic[] = [
  {
    title: "Why Most Solo SaaS Founders Quit in the First 90 Days",
    audience: "Aspiring indie hackers and solo software engineers",
    category: "Tech & Entrepreneurship",
    redditFocus: "r/SaaS, r/IndieHackers, r/entrepreneur",
  },
  {
    title: "The Honest Reality of Quitting Caffeine for 30 Days",
    audience: "Knowledge workers seeking sustained focus without afternoon crashes",
    category: "Health & Productivity",
    redditFocus: "r/decaf, r/productivity, r/biohackers",
  },
  {
    title: "Why Junior Developers Struggle with 'Clean Code' in Real Codebases",
    audience: "Early-career developers and bootcamp graduates",
    category: "Software Engineering",
    redditFocus: "r/cscareerquestions, r/programming, r/webdev",
  },
  {
    title: "What Medium Partner Program Writers Actually Earn in 2025-2026",
    audience: "Aspiring online writers seeking realistic income expectations",
    category: "Writing & Content",
    redditFocus: "r/Medium, r/freelanceWriters, r/Blogging",
  },
  {
    title: "Why Productivity Systems Break Down After Three Weeks",
    audience: "Busy professionals who keep abandoning Notion and Todoist setups",
    category: "Productivity",
    redditFocus: "r/productivity, r/Notion, r/ObsidianMD",
  },
];
