#!/usr/bin/env bash
set -euo pipefail

# Wybiera wskazaną wersję główną Xcode (np. 26) na maszynie macOS runnera.
WANT_MAJOR="${1:-26}"

CANDIDATE=$(ls -d "/Applications/Xcode_${WANT_MAJOR}"*.app 2>/dev/null | sort -V | tail -n 1 || true)
if [ -z "$CANDIDATE" ] && [ -d "/Applications/Xcode.app" ]; then
  CANDIDATE="/Applications/Xcode.app"
fi

if [ -z "$CANDIDATE" ] || [ ! -d "$CANDIDATE" ]; then
  echo "::error::Nie znaleziono instalacji Xcode ${WANT_MAJOR}.x w /Applications:" >&2
  ls -d /Applications/Xcode*.app 2>/dev/null >&2 || true
  exit 1
fi

sudo xcode-select -s "$CANDIDATE/Contents/Developer"
xcodebuild -version

SDK_VER=$(xcodebuild -version -sdk iphoneos ProductVersion 2>/dev/null || echo "")
SDK_MAJOR="${SDK_VER%%.*}"
echo "Wybrano Xcode: $CANDIDATE (iOS SDK: ${SDK_VER:-nieznane})"

if [ -n "$SDK_MAJOR" ] && [ "$SDK_MAJOR" != "$WANT_MAJOR" ]; then
  echo "::error::Wymagane iOS ${WANT_MAJOR} SDK, a wybrano iOS ${SDK_VER:-brak} z $CANDIDATE" >&2
  exit 1
fi
