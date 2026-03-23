# Firewall/Netzwerkfilter (ECODIGIT-180)

The virtual machines hosted by Arthur are executing user code (with full permissions) and therefore have to be sealed of from Arthurs Envrionment and Arthur itself. This is done with libvirts nwfilters. For more Dokumentation, see [Red Hat - Applying Network Filtering](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-virtual_networking-applying_network_filtering) and [Libvirt - Network Filters](https://libvirt.org/formatnwfilter.html).

## General Usage

Create a new Filter from an XML file:

```bash
sudo virsh nwfilter-define /var/lib/ecodigit/presets/libvirt-nwfilter.xml
```

Edit an existing Filter:

```bash
sudo virsh nwfilter-edit ecodigit-default
```

Write existing Filter to XML:

```bash
sudo virsh nwfilter-dumpxml ecodigit-default > nwfilter-dump.xml
```

The XML definition used for the default ecodigit firewall is stored in Arthurs 'presets' directory. ('libvirt-nwfilter.xml').

To use the firewall in a virtual machine, it must be added to the virtual machine xml file:

```xml
<interface type='bridge'>
    <mac address='{{mac_address}}'/>
    <source bridge='{{bridge_name}}'/>
    <model type='e1000'/>
    <address type='pci' domain='0x0000' bus='0x00' slot='0x02' function='0x0'/>
    <filterref filter='ecodigit-default'>
            <parameter name='IP' value='{{network_gateway_ip}}' />
    </filterref>
</interface>
```

## Caveat

The current nwfilter-definition needs a workaround: Normally, the '$IP' variable would be automatically filled with the clients (eames) IP address. It is possible to manually specify the clients IP like we did above in the clients xml definition. For our specific filter though, we don't actually need to know the clients IP as we don't have any rules regarding that. Instead we need to know the gateways IP because we have filters for that IP and it's different for every job. Because we can't have custom variables, we need to misuse that '$IP' parameter.

This would be a problem if we used any predefined nwfilter-rules like clean-traffic, because they rely on '$IP' being the clients IP. It would be nice to be able to add that rule as a precaution, but the firewall we implemented is currently more important. The solution to this problem is implementing a dynamic nwfilter-generation in the process_job scripts with a custom rule for each job.

## Test scenario

There is a test usage scenario in the examples folder ('firewall_check') to check that the firewall is working correctly. It performs a series of pings and portchecks. When everything is working correctly, it will output the following:

```
2024-05-16 08:28:10,716 - process_job.py - INFO: Started work on client 0 for job 114 (1/2).
2024-05-16 08:28:11,126 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: INTERNET IS AVAILABLE (ping 8.8.8.8 succeeded)
2024-05-16 08:28:21,130 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: INTRANET IS BLOCKED (ping 10.1.1.1 failed)
2024-05-16 08:28:21,135 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: LOCAL NETWORK IS AVAILABLE (ping 172.16.100.3 succeeded)
2024-05-16 08:28:21,144 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: GATEWAY IS AVAILABLE (ping 172.16.100.1 succeeded)
2024-05-16 08:28:31,148 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS?: HOST IS BLOCKED (ping 10.1.104.105 failed)
2024-05-16 08:28:31,168 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: SSH AVAILABLE TO LOCAL NETWORK (port 22 on 172.16.100.3 available)
2024-05-16 08:28:36,205 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: SSH NOT AVAILABLE TO GATEWAY (port 22 on 172.16.100.1 not available)
2024-05-16 08:28:41,235 - run_subprocess.py - DEBUG: Subprocess apply-us-linux for job 114: SUCCESS: SSH NOT AVAILABLE TO HOST (port 22 on 10.1.104.105 not available)
```
