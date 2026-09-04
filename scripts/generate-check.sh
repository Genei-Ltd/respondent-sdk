#!/usr/bin/env bash
#
# Regenerates the client from the vendored OpenAPI document into a scratch
# directory and fails if it differs from the committed `src/generated`.
#
# Run it in CI so a hand-edited generated file, or a vendored spec that was
# never regenerated, cannot be merged.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

SCRATCH_DIR="$(mktemp -d "${TMPDIR:-/tmp}/respondent-generated.XXXXXX")"
trap 'rm -rf "${SCRATCH_DIR}"' EXIT

bash "${SCRIPT_DIR}/generate.sh" "${SCRATCH_DIR}" >/dev/null

echo "Comparing regenerated output with src/generated..."
if diff -ru src/generated "${SCRATCH_DIR}"; then
  echo "src/generated is up to date with schemas/openapi.json."
else
  echo
  echo "src/generated is stale. Run \`pnpm run generate\` and commit the result." >&2
  exit 1
fi
