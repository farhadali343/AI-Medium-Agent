import { ai } from "@/lib/gemini";

export type AIProvider = "gemini" | "deepseek" | "deepseek_r1" | "openai" | "custom";

export interface AIProviderConfig {
  provider: AIProvider;
  customApiKey?: string;
  customBaseUrl?: string;
  customModel?: string;
}

export interface AIModelCallResult {
  rawText: string;
  groundingChunks: Array<{ title?: string; uri?: string }>;
  searchQueries?: string[];
  searchAttempted: boolean;
  searchSuccessful: boolean;
}

export async function callAIModel({
  systemPrompt,
  userPrompt,
  config,
  topic,
}: {
  systemPrompt: string;
  userPrompt: string;
  config?: AIProviderConfig;
  topic?: string;
}): Promise<AIModelCallResult> {
  const provider = config?.provider || "gemini";
  let groundingChunks: Array<{ title?: string; uri?: string }> = [];
  let searchAttempted = true;
  let searchSuccessful = false;
  let searchQueries: string[] = [];

  // 1. Google Gemini (Default - with Native Google Search Grounding)
  if (provider === "gemini") {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = response.text || "";

      // Extract search grounding metadata
      const candidate = response.candidates?.[0];
      const candidateAny = candidate as unknown as {
        groundingMetadata?: {
          groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
          webSearchQueries?: string[];
        };
      };

      if (candidateAny?.groundingMetadata?.groundingChunks) {
        for (const chunk of candidateAny.groundingMetadata.groundingChunks) {
          if (chunk.web?.uri) {
            groundingChunks.push({
              title: chunk.web.title || "Web Source",
              uri: chunk.web.uri,
            });
          }
        }
      }

      if (candidateAny?.groundingMetadata?.webSearchQueries) {
        searchQueries = candidateAny.groundingMetadata.webSearchQueries;
      }

      if (groundingChunks.length > 0) {
        searchSuccessful = true;
      }

      return {
        rawText,
        groundingChunks,
        searchQueries,
        searchAttempted,
        searchSuccessful,
      };
    } catch (geminiError) {
      console.warn("Gemini call with search tools failed, attempting fallback:", geminiError);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
          ],
        });
        return {
          rawText: fallbackResponse.text || "",
          groundingChunks: [],
          searchQueries: [],
          searchAttempted: true,
          searchSuccessful: false,
        };
      } catch (fallbackError) {
        throw new Error(
          fallbackError instanceof Error
            ? fallbackError.message
            : "Failed to generate content with Gemini."
        );
      }
    }
  }

  // 2. Pre-search Grounding Pass for External Providers (DeepSeek, OpenAI, BYOK)
  // Ensures external models also receive live real-world sources and Reddit discussion URLs
  let searchDossierContext = "";
  if (topic) {
    try {
      const researchResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Perform live web and Reddit research for the topic: "${topic}". Identify 5-10 real authoritative primary sources, recent benchmark studies (last 12 months), official documentation, and relevant Reddit forum discussions (r/technology, r/startups, r/productivity, r/programming or other relevant subreddits). Provide real URLs, key data points, and community consensus notes.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const cand = researchResponse.candidates?.[0];
      const candAny = cand as unknown as {
        groundingMetadata?: {
          groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
          webSearchQueries?: string[];
        };
      };

      if (candAny?.groundingMetadata?.groundingChunks) {
        for (const chunk of candAny.groundingMetadata.groundingChunks) {
          if (chunk.web?.uri) {
            groundingChunks.push({
              title: chunk.web.title || "Verified Web Source",
              uri: chunk.web.uri,
            });
          }
        }
      }

      if (candAny?.groundingMetadata?.webSearchQueries) {
        searchQueries = candAny.groundingMetadata.webSearchQueries;
      }

      if (groundingChunks.length > 0) {
        searchSuccessful = true;
      }

      if (researchResponse.text) {
        searchDossierContext = `\n\n--- REAL-TIME SEARCH GROUNDING DOSSIER (LIVE WEB & REDDIT FINDINGS) ---\n${researchResponse.text}\n\nVERIFIED CITATION URLS:\n${groundingChunks.map(g => `- ${g.title}: ${g.uri}`).join("\n")}\n--- END RESEARCH DOSSIER ---`;
      }
    } catch (preSearchErr) {
      console.warn("Live search grounding discovery pass failed:", preSearchErr);
    }
  }

  const enrichedUserPrompt = searchDossierContext
    ? `${userPrompt}\n\n${searchDossierContext}`
    : userPrompt;

  // 3. DeepSeek AI (Official API)
  if (provider === "deepseek" || provider === "deepseek_r1") {
    const apiKey = config?.customApiKey?.trim() || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DeepSeek API key is not configured. Please enter a valid API key or switch to Gemini.");
    }

    const modelName =
      config?.customModel ||
      (provider === "deepseek_r1" ? "deepseek-reasoner" : "deepseek-chat");

    const endpoint = "https://api.deepseek.com/chat/completions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enrichedUserPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: provider === "deepseek_r1" ? undefined : 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errBody.slice(0, 300)}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    return {
      rawText,
      groundingChunks,
      searchQueries,
      searchAttempted,
      searchSuccessful,
    };
  }

  // 4. OpenAI / Custom OpenAI-compatible endpoint
  if (provider === "openai" || provider === "custom") {
    const apiKey = config?.customApiKey?.trim() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing for OpenAI / Custom provider. Please enter your key or switch to Gemini.");
    }

    const baseUrl = config?.customBaseUrl?.trim() || "https://api.openai.com/v1";
    const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const modelName = config?.customModel || (provider === "openai" ? "gpt-4o" : "gpt-4o-mini");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enrichedUserPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Provider API error (${response.status}): ${errBody.slice(0, 300)}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    return {
      rawText,
      groundingChunks,
      searchQueries,
      searchAttempted,
      searchSuccessful,
    };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}
