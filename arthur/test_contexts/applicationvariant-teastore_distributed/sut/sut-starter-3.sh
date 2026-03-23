#! /bin/bash
set -euxo pipefail

# setup cypress
sudo apt-get -y update
sudo apt-get -y install npm libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
cp -r {{eco_digit_path}}/us/client /home/arthur/
cd /home/arthur/client
npm i
