#!/usr/bin/env bash
# Creates resized thumbnails without touching originals.
#
# Output:
#   images/projects/<id>/thumbs/<file>  — for cards + hero slideshow
#   images/team/thumbs/<file>           — for team section
#
# After running, update YAML thumbnail: fields to point to thumbs/ paths.
# Detail/lightbox views keep using original full-res files.
#
# Usage:
#   ./optimize-images.sh                        # defaults
#   THUMB_SIZE=600 QUALITY=80 ./optimize-images.sh
#   ./optimize-images.sh --thumb-size 600 --quality 80 --force

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.img-opt-venv"
THUMB_SIZE="${THUMB_SIZE:-800}"
QUALITY="${QUALITY:-85}"
FORCE=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --thumb-size) THUMB_SIZE="$2"; shift 2 ;;
    --quality)    QUALITY="$2";    shift 2 ;;
    --force)      FORCE=1;         shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "Settings: max ${THUMB_SIZE}px, quality ${QUALITY}, force=${FORCE}"

# Setup venv
if [[ ! -d "$VENV_DIR" ]]; then
  echo "Creating venv at $VENV_DIR..."
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

pip install --quiet --upgrade Pillow

python3 "$SCRIPT_DIR/optimize-images.py" "$SCRIPT_DIR" "$THUMB_SIZE" "$QUALITY" "$FORCE"
