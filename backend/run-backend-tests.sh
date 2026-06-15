#!/usr/bin/env bash
set -euo pipefail

docker compose down
docker compose build
docker compose up -d

# wait for api to be healthy / responsive
echo "Waiting for api container to become healthy..."
timeout=60
elapsed=0
while ! [ "$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q api)" 2>/dev/null || true)" = "healthy" ]; do
  sleep 1
  elapsed=$((elapsed+1))
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "Timed out waiting for health status; continuing anyway."
    break
  fi
done

# run tests inside the api service
docker compose exec api pytest

docker compose down
