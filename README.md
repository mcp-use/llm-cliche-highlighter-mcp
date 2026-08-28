# LLM Cliché Highlighter MCP Server

One MCP tool that checks supplied text for common LLM writing clichés using the
client-side pattern engine from Simon Willison's
[LLM cliché highlighter](https://tools.simonwillison.net/llm-cliche-highlighter).
It does not fetch URLs or call any backend service.

## Tool

`highlight-llm-cliches`

- Input: `text` (plain text, up to 250,000 characters)
- Output: warnings with the matched phrase, containing sentence, rule,
  explanation, character offsets, and chain item count where relevant

The warnings are heuristic writing feedback, not proof that text was
AI-generated.

## Live server

Connect an MCP client to:

```text
https://llm-cliche-highlighter.run.mcp-use.com/mcp
```

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/mcp/inspector](http://localhost:3000/mcp/inspector) with your browser to test your server.

Run `npm run typecheck` to refresh MCP view types and check the project with its local TypeScript compiler.

Run the automated checks with:

```bash
npm test
npm run typecheck
npm run build
```

## Deploy on Manufact Cloud

```bash
npm run deploy
```
