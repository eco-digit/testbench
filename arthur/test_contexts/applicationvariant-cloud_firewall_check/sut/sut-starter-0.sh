#! /bin/bash
set -uo pipefail

# setup nmap (currently not needed)
echo "updating repository and installing netcat and nmap. (Output is hidden)"
sudo apt -y update > /dev/null 2>&1
sudo apt -y install netcat-traditional > /dev/null 2>&1

# add this if you want to use this machine for debugging afterwards
# sudo apt -y install nmap > /dev/null 2>&1
