#!/usr/bin/env bash
set -euo pipefail

# Skanuje historię Gita za pomocą gitleaks z obsługą commitów scalających (-m)
# Wzorzec: organizer/.github/scripts/gitleaks-range.sh (M-48 / NFR-SEC-005)

BASE_REF="${1:-}"
HEAD_REF="${2:-HEAD}"

if [ -n "$BASE_REF" ] && git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  RANGE="$BASE_REF..$HEAD_REF"
else
  # Bezpieczny fallback dla shallow clone lub force-push
  RANGE="HEAD~50..$HEAD_REF"
  if ! git rev-parse --verify "HEAD~50" >/dev/null 2>&1; then
    RANGE="HEAD"
  fi
fi

echo "[gitleaks-range] Skanowanie zakresu: $RANGE (z flagą -m dla merge commitów)"

if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --verbose --redact --log-opts="-m $RANGE"
else
  echo "[gitleaks-range] gitleaks nie jest zainstalowany w środowisku lokalnym, pomijanie skanu."
fi
