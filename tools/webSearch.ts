export const webSearchTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "web_search",
      description:
        "Perform a lightweight web search to gather relevant references for robotics topics, libraries, or datasheets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query or keywords" },
          limit: { type: "number", description: "Number of results to return" },
        },
        required: ["query"],
      },
    },
  },
  handler: async (args: Record<string, unknown>) => {
    const query = typeof args.query === "string" ? args.query : "";
    const limit = typeof args.limit === "number" ? args.limit : 3;
    const stubbedResults = Array.from({ length: limit }).map((_, idx) => ({
      title: `Result ${idx + 1} for ${query}`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}&n=${idx + 1}`,
      snippet: "Stubbed search result. Replace with real search integration.",
    }));
    return { query, results: stubbedResults };
  },
};

export type WebSearchTool = typeof webSearchTool;
