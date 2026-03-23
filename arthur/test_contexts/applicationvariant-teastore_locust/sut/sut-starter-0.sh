#! /bin/sh
set -x



# install git & docker
sudo apt-get -y update
#sudo apt-get -y install git
sudo apt-get -y install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get -y update

sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose

# Using a timeout when loading the images because sometimes this just hangs indefinitely. (Using exactly 1 core 100%).
# It should take around 25 seconds, so after 120s we fail the script.
timeout --signal=TERM --kill-after=10s 120s sudo docker load -i {{eco_digit_path}}/docker_images_1-4-2.tar

# setup teastore
cd /home/arthur
docker-compose -f {{eco_digit_path}}/docker-compose.yaml up -d



# install locust dependencies
sudo apt-get -y update
sudo apt-get -y install python3-pip tmux ufw python3-venv
python3 -m venv myenv
source myenv/bin/activate

pip install --upgrade locust zope locust-plugins