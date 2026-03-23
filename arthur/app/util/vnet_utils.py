def determine_ip_address(vnet_id: int, host_address: int) -> str:
    """Get the host's IP address inside a vnet."""
    if validate_address_args(vnet_id, host_address) != 0:
        return "Computer says NO!"  # TODO RAISE ERROR
    return f"172.{16 + vnet_id // 256}.{vnet_id % 256}.{host_address}"


def determine_mac_address(vnet_id: int, host_address: int) -> str:
    """Get the host's MAC address inside the vnet."""
    if validate_address_args(vnet_id, host_address) != 0:
        return "Computer says NO!"  # TODO RAISE ERROR
    return f"02:00:ac:{hex(16 + vnet_id // 256).split('x')[-1].zfill(2)}:{hex(vnet_id % 256).split('x')[-1].zfill(2)}:{str(host_address).zfill(2)}"


def validate_address_args(vnet_id: int, host_address: int):
    if (type(vnet_id) != int) or (type(host_address) != int):
        return -1  # TODO LOG
    if not 0 <= vnet_id <= 4095:
        return -2  # TODO LOG
    if not 0 <= host_address <= 255:
        return -3  # TODO LOG
    return 0
