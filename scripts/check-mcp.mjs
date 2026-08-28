import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";

const port = "31337";
const serverName = `llm-cliche-check-${process.pid}`;
const serverUrl = `http://127.0.0.1:${port}/mcp`;
let serverOutput = "";

const server = spawn("npx", ["--no-install", "mcp-use", "start"], {
  detached: true,
  env: { ...process.env, PORT: port },
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => {
  serverOutput += chunk;
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk;
});

function client(...args) {
  return execFileSync("npx", ["--no-install", "mcp-use", "client", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before becoming ready.\n${serverOutput}`);
    }

    if (serverOutput.includes(`http://localhost:${port}/mcp`)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Server did not become ready within 30 seconds.\n${serverOutput}`);
}

try {
  await waitForServer();
  client("connect", serverName, serverUrl);

  const tools = JSON.parse(client(serverName, "tools", "list", "--json"));
  assert.deepEqual(
    tools.map((tool) => tool.name),
    ["highlight-llm-cliches"],
  );

  const result = JSON.parse(
    client(
      serverName,
      "tools",
      "call",
      "highlight-llm-cliches",
      JSON.stringify({ text: "It is important to note that the rollout happened in stages." }),
      "--json",
    ),
  );

  assert.equal(result.structuredContent.warningCount, 1);
  assert.equal(result.structuredContent.warnings[0].patternId, "note-that");
  console.log("MCP protocol check passed: one tool listed and one warning returned.");
} finally {
  try {
    client("remove", serverName);
  } catch {
    // The connection may not have been saved if setup failed early.
  }

  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}
