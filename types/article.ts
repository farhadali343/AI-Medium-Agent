export interface AngleAnalysis {
  intentAnalysis: string;
  readerPriorKnowledge?: string;
  commonGapsInExistingArticles?: string;
  articleUniqueValue?: string;
  honestAngle: string;
  readerPromise?: string;
  debunkedClickbait: string[];
  redditConsensus: string;
}

export type PrePublicationStageId =
  | 'topic_audience'
  | 'research_completed'
  | 'community_insights'
  | 'draft_generated'
  | 'claims_checked'
  | 'editorial_review'
  | 'policy_audit'
  | 'human_approval';

export type PrePublicationStageStatus =
  | 'completed'
  | 'partial'
  | 'failed'
  | 'not_attempted';

export interface PrePublicationStageInfo {
  id: PrePublicationStageId;
  stageNumber: number;
  label: string;
  status: PrePublicationStageStatus;
  statusSummary: string;
  detail: string;
  targetTab: 'angle' | 'article' | 'editorial' | 'community' | 'tags_sources' | 'factcheck' | 'disclosure' | 'policy_audit';
  actionLabel?: string;
  hasRetry?: boolean;
}

export interface TitleOption {
  id: string;
  type: 'practical' | 'curiosity' | 'search_friendly' | string;
  typeLabel: string;
  title: string;
  subtitle: string;
  seoKeywords: string[];
}

export type ClaimVerificationStatus =
  | 'verified'
  | 'partially_supported'
  | 'contradicted'
  | 'unverified'
  | 'outdated'
  | 'opinion_recommendation';

export type ClaimTypeCategory =
  | 'statistic_numerical'
  | 'date_timeline'
  | 'policy_official_requirement'
  | 'quotation'
  | 'author_recommendation'
  | 'community_anecdote'
  | 'empirical_estimate'
  | 'factual_statement';

export interface FactCheckItem {
  id: string;
  claim: string;
  claimType: ClaimTypeCategory;
  claimTypeLabel?: string;
  articleLocation: string; // Exact location in article (e.g. section title, paragraph reference)
  sourceUrl: string;
  sourceName: string;
  sourcePassage: string; // Specific supporting passage or excerpt from the source
  verificationDate?: string; // Date when actually available
  status: ClaimVerificationStatus | 'verified_primary' | 'verified_secondary' | 'qualified_estimate' | 'requires_human_review' | 'verified' | 'empirical_range' | 'policy_safe';
  statusExplanation: string; // Why it is verified, partially supported, contradicted, etc.
  suggestedCorrection?: string; // Actionable suggestion if unverified, outdated, or disputed
  
  // Advanced verification dimensions
  isPrimarySource?: boolean; // Platform policies, regulations, original studies
  isContradiction?: boolean; // Detects conflicting evidence between sources
  contradictionDetails?: string; // Description of unresolved dispute
  isAbsoluteOrSuperlative?: boolean; // Superlatives or absolute claims
  conditionsOrExceptions?: string; // Scope, geography, sample bounds
  isTopFivePriority?: boolean; // Display in main top-5 dashboard view

  // User review workflow before "Ready for Human Review"
  userReviewStatus?: 'pending' | 'accepted' | 'edited' | 'dismissed';
  userEditedText?: string;
  userReviewNote?: string;
}

export interface ClaimVerificationSummary {
  totalAudited: number;
  verifiedCount: number;
  partiallySupportedCount: number;
  contradictedCount: number;
  unverifiedCount: number;
  outdatedCount: number;
  opinionCount: number;
  unresolvedUnsupportedCount: number;
  prePublicationWarningActive: boolean;
  allMaterialClaimsReviewed: boolean;
  auditDisclaimer: string;
}

export interface UncertainClaimItem {
  claim: string;
  uncertaintyReason: string;
  suggestedAction: string;
}

export interface SourceItem {
  title: string;
  publisher?: string;
  url: string;
  domain: string;
  publicationDate?: string;
  type: 'primary_official' | 'original_study' | 'regulatory_doc' | 'reputable_secondary' | 'reddit_discussion' | 'web_benchmark';
  supportedClaim?: string;
  keyTakeaway: string;
  verificationConfidence?: 'confirmed_primary' | 'reputable_secondary' | 'community_anecdote' | 'estimate_qualified';
}

