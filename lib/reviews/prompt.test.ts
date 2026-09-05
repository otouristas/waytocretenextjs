import test from "node:test";
import assert from "node:assert/strict";
import { formatReviewDate, reviewPrompt } from "./prompt.ts";

const base = {
  name: "Anna",
  date: "2026-09-10",
  experience: "Imbros Gorge",
  highlight: "the lunch in the village",
} as const;

test("reviewPrompt is a paste-ready first-person review", () => {
  const text = reviewPrompt({
    lang: "en",
    ...base,
    hotel: "Casa Mooma",
    host: "Nikos",
  });
  assert.equal(
    text,
    [
      "We did Imbros Gorge with Rethymno Tours on 10 September 2026. Pickup was from Casa Mooma. Nikos was our host.",
      "The lunch in the village.",
      "I'd recommend Rethymno Tours if you're staying in Crete.",
    ].join("\n\n"),
  );
  assert.doesNotMatch(text, /Experience:/);
  assert.doesNotMatch(text, /Do not paste/);
  assert.doesNotMatch(text, /Anna travelled/);
  assert.doesNotMatch(text, /5\s*star/i);
  assert.doesNotMatch(text, /⭐/);
});

test("reviewPrompt omits blank hotel and host", () => {
  const text = reviewPrompt({
    lang: "en",
    ...base,
    hotel: "  ",
    host: "",
  });
  assert.doesNotMatch(text, /Pickup was from/);
  assert.doesNotMatch(text, /was our host/);
  assert.match(text, /^We did Imbros Gorge with Rethymno Tours on 10 September 2026\.\n\n/);
});

test("reviewPrompt keeps ending punctuation on the highlight", () => {
  const text = reviewPrompt({
    lang: "en",
    ...base,
    highlight: "The gorge was quiet after the first hour!",
  });
  assert.match(text, /The gorge was quiet after the first hour!/);
  assert.doesNotMatch(text, /hour!\./);
});

test("reviewPrompt formats the date in the page language", () => {
  const text = reviewPrompt({ lang: "de", ...base, host: "Nikos" });
  assert.match(text, /Wir waren am 10\. September 2026 mit Rethymno Tours auf Imbros Gorge/);
  assert.match(text, /Nikos war unser Gastgeber/);
  assert.match(text, /The lunch in the village/);
});

test("formatReviewDate leaves a malformed value alone", () => {
  assert.equal(formatReviewDate("soon", "en"), "soon");
});
