#!/usr/bin/env bash
set -euo pipefail

docker compose down
docker compose build
docker compose up

