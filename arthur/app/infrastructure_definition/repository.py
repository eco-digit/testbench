import json, os
from typing import Dict, Any, List


class InfrastructureRepository:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir

    def load_main(self, main_json: str) -> Dict[str, Any]:
        with open(os.path.join(self.base_dir, main_json)) as f:
            return json.load(f)

    def load_reference(self, ref_path: str) -> Dict[str, Any]:
        with open(os.path.join(self.base_dir, ref_path)) as f:
            return json.load(f)

    def list_device_metas(self, main_json: str) -> List[Dict[str, Any]]:
        return self.load_main(main_json)["devices"]
