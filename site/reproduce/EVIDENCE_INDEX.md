# Evidence index

All paths below are relative to this package. Exact file sizes and SHA-256 values are in manifest.json. Every evidence file is a separate byte-preserving copy; the originals remain in the workspace experiments directory.

| ID | Claim / scope | Artifact |
|---|---|---|
| E01 | Preregistration, balanced phases and original analysis rules | evidence/enygma-m15-preregistration.json |
| E02 | Frozen training-selected threshold; no held-out refit | evidence/enygma-m16-frozen-classifier-v1.json |
| E03 | Training Hub features; no amount labels | evidence/enygma-m16-training-hub-features-v1.json |
| E04 | Cumulative 160-event / 40-batch endpoint; chain metadata | evidence/enygma-m16-t16-hubonly.json |
| E05 | Initial 16-event / 4-batch observer snapshot | evidence/enygma-hub-observer-v1.json |
| E06 | Post-pilot-01 24-event / 6-batch snapshot | evidence/enygma-hub-observer-v1-postpilot.json |
| E07 | Pre-randomization 32-event / 8-batch snapshot | evidence/enygma-hub-observer-v1-pilot02.json |
| E08 | Historical Hub approval and Bank A activation | evidence/enygma-hub-approval-bank-a-activation-audit.log |
| E09 | Historical token bytecode and metadata verification | evidence/enygma-production-bank-a-onchain-verification.log |
| E10 | Historical initial cross-bank settlement | evidence/enygma-bank-a-to-b-settlement-audit.log |
| E11 | First-transfer source dispatch and temporal Hub candidates | evidence/enygma-first-transfer-cross-chain-correlation.log |
| E12 | Pilot 01 saved settlement | evidence/enygma-m14-pilot-025-settlement-audit.log |
| E13 | Pilot 02 saved settlement | evidence/enygma-m14-pilot-02-settlement-audit.log |
| E14-Tnn | Trial nn cumulative snapshot | evidence/enygma-m16-tnn-hubonly.json |
| E15-Tnn | Trial nn new events (eight rows / two batches) | evidence/enygma-m16-tnn-hubonly-new-events.csv |
| E16-Tnn | Trial nn saved settlement audit | evidence/enygma-m16-tnn-settlement-audit.log |
| E17-Tnn | Held-out prediction and hash references (nn=09–16) | evidence/enygma-m16-tnn-heldout-prediction-v1.json |
| E18-Tnn | Blind Hub snapshot (nn=09–16) | evidence/enygma-m16-tnn-heldout-hub-blind-v1.json |
| U01 | Owner-supplied controlled unblinding | ground-truth.csv |
| R01 | Fresh offline computed results | generated metrics.json and heldout-results.csv |

Replace nn with two digits. All original trial identifiers remain W4_M15_Tnn. E14–E16 cover 01–16; E17–E18 cover 09–16.

No amount leakage claim follows from ciphertext variation alone. E08–E13 are saved historical audits, not live chain queries. E16 verifies audit text and integrity, not current RPC state. Prediction hash links do not supply independent external timestamps. The 76-file allowlist excludes original private schedules, seeds, environment files, operational scripts and attempt guards.

The complete 76-name machine-readable inventory is manifest.json. The verifier refuses extra files, missing files, changed bytes, changed labels and duplicate event identities.

## Joined audit and identity views

New builds add trial-evidence.json and trial-evidence.csv with one row for each T01–T16 and full evidence-file SHA-256 references. Each site row links to trial-Tnn.html, its exact saved audit and underlying approved files. Null fields are not captured/released, not inferred. TRANSACTION_AUDIT_GUIDE.md documents status semantics and verification levels.

Topology identities are derived/cross-checked using E01, E04, E08 and E09. Captured analysis-host metadata is separate from the unchanged historical evidence manifest and is not evidence of historical runtime versions.
