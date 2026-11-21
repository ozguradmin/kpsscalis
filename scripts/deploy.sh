#!/usr/bin/env bash
# Yerelden yayın (GitHub Actions yerine; Cloudflare API token'ı gerekmez, wrangler OAuth oturumu kullanılır).
# Sıra: sözdizimi + içe aktarma + duman testleri → çalışan başvuru yoksa yayınla → /api/health.
# Kullanım: bash scripts/deploy.sh   (repo kökünden)
set -euo pipefail
cd "$(dirname "$0")/.."
W="node node_modules/wrangler/bin/wrangler.js"
for f in src/*.js src/lib/*.js src/apply/*.js src/sources/*.js; do node --check "$f"; done
node --import ./test/register.mjs -e "await import('./src/index.js')"
node --import ./test/register.mjs scripts/smoke-dispatch.mjs
node --import ./test/register.mjs scripts/letter-guard-test.mjs | grep -q FAIL && { echo "letter-guard-test başarısız"; exit 1; }
# Yayın çalışan başvuru workflow'unu keser
N=$($W d1 execute ozgur-is-ajani --remote --json --command "SELECT COUNT(*) n FROM applications WHERE status IN ('applying','prepared','queued')" 2>/dev/null | grep -o '"n": [0-9]*' | grep -o '[0-9]*$')
if [ "${N:-x}" != "0" ]; then echo "Çalışan başvuru var ($N) ya da sayılamadı; yayın yapılmadı."; exit 2; fi
$W deploy
sleep 5
curl -fsS -A curl-agent https://ozgur-is-ajani.ozgurglr256.workers.dev/api/health; echo
