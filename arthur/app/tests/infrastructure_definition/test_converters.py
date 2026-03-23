import pytest
from infrastructure_definition.converters import convert_to_bytes

testdata = [
    (2, "abc", 2),
    (2, "", 2),
    (2, "b", 0),
    (2, "B", 2),
    (2, "Bps", 2),
    (2, "Kb", 250),
    (2, "KB", 2000),
    (2, "Kib", 256),
    (2, "KiB/s", 2048),
    (2, "Mb", 250000),
    (2, "MB", 2000000),
    (2, "Mib", 262144),
    (2, "MiB", 2097152),
    (2, "Gb", 250000000),
    (2, "GB", 2000000000),
    (2, "Gib", 268435456),
    (2, "GiB", 2147483648),
    (2, "Tb", 250000000000),
    (2, "TB", 2000000000000),
    (2, "Tib", 274877906944),
    (2, "TiB", 2199023255552),
]


@pytest.mark.parametrize("value,unit,expected", testdata)
def test_convert_to_bytes(value, unit, expected):
    assert convert_to_bytes(value, unit) == expected
