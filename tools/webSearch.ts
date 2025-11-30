export const webSearchTool = {
  name: "web_search",
  description:
    "Perform a targeted web search for robotics components, datasheets, or troubleshooting guides.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search phrase to lookup." },
    },
    required: ["query"],
  },
  handler: async ({ query }: { query: string }) => {
    // Replace with real search integration. Returns a stubbed result for now.
    return {
      query,
      summary:
        "Simulated search results. Integrate a search API to retrieve live resources.",
      links: [
        "https://www.arduino.cc/en/Guide",
        "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/",
      ],
    };
  },
};

export type WebSearchResult = Awaited<
  ReturnType<typeof webSearchTool["handler"]>
>;
