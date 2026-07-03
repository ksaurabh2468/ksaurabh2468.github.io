---
title: "Building a GenAI engine that reads quarterly reports for us"
date: 2026-06-28
categories: [ai, generative]
read_time: "6 min read"
excerpt: "Competitive intelligence is drowning in public documents nobody has time to read. Here's what worked — and what didn't — building a GenAI system to turn that firehose into decisions."
---

Every competitor you have is publishing more about themselves than any analyst can keep up
with — earnings calls, annual reports, investor decks, press releases, regulatory filings.
The information is *public*. The bottleneck is entirely human attention.

That gap is a near-perfect fit for generative AI, and it's the shape of a competitive-
intelligence engine I helped build: ingest the firehose of competitor disclosures, and
surface what changed and why it matters — financial performance, strategic moves, market
positioning — as briefings a leadership team can actually act on. Here's what the work taught
me.

## Summarization is the easy 30%

The seductive first version is "point an LLM at the PDF, ask for a summary." It demos
beautifully and it's nearly useless, for two reasons.

First, a summary of one document in isolation answers the wrong question. Executives don't
ask *"what does this report say?"* — they ask *"what's **different** from last quarter, and
what does it imply about what they'll do next?"* That's a comparison across time and across
competitors, not a compression of a single file.

Second, a fluent summary is indistinguishable from a fluent hallucination. When the output
feeds a strategic decision, "sounds right" is not a standard you can ship.

## What actually moved the needle

Three design choices did most of the real work:

1. **Structured extraction before generation.** Instead of asking for prose, we first pulled
   specific, typed facts — reported revenue, guidance changes, named initiatives, leadership
   quotes — into a schema. Comparison and trend detection then run on *structured data*, and
   the model's freedom to invent drops sharply.
2. **Every claim carries a citation.** No assertion reaches a human without a pointer back to
   the source sentence. This is the single feature that earned the system trust — an analyst
   can verify in one click instead of taking the model's word.
3. **Change detection as a first-class step.** The engine's job isn't "describe competitor
   X." It's "tell me what X said this quarter that they didn't say last quarter." Diffing
   structured facts across periods is where the genuinely useful signals surfaced.

> The output that changes a decision isn't a summary. It's a *delta* — with a receipt.

## The failure modes I now design around

- **Confident nonsense on numbers.** Language models are unreliable arithmeticians. Financial
  figures get *extracted and validated*, never "reasoned about." The model routes to the
  data; it doesn't do the math in its head.
- **Recency blindness.** Without explicit dating, the model happily blends a fact from 2023
  with one from this quarter. Timestamps are load-bearing, not metadata.
- **The plausibility trap.** The scariest errors aren't the obviously wrong ones — they're
  the plausible ones that sail past review. Citations are the antidote: make verification
  cheaper than trust.

## The reframe that made it work

We stopped trying to build "an AI that understands our competitors" and started building
"an AI that never misses a disclosure and always shows its work." The first is a research
project. The second is a tool a strategy team opens every morning — and that difference is
the whole game.

---

*If you're building in the competitive-intelligence or document-understanding space, I'd
love to compare approaches — [drop me a line](mailto:ksaurabh2468@gmail.com).*
