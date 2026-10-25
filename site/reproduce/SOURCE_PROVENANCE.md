# Source provenance

Local read-only Git inspection identified:

| Upstream | Observed HEAD |
|---|---|
| https://github.com/raylsnetwork/rayls-sovereign-contracts | ed8863885c8ed5d5d317d47a34c063907192687a |
| https://github.com/raylsnetwork/rayls-sovereign-relayer | b01b427de4cfc2ac66e75eba0d5070b73a3b137c |

Both upstream LICENSE files identify Apache License 2.0. No complete upstream source tree is redistributed here. URLs identify the upstream origins; they are not a publication destination for this research package.

Preexisting changes reported by Git:
- Contracts: deploy/pcDeployContractsAndUpdateEnvs.sh; docker/dev/deploy_contracts.sh; scripts/compile-contracts.js; scripts/delete-bindings.sh; scripts/generate-bindings.js; scripts/move-bindings.sh.
- Relayer: compose.sh; docker/development/local/axyl_genesis.sh; docker/development/relayer_healthcheck.sh; docker/development/start_pubrelayer.sh; docker/development/start_relayer.sh; docker/hooks/pre-commit.sh; scripts/gen-dev-certs.sh; scripts/rebuild.sh; start_dev.sh.

Their content and significance have not been fully audited. Do not assume these are merely permission changes. These observations do not establish that the recorded local changes were part of the deployed build.

The recorded source inspection does not reconstruct the full historical runtime. Exact image, build and configuration provenance remain unverified.

These source checkout identities do not attest to a public research-repository commit, remote workflow execution or hosted-site availability. Those must be verified against their actual public endpoints.

The existing compose configuration includes mutable latest image tags, fixed host ports, generated certificates, shared configuration and persistent services. No running image digests, live service state or secrets were collected. These limits matter for any claim of full deployment reproducibility.

Historical trial filenames use m16 while internal trial IDs use W4_M15_T01 through W4_M15_T16. This package uses T01–T16 display identifiers and preserves every original filename and internal identifier. It does not rewrite frozen evidence.

See CURRENT_VS_HISTORICAL_RUNTIME_MATRIX.md for a concise separation of current host, historical saved deployment facts, present configuration tags and unverified runtime mapping. The recorded checkout hashes above remain checkout identities, not pinned historical container-build attestations. host-versions.mjs does not invoke Docker or query blockchains.
