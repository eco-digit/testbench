# Eames GM Creation Guide

This guide will show how to setup a GM for the Linux test environments (Eames) in either Debian or Ubuntu.

## Create new virtual machine

It is recommended to have at least 4096 MiB of memory and 16 GiB of storage. More storage is better though because unused storage does not take up actual space on the host.

```bash
# Debian
sudo virt-install \
--name eames-gm-deb \
--memory 4096 \
--vcpus 4 \
--disk size=64,format=qcow2 \
--os-variant unknown \
--network bridge=virbr0 \
--location /var/lib/ecodigit/images/iso/debian-12.1.0-amd64-netinst.iso \
--graphics none \
--extra-args 'console=ttyS0'
```

```bash
# Ubuntu
sudo virt-install \
--name eames-gm-ubuntu-22-docker \
--memory 4096 \
--vcpus 4 \
--disk size=64,format=qcow2 \
--os-variant unknown \
--network bridge=virbr0 \
--location /var/lib/ecodigit/iso/ubuntu-22.04.5-live-server-amd64.iso \
--graphics none \
--extra-args 'console=ttyS0'
```

After executing these commands, you will enter the machines and continue to the operating systems installation screens.

### Debian

Select the following options during installation:

- Locale: C -> Europe -> Germany -> German Keymap
- Hostname: eames; Domain: empty
- Accounts:
  - Root: Empty
  - Full Name: empty
  - Username: arthur
  - Password: arthur
- Partition Disk: Default; Write changes to disk: yes
  - On ubuntu, ensure that the full storage will be allocated! The default behaviour seems to omit part of the disk.
- Default APT Mirror
- Software Selection: Deselect everything; Select SSH Server
- Device for boot loader installation: /dev/sda

After installation: Login and set Grub-Timout from 5 to 0:

```bash
sudo nano /etc/default/grub
# change GRUB_TIMEOUT TO: 'GRUB_TIMEOUT=0'

sudo update-grub
```

### Ubuntu:

Select the following options during installation:

- Rich Mode
- Locale: English; Layout + Variant: German
- Hostname: eames
- Type of Install: Ubuntu Server (minimized), no third-party drivers
- change partition (ubuntu-lv of ubuntu vg) to use all space available
- Your Name: empty, Your servers name: eames, Username: arthur, password: arthur
- Install OpenSSH server: yes

### Prepare Image (Debian & Ubuntu)

```bash
# if you need to reconnect to the machine
sudo virsh list --all
sudo virsh start --console eames-gm-ubuntu-22-docker
```

First, switch to root, because >> operator doesn't work as a normal user with sudo.

```bash
sudo -s
```

Execute the following commands:

```bash
# edit sudoers to allow everything without typing a password
echo "arthur ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/ecodigitpermissions

# for mounting the shared folder
chmod o+w /etc/fstab

# install updates
apt -y update && apt -y upgrade
```

This is a workaround to disable IPv6 DNS, because we have a problem with IPv6 DNS not working and interrupting the local permission checks on 'sudo'. (We should try to re-enable IPv6 in the future.):

```bash
apt -y update && apt -y install curl
curl https://download.osso.pub/deb/nss-dns4only/nss-dns4only_0.1-1/libnss_dns4only-0.1.so \
    -o /lib/x86_64-linux-gnu/libnss_dns4only.so.2
ldconfig
sed -i -e '/^hosts:.*/s/ dns\( \|$\)/ dns4only [!UNAVAIL=return] dns\1/' \
    /etc/nsswitch.conf
```

### Advanced minimizations

The following changes further decrease resource usage in idle by uninstalling unnecessary packages and disabling services. They allow for a more clean test environment, but are in turn less realistic for real environments and might cause problems for users. We should continue to evaluate these tradeoffs or provide options for selecting both variants.

