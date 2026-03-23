#!/bin/bash

# Parameter prüfen
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <start_id> <end_id>"
    exit 1
fi

START=$1
END=$2

# Check: START < END
if [ "$START" -gt "$END" ]; then
    echo "Error: START ($START) must be <= END ($END)"
    exit 1
fi

# Regex für eames-<ID> mit Nicht-Ziffer danach oder Zeilenende
VM_PATTERN=$(seq "$START" "$END" | sed 's/.*/^eames-&([^0-9]|$)/' | paste -sd'|' -)
NET_PATTERN=$(seq "$START" "$END" | sed 's/.*/^vnet&([^0-9]|$)/' | paste -sd'|' -)

echo "=== Destroying VMs ==="
virsh list --all --name \
  | grep '^eames-' \
  | grep -Ev '^eames-gm-' \
  | grep -E "$VM_PATTERN" \
  | tee /dev/stderr \
  | xargs -r -I{} virsh destroy "{}"

echo "=== Undefining VMs ==="
virsh list --all --name \
  | grep '^eames-' \
  | grep -Ev '^eames-gm-' \
  | grep -E "$VM_PATTERN" \
  | tee /dev/stderr \
  | xargs -r -I{} virsh undefine "{}"

echo "=== Destroying networks ==="
virsh net-list --all --name \
  | grep '^vnet' \
  | grep -E "$NET_PATTERN" \
  | tee /dev/stderr \
  | xargs -r -I{} virsh net-destroy "{}"

echo "=== Undefining networks ==="
virsh net-list --all --name \
  | grep '^vnet' \
  | grep -E "$NET_PATTERN" \
  | tee /dev/stderr \
  | xargs -r -I{} virsh net-undefine "{}"

echo "=== Killing matching Python processes ==="
pgrep -af ".venv/bin/python3 process_measurement.py" \
  | awk -v start="$START" -v end="$END" '
    {
      last_arg = $NF
      if (last_arg ~ /^[0-9]+$/ && last_arg >= start && last_arg <= end) {
        print $1
      }
    }
  ' | tee /dev/stderr | xargs -r kill
