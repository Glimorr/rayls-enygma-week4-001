# Current versus historical runtime matrix

Scope: local development experiment. The original transactions are historical; verification commands execute now. No production/Mainnet result or current chain-health claim is made.

## Captured analysis host versus historical deployment

Analysis-host observations were captured at 2026-10-25T17:22:52.883Z in runtime-host-snapshot.json. They describe that command session and may differ from another verification host. Run node host-versions.mjs to inspect a new host. The capture is creator-produced metadata, not third-party attestation.

| Component | Captured analysis-host observation | Historical deployment evidence | Source-to-runtime status |
|---|---|---|---|
| Node | v24.19.0, node --version | Previous offline test log also records v24.19.0; original deployment Node unknown | Analysis capture only |
| Git | git version 2.53.0.windows.3, git --version | Historical deployment Git version not captured | Not a runtime build identity |
| npm | npm --version unavailable on this session PATH | Original npm version unknown | No npm dependency/install needed for verifier |
| Docker CLI / Compose | NOT QUERIED under restriction | Version not established by approved package | UNVERIFIED |
| Contracts checkout | Recorded checkout HEAD ed8863885c8ed5d5d317d47a34c063907192687a | SOURCE_PROVENANCE.md records preexisting local changes | Exact deployed-build mapping UNVERIFIED |
| Relayer checkout | Recorded checkout HEAD b01b427de4cfc2ac66e75eba0d5070b73a3b137c | SOURCE_PROVENANCE.md records preexisting local changes | Exact deployed-build mapping UNVERIFIED |
| Token runtime bytecode | No live code query | Saved audit reports 19180 bytes, hash 0xdd49dd0790db65e210bf52c01e684fbe2a8e2c2d82dd33d8177f43d67e4c8aaa | Saved hash not rebuilt from pinned compiler/settings/source |
| Hub / participant chains | No live RPC query | Saved metadata identifies Hub 1337 and participants 12345–12348 | Current health and binary builds UNVERIFIED |
| Container images | No Docker inspect, pull or execution | Configuration references below, not running-image observations | Image IDs/digests and commit mapping UNVERIFIED |

A checkout commit identifies source present at inspection, not necessarily source used to build historical images. Captured host observations do not establish versions used during historical deployment.

## Configuration image references

Inspected only image: declarations from rayls-oct-w4-enygma-local/docker-compose.yaml. This is present configuration evidence, not proof of what ran historically. No full configuration or credentials are redistributed.

| Configuration reference | Interpretation |
|---|---|
| public.ecr.aws/w0k9o1t3/rayls-demo/rayls-contracts:latest | Mutable contracts tag; digest unknown |
| public.ecr.aws/w0k9o1t3/rayls-demo/rayls-relayer:latest | Mutable relayer tag; digest unknown |
| public.ecr.aws/w0k9o1t3/rayls-demo/rayls-private-network-hub:latest | Mutable Hub tag; digest unknown |
| public.ecr.aws/w0k9o1t3/rayls-demo/rayls-privacy-axyl:latest | Mutable privacy-node tag; digest unknown |
| rayls-proof-api / rayls-pubrelayer / rayls-kos / rayls-nats :latest under the same registry prefix | Supporting mutable service references; no running identity collected |
| rayls-governance-api / rayls-governance-flagger / rayls-governance-listener / rayls-audit-explorer :latest under the same prefix | Supporting mutable service references |
| postgres:17.3-bookworm | Versioned tag, not immutable digest |
| alpine:3.20 | Versioned tag, not immutable digest |

The inspected configuration uses fixed published ports and persistent/shared configuration and certificate volumes; the full operational configuration is not part of this reproduction package. No claim is made that a new deployment can be reconstructed exactly from these tags.

## Saved identity cross-checks

node verify.mjs --show topology checks Hub/event chain IDs, participant membership, issuer/source/destination identities, resource ID and EnygmaTeleport consistency across the approved snapshot, preregistration, activation audit and token-bytecode audit. It verifies current artifact consistency, not raw RPC receipts, cryptographic transfer attribution or running binaries.

The route is a documented source→Hub→destination description. Participants are derived from saved anonymity sets; source/destination roles are read from preregistration and cross-checked against saved activation/token metadata.

Missing historical image digests, compiler settings, relayer build IDs and exact local patch mapping remain UNVERIFIED. No attempt was made to recover them by operating Docker, accessing environment files or querying chains.
