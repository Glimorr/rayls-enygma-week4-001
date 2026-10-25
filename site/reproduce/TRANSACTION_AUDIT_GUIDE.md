# Transaction audit table and verification levels

The builder emits trial-evidence.json and trial-evidence.csv with 16 rows. Each row joins approved saved settlement declarations to trial Hub deltas and the frozen held-out result. No evidence allowlist changes were made.

## Status meanings

- sourceReceiptStatus / destinationReceiptStatus: null unless explicitly captured as a receipt-status field. All captured trial rows are null; reference states must not be substituted.
- sourceReferenceStatus / destinationReferenceStatus: explicit reference-status fields, when present (1 SENT / 2 RECEIVED according to the saved experiment).
- legacySourceStatus / legacyDestinationStatus: T01 SOURCE_STATUS and DESTINATION_STATUS, retained without upgrading their semantics.
- Event assertions: saved counts or saved verified booleans; sourceField records the original field name.
- rawTransactionReconstruction: NOT_AVAILABLE. Full raw receipts and calldata are not in this approved package.
- beforeAfterBalances: null. No per-trial balance transition is invented from earlier baseline logs.
- frozenPrediction / actualAmountClass: null for training rows because training labels and held-out predictions do not apply there. T09–T16 use the approved seed-free unblinding.
- Evidence references contain allowlisted filenames and SHA-256 values. Label source/hash is recorded separately in JSON.
- Hub batch IDs/blocks are derived from saved CSV rows. Trial-to-batch association stays TEMPORAL_ONLY.

## Structured verification

The parser checks trial identifier, unique fields, hash syntax, positive chain-specific block numbers, saved reference/legacy state values, reference/burn/dispatch assertions, exactly one matched mint and amount-match/read-only declarations. It rejects duplicate trial reference IDs, source transactions and mint transactions. Existing model/prediction/hash/snapshot checks remain enabled.

Blocks are chain-specific. A destination block lower than a source block is not an inconsistency across two chains. No cross-chain height ordering assertion is performed.

Verification levels are deliberately separate:
1. Byte consistency: evidence hashes match the captured manifest.
2. Structured saved-audit checks: saved fields are present and mutually acceptable.
3. Offline reconstruction: trial deltas, features, exact statistics and joins are recomputed.
4. Raw receipt/calldata reconstruction and live requery: NOT AVAILABLE / NOT PERFORMED.

## Compact verification commands

From the standalone package:
~~~sh
node verify.mjs --show summary
node verify.mjs --show topology
node verify.mjs --show audit T16
~~~

A fresh build writes the full machine-readable table:
~~~sh
node verify.mjs --out ../results/audit-review-001
~~~

Use an unused destination. The site table links each trial to a readable detail page, underlying saved audit and full SHA-256 references. Short hashes on the summary table are display abbreviations only.
