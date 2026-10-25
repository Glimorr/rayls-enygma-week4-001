# Reproducing the saved-observation analysis

Node.js >=22 is sufficient. Local validation used Node v24.19.0; this identifies an analysis host, not the historical deployment. Only Node standard-library modules are used. No npm install, Docker, RPC access, credentials or private seed is needed.

## Inputs and commands

The historical inputs are the 76 files in evidence/, bound to manifest.json and manifest.sha256. The owner-supplied seed-free ground-truth.csv is separately hash-bound in the manifest. Source code, tests and documentation accompany those data; a reviewed repository commit identifies their revision.

Run from the standalone package directory:

~~~sh
node --version
node --test tests/research.test.mjs tests/audit.test.mjs tests/publication.test.mjs
node verify.mjs --show summary
node verify.mjs --show topology
node verify.mjs --show audit T16
node verify.mjs --out ../results/independent-001
~~~

These commands work in PowerShell and a POSIX shell. Use an unused output name on each build. Do not delete or replace historical evidence to clear an error.

The generated website is static: open index.html directly. Its reproduce/ directory contains the same selected source files, tests, documentation and evidence. Verify that copy independently:

~~~sh
node ../results/independent-001/reproduce/verify.mjs --show summary
~~~

## Expected results

| Quantity | Expected value |
|---|---|
| Saved settlement audits | 16/16 |
| Cumulative Hub events / batches | 160/40 |
| Randomized events / batches | 128/32 |
| Earlier events / batches | 32/8 |
| Frozen held-out predictions | 8 |
| Correct predictions | T10, T13, T15: 3/8 = 37.5% |
| Balanced constant-class baseline | 4/8 = 50% |
| Conditional label assignments | C(8,4) = 70 |
| One-sided extreme assignments / p | 65 / 65/70 |
| Two-sided extreme assignments / p | 70 / 1 |
| Attribution | TEMPORAL_ONLY |

Outputs are metrics.json, heldout-results.csv, heldout-lengths.svg, trial-evidence.json/CSV, 16 trial detail pages, topology.html, index.html, .nojekyll and reproduce/. Derived outputs are deterministic for unchanged inputs. Missing audit fields remain null rather than inferred.

## Exact randomization calculation

Keep predictions fixed and enumerate every placement of four 0.25 and four 1.00 labels across the eight held-out trials. Count correct predictions for each assignment.

The directional alternative is higher accuracy. The one-sided p-value includes every assignment with correct count >= the observed count. The two-sided calculation includes assignments whose absolute distance from the conditional null mean of four correct is >= the observed distance. Ties are included. No Monte Carlo approximation, seed, refitting or post-hoc direction reversal is used.

## What verification establishes

Checks cover evidence membership, byte lengths and SHA-256; label hashes; model input and prediction hash links; derived features; observation windows; trial snapshot deltas; duplicate event identities; structured saved reference/event/mint assertions; and internal topology consistency.

These are checks of saved observations and analysis. Full raw per-trial receipts, independent calldata reconstruction, per-trial balance transitions, external freeze timestamps and exact source-to-original-runtime mapping are not established. Reference statuses and legacy fields are never substituted for receipt statuses.

The tests retain evidence-tamper, altered-label, extra-file, malformed-audit, existing-output-refusal, deterministic-build and standalone-verification coverage, with additional checks of public content and package boundaries.

## CI and static hosting

ci/offline-verification.yml is a workflow template for a repository rooted at this standalone package. It runs the full offline suite and builds into an absent child of a unique runner-temporary directory, then uploads the site artifact. It has no deployment step. No remote Actions run is attested by this package.

Generated links are relative and .nojekyll disables Jekyll processing. The site uses no external fonts, analytics, CDN assets or API calls. A build does not establish hosted availability: verify the actual deployed links and downloads separately.

See [package contents](PACKAGE_CONTENTS.md), [runtime provenance](CURRENT_VS_HISTORICAL_RUNTIME_MATRIX.md) and [attribution](ATTRIBUTION.md).
