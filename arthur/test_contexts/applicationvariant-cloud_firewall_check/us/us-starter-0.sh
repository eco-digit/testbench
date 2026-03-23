#! /bin/bash
set -uo pipefail

ip_a='{{eco_digit_ip_0}}'
ip_b='{{eco_digit_ip_1}}'
ip_c='{{eco_digit_ip_2}}'
# ip gateway and host should be the same machine in different networks
ip_gateway="${ip_a%?}"1
ip_host="10.1.104.105"
ip_internet="8.8.8.8"
ip_intranet="10.1.1.1"

# check internet access
ip_address="${ip_internet}"
ping -c 1 $ip_address > /dev/null
if [ $? -eq 0 ]; then
    echo "SUCCESS: INTERNET IS AVAILABLE (ping ${ip_address} succeeded)"
else
    echo "FAIL: INTERNET IS BLOCKED (ping ${ip_address} failed)"
fi

# check intranet access
ip_address="${ip_intranet}"
ping -c 1 $ip_address > /dev/null
if [ $? -eq 0 ]; then
    echo "FAIL: INTRANET IS AVAILABLE (ping ${ip_address} succeeded)"
else
    echo "SUCCESS: INTRANET IS BLOCKED (ping ${ip_address} failed)"
fi

# check local network access (guest b)
ip_address="${ip_b}"
ping -c 1 $ip_address > /dev/null
if [ $? -eq 0 ]; then
    echo "SUCCESS: LOCAL NETWORK (GUEST B) IS AVAILABLE (ping ${ip_address} succeeded)"
else
    echo "FAIL: LOCAL NETWORK (GUEST B) IS BLOCKED (ping ${ip_address} failed)"
fi

# check local network access (guest c)
ip_address="${ip_c}"
ping -c 1 $ip_address > /dev/null
if [ $? -eq 0 ]; then
    echo "SUCCESS: LOCAL NETWORK (GUEST B) IS AVAILABLE (ping ${ip_address} succeeded)"
else
    echo "FAIL: LOCAL NETWORK (GUEST B) IS BLOCKED (ping ${ip_address} failed)"
fi

# check gateway address
ip_address="${ip_gateway}"
ping -c 1 $ip_address > /dev/null
if [ $? -eq 0 ]; then
    echo "SUCCESS: GATEWAY IS AVAILABLE (ping ${ip_address} succeeded)"
else
    echo "FAIL: GATEWAY IS BLOCKED (ping ${ip_address} failed)"
fi

# check host address
ip_address="${ip_host}"
ping -c 1 $ip_address > /dev/null
if [ $? -eq 0 ]; then
    echo "FAIL: HOST IS AVAILABLE (ping ${ip_address} succeeded)"
else
    echo "SUCCESS: HOST IS BLOCKED (ping ${ip_address} failed)"
fi


# check ssh availability on other eames
ip_address="${ip_b}"
nc -z -v -w5 $ip_address 22 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "SUCCESS: SSH AVAILABLE TO LOCAL NETWORK (port 22 on $ip_address available)"
else
    echo "FAIL: SSH NOT AVAILABLE TO LOCAL NETWORK (port 22 on $ip_address not available)"
fi


# check ssh availability on gateway (internal address)
ip_address="${ip_gateway}"
nc -z -v -w5 $ip_address 22 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: SSH AVAILABLE TO GATEWAY (port 22 on $ip_address available)"
else
    echo "SUCCESS: SSH NOT AVAILABLE TO GATEWAY (port 22 on $ip_address not available)"
fi


# check ssh availability on gateway (external address)
ip_address="${ip_host}"
nc -z -v -w5 $ip_address 22 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "FAIL: SSH AVAILABLE TO HOST (port 22 on $ip_address available)"
else
    echo "SUCCESS: SSH NOT AVAILABLE TO HOST (port 22 on $ip_address not available)"
fi
