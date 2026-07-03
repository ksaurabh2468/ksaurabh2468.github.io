---
title: "Agents that actually do things: a field guide to MCP"
date: 2026-06-22
categories: [ai, agentic]
read_time: "6 min read"
excerpt: "Most 'AI agents' are just a chatbot with extra steps. The Model Context Protocol is what turns a model that talks into one that acts — here's how I think about it on real programs."
---

For a year, "agentic AI" mostly meant a language model in a loop, narrating what it
*would* do if only it could touch anything. The interesting shift of the last stretch
isn't smarter models — it's giving them a clean, governed way to reach the systems where
work actually happens. That's the problem the **Model Context Protocol (MCP)** solves,
and it's changed how I scope this class of project.

## The gap MCP closes

A model on its own is a brilliant intern with no hands. It can reason about your CRM,
your data warehouse, or your ticketing system — but it can't read or change any of them
without a bridge. Historically every team built that bridge by hand: bespoke function-calling
glue, per-integration, re-written for each new model.

MCP standardizes the bridge. A **server** exposes tools, resources, and prompts; a
**client** (the model's host) discovers and calls them over a common protocol. Swap the
model, keep the integrations. Add a system, expose one server, and every agent can use it.

> The value of a standard isn't elegance. It's that the integration you build today
> still works with the model you adopt next year.

## What it changes on a program

Three things, in the order they tend to matter:

1. **Scope stops being N×M.** Without a standard, five models times eight systems is forty
   integrations to build and maintain. With MCP it's roughly five plus eight. That math is
   the difference between a pilot and a platform.
2. **Governance gets a seam.** Because tool calls flow through a defined boundary, that
   boundary is where you put auth, rate limits, audit logging, and human-in-the-loop
   approvals. Security stops being sprinkled through prompt text and starts living in
   infrastructure — where it belongs.
3. **The blast radius is legible.** You can enumerate exactly which tools an agent can
   reach. "What can this thing do to production?" becomes a list you can review, not a
   vibe you have to trust.

## Where teams get it wrong

The failure mode I watch for isn't technical — it's handing an agent broad, write-capable
tools before anyone has decided what "wrong" costs.

- **Start read-only.** Let an agent *observe* and *recommend* long before it *acts*. Most
  of the value shows up in the read path anyway.
- **Make destructive tools ask.** Anything that spends money, sends a message, or mutates a
  record of consequence should route through an approval, not an inference.
- **Log the call, not just the answer.** When something goes sideways — and it will — you
  want the tool invocation, arguments, and result, not a paraphrase the model wrote after
  the fact.

## The honest state of it

MCP isn't magic and it isn't finished. You still own the hard parts: which tools to expose,
what they're allowed to touch, and how a human stays in the loop where the stakes are real.
What it gives you is a place to *put* those decisions — a boundary that's the same across
models and systems.

That's not a small thing. On the programs I lead, "where does the governance live?" is
usually the question that decides whether an agent ever leaves the sandbox. MCP finally
gives it a clean answer.

---

*Building agentic workflows and wrestling with the same trade-offs? I'd genuinely like to
compare notes — [get in touch](mailto:ksaurabh2468@gmail.com).*
