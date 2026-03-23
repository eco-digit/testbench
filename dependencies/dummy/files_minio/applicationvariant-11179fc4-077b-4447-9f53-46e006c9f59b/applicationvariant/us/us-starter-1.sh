#! /bin/bash
set -euxo pipefail

# run cypress test
cd /home/arthur/client
npx cypress run
