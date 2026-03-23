import json
import subprocess

from adapter.nftables.nftables_types import Table


class NFTables:
    @staticmethod
    def create_table(table: Table):
        nft_config = table.get_config()
        subprocess.run(
            args=["sudo", "nft", "-f", "-"],
            input=nft_config,
            encoding="utf-8",
            capture_output=True,
            text=True,
            check=True,
        )

    @staticmethod
    def delete_table(table: Table):
        subprocess.run(
            args=["sudo", "nft", "delete", "table", table.family.value, table.name],
            capture_output=True,
            text=True,
            check=True,
        )

    @staticmethod
    def get_counter_in_bytes(table: Table, counter_name: str) -> int:
        completed_process = subprocess.run(
            [
                "sudo",
                "nft",
                "-j",
                "list",
                "counter",
                table.family.value,
                table.name,
                counter_name,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        # The structure returned by NFTables is always the same if one single counter is requested
        return json.loads(completed_process.stdout)["nftables"][1]["counter"]["bytes"]

    @staticmethod
    def get_set_in_bytes(table: Table, set_name: str):
        completed_process = subprocess.run(
            [
                "sudo",
                "nft",
                "-j",
                "list",
                "set",
                table.family.value,
                table.name,
                set_name,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        # The structure returned by NFTables is always the same if one single counter is requested
        set_elements = json.loads(completed_process.stdout)["nftables"][1]["set"][
            "elem"
        ]
        return NFTables._parse_elements(set_elements)

    @staticmethod
    def _parse_elements(set_elements: list) -> dict:
        parsed_set = {}
        for element in set_elements:
            parsed_set[element["elem"]["val"]] = element["elem"]["counter"]["bytes"]
        return parsed_set
