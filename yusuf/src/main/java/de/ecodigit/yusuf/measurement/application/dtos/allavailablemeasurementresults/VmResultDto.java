package de.ecodigit.yusuf.measurement.application.dtos.allavailablemeasurementresults;

import com.fasterxml.jackson.annotation.JsonProperty;
import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import java.util.UUID;

public record VmResultDto(
    @JsonProperty("adp") double adp,
    @JsonProperty("average_cpu_usage") double averageCpuUsage,
    @JsonProperty("average_network_usage") double averageNetworkUsage,
    @JsonProperty("average_ram_usage") double averageRamUsage,
    @JsonProperty("average_storage_usage") double averageStorageUsage,
    @JsonProperty("ced") double ced,
    @JsonProperty("eco_digit_score") double ecoDigitScore,
    @JsonProperty("gm_type") String gmType,
    @JsonProperty("guest_id") int guestId,
    @JsonProperty("measurement_id") UUID measurementId,
    @JsonProperty("state") MeasurementState state,
    @JsonProperty("gwp") double gwp,
    @JsonProperty("tox") double tox,
    @JsonProperty("water") double water,
    @JsonProperty("weee") double weee) {}
