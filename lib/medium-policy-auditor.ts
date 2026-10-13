import {
  AuditCategory,
  EditorialImprovementItem,
  EditorialRiskLevel,
  MediumPolicyAudit,
  OfficialPolicyDoc,
  PolicyAuditIssue,
  PolicyEvidenceType,
  SourceItem,
  FactCheckItem,
  TitleOption,
} from "@/types/article";

/**
 * Verified Official Medium Documentation & Policies (Current Help Center & Partner Program Rules)
 */
export const OFFICIAL_MEDIUM_POLICIES: OfficialPolicyDoc[] = [
  {
    title: "Medium Partner Program Overview & Eligibility (May 1, 2024 Policy)",
    url: "https://help.medium.com/hc/en-us/articles/115011694187-Medium-Partner-Program-overview-and-eligibility",
    topic: "AI-Generated Writing & Paywall Monetization",
    excerpt: "Stories featuring fully AI-generated writing, whether disclosed or not, are prohibited from being paywalled as part of the Partner Program. Accounts with fully AI-generated stories behind the paywall risk removal from the Partner Program.",
    ruleType: "explicit_rule",
  },
  {
    title: "How to Disclose AI-Generated Content on Medium",
    url: "https://help.medium.com/hc/en-us/articles/12637024604567-How-to-disclose-AI-generated-content-on-Medium",
    topic: "AI-Assisted Writing & Early Disclosure",
    excerpt: "Any story created with AI assistance must clearly disclose this within the first two paragraphs or before any paywall cutoff. Undisclosed AI content is stripped from distribution and ineligible for Boost.",
    ruleType: "explicit_rule",
  },
  {
    title: "Medium's Quality Guidelines for Boost",
    url: "https://help.medium.com/hc/en-us/articles/14108643843607-Medium-s-Quality-Guidelines-for-Boost",
    topic: "Boost Curation, Originality & Depth",
    excerpt: "To be Boosted, a story must be constructive, original, written from relevant experience or rigorous research, and well-crafted. Derivative summaries or superficial content will not receive distribution boost.",
    ruleType: "editorial_best_practice",
  },
  {
    title: "Medium Rules: Plagiarism and Duplicate Content",
    url: "https://policy.medium.com/medium-rules-30e5502c4eb4",
    topic: "Plagiarism, Excessive Paraphrasing & Attribution",
    excerpt: "We do not allow plagiarism. Rephrasing or translating content from another source without clear attribution is considered plagiarism. Using AI to remix or reproduce existing text closely is a policy violation.",
    ruleType: "explicit_rule",
  },
  {
    title: "Medium Rules: Third-Party Advertising and Affiliate Links",
    url: "https://help.medium.com/hc/en-us/articles/213477928-Third-party-advertising-on-Medium",
    topic: "Affiliate Disclosures & Promotional Intent",
    excerpt: "You must disclose affiliate links or payments in the story. Stories written primarily to promote a service or product, or containing undisclosed affiliate links, violate our rules.",
    ruleType: "explicit_rule",
  },
  {
    title: "Medium Rules: Cryptocurrencies, High-Yield & Financial Scams",
    url: "https://policy.medium.com/medium-rules-30e5502c4eb4",
    topic: "Unsupported Financial & Health Claims",
    excerpt: "We do not allow deceptive financial schemes, guaranteed earnings promises, or unsubstantiated medical claims that could cause harm.",
    ruleType: "explicit_rule",
  },
  {
    title: "Medium Editorial Guidelines: Titles & Clickbait",
    url: "https://help.medium.com/hc/en-us/articles/14108643843607-Medium-s-Quality-Guidelines-for-Boost",
    topic: "Title Authenticity & Reader Expectations",
    excerpt: "Titles should set honest expectations and accurately reflect the content. Misleading titles, exaggerated promises, fake urgency, and sensationalism degrade reader trust and prevent Boost distribution.",
    ruleType: "editorial_best_practice",
  },
  {
    title: "Medium Rules: Copyright & Fair Use",
    url: "https://policy.medium.com/medium-rules-30e5502c4eb4",
    topic: "Copyright, Blockquotes & Image Licensing",
    excerpt: "Respect copyright and trademark laws. Extensive blockquoting without original commentary, or using uncredited images without appropriate license, violates platform policies.",
    ruleType: "explicit_rule",
  },
  {
    title: "Medium Rules: Spam, Tags & SEO Manipulation",
    url: "https://policy.medium.com/medium-rules-30e5502c4eb4",
    topic: "Tag Stuffing & Low-Value Automation",
    excerpt: "Stories packed with irrelevant tags, repetitive keywords, or published at mass scale for search engine manipulation are classified as spam and will be suspended.",
    ruleType: "explicit_rule",
  },
];

