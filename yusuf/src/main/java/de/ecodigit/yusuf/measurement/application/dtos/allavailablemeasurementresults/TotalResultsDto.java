package de.ecodigit.yusuf.measurement.application.dtos.allavailablemeasurementresults;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;
import java.util.UUID;

public record TotalResultsDto(
    @JsonProperty("application_variant_id") UUID applicationVariantId,
    @JsonProperty("measurement_id") UUID measurementId,
    @JsonProperty("simulation_duration") Duration simulationDuration,
    @JsonProperty("total_adp") double totalAdp,
    @JsonProperty("total_ced") double totalCed,
    @JsonProperty("total_eco_digit_score") double totalEcoDigitScore,
    @JsonProperty("total_gwp") double totalGwp,
    @JsonProperty("total_tox") double totalTox,
    @JsonProperty("total_water") double totalWater,
    @JsonProperty("total_weee") double totalWeee) {}
