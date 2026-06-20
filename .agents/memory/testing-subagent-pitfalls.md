---
name: Testing subagent pitfalls
description: Why an E2E test can falsely report a "reset to initial screen" bug for in-memory SPA state
---

# Testing subagent: page reloads wipe in-memory SPA state

When a `runTest` E2E test reports that a single-page React app "reverted to the
initial/first screen" mid-flow AND the corresponding backend request shows up as
"request aborted" (statusCode null), suspect the **test agent reloaded the page**,
not a real bug. A reload aborts in-flight fetches and wipes all in-memory React
state back to first render.

**Why:** This happened with the Belinda portfolio SocraticChat demo. The first run
reported "clicking the determination button reverted to the name-entry screen" and
the `/api/socratic/determination` request aborted ~3.5s in. There was no router, no
StrictMode, no wrapping `<form>`, no reload code anywhere — the LLM determination
call was just slow (5-15s) and the test agent reloaded out of impatience.

**How to apply:** Before chasing a phantom remount/reset bug, re-run the test with
an explicit instruction: "do NOT reload or navigate; wait patiently up to Ns;
capture console logs." If it passes when the agent is patient, the original failure
was a test artifact. Reserve real-bug investigation (stale closures, key changes,
form-submit reloads) for when console logs actually show an error or navigation.
