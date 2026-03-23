# Arthur

### Description

This is Arthur, the component that runs measurements. It does so by spawning instances of virtual machines, called "
eames", and measuring their usage meanwhile from outside.
Arthur consists of a slim flask api, a measurement queue and the process job script, that handles the eames instances.

## Getting Started

### IDE

Especially when writing the Python backend, it may be beneficial to develop directly on the shared project server.
Visual Studio Code (Free) and IntelliJ IDEA / PyCharm Professional (Paid) are able to connect to the server over SSH and
access remote files + shell similar to a native session on your own machine.
Please note: The Python backend cannot be started locally on non-Linux systems – development and execution require a
Linux environment.

Before you can start you must write the IT-Support to get access to the Server (10.1.104.105). Then, clone the project
from GitLab into a directory inside your home folder (e.g., /home/your-username/project-name), so you have full access
and the correct permissions.
These IDEs may also automatically forward open Ports to access them on your machine. (WARNING: Sometimes, VS Code seems
to forward only a fraction of the needed ports.) If not, you can manually setup Port Forwarding in your personal
machines shell:

```bash
# username@10.1.104.105: SSH connection to the remote server
# localhost: hostname of application from inside the remote server. ('localhost' for Docker; Eames-IP for a virtual machine.)
# 4200: Port that the application uses on the remote server
# 1234: Port that the application will be available on on your machine
ssh -L 1234:localhost:4200 -N username@10.1.104.105
```

This way, we can directly access the server from our machines without opening the server up to other people or having to
mess with the Firewall.

## Install global dependencies (on fresh server installation only)

```bash
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virtinst virtiofsd nmap net-tools uuid-runtime sshpass gnupg curl python3-pip python3-nftables
```

- Complete directory structure

```bash
mkdir ~/ecodigit/testbench/arthur/logs
# nwfilter-define only necessary for the first installation on a new server
sudo virsh nwfilter-define ~/ecodigit/testbench/arthur/machines/presets/libvirt-nwfilter.xml
ln -s /var/lib/libvirt/images/ ~/ecodigit/testbench/arthur/machines/libvirt_images
ln -s /var/lib/ecodigit/configuration/vnets_jobs ~/ecodigit/testbench/arthur/app/vnets_jobs
```

## Get correct permissions

```bash
sudo usermod -aG libvirt,docker $USER
```

### Create `config.yaml` in /home/user/ecodigit/testbench/arthur/app

The config.yaml file is used to configure various components of the application, including the database connection,
Flask server settings, and cleanup processes. It is especially important to adjust the values for the Flask port,
cleanup times, and database connection to fit your own environment to avoid conflicts with other developers. The Flask
server port should differ from other developers' port numbers, and cleanup times should be selected to ensure they do
not overlap with the time windows of other team members. The database is set up with a TimescaleDB instance, which must
also be configured with the correct credentials to ensure proper connectivity. It’s important to avoid conflicts with
other developers to ensure smooth, independent work. For example, if multiple developers use the same Flask port, their
applications won't be able to run simultaneously. Similarly, overlapping cleanup times can lead to issues like data
corruption or inconsistencies. Lastly, if database credentials are not properly managed, it could cause access problems
or unintended data modifications. By adjusting settings like port numbers, cleanup windows, and database configurations,
each developer can work independently without interfering with others.

- use the config_example.yml as reference
- edit especially everywhere where you can see .../username/
- enter the timescale database name. You will create the database in the next step. You can just use your "
  arthur_yourname". Username, Passwort, Host and Port can stay the same.
- the port for arthur_flask_port should be different then the ones from your coworkers

### Set up new TimescaleDB (PyCharm)

1. Create a new DataSource -> PostgreSQL.
2. Enter the data from the config (host, user, password, port). .

### Starting the application

Create a virtual environment and install the requirements:

```bash
cd ~/ecodigit/testbench/arthur/app
python3 -m venv .venv # Create a new venv under .venv
source .venv/bin/activate # Activate the venv
pip install -r requirements.txt
```

Run the application

```bash
# run application
python3 app.py
```

### Measurement starten

You can start measurements using a Curl command:

```bash
# example: curl -X POST http://127.0.0.1:5000/measurement/0001aaaa-bbbb-cccc-dddd-eeee12345678/start/firewall_check
curl -X POST http://127.0.0.1:your-port/measurement/uuid/start/firewall_check

```
