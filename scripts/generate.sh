#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

if [ "${NO_FETCH_SCHEMA:-0}" != "1" ]; then
  echo "Fetching the Respondent.io Partner API OpenAPI document..."
  pnpm exec tsx "${SCRIPT_DIR}/fetch-openapi.ts"
else
  echo "Skipping schema fetch (NO_FETCH_SCHEMA=1)..."
fi

echo
echo "Validating the vendored OpenAPI document..."
pnpm exec tsx "${SCRIPT_DIR}/validate-openapi.ts" schemas/openapi.json

echo
echo "Generating the TypeScript client with OpenAPI-ts..."
pnpm exec openapi-ts

echo
echo "Formatting generated output..."
pnpm exec prettier --write src/generated --log-level warn

echo
echo "Done."
