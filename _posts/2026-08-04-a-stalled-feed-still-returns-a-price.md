---
title: "A stalled feed still returns a price"
date: 2026-08-04
categories: [trading, engineering]
read_time: "6 min read"
excerpt: "The most expensive bug in an automated trading system isn't a crash. It's a number that looks perfectly reasonable and hasn't been true for four minutes."
---

Ask someone to list the failure modes of a trading system and you'll hear about outages:
the socket drops, the API 500s, the process dies. Those are the *easy* ones. They announce
themselves, and any competent engineer handles them.

The failure that actually costs money is quieter. Your feed is connected. Your last-price
variable holds `24,512.40`. Nothing has thrown. And that number stopped being true four
minutes ago.

## Why "connected" isn't "current"

A market data connection has more states than up and down:

- The socket is open, the heartbeat is fine, but the **data** stopped arriving.
- Ticks arrive for the index and stall for the option chain you're actually trading.
- The provider silently reconnects you to a stale snapshot after a blip.
- You're being throttled and receiving one update every few seconds instead of every few
  milliseconds — technically live, practically useless for a strategy that reacts to moves.

In every one of those cases, `self.last_price` returns a float. It has no idea it's lying.
Neither does the strategy that reads it, sizes a position off it, and fires an order.

> A crash costs you an opportunity. Stale data costs you capital. Systems that treat
> those as the same class of problem are optimising for the wrong one.

## Freshness is a property of the data, not the connection

The fix isn't clever, it's structural: **no price exists in the system without a timestamp
attached, and nothing reads a price without asserting on its age.**

In practice that means:

1. **Stamp on arrival.** Every tick carries the time *you received it*, not just the time
   the exchange claims it happened. Clock skew between you and a venue is real, and you
   need both numbers to diagnose anything.
2. **Make staleness a first-class state.** Not `None`, not a stale float — an explicit
   `STALE` that callers must handle. If a strategy can accidentally use a stale price, it
   eventually will.
3. **Set the threshold per instrument, not globally.** An index that prints continuously
   and a deep out-of-the-money strike that trades twice an hour need different definitions
   of "too old". A single global timeout either fires constantly on the illiquid leg or
   never fires on the liquid one.
4. **Halt loudly.** When data goes stale mid-position, the system should stop initiating
   and escalate — not quietly carry on with its last known value.

That last point is where the design decision actually bites, because halting isn't free.

## The asymmetry that decides the default

If your system halts when it shouldn't have, you miss a trade. Annoying, measurable,
recoverable.

If your system trades on data that's four minutes old, you can take a position based on a
market that no longer exists — and on an expiry afternoon, four minutes is an entirely
different market. The loss isn't bounded by the opportunity you missed; it's bounded by
how wrong the stale number was.

Those two outcomes are not symmetric, so the default shouldn't be symmetric either. Halt
first, investigate second. A system that fails closed is one you can leave running.

## What this looks like when it's working

The honest test isn't whether it handles a disconnect — everyone's does. It's whether you
can **inject** staleness and watch the right thing happen. Feed the engine a recorded
session, freeze the tick stream at 13:47, and confirm the system stops instead of
extrapolating. If you can't construct that scenario on demand, you don't know how your
system behaves in it; you're just waiting to find out live.

Which is really the same principle as everything else in this work: the states that matter
most are the ones that don't happen to occur on the day you were watching.

---

*Automating a strategy and thinking through these failure modes? I'd be glad to compare
notes — [get in touch](mailto:ksaurabh2468@gmail.com).*
