import { MCPServer, object } from "mcp-use";
import { z } from "zod";
import { analyzeText } from "./src/analyzer.js";

const server = new MCPServer({
  name: "llm-cliche-highlighter-mcp",
  title: "LLM Cliché Highlighter",
  version: "1.0.0",
  description:
    "Flags common LLM writing clichés in supplied text using local pattern matching.",
});

server.tool(
  {
    name: "highlight-llm-cliches",
    description:
      "Check supplied text for common LLM writing clichés and return each warning with its matched phrase, containing sentence, rule, explanation, and character offsets. This is a heuristic writing aid, not proof that text was AI-generated.",
    schema: z.object({
      text: z
        .string()
        .max(250_000)
        .describe("The plain text to check for common LLM writing clichés."),
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ text }) => object({ ...analyzeText(text) }),
);

export default server;
