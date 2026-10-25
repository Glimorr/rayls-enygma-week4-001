# Rayls Enygma: a held-out test of amount inference

This study asks whether an observer with Private Network Hub metadata and trial observation windows can distinguish 0.25 from 1.00 cross-bank transfers in a local Rayls deployment. Its contribution is an empirical test of a concrete ciphertext-length classifier, with frozen held-out predictions and a reproducible negative result.

The classifier correctly predicts **3/8 held-out trials (37.5%)**, compared with **4/8 (50%)** for a constant-class prediction on the balanced set. Exact conditional randomization gives **65/70 = 0.9285714285714286** one-sided and **1** two-sided. It did not demonstrate reliable amount inference. This does not establish universal privacy.

## Observations and method

- Sixteen randomized trials have saved settlement-audit declarations.
- Eight held-out predictions were frozen before controlled unblinding according to the project record; the package verifies their declarations and hash links, not an independent external timestamp.
- The cumulative Hub snapshot contains 160 ciphertext events / 40 batches. Randomized deltas contribute 128 / 32; the earlier complement is 32 / 8.
- Maximum Bank B ciphertext length >=1157 bytes predicts 0.25; otherwise 1.00. The rule was selected from training data rather than fixed in the original preregistration.
- One settled trial is the statistical unit. Trial-to-Hub attribution remains **TEMPORAL_ONLY**.

## Reproduce the analysis

Requires Node.js >=22 and no external packages. From this directory:

~~~sh
node --test tests/research.test.mjs tests/audit.test.mjs tests/publication.test.mjs
node verify.mjs --show summary
node verify.mjs --show audit T16
node verify.mjs --out ../results/reproduction-001
~~~

Choose a destination that does not exist. The builder refuses replacement. The generated site includes metrics, the held-out results, a 16-trial audit table and a standalone reproduce/ package.

The analysis reads saved files. It does not access Docker, a blockchain, an environment file, a private key or the original randomization seed. [Reproducibility details](REPRODUCIBILITY.md) define the expected outputs and exact test.

## Inspect the evidence

- [Final research report](FINAL_REPORT.md): design, observations, statistics and limits.
- [Evidence index](EVIDENCE_INDEX.md) and [SHA-256 manifest](manifest.json): the 76 historical evidence files.
- [Transaction audit guide](TRANSACTION_AUDIT_GUIDE.md): status semantics, missing fields and verification levels.
- [Source provenance](SOURCE_PROVENANCE.md) and [runtime matrix](CURRENT_VS_HISTORICAL_RUNTIME_MATRIX.md): checkout identities, captured analysis-host versions and unverified deployment mappings.
- [Package contents](PACKAGE_CONTENTS.md): exact reproduction inputs.
- [Attribution and AI assistance](ATTRIBUTION.md).

The transaction table preserves receipt statuses, reference statuses and T01 legacy statuses separately. Missing per-trial receipt statuses and before/after balances remain null. Full raw transaction receipts and calldata reconstruction are not available.

## Scope of verification

The verifier checks artifact hashes, structured saved-audit fields, snapshot deltas, prediction references, feature values and exact statistics. It does not independently requery historical receipts, reverify ZK proofs, establish current chain health, or map source commits to original container builds.

Captured analysis-host versions are distinct from historical deployment versions. Eight held-out observations, one classifier and one local deployment do not establish broad privacy or production behavior. The saved observations are creator-produced local records; package verification is not third-party certification.
