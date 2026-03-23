#! /bin/bash
set -euxo pipefail

echo "Executing locust script"
{{eco_digit_path}}/sut/start-locust.sh 3 {{eco_digit_path}}/sut 100