# SPDX-FileCopyrightText: 2025 Siemens AG <https://siemens.com>
#
# SPDX-License-Identifier: MIT


class Switch:
    def __init__(self, duration_evaluated_seconds):
        # power consumption
        self.power_consumption_W = 9.6
        self.maximum_power_consumption_W = self.power_consumption_W
        self.idle_power_consumption_W = self.power_consumption_W
        self.dynamic_power_consumption_W = self.power_consumption_W

        # calculate energy consumption
        self.duration_evaluated_seconds = duration_evaluated_seconds

        # calculate energy consumption
        self.energy_consumption_Wh = (
            self.power_consumption_W * self.duration_evaluated_seconds / 3600
        )
