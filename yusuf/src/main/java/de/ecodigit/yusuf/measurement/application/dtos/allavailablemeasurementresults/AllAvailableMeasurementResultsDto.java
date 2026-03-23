package de.ecodigit.yusuf.measurement.application.dtos.allavailablemeasurementresults;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record AllAvailableMeasurementResultsDto(
    @JsonProperty("data_sets") Map<String, List<DataSetDto>> dataSets,
    @JsonProperty("total_results") Map<String, List<TotalResultsDto>> totalResults,
    @JsonProperty("vm_results") List<VmResultDto> vmResult) {}
