import json
from subprocess import CompletedProcess

from adapter.nftables.nftables import NFTables
from adapter.nftables.nftables_types import Table, Family
from nftables_fixtures import mock_subprocess_run


def test_create_table_ok(mock_subprocess_run):
    # GIVEN
    table = Table(name="measurement-0001", family=Family.INET)

    # WHEN
    NFTables.create_table(table=table)

    # THEN
    mock_subprocess_run.assert_called_once()


def test_delete_table_ok(mock_subprocess_run):
    # GIVEN
    table = Table(name="measurement-0001", family=Family.INET)

    # WHEN
    NFTables.delete_table(table=table)

    # THEN
    mock_subprocess_run.assert_called_once()


def test_get_counter_ok(mock_subprocess_run):
    # GIVEN
    table = Table(name="measurement-0001", family=Family.INET)
    mock_subprocess_run.return_value = CompletedProcess(
        args=[],
        returncode=0,
        stdout=json.dumps(
            {
                "nftables": [
                    {"metadata": "none"},
                    {
                        "counter": {
                            "family": "inet",
                            "name": "eames-1-0_in",
                            "table": "measurement",
                            "handle": 372,
                            "packets": 14,
                            "bytes": 1424,
                        }
                    },
                ]
            }
        ),
    )

    # WHEN
    result = NFTables.get_counter_in_bytes(table=table, counter_name="eames-1-0_in")

    # THEN
    mock_subprocess_run.assert_called_once()
    assert result == 1424


def test_get_set_ok(mock_subprocess_run):
    # GIVEN
    table = Table(name="measurement-0001", family=Family.INET)
    mock_subprocess_run.return_value = CompletedProcess(
        args=[],
        returncode=0,
        stdout=json.dumps(
            {
                "nftables": [
                    {"metadata": "none"},
                    {
                        "set": {
                            "family": "inet",
                            "name": "eames-1-0",
                            "table": "measurement",
                            "type": "ipv4_addr",
                            "handle": 370,
                            "size": 256,
                            "flags": ["dynamic"],
                            "elem": [
                                {
                                    "elem": {
                                        "val": "172.16.46.1",
                                        "counter": {"packets": 107, "bytes": 17662},
                                    }
                                }
                            ],
                        }
                    },
                ]
            }
        ),
    )

    # WHEN
    result = NFTables.get_set_in_bytes(table=table, set_name="eames-1-0_in")

    # THEN
    mock_subprocess_run.assert_called_once()
    assert result == {"172.16.46.1": 17662}


# This test fully creates the configured table on the hosts machine. Only use for manual testing
def no_test_create_fully_configured_table(sample_table):
    NFTables.create_table(sample_table)


# This test fully deletes the configured table on the hosts machine. Only use for manual testing
def no_test_delete_table(sample_table):
    NFTables.delete_table(sample_table)


# This test requests a specific counter from  the configured table on the hosts machine. Only use for manual testing
def no_test_get_counter():
    result = NFTables.get_counter_in_bytes(
        Table(name="measurement", family=Family.INET), "eames-1-0_out"
    )
    print(result)


# This test requests a specific set from the configured table on the hosts machine. Only use for manual testing
def no_test_get_set():
    result = NFTables.get_set_in_bytes(
        Table(name="measurement", family=Family.INET), "eames-1-0"
    )
    print(result)
