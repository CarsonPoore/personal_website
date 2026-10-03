#!/usr/bin/env bash
# Render each loop one at a time, then encode web assets into ../media/motion/.
# Usage: ./render.sh [id ...]   (defaults to all)
set -euo pipefail
cd "$(dirname "$0")"
IDS=("$@")
[ ${#IDS[@]} -eq 0 ] && IDS=(tactics-to-system one-roof method-stack tier-stack central-indiana proof-line)
OUT=../media/motion
mkdir -p out "$OUT"
for id in "${IDS[@]}"; do
  echo "== $id"
  # Lossless RGB frames, so the section background color survives exactly into BT.709 YUV
  [ -n "${SKIP_RENDER:-}" ] || { rm -rf "out/$id" && npx remotion render "$id" "out/$id" --sequence --image-format=png --log=error; }
  SRC=(-framerate 30 -i "out/$id/element-%03d.png")
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
  ffmpeg -y -loglevel error -i "out/$id/element-000.png" -frames:v 1 -q:v "${JPG_Q:-4}" "$OUT/$id.jpg"
  ls -l "$OUT/$id".*
done
