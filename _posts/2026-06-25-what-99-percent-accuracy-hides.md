---
title: "What \"99% accurate\" doesn't tell you"
date: 2026-06-25
categories: [ai, computer-vision]
read_time: "5 min read"
excerpt: "A headline accuracy number is the most quoted and least useful metric in computer vision. Here's what I look at instead before I let a system near a production line."
---

Every computer-vision deck I've ever seen leads with one number: accuracy. And every plant
manager I've ever worked with has learned, usually the hard way, that the number on the slide
and the number that matters are rarely the same thing.

I've shipped vision systems for quality inspection — label checks running in real time on a
line that doesn't stop for anyone. Here's what I actually watch, because the top-line
accuracy figure hides all of it.

## The 1% is not random

"99% accuracy" quietly implies the 1% of errors is spread evenly and harmlessly across your
data. It almost never is. On a real line the misses **cluster** — around the new label
variant, the glare from one particular lighting angle, the SKU that ships in low volume and
was underrepresented in training.

> A model that's 99% accurate overall and 60% accurate on your highest-liability defect is
> not a 99% accurate model. It's a liability with good marketing.

Before I trust a system, I want the confusion matrix sliced by the categories the *business*
cares about — not the ones that happen to be common.

## False positives and false negatives don't cost the same

Collapsing errors into a single "accuracy" number pretends a missed defect and a false
alarm are equally bad. They're not, and the ratio is a business decision, not a modeling one.

- **A false negative** — a real defect that ships — can mean a recall, a safety issue, a
  furious customer.
- **A false positive** — a good unit flagged as bad — means wasted product, unnecessary
  manual review, and operators who start ignoring the system because it "cries wolf."

The right operating point sits wherever the *cost* of those two failures balances for this
product. That's a conversation with operations, priced in real consequences — not a threshold
you pick to make a metric look good.

## Accuracy on a static test set is a lab result

The most dangerous gap is between the curated evaluation set and the living line. Production
drifts: lighting changes across a shift, a supplier tweaks the label stock, a camera slowly
loses focus. A model frozen at yesterday's accuracy silently decays against today's reality.

**What I insist on:**

- A **monitoring path** that tracks live prediction distributions, not just an offline score.
- A **feedback loop** where operator overrides flow back as labeled data.
- A **drift alarm** that trips on the inputs, so you catch the label-stock change *before* it
  becomes a quality escape.

## The metric I actually report

When I hand a vision system to a client, the number I lead with isn't accuracy. It's
something closer to: *"defect escape rate on the categories you told me you can't afford to
miss, at a false-alarm rate your operators will tolerate, holding up over four weeks of live
production."*

It's a mouthful. It doesn't fit on a slide. But it's the number that's still true a quarter
later — and that's the only kind of number worth putting your name on.

---

*Working on inspection or vision QA? I'm always up for trading war stories —
[reach out](mailto:ksaurabh2468@gmail.com).*
