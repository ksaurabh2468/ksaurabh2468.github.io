---
title: "What tick replay actually proves — and what it doesn't"
date: 2026-08-08
categories: [trading, backtesting]
read_time: "7 min read"
excerpt: "A backtest is not a prediction. It's a unit test for your execution logic that happens to be written in market data — and confusing the two is how people end up trusting a number that never meant what they thought."
---

There are two completely different things people call "backtesting", and most arguments
about it are really arguments about which one is being discussed.

The first asks: *would this strategy have made money?* The second asks: *does my code do
what I believe it does?* They use the same historical data and the same engine, and they
answer questions of wildly different reliability.

I care enormously about the second one. I'm deeply sceptical of the first.

## The part replay is genuinely good at

Deterministic replay — same recorded ticks in, same decisions out, every time — is the only
practical way to answer questions like:

- When the underlying gapped through my stop between two ticks, did I exit where I think I did?
- When both legs of a hedge filled in the same instant, did my position tracker end up correct?
- When a re-entry triggered on the same tick as a square-off, which one won?
- When the strike I wanted didn't exist in the chain, what did the system do instead?

These are **engineering questions with correct answers.** Replay gives you a repeatable,
inspectable verdict on each one. That's not a forecast; it's a test. And it catches the
class of bug that quietly corrupts a live position while every dashboard stays green.

> Replay doesn't tell you whether a strategy is good. It tells you whether the thing you
> built is the thing you described. Those are both worth knowing, but only one of them
> is knowable.

## The part where the numbers start lying

The moment you turn replay output into a performance expectation, several assumptions
smuggle themselves in:

1. **Your fills were free.** Historical data tells you a price existed, not that *you*
   would have got it, in your size, at that moment. Options books away from the money are
   thin in exactly the conditions your strategy finds interesting.
2. **You didn't move anything.** Replay assumes the market would have ignored your order.
   Sometimes fair, sometimes very much not.
3. **Nothing was missing.** Gaps, bad prints, and adjustment artefacts in the raw feed
   quietly become "the market" unless you've explicitly hunted for them.
4. **You'd have made every decision the same way.** The strategy was almost certainly
   shaped — consciously or not — by knowing what those years did. That's not a bug in the
   engine; it's a bug in the epistemics.

None of this makes replay useless. It makes replay a **lower bound on your understanding**
rather than an estimate of your future.

## Every state, not just the ones that happened

Here's the trap that gets even careful people. A strategy with a dozen internal states will
visit maybe five of them in any given month of real data. Run a year of replay and you might
still never construct the case where a hedge leg is rejected while a re-entry is pending.

So "I replayed two years and it was fine" means less than it sounds like. It means the paths
the market happened to walk were fine.

The complement to replay is **deliberately constructed state**: synthetic sequences built to
force the ugly combinations, boundaries, and orderings that history didn't hand you. Fake
the rejection. Fake the duplicate fill. Fake the tick that arrives out of order. Assert on
what the system does.

Real data tells you what happened. Constructed data tells you what *can* happen. You need both,
and only one of them is under your control.

## The reporting discipline that follows

If replay is a test rather than a forecast, then its output should look like test output:

- Which requirements are covered, and which aren't.
- Which states were exercised, and which were never reached.
- What the engine did at each interesting decision point, inspectable after the fact.

That's a very different artefact from a single summary statistic, and it's a far more useful
one when you're deciding whether to put real money behind it. "It works" isn't a
deliverable. A record of exactly what was checked is.

---

*If you're building or validating an execution system and want a second set of eyes on the
methodology, [get in touch](mailto:ksaurabh2468@gmail.com).*
