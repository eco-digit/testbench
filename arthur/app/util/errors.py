from logging import getLogger
from os.path import basename

logger = getLogger(basename(__file__))


class ApplicationError(Exception):
    """Base class for application-specific errors."""

    def __init__(self, message):
        logger.error(message)
        super().__init__(message)


class NetworkIdTakenError(ApplicationError):
    def __init__(self):
        super().__init__("That network id is already taken!")


class NoFreeNetworkIdError(ApplicationError):
    def __init__(self):
        super().__init__("There is no free network id!")


class TooManyGuestsRequestedError(ApplicationError):
    """A maximum of 253 guests per infrastructure definition is possible."""

    def __init__(self):
        super().__init__("Number of machines exceeded maximum of 253!")


class ConfigError(ApplicationError):
    pass


class InvalidConfigError(ConfigError):
    def __init__(self):
        super().__init__(
            "The config is invalid! Please check it for any errors and compare it to the config example file!"
        )


class MissingConfigFileError(ConfigError):
    def __init__(self):
        super().__init__("The config file is missing!")


class NftablesError(ApplicationError):
    pass


class NftablesSetupError(NftablesError):
    def __init__(self):
        super().__init__("Failed to setup nftables counters!")


class ClientScriptError(ApplicationError):
    def __init__(self, script_name: str, machine: str, e: Exception):
        super().__init__(f"Failed to execute {script_name} on {machine}.")
