#!/usr/bin/env bash
# Render each loop one at a time, then encode web assets into ../media/motion/.
# Usage: ./render.sh [id ...]   (defaults to all)
#   ENTRY=src/v2/a/index.ts ./render.sh id   render from a separate entry point (one per agent/group)
#   ALPHA=1 ./render.sh id                   transparent loop: VP9-alpha webm + HEVC-alpha mp4 (Safari) + PNG poster
set -euo pipefail
cd "$(dirname "$0")"
IDS=("$@")
[ ${#IDS[@]} -eq 0 ] && IDS=(tactics-to-system one-roof method-stack tier-stack central-indiana proof-line)
OUT=../media/motion
mkdir -p out "$OUT"
for id in "${IDS[@]}"; do
  echo "== $id"
  # Lossless RGB frames, so the section background color survives exactly into BT.709 YUV
  [ -n "${SKIP_RENDER:-}" ] || { rm -rf "out/$id" && npx remotion render ${ENTRY:-} "$id" "out/$id" --sequence --image-format=png --concurrency=${CONC:-3} --log=error; }
  # Frame filename padding depends on frame count (element-00.png vs element-000.png)
  F0=$(ls "out/$id" | sort | head -1); PAD=$(( ${#F0} - 12 ))
  PAT="out/$id/element-%0${PAD}d.png"
  if [ -n "${ALPHA:-}" ]; then
    A=(-framerate 30 -i "$PAT")
    ffmpeg -y -loglevel error "${A[@]}" -an -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf "${VP9_CRF:-28}" -row-mt 1 -deadline good -cpu-used 1 -auto-alt-ref 0 "$OUT/$id.webm"
    ffmpeg -y -loglevel error "${A[@]}" -an -pix_fmt bgra -c:v hevc_videotoolbox -alpha_quality 0.8 -q:v "${HEVC_Q:-55}" -allow_sw 1 -tag:v hvc1 -movflags +faststart "$OUT/$id-hevc.mp4"
    cp "out/$id/$F0" "$OUT/$id.png"
    ls -l "$OUT/$id".* "$OUT/$id-hevc.mp4"
    continue
  fi
  SRC=(-framerate 30 -i "$PAT")
  VF="scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p"
  CS=(-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv)
  # WebM / VP9, two-pass constrained quality
  ffmpeg -y -loglevel error "${SRC[@]}" -an -vf "$VF" -c:v libvpx-vp9 "${CS[@]}" \
    -b:v 0 -crf "${VP9_CRF:-24}" -row-mt 1 -deadline good -cpu-used 1 -pass 1 -passlogfile "out/$id" -f null /dev/null
  ffmpeg -y -loglevel error "${SRC[@]}" -an -vf "$VF" -c:v libvpx-vp9 "${CS[@]}" \
    -b:v 0 -crf "${VP9_CRF:-24}" -row-mt 1 -deadline good -cpu-used 1 -pass 2 -passlogfile "out/$id" "$OUT/$id.webm"
  # MP4 / H.264 fallback
  ffmpeg -y -loglevel error "${SRC[@]}" -an -vf "$VF" -c:v libx264 -profile:v high -preset slow -tune animation \
    -crf "${X264_CRF:-15}" "${CS[@]}" -movflags +faststart "$OUT/$id.mp4"
  # Poster = frame 0 (identical to the loop's first frame, so playback starts without a jump)
  ffmpeg -y -loglevel error -i "out/$id/$F0" -frames:v 1 -q:v "${JPG_Q:-4}" "$OUT/$id.jpg"
  ls -l "$OUT/$id".*
done
