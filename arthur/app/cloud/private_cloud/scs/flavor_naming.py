import re

# regex after SCS-0100 v3.2
_SCS_FLAVOR_RE = re.compile(
    r"^SCS-(\d+)([LVTC])i?-"  # vCPUs + Typ (+ optional i)
    r"(\d+(?:\.\d+)?)"  # RAM (z. B. 16 oder 16.5)
    r"(?:uo?|o)?"  # u/o/uo (u vor o)
    r"(?:-"  # optionaler Disk-Teil
    r"(?:(?:\d+x)?(?:5|10|20|50|100|200|500|1000)[nhsp]?|[nhsp])"
    r")?"
    r"(?:_(?:kvm|xen|vmw|hyv|bms))?"  # Hypervisor
    r"(?:_hwv)?"  # HW-Virtualization
    r"(?:_(?:[izar])(?:\d{1,2}(?:\.\d+)?)?(?:h{1,3})?)?"  # Architektur + Gen + h/hh/hhh
    r"(?:_([Gg])([NAI])(?:\d+(?:\.\d+)?)?"  # GPU/VGPU + Vendor + optional Gen
    r"(?:-(\d+)h?)?"  # -M[ h ]
    r"(?:-(\d+)h?)?"  # -V[ h ]
    r")?"
    r"(?:_ib)?$"  # Infiniband
)


def is_valid_scs_flavor(name: str) -> bool:
    return _SCS_FLAVOR_RE.fullmatch(name) is not None


def read_specs_from_scs_flavor(flavor: str) -> dict:
    """
    Parse an SCS flavor string and extract vCPU count (int), RAM in GiB (float),
    and disk size in GiB (int or None).

    Returns dict: {"vcpus": int, "ram_gib": float, "disk_gib": int or None}
    """
    # also validates the regex
    m = _SCS_FLAVOR_RE.match(flavor)
    if not m:
        return {"vcpus": None, "ram_gib": None, "disk_gib": None}

    # vCPUs and RAM from main groups
    vcpus = int(m.group(1))
    ram_gib = float(m.group(3))

    # Extract disk portion separately by slicing after the RAM match.
    # We look for "-<diskpart>" where diskpart can be like "100", "2x50", "500n", "h", "n", etc.
    disk_gib = None
    # find the position right after the RAM number in the original string
    # locate the RAM substring (first occurrence after the matched "SCS-...-")
    # compute end of RAM token plus optional u/o/uo
    ram_end = m.start(3) + len(m.group(3))
    # skip optional 'uo', 'u', or 'o' that may follow RAM
    if flavor.startswith("uo", ram_end):
        ram_end += 2
    elif flavor.startswith("u", ram_end) or flavor.startswith("o", ram_end):
        ram_end += 1
    after_ram = flavor[ram_end:]

    # attempt to locate a '-' that introduces the disk spec immediately after RAM (no other separators)
    # acceptable patterns: -<diskpart> where diskpart can be like "100", "2x50", "500n", or single letter n/h/s/p
    disk_part = None
    if after_ram.startswith("-"):
        # capture up to next "_" (hypervisor/hwv/arch/gpu) or end of string
        rest = after_ram[1:]
        # cut at first "_" if present
        rest_cut = rest.split("_", 1)[0]
        disk_part = rest_cut  # e.g., "2x50n", "100", "n", "50h"
    # helper to normalize single-letter tokens
    if disk_part:
        # handle single-letter tokens mapping to sizes if known:
        single_map = {
            "n": 0,
            "h": 0,
            "s": 0,
            "p": 0,
        }  # unknown semantics -> keep 0 as placeholder
        # try patterns: NxM (e.g., 2x50), number with optional suffix letter, or single letter
        m2 = re.match(r"^(?:(\d+)x)?(\d+)([nhsp]?)$", disk_part)
        if m2:
            count = int(m2.group(1)) if m2.group(1) else 1
            size = int(m2.group(2))
            # size units in SCS are GiB-like raw numbers; treat as GiB
            disk_gib = count * size
        else:
            # single-letter disk tokens like "n", "h", "s", or "p"
            if disk_part in single_map:
                disk_gib = None
            else:
                # fallback: try to extract leading integer
                m3 = re.match(r"^(\d+)", disk_part)
                if m3:
                    disk_gib = int(m3.group(1))
                else:
                    disk_gib = None

    return {"vcpus": vcpus, "ram_gib": ram_gib, "disk_gib": disk_gib}
