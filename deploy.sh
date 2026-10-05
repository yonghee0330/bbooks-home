#!/bin/sh
# bbooks.co.kr(운영) 배포: 이 폴더의 사이트 파일만 ~/Documents/bbooks 로 복사 → 커밋 → 푸시
# 사용: sh deploy.sh "커밋 메시지"
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"
DST="$HOME/Documents/bbooks"
MSG="${1:-메인 페이지 업데이트}"
cd "$DST" && git pull -q --ff-only
rsync -a --delete "$SRC/images/" "$DST/images/"
rsync -a --delete "$SRC/assets/" "$DST/assets/"
rsync -a --delete "$SRC/data/"   "$DST/data/"
for d in talks bam box; do rsync -a --delete "$SRC/$d/" "$DST/$d/"; done
cp "$SRC/index.html" "$DST/index.html"
cd "$DST" && git add index.html images assets data talks bam box
git commit -m "$MSG

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push
