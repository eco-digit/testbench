# testbench/arthur/app/cloud/dtos/impacts.py

from dataclasses import dataclass
from typing import Any, Dict, Optional

from cloud.domain.cloud_device import Impacts as DomainImpacts


@dataclass(frozen=True)
class ImpactResponseDTO:
    raw: Dict[str, Any]

    @classmethod
    def from_boavizta(cls, payload: Dict[str, Any]) -> "ImpactResponseDTO":
        return cls(raw=payload)

    def to_domain(self) -> DomainImpacts:
        # Extrahiere impacts und mappe die Werte auf einfache Keys
        impacts_raw = self.raw.get("impacts", {})
        flat: dict[str, float] = {}

        for key, obj in impacts_raw.items():
            if not isinstance(obj, dict):
                continue
            # priorisiere "use" > "embedded" > direkte Werte
            val = None
            if "use" in obj and isinstance(obj["use"], dict):
                val = obj["use"].get("value")
            if val is None and "embedded" in obj and isinstance(obj["embedded"], dict):
                val = obj["embedded"].get("value")
            if val is None and "value" in obj:
                val = obj.get("value")

            if isinstance(val, (int, float)):
                flat[key] = float(val)

            # auch gleich sprechendere Aliase anlegen
            if key == "gwp" and isinstance(val, (int, float)):
                flat["gwp_kg_co2e"] = float(val)
            if key == "pe" and isinstance(val, (int, float)):
                flat["energy_kwh"] = float(val) / 3.6  # MJ → kWh Umrechnung
            if key == "adp" and isinstance(val, (int, float)):
                flat["adp_kg_sbe"] = float(val)

        return DomainImpacts(values=flat)
