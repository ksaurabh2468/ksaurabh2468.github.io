---
title: "Expiry day breaks assumptions your code didn't know it was making"
date: 2026-08-12
categories: [trading, options]
read_time: "7 min read"
excerpt: "Most automated options strategies work fine for twenty-odd sessions a month. Then expiry arrives and every quiet assumption about liquidity, decay and settlement gets tested at once."
---

An index options system that runs cleanly for weeks can still have a bad Thursday. Not
because the strategy is wrong, but because expiry day violates a handful of assumptions the
code never stated out loud.

These are the ones I've seen bite hardest.

## 1. "Premium decays smoothly"

Time decay is smooth in the textbook and distinctly not smooth in the last few hours of an
index option's life. An at-the-money straddle that behaved predictably all week can lose most
of its remaining value in a stretch where the underlying barely moves.

Any logic that sizes, trails, or exits based on a *percentage* of premium inherits that
non-linearity. A trailing stop set at "30% of entry premium" means something completely
different at 10:00 than at 14:45, because the denominator is collapsing underneath it. If the
rule is expressed in premium terms, it needs to know what time it is.

## 2. "The strike I want will be tradeable"

Strike selection logic usually assumes the chain is a continuous, liquid surface. Near expiry
it isn't. Spreads on strikes a little way out widen; some barely trade at all.

The dangerous version of this is a hedge leg. If the system opens a primary position assuming
it can immediately protect it with a strike that turns out to be untradeable at any sensible
price, you now hold a naked leg you never intended — created by an assumption, not a decision.

> Any strategy that depends on a second leg needs to treat "I couldn't get the hedge" as a
> first-class outcome with defined behaviour — not as an exception that bubbles up somewhere.

## 3. "Moneyness changes slowly"

On a normal day, the ATM strike is a fairly stable notion. On expiry day, a modest index move
walks through several strikes, and the option you were treating as at-the-money is now
meaningfully in or out.

Systems that recompute "ATM" on a schedule — every minute, every five minutes — can be acting
on a definition that's already wrong. Systems that latch it at entry and never revisit it can
be managing a position they've mentally mislabelled for hours. Neither is automatically wrong;
what's wrong is not having decided which one you meant.

## 4. "I'll exit before settlement matters"

Intent is not a mechanism. If a position is open into the close on expiry, settlement is
no longer a thing you're avoiding — it's a thing that's happening to you, on the exchange's
rules and timetable rather than yours.

That needs to be explicit and time-driven: a hard square-off deadline enforced by the system,
early enough that a failed exit attempt still leaves room for a second. "The strategy normally
closes by then" is not a deadline. A clock that fires and squares off is.

## 5. "Today is like the other days"

The most useful thing you can do is stop treating expiry as a normal session with more
volatility. It's a different regime with different liquidity, different decay behaviour, and a
hard terminal boundary.

Concretely, that tends to mean:

1. **Make the session type an input.** The engine should know whether today is an expiry, and
   for which instrument — weekly and monthly land differently, and with multiple indices on
   different days, "is today expiry?" is per-instrument, not global.
2. **Parameterise by time-to-expiry, not by constants.** Thresholds that are sensible on
   Monday are often nonsense on Thursday afternoon.
3. **Test the last hour specifically.** Replay the closing stretch of many expiries as its own
   test suite. It's a small fraction of your data and a large fraction of your risk.
4. **Enforce the deadline in code.** With a real square-off time, retries, and an escalation if
   the exit doesn't confirm.

None of this is exotic. It's just the difference between a system that works on the twenty
ordinary days and one you can also leave running on the day that isn't.

---

*Automating index F&O and working through this class of problem? I'd be glad to compare
notes — [get in touch](mailto:ksaurabh2468@gmail.com).*
