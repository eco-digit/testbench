import re


def convert_to_bytes(value: float, unit: str | None) -> int:
    if not unit:
        return int(value)
    unit = unit.strip()
    prefixes = {
        "KiB": 1024,
        "MiB": 1024**2,
        "GiB": 1024**3,
        "TiB": 1024**4,
        "Kib": 1024 / 8,
        "Mib": (1024**2) / 8,
        "Gib": (1024**3) / 8,
        "Tib": (1024**4) / 8,
        "KB": 1000,
        "MB": 1000**2,
        "GB": 1000**3,
        "TB": 1000**4,
        "Kb": 1000 / 8,
        "Mb": (1000**2) / 8,
        "Gb": (1000**3) / 8,
        "Tb": (1000**4) / 8,
        "B": 1,
        "b": 1 / 8,
        "bit": 1 / 8,
    }
    pattern = r"^(" + "|".join(re.escape(k) for k in prefixes) + r")"
    m = re.match(pattern, unit)
    if not m:
        return int(value)
    return int(value * prefixes[m.group(1)])