export interface ResearchStatus {
  webSearchAttempted: boolean;
  webSearchSuccessful: boolean;
  sourcesCount: number;
  primarySourcesCount: number;
  redditSearched: boolean;
  redditSuccessful: boolean;
  auditLabel: string;
  researchDisclaimer?: string;
}

export interface AntiAiScore {
  bannedWordsCount: number;
  checkedWords: string[];
  status: 'pristine' | 'contains_warnings';
  detectedBannedWords: string[];
}

export interface Folder {
  id: string;
  userId?: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ArticleDraft {
  id: string;
  userId?: string;
  topic: string;
  audience: string;
  selectedTitle: string;
  selectedSubtitle: string;
  titleOptions: TitleOption[];
  angle: AngleAnalysis;
  contentMarkdown: string;
  tags: string[];
  sources: SourceItem[];
  factCheck: FactCheckItem[];
  uncertainClaims?: UncertainClaimItem[];
  researchStatus?: ResearchStatus;
  aiDisclosure: string;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt?: string;
  isFavorite?: boolean;
  folderId?: string;
  antiAiScore: AntiAiScore;
  policyAudit?: MediumPolicyAudit;
  redditResearch?: RedditResearchModule;
  claimVerificationSummary?: ClaimVerificationSummary;
  editorialReviewReport?: EditorialReviewEngineReport;
  versionHistory?: ArticleVersionItem[];
  originalContentMarkdown?: string;
  humanReviewStatus?: "pending_audit" | "requires_claim_review" | "ready_for_review" | "approved_by_human";
  humanReviewApprovedAt?: string;
  humanReviewNotes?: string;
  redditSubreddits?: string[];
  focusKeywords?: string;
  tone?: string;
  audienceKnowledgeLevel?: "beginner" | "intermediate" | "advanced";
  audienceInterests?: string;
}

export type EditorialToneStyle =
  | "conversational_practical"
  | "analytical"
  | "first_person_essay"
  | "technical_explainer";

export type EditorialCriterion =
  | "specificity_depth"
  | "original_analysis"
  | "clarity_readability"
  | "sentence_paragraph_variation"
  | "repetition_filler"
  | "evidence_attribution"
  | "practical_usefulness"
  | "logical_flow_transitions"
  | "balance_nuance_limitations"
  | "title_opening_strength"
  | "conclusion_value_add";

export interface EditorialSuggestionItem {
  id: string;
  criterion: EditorialCriterion;
  criterionLabel: string;
  severity: "high" | "medium" | "low";
  targetPassage: string; // Exact sentence or paragraph in article
  problemExplanation: string; // Detailed diagnosis of the writing issue
  suggestedImprovement: string; // Actionable, concrete proposed rewrite
  status: "pending" | "accepted" | "dismissed";
  acceptedAt?: string;
  appliedContentDiff?: {
    originalText: string;
    newText: string;
  };
}

export interface EditorialTopPriorityItem {
  rank: 1 | 2 | 3;
  area: string;
  diagnosis: string;
  recommendedAction: string;
  editorialImpact: string;
}

export interface EditorialCriterionEvaluation {
  rating: "strong" | "adequate" | "needs_work";
  feedback: string;
  scoreNumber?: number; // 1-10 reference
}

export interface EditorialReviewEngineReport {
  reviewedAt: string;
  toneSelected: EditorialToneStyle;
  overallEditorialAssessment: string;
  scorecard: {
    [key in EditorialCriterion]?: EditorialCriterionEvaluation;
  };
  topThreePriorities: EditorialTopPriorityItem[];
  suggestions: EditorialSuggestionItem[];
  userSuppliedExperiences?: string;
}

export interface ArticleVersionItem {
  versionId: string;
  timestamp: string;
  label: string;
  contentMarkdown: string;
  selectedTitle: string;
  selectedSubtitle: string;
  changeSummary: string;
  wordCount: number;
}

export type EditorialRiskLevel = "low" | "moderate" | "high";
export type PolicyEvidenceType = "explicit_rule" | "editorial_best_practice" | "uncertain_interpretation" | "needs_manual_verification";

export type AuditCategory =
  | "originality_value"
  | "plagiarism_reuse"
  | "ai_disclosure"
  | "high_impact_claims"
  | "misleading_titles"
  | "affiliate_promotional"
  | "copyright_licensing"
  | "spam_seo_quality"
  | "citations_fabrication"
  | "partner_program_rules";

export interface PolicyAuditIssue {
  id: string;
  category: AuditCategory;
  categoryLabel: string;
  riskSeverity: "high" | "medium" | "low";
  affectedPassage: string;
  whyProblem: string;
  recommendedCorrection: string;
  policySourceUrl: string;
  policySupportingPassage: string;
  ruleType: PolicyEvidenceType;
}

export interface EditorialImprovementItem {
  id: string;
  category: string;
  suggestion: string;
  benefit: string;
  rationale: string;
}

export interface OfficialPolicyDoc {
  title: string;
  url: string;
  topic: string;
  excerpt: string;
  ruleType: PolicyEvidenceType;
}

export interface MediumPolicyAudit {
  overallRisk: EditorialRiskLevel;
  riskSummary: string;
  issues: PolicyAuditIssue[];
  editorialImprovements: EditorialImprovementItem[];
  auditedAt: string;
  humanReviewReady: boolean;
  humanReviewApproved?: boolean;
  humanReviewApprovedAt?: string;
  humanReviewNotes?: string;
  rulesAuditedCount: number;
  officialDocSources: OfficialPolicyDoc[];
  disclaimer: string;
}

export type CommunityAccessStatus =
  | "live_search_success"
  | "direct_api_blocked_fallback_search"
  | "direct_api_success"
  | "rate_limited"
  | "unavailable";

export interface RedditDiscussionItem {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  date?: string;
  authorOrSnippet?: string;
  summary: string;
  evidenceType: "individual_anecdote" | "repeated_pattern" | "community_disagreement" | "practical_worked_example";
  relevantProblemOrQuestion?: string;
  verificationNeeded?: string;
  usedInArticle: boolean;
  usedInArticleContext?: string;
}

export interface CommunityInsightItem {
  id: string;
  category: "beginner_questions" | "reported_mistakes" | "unresolved_problems" | "community_disagreements" | "real_world_examples";
  categoryLabel: string;
  coreInsight: string;
  communitySentiment: string;
  evidenceStrength: "anecdotal_single" | "moderate_multiple" | "widespread_pattern";
  sourceDiscussionUrls: string[];
  sampleLimitationNote: string;
  conflictsWithOfficialDocs?: string;
  usedInArticle: boolean;
  editorialApplication: string;
}

export interface RedditClaimVerification {
  communityClaim: string;
  sourceUrl: string;
  reasonVerificationNeeded: string;
  status: "verified_against_docs" | "unverified_anecdote" | "empirical_estimate";
}

export interface RedditEditorialAnswers {
  whatReadersStruggleWith: string;
  confusingOrIncompleteAdvice: string;
  practicalDetailsToAdd: string;
  beliefsNeedingVerification: string;
  conflictsWithDocumentation: string;
}

export interface RedditResearchModule {
  status: CommunityAccessStatus;
  statusMessage: string;
  directApiAttempted: boolean;
  directApiHttpCode?: number | string;
  searchMethod: "google_search_grounding_reddit" | "direct_reddit_json" | "hybrid";
  queriesExecuted: string[];
  subredditsSearched: string[];
  totalDiscussionsReviewed: number;
  sampleLimitations: string;
  researchSummary: string;
  discussions: RedditDiscussionItem[];
  keyInsights: CommunityInsightItem[];
  recurringBeginnerQuestions: string[];
  reportedMistakes: string[];
  unresolvedProblems: string[];
  claimsRequiringVerification: RedditClaimVerification[];
  editorialAnswers: RedditEditorialAnswers;
}

export interface GenerateArticleRequest {
  topic: string;
  audience?: string;
  tone?: string;
  redditFocus?: string;
  focusKeywords?: string;
  audienceKnowledgeLevel?: "beginner" | "intermediate" | "advanced";
  audienceInterests?: string;
  providerConfig?: any;
}

export interface GenerateArticleResponse {
  success: boolean;
  draft?: ArticleDraft;
  error?: string;
}

export interface RephraseRequest {
  text: string;
  style: "conversational" | "punchy" | "humorous" | "authoritative" | "reddit_candid";
  topic?: string;
}

export interface RephraseResponse {
  success: boolean;
  rephrased?: string;
  variations?: string[];
  error?: string;
}

export interface RegenerateSectionRequest {
  sectionTitle: string;
  currentContent: string;
  articleTopic: string;
  promptInstruction: string;
  tone?: string;
}

export interface RegenerateSectionResponse {
  success: boolean;
  regeneratedMarkdown?: string;
  error?: string;
}
