class Exportable:
    def to_export_dict(self) -> dict:
        raise NotImplementedError("Subclasses must implement to_export_dict()")
