import assert from "node:assert/strict";
import test from "node:test";

import { analyzeText } from "../src/analyzer.js";

test("returns no warnings for ordinary prose", () => {
  assert.deepEqual(analyzeText("The team shipped the update on Tuesday."), {
    warningCount: 0,
    warnings: [],
  });
});

test("returns structured warnings with sentence context and offsets", () => {
  const text = "The draft was concise. It is important to note that the rollout happened in stages.";
  const result = analyzeText(text);

  assert.equal(result.warningCount, 1);
  assert.equal(result.warnings[0].patternId, "note-that");
  assert.equal(result.warnings[0].matchedText, "It is important to note that");
  assert.equal(result.warnings[0].sentence, "It is important to note that the rollout happened in stages.");
  assert.equal(text.slice(result.warnings[0].start, result.warnings[0].end), result.warnings[0].matchedText);
});

test("includes the item count for chain warnings", () => {
  const result = analyzeText("No fluff, no filler, no jargon.");

  assert.equal(result.warningCount, 1);
  assert.equal(result.warnings[0].patternId, "no-chain");
  assert.equal(result.warnings[0].itemCount, 3);
});

test("does not make network calls", () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("unexpected network call");
  };

  try {
    const result = analyzeText("As an AI language model, I cannot browse the internet.");
    assert.ok(result.warningCount >= 1);
    assert.ok(result.warnings.every((warning) => warning.patternId === "ai-leftovers"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("stays fast on a long line with no sentence punctuation", () => {
  // A CSV row, a pasted log line or a URL list carries no . ! ? or newline.
  // The sentence scanners used to run to the end of such a stretch from every
  // offset and backtrack all the way, which is quadratic in its length.
  const text = "a,".repeat(32_000);

  const started = process.hrtime.bigint();
  analyzeText(text);
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

  assert.ok(
    elapsedMs < 2000,
    `analyzeText took ${elapsedMs.toFixed(0)}ms on a ${text.length} character line`
  );
});
