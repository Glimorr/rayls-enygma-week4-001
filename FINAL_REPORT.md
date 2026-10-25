# Final technical report — Rayls Enygma Week 4

## Research question

Can an observer restricted to public metadata and ciphertext lengths on a Private Network Hub distinguish 0.25 versus 1.00 cross-bank transfers in this local deployment?

The primary statistical unit is one independently settled trial. Four ciphertext events in a batch are not four independent payments. The experiment comprises eight training and eight held-out transfers with four examples per amount class in each phase. The final report uses the owner-supplied seed-free held-out unblinding table. The private seed was neither needed nor disclosed.

## Deployment and observation scope

The historical local deployment routes messages through a Private Network Hub (chain ID 1337), with Bank A chain ID 12345, Bank B 12346, and the saved anonymity set also containing 12347 and 12348. The research token is ENYW4P26. Saved audits document token deployment, Hub approval, Bank A activation, and cross-bank settlement. These are historical observations, not assertions of current network health.

The Hub observer decodes ciphertext event metadata and matches emitted ciphertexts to saved batch calldata. This package verifies saved metadata and hash-linked artifacts, without contacting a blockchain. Calldata/event agreement is not a cryptographic mapping from a particular private transfer to a Hub batch.

## Model development and freezing

The original preregistration describes feature families and the split. The specific size classifier was subsequently selected from training data. The frozen JSON explicitly records modelWasSpecifiedInOriginalPreregistration=false, training-only fitting, threshold 1157 bytes, high_means_0.25, and a prohibition on held-out refitting.

Feature: maximum ciphertextBytes for destination chain 12346 in each trial's temporal observation window. A feature >=1157 predicts 0.25; otherwise 1.00.

The frozen record reports 6/8 training accuracy and 4/8 training leave-one-out accuracy. These are historical model metadata, not independently recomputed training performance here because this release does not include training amount labels. They are not the confirmatory result.

Eight held-out prediction files declare labels unrevealed and private schedule unopened. Their references to model bytes, blind snapshots and prior snapshots verify against the captured evidence. The owner confirms they were locked before unblinding. This package does not add an independent timestamp attestation retroactively.

## Controlled unblinding and result

| Trial | Maximum Bank B bytes | Prediction | Actual | Correct |
|---|---:|---|---|---|
| T09 | 1156 | 1.00 | 0.25 | No |
| T10 | 1153 | 1.00 | 1.00 | Yes |
| T11 | 1162 | 0.25 | 1.00 | No |
| T12 | 1158 | 0.25 | 1.00 | No |
| T13 | 1160 | 0.25 | 0.25 | Yes |
| T14 | 1154 | 1.00 | 0.25 | No |
| T15 | 1160 | 0.25 | 0.25 | Yes |
| T16 | 1165 | 0.25 | 1.00 | No |

Held-out accuracy is 3/8 = 37.5%. Always predicting either class yields 4/8 = 50% on the balanced set. There are no abstentions among these eight stored predictions.

Exact conditional randomization enumerates 70 balanced label assignments with predictions fixed. Of these, 65 attain at least three correct: one-sided p=65/70=0.9285714285714286. All 70 are at least as far from the null mean of four as the observed three: two-sided p=1.000000 using inclusive absolute-deviation tails.

These results are computed by verify.mjs from the captured prediction features and approved labels. Expected values appear in regression tests and documentation, not as substituted analysis outputs. The direction is not reversed after seeing held-out labels.

## Evidence reconciliation

All 16 saved trial audit logs report settlement verified and private amount matched. Every randomized trial delta contains eight events and two distinct Hub batches. Trial deltas are disjoint and exactly match successive saved cumulative-snapshot differences.

The final cumulative dataset contains 160 events and 40 distinct transaction batches. Randomized trials contribute 128 events and 32 batches. The complement consists of 32 events/eight batches, exactly matching enygma-hub-observer-v1-pilot02.json by transaction hash, log index and ciphertext hash.

| Earlier temporal group | Events | Batches | Hub blocks |
|---|---:|---:|---|
| Initial observer snapshot, setup/first-transfer period | 16 | 4 | 15943–17318 |
| Pilot 01 increment | 8 | 2 | 23147–23150 |
| Pilot 02 increment | 8 | 2 | 24592–24595 |

The first-transfer correlation log includes candidates in the initial group; its later candidates occur around the source dispatch. The initial group's exact causal assignment is not established. Pilot settlement audits and snapshot sequencing support temporal labels for the pilot increments. No earlier event is silently counted as a randomized trial and no temporal association is promoted to cryptographic proof.

## Limitations

- One local deployment, two amount classes, one training-selected classifier, eight held-out trials.
- Low statistical power and limited precision: poor held-out accuracy does not prove ciphertext metadata is harmless.
- No independent external timestamp attestation for freezing or unblinding.
- Checksums verify present bytes relative to a local manifest; they do not authenticate authorship.
- Settlement checks rely on saved audit records rather than fresh RPC receipt queries.
- Source repositories have preexisting local modifications. Commit IDs alone do not reproduce their exact historical runtime.
- Initial pre-randomization events have incomplete causal allocation.
- Synthetic length modeling is distinct from actual observations and is excluded from this experiment's statistical results.

## Conclusion

The frozen ciphertext-length classifier did not demonstrate reliable amount inference in this held-out evaluation. The experiment does not establish general privacy guarantees and does not demonstrate reliable amount leakage. Trial-to-Hub attribution is TEMPORAL_ONLY.

## Evidence and reproducibility

See EVIDENCE_INDEX.md for artifact citations, manifest.json for exact captured bytes, SOURCE_PROVENANCE.md for source revisions and limitations, and REPRODUCIBILITY.md for independent offline commands.

## Audit access and verification boundaries

The original empirical contribution is a controlled held-out evaluation of one concrete Hub metadata classifier, including an honest negative result; ordinary token activation/settlement provides context rather than the research novelty. Controls include balanced labels, a constant-class comparison, training/held-out separation and a fixed classifier. Positive attack-sensitivity controls and new on-chain adversarial/failure boundaries are not established by this package.

Fresh site builds expose trial-evidence.json/CSV and 16 readable detail pages joining reference IDs, source/mint transactions, chain-specific blocks, saved event assertions, Hub batches, predictions/labels and evidence SHA-256 references. This is structured saved-audit verification, not raw receipt reconstruction. Receipt statuses and per-trial balance transitions remain absent where not captured; training labels are not released. T01 legacy status names are preserved separately.

CURRENT_VS_HISTORICAL_RUNTIME_MATRIX.md distinguishes current tool observations, source checkout commits, present configuration tags, historical saved token bytecode identity and unverified source-to-runtime mappings. The current host is not assumed to match the historical deployment. No external timestamp attestation, current health query, new transaction, production result or remote CI success is asserted.

## Attribution

AI assistance was used for analysis-code preparation, testing, documentation and website editing. The historical artifacts remain creator-produced local records. See ATTRIBUTION.md for upstream references and the distinction between package verification and independent attestation.
