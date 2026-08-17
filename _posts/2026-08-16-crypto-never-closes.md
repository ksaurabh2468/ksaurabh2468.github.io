---
title: "Crypto never closes, and your system was built around a bell"
date: 2026-08-16
categories: [trading, crypto, engineering]
read_time: "6 min read"
excerpt: "Porting an execution engine from index F&O to crypto derivatives isn't mostly about the instruments. It's about discovering how many things in your code quietly depended on the market being shut."
---

The first time you point an equities-shaped execution engine at a perpetual futures market,
the strategy logic usually ports fine. What breaks is everything that assumed the day ends.

A 9:15–3:30 session gives you something you never asked for and immediately came to depend on:
a guaranteed window where nothing is happening. That window is where most systems quietly do
their housekeeping.

## What the closing bell was silently doing for you

- **Reconciliation.** Comparing your view of positions against the broker's is easy when both
  sides are frozen. There is no frozen moment in a 24×7 market.
- **Deploys and restarts.** "We'll ship after close" isn't available. Every restart is now a
  restart mid-session, with open positions.
- **Daily boundaries.** P&L windows, trade counters, loss caps, "max trades per day" — all of
  these assumed an obvious place to reset. Now you have to *choose* one, and defend it.
- **State cleanup.** Anything that relied on starting each morning from a clean slate now runs
  for weeks, which is also how you find your slow memory leak and your unbounded in-memory list.

None of these are strategy problems. They're all operational assumptions that were true by
accident.

> Moving to a market that never closes doesn't add a feature to your system. It removes a
> guarantee your system was resting on without documenting it.

## Reconciliation without a quiet moment

This is the one that requires actual rethinking rather than configuration.

With a session, you can reconcile at a point in time and trust the answer. Without one, any
snapshot you take is immediately out of date, and naive comparison produces false alarms every
time a fill lands mid-check.

What works better is treating reconciliation as continuous and **tolerant of in-flight state**:
compare against the venue constantly, but only escalate a mismatch that persists across
multiple checks and can't be explained by a known pending order. A discrepancy that resolves
itself in 300ms was a race in your observation, not a break in your position. A discrepancy
that survives ten seconds is real and needs a human.

## Funding, and other things with no equity analogue

Perpetuals don't expire, which sounds like a simplification and isn't. Instead of a terminal
settlement, you get a **recurring funding payment** — a periodic cash flow that depends on
where the perp trades relative to spot.

For an automated system that means a cost which is:

- Time-based rather than event-based, so it accrues while you're doing nothing.
- Sign-flipping, so it can pay you or charge you depending on your side.
- Entirely absent from the mental model you built around expiring options.

A strategy that holds positions across funding intervals has an economic term that simply
didn't exist in the F&O version. If your engine doesn't model it, your accounting drifts from
the venue's and you won't know which one is wrong.

## What actually ports cleanly

The encouraging part: the machinery that was hard to build transfers almost entirely. The
state machine, order manager, staleness handling, kill switch, replay harness, and audit log
don't care what the instrument is. Venue adapters and contract maths change; the safety
engineering doesn't.

Which is a decent argument for building that layer properly in the first place. The
instrument-specific parts are the parts you expect to rewrite. It's the operational
assumptions — the ones nobody wrote down because the exchange enforced them for free — that
cost you the weekend.

---

*Running strategies across both traditional and crypto venues, or thinking about the move?
[Get in touch](mailto:ksaurabh2468@gmail.com) — I'd like to hear how you're handling it.*
