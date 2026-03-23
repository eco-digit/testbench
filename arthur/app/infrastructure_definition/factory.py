from cloud.adapters.boavizta_client import fetch_instance_config
from cloud.private_cloud.scs.allocation_vcpu import allocate_vcpu
from cloud.private_cloud.scs.flavor_naming import read_specs_from_scs_flavor
from .models import *
from .converters import convert_to_bytes


class DeviceFactory:

    @staticmethod
    def none_if_blank(v):
        return v if v not in (None, "") else None

    @staticmethod
    def _load_power_profile(specs):
        if not specs or "power_profile" not in specs:
            return None
        pp = specs["power_profile"]
        return PowerProfile(
            compute=PowerProfileEntry.from_dict(pp["compute"]),
            memorize=PowerProfileEntry.from_dict(pp["memorize"]),
            store=PowerProfileEntry.from_dict(pp["store"]),
            transfer=PowerProfileEntry.from_dict(pp["transfer"]),
        )

    @staticmethod
    def _load_pp_hardware(specs):
        if not specs or "power_profile_per_hardware" not in specs:
            return None
        pph = specs["power_profile_per_hardware"]
        return PowerProfilePerHardware(
            cpu=PowerProfileEntry.from_dict(pph["CPU"]),
            gpu=PowerProfileEntry.from_dict(pph["GPU"]),
            ram=PowerProfileEntry.from_dict(pph["RAM"]),
            ssd=PowerProfileEntry.from_dict(pph["SSD"]),
            hdd=PowerProfileEntry.from_dict(pph["HDD"]),
            nw=PowerProfileEntry.from_dict(pph["NW"]),
            total_average=pph["total_avg"],
        )

    @staticmethod
    def _load_performance(specs):
        perf = specs["performance"]
        converted = {
            k: convert_to_bytes(v["value"], v["unit"]) for k, v in perf.items()
        }
        return Performance(
            compute=converted["compute"],
            memorize=converted["memorize"],
            store=converted["store"],
            transfer=converted["transfer"],
        )

    @staticmethod
    def _parse_cloud_parameters(meta):
        cp = meta.get("cloud_parameters")
        if not cp:
            return None
        return CloudParameters(
            provider=cp["provider"],
            instance_type=cp["instance_type"],
            storage_size=cp["storage_size"],
            usage_location=cp.get("usage_location", "GER"),
            is_public=False,
        )

    @classmethod
    def _build_aws_cloud(cls, meta, cp):
        instance = fetch_instance_config(
            meta["id"],
            cp.provider,
            cp.instance_type,
            cp.usage_location,
        )

        cp.is_public = True

        return {
            "cpu": CPU(1, instance.cpu.cores),
            "ram": instance.ram.size_gb * 1024**3,
            "ssd": SSD(1, cp.storage_size),
            "performance": Performance(
                compute=None,
                memorize=instance.ram.size_gb * 1024**3,
                store=cp.storage_size * 1024**3,
                transfer=125 * 1024 * 1024,
            ),
            "embedded": None,
            "power_profile": None,
            "svhc_score": None,
            "lifetime": meta.get("lifetime"),
        }

    @classmethod
    def _build_scs_cloud(cls, meta, cp):
        flavor = read_specs_from_scs_flavor(cp.instance_type)

        cpu_count = flavor["vcpus"]
        ram_gib = flavor["ram_gib"]
        disk_gib = flavor["disk_gib"] or cp.storage_size

        profile = allocate_vcpu(cpu_count)

        cp.is_public = False

        return {
            "cpu": CPU(1, cpu_count),
            "ram": ram_gib * 1024**3,
            "ssd": SSD(1, disk_gib),
            "performance": Performance(
                compute=profile["performance"]["compute"]["value"],
                memorize=ram_gib * 1024**3,
                store=disk_gib * 1024**3,
                transfer=125 * 1024 * 1024,
            ),
            "embedded": EmbeddedData.from_dict(profile["embedded"]),
            "power_profile": PowerProfile(
                compute=PowerProfileEntry.from_dict(
                    profile["power_profile"]["compute"]
                ),
                memorize=PowerProfileEntry.from_dict(
                    profile["power_profile"]["memorize"]
                ),
                store=PowerProfileEntry.from_dict(profile["power_profile"]["store"]),
                transfer=PowerProfileEntry.from_dict(
                    profile["power_profile"]["transfer"]
                ),
            ),
            "svhc_score": profile["svhc_score"],
            "lifetime": profile["lifespan"],
        }

    @classmethod
    def from_meta_and_specs(cls, meta, specs):

        cp = cls._parse_cloud_parameters(meta)

        # Case 1: Cloud device
        if cp:
            if cp.provider.lower() == "aws":
                cloud = cls._build_aws_cloud(meta, cp)
            elif cp.provider.lower() == "scs":
                cloud = cls._build_scs_cloud(meta, cp)
            else:
                raise Exception(f"Unsupported cloud provider: {cp.provider}")

            return Device(
                id=meta["id"],
                type=meta["type"],
                lifetime=cloud["lifetime"],
                average_load=AverageLoad(**meta["average_load"]),
                network=Network(**meta["network"]),
                runtime=Runtime(**meta["runtime"]),
                cpu=cloud["cpu"],
                ram=cloud["ram"],
                ssd=cloud["ssd"],
                performance=cloud["performance"],
                cloud_parameters=cp,
                power_profile=cloud.get("power_profile"),
                embedded=cloud.get("embedded"),
                svhc_score=cloud.get("svhc_score"),
                embedded_per_dbr=None,
                power_profile_per_hardware=None,
            )

        # Case 2: Bare-metal or generic device with reference
        # (no cloud parameters present)
        if not specs:
            raise Exception("Device reference required for non-cloud devices.")

        return Device(
            id=meta["id"],
            type=meta["type"],
            lifetime=meta.get("lifetime"),
            average_load=AverageLoad(**meta["average_load"]),
            network=Network(**meta["network"]),
            runtime=Runtime(**meta["runtime"]),
            cpu=CPU(**specs["cpu"]),
            ram=RAM(**specs["ram"]),
            ssd=SSD(**specs["ssd"]),
            performance=cls._load_performance(specs),
            cloud_parameters=None,
            power_profile=cls._load_power_profile(specs),
            power_profile_per_hardware=cls._load_pp_hardware(specs),
            embedded=(
                EmbeddedData.from_dict(specs["embedded"])
                if "embedded" in specs
                else None
            ),
            embedded_per_dbr=(
                EmbeddedData.from_dict(specs["embedded_per_dbr"])
                if "embedded_per_dbr" in specs
                else None
            ),
            svhc_score=specs.get("svhc_score"),
        )


def build_devices(repo, main_json: str) -> List[Device]:
    metas = repo.list_device_metas(main_json)
    devices = []
    for m in metas:
        ref_path = m.get("reference")
        specs = repo.load_reference(ref_path) if ref_path else None
        devices.append(DeviceFactory.from_meta_and_specs(m, specs))
    return devices


def build_devices(repo, main_json: str) -> List[Device]:
    metas = repo.list_device_metas(main_json)
    devices = []
    for m in metas:
        ref_path = m.get("reference")
        specs = repo.load_reference(ref_path) if ref_path else None
        devices.append(DeviceFactory.from_meta_and_specs(m, specs))
    return devices