These instrcutions are taken from the [NOP-Linux-Creation](https://www.green-coding.io/blog/nop-linux/). (We only took instructions that weren't breaking our setup.) They were written for Ubuntu, but most of them can be applied for Debian as well.

It should be noted that a default minimal Debian installation is already much 'quieter' than a default minimal Ubuntu installation. Just disabling CRON-Jobs on the Debian installation already takes you most of the way. It also has a faster and more efficient bootup than Ubuntu. Ubuntu on the other hand seems to have a smaller memory footprint after all these change below are applied.

Detailed Footprint for 29 Minutes in Idle (after applying advanced minimizations):

- Debian:
  - 9.313 CPU Seconds
  - 4 KiB read
  - ~ 610 KiB written
- Ubuntu:
  - 12.679 CPU Seconds
  - 4 KiB read
  - ~ 254 KiB written
- Network usage is the same.

#### Instructions

It is recommended to do all of the following as root (needed for some commands, more practical for others).

```bash
sudo -s
```

Uninstall packages (Ubuntu):

```bash
apt purge -y --purge snapd apport apport-symptoms cryptsetup cryptsetup-bin cryptsetup-initramfs gdisk lxd-installer mdadm open-iscsi squashfs-tools ssh-import-id wget xauth && apt -y --purge autoremove
```

Uninstall packages (Debian):

```bash
apt purge -y --purge xauth && apt -y --purge autoremove
```

Disable services (Debian & Ubuntu):

```bash
systemctl disable --now apt-daily-upgrade.timer
systemctl disable --now apt-daily.timer
systemctl disable --now dpkg-db-backup.timer
systemctl disable --now e2scrub_all.timer
systemctl disable --now fstrim.timer
systemctl disable --now motd-news.timer

systemctl disable --now systemd-tmpfiles-clean.timer
systemctl disable --now fwupd-refresh.timer
systemctl disable --now logrotate.timer
systemctl disable --now ua-timer.timer
systemctl disable --now man-db.timer
systemctl disable --now systemd-tmpfiles-clean.timer

systemctl disable --now systemd-journal-flush.service
systemctl disable --now systemd-timesyncd.service

systemctl disable --now systemd-fsckd.socket
systemctl disable --now systemd-initctl.socket

systemctl disable --now cryptsetup.target

# disable cron, necessary for Debian; needs to be two commands according to stackoverflow
systemctl disable cron
systemctl stop cron
```

Other stuff (Debian & Ubuntu)

```bash
# Disable the kernel watchdogs
echo 0 > /proc/sys/kernel/soft_watchdog
echo 0 > /proc/sys/kernel/nmi_watchdog
echo 0 > /proc/sys/kernel/watchdog
echo 0 > /proc/sys/kernel/watchdog_thresh

# Removes the large header when logging in
rm /etc/update-motd.d/*

# Remove all cron files. Cron shouldn't be running anyway but just to be safe
rm /etc/cron.d/*
rm /etc/cron.daily/*

apt autoremove -y --purge
```

## Make hard drive small (Debian & Ubuntu) & fix permissions

After the machine is prepared and shutdown, the virtual hard drive can be shrunk. It also makes sense to do this from time to time after software updates.

```bash
sudo chmod 777 eames-gm-ubu.qcow2

# see maximum size of hard drive
ls -lh eames-gm-ubu.qcow2

# see actually used size of hard drive
du -h eames-gm-ubu.qcow2

# reclaim unused space from file (e.g. after uninstalling a lot of packages)
# (If you want to be sure not to destroy anything, test the shrunk image before overwriting the old image)
sudo qemu-img convert -O qcow2 eames-gm-ubu.qcow2 shrunk.qcow2 && sudo mv shrunk.qcow2 eames-gm-ubu.qcow2
```

## Setup Package Proxys

To reduce bandwidth we run a Nexus3 isntance, see the instructions in `/provisioning` on how to run the setup.
The nexus proxy needs to be configured for every package source in every eames.
The following explains how this works for each package source.

You will need to replace the variable `ARTHUR_PRIMARY_IP` with the primary interface's IPv4 address of your arthur host in all configuration files.
On vm-744caf9c this is the eth0 interface's address `10.1.104.105`.

### mvn

Copy the contents from `files/mvn_settings.xml` to `/home/arthur/.m2/settings.xml` and replace `hostname` with arthur's hostname.

### gradle

Copy the contents from `files/mirror.gradle` to `/home/arthur/.gradle/init.d/mirror.gradle` and replace `hostname` with arthur's hostname.

### npm

Install npm:

```commandline
apt install npm
```

Set nexus as the registry:

```commandline
npm config set registry http://hostname:8080/repository/npmjs
```

### Docker

Copy the contents from `files/daemon.json` to `/etc/docker/daemon.json` and replace `hostname` with arthur's hostname.

### apt - Debian bookworm

Copy the contents from `files/sources_bookworm.list` to `/etc/apt/sources.list` and replace `hostname` with arthur's hostname.

### apt - Ubunut jammy

Copy the contents from `files/sources_jammy.list` to `/etc/apt/sources.list` and replace `hostname` with arthur's hostname.

## Comparison between Ubuntu and Debian

The differences between Debian and Ubuntu in Idle have been measured and documented above, see `Advanced minimizations`. These idle usages remained stable for days apart from an Error that seems to be related to virtualization. (See `Open Problems` - `CPU lockups`.)

To evaluate the performance differences in actual test cases between Ubuntu and Debian, a teastore sut has been run for multiple times. (30 runs in total, alternating between Ubuntu and Debian. The last Ubuntu run had an anomaly where the npm repository seems to have blocked our requests, so this run has been removed from the dataset). Their install scripts differ slightly in the Docker installation because Docker offers different Docker-DEB-Sources for Ubuntu and Debian. Otherwise, the use cases are the same. (Used were the scenarios from ecodigit/notes/gm-creation/benchmark-scenarios)

### Actual Time (in seconds)

This table shows the actual time taken for each test case.

| Real Time | Average | | Median | | Std. Dev. | |
|-------------|--------:|--------:|--------:|--------:|----------:|-------:|
| OS: | Debian | Ubuntu | Debian | Ubuntu | Debian | Ubuntu |
| Prepare | 76.192 | 111.226 | 76.974 | 112.383 | 4.213 | 6.870 |
| Install | 340.491 | 330.486 | 340.409 | 329.205 | 3.444 | 4.288 |
| Work | 52.147 | 52.837 | 51.971 | 53.012 | 0.995 | 1.005 |
| Cleanup | 6.098 | 6.107 | 6.117 | 6.065 | 0.150 | 0.193 |
| Total | 474.950 | 500.677 | 475.050 | 501.697 | 6.103 | 7.481 |
| Unaccounted | 0.021 | 0.021 | 0.020 | 0.020 | 0.003 | 0.004 |

(Total is the sum of each phase; Unaccounted is the time between timestamps for the end of one phase and the start of another, and not included in Total.)

### CPU Time (all virtual machines combined) (in seconds)

This table shows the CPU times that have been measured for each machine. This is more important than actual time, both because it takes the vm CPU utilization into account and because it should not be contaminated by CPU utilization on the host.

| CPU Time | Average | | Median | | Std. Dev. | |
|-------------|---------:|--------:|--------:|--------:|----------:|-------:|
| OS: | Debian | Ubuntu | Debian | Ubuntu | Debian | Ubuntu |
| Prepare | 51.711 | 86.584 | 51.500 | 86.480 | 0.531 | 0.356 |
| Install | 594.797 | 587.741 | 595.953 | 588.575 | 6.491 | 7.784 |
| Work | 100.223 | 104.776 | 99.599 | 104.450 | 2.320 | 2.376 |
| Cleanup | 0.085 | 0.096 | 0.093 | 0.081 | 0.019 | 0.031 |
| Total | 746.823 | 779.202 | 748.176 | 778.304 | 5.559 | 8.152 |
| Unaccounted | 0.006 | 0.005 | 0.005 | 0.005 | 0.004 | 0.002 |

#### Prepare & Install phase

There is a great performance difference between Debian & Ubuntu in the Prepare Phase. The Debian images are a bit smaller to copy and boot up notably quicker. The Ubuntu boot up was more consistent (standard deviation: Ubuntu: 0.356, Debian: 0.531) though.

The Install Phase finishes a bit quicker and more efficient on Ubuntu, but is more consistent on Debian. The Install phase is not very comparable though, because Debian and Ubuntu have to use different external repositories for their packages.

##### Work Phase

This phase is by far the most important one. It is also very comparable, because both use exactly the same work definitions. Debian is faster (0.69 seconds on average - 1.3% faster) and more efficient (4.55 CPU seconds on average; 4.3% more efficient), but both are very similar with a standard deviation of 2.320 for Debian and 2.376 for Ubuntu.

##### Cleanup, Unaccounted

Cleanup and Unaccounted Phases both are very small and don't show notable differences.

### Conclusion

The most obvious difference is the efficient boot up on Debian. In general, Debian seems to be slightly more efficient and also more consistent. This is especially significant because Debian in its default configuration is already way more minimal, making the advanced minimizations that are described above less necessary than on Ubuntu.

The test data is limited though, as only 29 test runs on one evening have been made. More complex workloads should be tested as well. But before running more big collections of test runs we should stop using external package mirrors, because they both introduce a large unknown variable to our Install Phases, and (understandingly) seem to block our Requests after too much usage.

## Open Problems

### CPU lockups

There is a problem happening both on Ubuntu and Debian, where both Ubuntu and Debian can get excessive measured resource usage by some error that seems to be caused by the virtualization layer either on arthur itself, or on the host that provides arthur.

Symptoms are error messages on the machines stdout (see below), high cpu usage for a vm-internal-process called 'rcu-schedule', and 100% CPU usage from every core.

Logs:

```
arthur@eames:~$ [11628.341472] watchdog: BUG: soft lockup - CPU#1 stuck for 26s! [networkd-dispat:501]
[11628.353430] watchdog: BUG: soft lockup - CPU#2 stuck for 26s! [systemd-resolve:487]
[11628.365426] watchdog: BUG: soft lockup - CPU#3 stuck for 26s! [systemd-network:485]
[11632.329431] watchdog: BUG: soft lockup - CPU#0 stuck for 26s! [swapper/0:0]
[11656.341430] watchdog: BUG: soft lockup - CPU#1 stuck for 52s! [networkd-dispat:501]
[11656.353427] watchdog: BUG: soft lockup - CPU#2 stuck for 52s! [systemd-resolve:487]
[11656.365428] watchdog: BUG: soft lockup - CPU#3 stuck for 52s! [systemd-network:485]
[11660.329428] watchdog: BUG: soft lockup - CPU#0 stuck for 52s! [swapper/0:0]
[11662.289062] rcu: INFO: rcu_sched self-detected stall on CPU
[11662.304645] rcu:     2-...!: (14819 ticks this GP) idle=c0d/1/0x4000000000000000 softirq=3752/3752 fqs=644
[11662.331738] rcu: rcu_sched kthread timer wakeup didn't happen for 13702 jiffies! g4665 f0x0 RCU_GP_WAIT_FQS(5) ->state=0x402
[11662.359157] rcu:     Possible timer handling issue on cpu=0 timer-softirq=25826
[11662.361237] rcu: rcu_sched kthread starved for 13713 jiffies! g4665 f0x0 RCU_GP_WAIT_FQS(5) ->state=0x402 ->cpu=0
[11662.364241] rcu:     Unless rcu_sched kthread gets sufficient CPU time, OOM is now expected behavior.
[11662.367051] rcu: RCU grace-period kthread stack dump:
[11662.368854] rcu: Stack dump where RCU GP kthread last ran:
```

It doesn't happen very often though - it has not once appeared while executing a test run yet. (At least 30 runs in the last weeks were observed.) It's very probable to happen at some point when a vm is run in idle for several days. A Debian vm was run for ~40 hours, in that time frame it happened only once for ~45 minutes in the night. It can also happen for just a few minutes. To further debug this error, it might make sense to try hosting arthur on actual hardware instead of virtualized.

### Test on real Hardware (TODO)

To better evaluate the measured data we should run these tests on dedicated hardware and compare these results to the tests run on our vm. (Both idle usage and the test cases above.) The test cases used can be found in this repo in `/prototypes/examples-infra-sut-load/teastore_110-verification-{os}`. We can also see if these lockup problems mentioned above happen there as well.

## Snapshots

Snapshots can be used to create copies of virtual machines without copying entire disk images, but instead using one base image for each machine. Each machine has a separate disk image where only the changes/additions to the base image are stored. Additional instructions/explanations can be found here: https://techpiezo.com/linux/use-and-implementation-of-backing-file-and-snapshot-in-qemu-kvm/

To create a new machine as a copy from another machine as a base image, use the following instructions:

```bash
# mv base image to make it a backing file
sudo mv /var/lib/libvirt/images/eames-gm-deb.qcow2 /var/lib/libvirt/images/eames-gm-deb-base.qcow2

# create new image that builds on backing file
sudo qemu-img create -f qcow2 -F qcow2 -b /var/lib/libvirt/images/eames-gm-deb-base.qcow2 /var/lib/libvirt/images/eames-gm-deb-docker.qcow2
```

```bash
# create a vm based on the new image file
virt-install \
--name eames-gm-deb-docker \
--memory 2048 \
--vcpus 4 \
--import \
--disk /var/lib/libvirt/images/eames-gm-deb-docker.qcow2 \
--os-variant unknown \
--network bridge=virbr0 \
--graphics none
```

Snapshots will not be used for basic gm images, because we abandoned (at least for now) the idea of having separate images for things like Docker, JDK, etc.

Snapshots could however be very useful for executing test runs, because they speed up vm creation time and disk usage while they are active.
