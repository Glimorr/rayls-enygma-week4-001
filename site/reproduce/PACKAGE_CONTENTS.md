# Public research package

The standalone reproduce/ directory contains an exact file selection defined by public-package.mjs:

- Analysis: verify.mjs, audit.mjs and presentation.mjs.
- Packaging and environment inspection: public-package.mjs, host-versions.mjs and runtime-host-snapshot.json.
- Research documentation: README, final report, reproducibility guide, evidence index, source/runtime provenance, audit guide and attribution.
- Inputs: ground-truth.csv, manifest.json, manifest.sha256 and the 76 evidence files listed by that manifest.
- Validation: all three test files, package.json and the non-deploying CI workflow template.

The generated website contains the derived results, transaction audit/detail pages and a technical topology page. It also carries the selected standalone package, so the same analysis can be run without the original workspace.

Recording scripts, production runbooks, internal handoffs, evaluator feedback, historical draft builds and raw recordings are not public package inputs. Operational chain scripts, environment files, original private schedules and keys are excluded.

Historical evidence is copied byte for byte. The package replays analysis; it does not recreate chains, raw RPC collection, the randomization ceremony or external timestamp attestation. Tests use only their own temporary copies for mutation cases.

