#!/usr/bin/env bash
# Convierte un video en bucle sin salto: funde el final con el inicio y quita el audio.
# Uso: bash tools/video-bucle.sh entrada.mp4 assets/video/portada-bucle.mp4 [segundos_de_fundido]
set -euo pipefail
IN="$1"; OUT="$2"; X="${3:-1.25}"
D=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$IN")
OFF=$(python3 -c "print(round($D-2*$X,3))")
ffmpeg -v error -y -i "$IN" -filter_complex \
 "[0:v]scale=1280:720,split[a][b];[a]trim=0:$X,setpts=PTS-STARTPTS[head];[b]trim=$X,setpts=PTS-STARTPTS[body];[body][head]xfade=transition=fade:duration=$X:offset=$OFF,format=yuv420p[v]" \
 -map "[v]" -an -c:v libx264 -preset slow -crf 27 -profile:v high -movflags +faststart "$OUT"
echo "Listo: $OUT"
