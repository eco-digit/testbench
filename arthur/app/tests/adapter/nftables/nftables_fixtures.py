import subprocess
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from adapter.nftables.nftables_types import (
    Table,
    Chain,
    Family,
    ChainHook,
    ChainType,
    Policy,
    Counter,
    Set,
    SetType,
)


@pytest.fixture
def mock_subprocess_run(monkeypatch):
    mock = MagicMock(return_value=subprocess.CompletedProcess(args="", returncode=0))
    monkeypatch.setattr(subprocess, "run", mock)
    return mock


@pytest.fixture
def sample_table_file_from_file() -> str:
    with open((Path(__file__).parent / "ecodigit_sample.nft"), "r") as sample_file:
        return sample_file.read()


@pytest.fixture
def sample_full_table() -> Table:
    return Table(
        name="measurement-0001",
        family=Family.INET,
        counters=[
            Counter(name="eames-1-0_in"),
            Counter(name="eames-1-0_out"),
            Counter(name="eames-1-1_in"),
            Counter(name="eames-1-1_out"),
        ],
        sets=[
            Set(name="eames-1-0", type=SetType.IPV4_ADDR, size=256),
            Set(name="eames-1-1", type=SetType.IPV4_ADDR, size=256),
        ],
        chains=[
            Chain(
                name="eames-1-0",
                type=ChainType.FILTER,
                hook=ChainHook.INGRESS,
                device="vnet1",
                policy=Policy.ACCEPT,
                prio=0,
                expressions=[
                    "ip daddr 172.16.25.0/24 update @eames-1-0 { ip daddr counter } accept",
                    'counter name "eames-1-0_out" accept',
                    "ip saddr 172.16.25.0/24 accept",
                    'ip daddr 172.16.25.2 counter name "eames-1-0_in" accept',
                ],
            ),
            Chain(
                name="eames-1-1",
                type=ChainType.FILTER,
                hook=ChainHook.INGRESS,
                device="vnet2",
                policy=Policy.ACCEPT,
                prio=0,
                expressions=[
                    "ip daddr 172.16.25.0/24 update @eames-1-1 { ip daddr counter } accept",
                    'counter name "eames-1-1_out" accept',
                    "ip saddr 172.16.25.0/24 accept",
                    'ip daddr 172.16.25.3 counter name "eames-1-1_in" accept',
                ],
            ),
        ],
    )
