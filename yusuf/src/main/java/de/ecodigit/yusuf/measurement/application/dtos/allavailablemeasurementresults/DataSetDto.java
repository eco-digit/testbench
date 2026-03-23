package de.ecodigit.yusuf.measurement.application.dtos.allavailablemeasurementresults;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public record DataSetDto(
    @JsonProperty("cpu_usage") double cpuUsage,
    @JsonProperty("network") Map<String, Integer> network,
    @JsonProperty("ram_usage") double ramUsage,
    @JsonProperty("storage_usage") double storageUsage,
    @JsonProperty("timestamp") String timestamp) {}