export interface AuditMediumInput {
  topic: string;
  selectedTitle: string;
  selectedSubtitle: string;
  contentMarkdown: string;
  tags: string[];
  sources: SourceItem[];
  factCheck?: FactCheckItem[];
  aiDisclosure?: string;
  titleOptions?: TitleOption[];
}

/**
 * Audits a finished article against official Medium platform rules, Partner Program policies,
 * and editorial quality standards.
 */
export function auditMediumArticlePolicy(input: AuditMediumInput): MediumPolicyAudit {
  const {
    topic,
    selectedTitle,
    selectedSubtitle,
    contentMarkdown,
    tags,
    sources,
    factCheck = [],
    aiDisclosure = "",
    titleOptions = [],
  } = input;

  const issues: PolicyAuditIssue[] = [];
  const editorialImprovements: EditorialImprovementItem[] = [];

  const lowerContent = contentMarkdown.toLowerCase();
  const lowerTitle = selectedTitle.toLowerCase();
  const lowerSubtitle = selectedSubtitle.toLowerCase();

  // 1. ORIGINALITY & MEANINGFUL READER VALUE
  const hasWorkedExample = lowerContent.includes("blueprint") || lowerContent.includes("framework") || lowerContent.includes("phase") || lowerContent.includes("step ");
  const hasDecisionTable = contentMarkdown.includes("|") && contentMarkdown.includes("---");
  if (!hasWorkedExample || !hasDecisionTable) {
    editorialImprovements.push({
      id: "improv-orig-1",
      category: "Originality & Depth",
      suggestion: "Add a concrete comparison matrix table or worked operational example with specific numbers.",
      benefit: "Elevates article above generic AI summaries, directly satisfying Medium Boost Quality criteria.",
      rationale: "Medium curators look for actionable decision frameworks and proprietary synthesis rather than regurgitated theory.",
    });
  }

  // 2. PLAGIARISM, EXCESSIVE PARAPHRASING & ATTRIBUTION
  const paragraphs = contentMarkdown.split(/\n\n+/);
  const largeBlockquotes = paragraphs.filter((p) => p.startsWith(">") && p.length > 350);
  if (largeBlockquotes.length > 0) {
    issues.push({
      id: "policy-plag-1",
      category: "plagiarism_reuse",
      categoryLabel: "Quotation Length & Derivative Reuse",
      riskSeverity: "medium",
      affectedPassage: largeBlockquotes[0].slice(0, 160) + "...",
      whyProblem: "Extensive verbatim blockquotes without proportional analytical synthesis may trigger copyright scrutiny or fair use disputes.",
      recommendedCorrection: "Condense long blockquotes to 1-2 core sentences and provide direct editorial analysis and attribution.",
      policySourceUrl: "https://policy.medium.com/medium-rules-30e5502c4eb4",
      policySupportingPassage: "Rephrasing or translating content without clear attribution is considered plagiarism. Extensive verbatim quotes without critical synthesis infringe fair use standards.",
      ruleType: "explicit_rule",
    });
  }

  // 3. AI-ASSISTED OR AI-GENERATED CONTENT DISCLOSURE REQUIREMENTS
  const firstTwoParagraphs = paragraphs.slice(0, 2).join(" ").toLowerCase();
  const hasEarlyAiDisclosure =
    firstTwoParagraphs.includes("disclosure") ||
    firstTwoParagraphs.includes("ai assistance") ||
    firstTwoParagraphs.includes("ai-assisted") ||
    firstTwoParagraphs.includes("artificial intelligence");

  const hasBottomAiDisclosure =
    lowerContent.includes("disclosure: ai") ||
    lowerContent.includes("disclosure: this article") ||
    lowerContent.includes("ai assistance was used");

  if (!hasEarlyAiDisclosure && !hasBottomAiDisclosure) {
    issues.push({
      id: "policy-ai-1",
      category: "ai_disclosure",
      categoryLabel: "AI Disclosure Requirement",
      riskSeverity: "high",
      affectedPassage: "Article text lacks explicit AI assistance disclosure.",
      whyProblem: "Medium's updated policy (May 1, 2024) mandates transparent disclosure of AI assistance. Undisclosed AI stories are stripped from distribution and ineligible for monetization.",
      recommendedCorrection: "Add a compliant disclosure statement within the opening two paragraphs or article footer.",
      policySourceUrl: "https://help.medium.com/hc/en-us/articles/12637024604567-How-to-disclose-AI-generated-content-on-Medium",
      policySupportingPassage: "Any story created with AI assistance must clearly disclose this within the first two paragraphs or before any paywall cutoff.",
      ruleType: "explicit_rule",
    });
  } else if (!hasEarlyAiDisclosure && hasBottomAiDisclosure) {
    editorialImprovements.push({
      id: "improv-ai-placement",
      category: "AI Disclosure Placement",
      suggestion: "Consider mirroring the disclosure in an italicized subtitle or within the opening two paragraphs.",
      benefit: "Meets the strictest interpretation of Medium's Partner Program early-disclosure guidelines.",
      rationale: "Help Center recommends disclosing AI assistance before the paywall break.",
    });
  }

  // 4. UNSUPPORTED FINANCIAL, HEALTH, LEGAL OR EARNINGS CLAIMS
  const riskyFinancialTerms = ["guaranteed income", "guaranteed profit", "overnight wealth", "passive income secret", "financial freedom in 30 days"];
  const foundFinancialTrap = riskyFinancialTerms.find((t) => lowerContent.includes(t) || lowerTitle.includes(t));
  if (foundFinancialTrap) {
    issues.push({
      id: "policy-fin-1",
      category: "high_impact_claims",
      categoryLabel: "Unsupported Financial Claims",
      riskSeverity: "high",
      affectedPassage: `Mentions '${foundFinancialTrap}'`,
      whyProblem: "Medium strictly prohibits deceptive financial schemes, guaranteed earning claims, and unsubstantiated promises.",
      recommendedCorrection: "Reframe as realistic empirical ranges with explicit risk factors and trade-offs.",
      policySourceUrl: "https://policy.medium.com/medium-rules-30e5502c4eb4",
      policySupportingPassage: "We do not allow deceptive financial schemes, guaranteed earnings promises, or unsubstantiated high-impact claims.",
      ruleType: "explicit_rule",
    });
  }

  // 5. MISLEADING TITLES, SENSATIONALIZED CLAIMS & CLICKBAIT
  const clickbaitPatterns = [
    /\bthis one trick\b/i,
    /\bwill shock you\b/i,
    /\bsecret that .* don't want you to know\b/i,
    /\bguaranteed\b/i,
    /\binstant\b/i,
    /\bmake \$\d+ in \d+ days\b/i,
  ];
  const titleClickbait = clickbaitPatterns.find((p) => p.test(selectedTitle) || p.test(selectedSubtitle));
  if (titleClickbait) {
    issues.push({
      id: "policy-clickbait-1",
      category: "misleading_titles",
      categoryLabel: "Sensationalized Title / Clickbait",
      riskSeverity: "high",
      affectedPassage: `Title: "${selectedTitle}"`,
      whyProblem: "Medium Quality Guidelines for Boost actively penalize hyperbole, manufactured urgency, and exaggerated promises.",
      recommendedCorrection: "Use a descriptive, practical headline that accurately sets reader expectations.",
      policySourceUrl: "https://help.medium.com/hc/en-us/articles/14108643843607-Medium-s-Quality-Guidelines-for-Boost",
      policySupportingPassage: "Titles should set honest expectations and accurately reflect the content. Misleading titles or sensationalism degrade trust.",
      ruleType: "editorial_best_practice",
    });
  }

  // 6. AFFILIATE LINKS, SPONSORSHIPS & PROMOTIONAL INTENT
  const affiliateMarkers = ["affiliate link", "amzn.to", "ref=", "aff_id", "sponsored by"];
  const foundAffiliate = affiliateMarkers.some((m) => lowerContent.includes(m));
  const hasAffiliateDisclosure = lowerContent.includes("this post contains affiliate links") || lowerContent.includes("affiliate disclosure") || lowerContent.includes("commission");
  if (foundAffiliate && !hasAffiliateDisclosure) {
    issues.push({
      id: "policy-aff-1",
      category: "affiliate_promotional",
      categoryLabel: "Affiliate Link Disclosure Missing",
      riskSeverity: "high",
      affectedPassage: "Contains affiliate tracking parameters without prominent disclosure.",
      whyProblem: "Medium rules require immediate, explicit disclosure of any financial relationship or affiliate link.",
      recommendedCorrection: "Add a clear affiliate disclosure notice before the first commercial link.",
      policySourceUrl: "https://help.medium.com/hc/en-us/articles/213477928-Third-party-advertising-on-Medium",
      policySupportingPassage: "You must disclose affiliate links or payments in the story. Undisclosed affiliate links violate our platform rules.",
      ruleType: "explicit_rule",
    });
  }

  // 7. COPYRIGHT, ATTRIBUTION & IMAGE LICENSING
  const imageMarkdownCount = (contentMarkdown.match(/!\[.*?\]\(.*?\)/g) || []).length;
  if (imageMarkdownCount > 0) {
    editorialImprovements.push({
      id: "improv-image-credit",
      category: "Image Rights & Attribution",
      suggestion: "Ensure all embedded images include an explicit caption with author name and license (e.g., Unsplash, Creative Commons).",
      benefit: "Avoids copyright takedowns under DMCA and complies with Medium image attribution guidelines.",
      rationale: "Medium policies require clear permission or licensing for all non-original graphic assets.",
    });
  }

  // 8. SPAM SEO, IRRELEVANT TAGS & MASS-PRODUCED LOW-VALUE CONTENT
  if (tags.length > 5) {
    issues.push({
      id: "policy-tags-1",
      category: "spam_seo_quality",
      categoryLabel: "Tag Limit Exceeded",
      riskSeverity: "low",
      affectedPassage: `Assigned ${tags.length} tags: [${tags.join(", ")}]`,
      whyProblem: "Medium articles support a maximum of 5 tags upon publishing. Over-tagging is filtered by the platform editor.",
      recommendedCorrection: "Select the top 5 most relevant niche tags.",
      policySourceUrl: "https://policy.medium.com/medium-rules-30e5502c4eb4",
      policySupportingPassage: "Medium supports up to 5 topic tags per story. Do not attempt tag manipulation.",
      ruleType: "explicit_rule",
    });
  }

  // 9. FABRICATED CITATIONS & CITATION VALIDITY
  const suspiciousSources = sources.filter(
    (s) => s.url.includes("example.com") || s.url.includes("localhost") || !s.url.startsWith("http")
  );
  if (suspiciousSources.length > 0) {
    issues.push({
      id: "policy-cite-1",
      category: "citations_fabrication",
      categoryLabel: "Invalid or Placeholder Citation URL",
      riskSeverity: "high",
      affectedPassage: `Placeholder source: ${suspiciousSources[0].url}`,
      whyProblem: "Fabricated citations, dead URLs, or placeholder domains degrade journalistic credibility and violate reader trust.",
      recommendedCorrection: "Replace with verified live URLs from authoritative documentation or primary research.",
      policySourceUrl: "https://policy.medium.com/medium-rules-30e5502c4eb4",
      policySupportingPassage: "We prohibit deceptive practices, fabricated sources, and falsified research claims.",
      ruleType: "explicit_rule",
    });
  }

  // Check fact check claims marked unverified or needing verification
  const unverifiedClaims = factCheck.filter((fc) => fc.status === "unverified" || fc.status === "requires_human_review");
  if (unverifiedClaims.length > 0) {
    editorialImprovements.push({
      id: "improv-unverified-claims",
      category: "Empirical Claim Verification",
      suggestion: `Review ${unverifiedClaims.length} statistical claim(s) flagged for manual verification before publication.`,
      benefit: "Prevents distribution suppression caused by unverified empirical statements.",
      rationale: "Self-reported community percentages should be qualified with observational caveats.",
    });
  }

  // 10. PARTNER PROGRAM SPECIFIC MONETIZATION CHECK
  editorialImprovements.push({
    id: "improv-partner-paywall",
    category: "Partner Program Eligibility",
    suggestion: "If placing behind the Partner Program paywall, confirm the author has added human editing, personal voice, and individual domain expertise.",
    benefit: "Guarantees complete compliance with the May 1, 2024 rule prohibiting 100% automated AI text behind paywalls.",
    rationale: "Medium strictly prohibits paywalling 100% automated AI stories without genuine human authorship.",
  });

  // Calculate Overall Risk Level
  const highSeverityCount = issues.filter((i) => i.riskSeverity === "high").length;
  const mediumSeverityCount = issues.filter((i) => i.riskSeverity === "medium").length;

  let overallRisk: EditorialRiskLevel = "low";
  if (highSeverityCount > 0) {
    overallRisk = "high";
  } else if (mediumSeverityCount > 0 || issues.length >= 2) {
    overallRisk = "moderate";
  }

  const riskSummary =
    overallRisk === "high"
      ? `High Editorial Risk: ${highSeverityCount} policy issue(s) identified that may prevent Boost nomination or violate Partner Program requirements. Resolve highlighted passages before final human review.`
      : overallRisk === "moderate"
      ? `Moderate Editorial Risk: ${issues.length} item(s) require review. Core policies are respected, but minor disclosures or formatting adjustments are recommended.`
      : "Low Editorial Risk: Article adheres to official Medium platform rules, Partner Program guidelines, and Boost quality standards. Ready for human editorial review.";

  return {
    overallRisk,
    riskSummary,
    issues,
    editorialImprovements,
    auditedAt: new Date().toISOString(),
    humanReviewReady: overallRisk !== "high",
    rulesAuditedCount: 10,
    officialDocSources: OFFICIAL_MEDIUM_POLICIES,
    disclaimer:
      "This editorial risk audit evaluates policy compliance against publicly documented Medium standards, Help Center guides, and Partner Program rules. It is not an algorithmic bypass, AI detector evasion tool, or guarantee of Medium Boost curation or Partner Program monetization.",
  };
}
