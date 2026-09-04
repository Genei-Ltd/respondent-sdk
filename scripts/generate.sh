#!/usr/bin/env bash
#
# Regenerates the TypeScript client from the vendored OpenAPI document.
#
# This never touches the network: `schemas/openapi.json` is the only input, so
# the same commit always generates the same output. Refresh the vendored
# document with `pnpm run schema:update`.
#
# Usage: bash scripts/generate.sh [output-dir]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

OUTPUT_DIR="${1:-./src/generated}"

echo "Validating the vendored OpenAPI document..."
pnpm exec tsx "${SCRIPT_DIR}/validate-openapi.ts" schemas/openapi.json

echo
echo "Generating the TypeScript client into ${OUTPUT_DIR} with OpenAPI-ts..."
RESPONDENT_GENERATED_OUTPUT="${OUTPUT_DIR}" pnpm exec openapi-ts

echo
echo "Done."
