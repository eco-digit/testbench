package de.ecodigit.yusuf.measurement.ui;

import de.ecodigit.yusuf.measurement.application.MeasurementService;
import de.ecodigit.yusuf.measurement.application.dtos.*;
import de.ecodigit.yusuf.measurement.application.dtos.measurementresults.MeasurementResultDto;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import de.ecodigit.yusuf.measurement.infrastructure.ArthurAdapter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("measurements")
@RequiredArgsConstructor
public class MeasurementController {

  private final MeasurementService measurementService;
  private final ArthurAdapter arthurService;

  @Operation(
      summary = "Create and start measurement",
      description = "Create and start a measurement")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Measurement created successfully"),
        @ApiResponse(responseCode = "400", description = "Measurement Information not complete"),
        @ApiResponse(
            responseCode = "404",
            description = "Measurement not found or missing in the application"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping("/createAndStart")
  public ResponseEntity<Void> createAndStartMeasurement(
      @Valid @RequestBody CreateMeasurementDto createMeasurementDto) {
    measurementService.createAndStartMeasurement(createMeasurementDto);
    return ResponseEntity.status(HttpStatus.ACCEPTED).build();
  }

  @Operation(
      summary =
          "Retrieve an summarized list of all recorded measurements for a specific application",
      description =
          "Retrieve a summarized list of all recorded measurements associated with the specified"
              + " application ID.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved the overview list."),
        @ApiResponse(responseCode = "400", description = "Invalid application ID provided."),
        @ApiResponse(responseCode = "404", description = "Measurements not found."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/ofApplication/{applicationId}")
  public ResponseEntity<List<MeasurementOverviewDto>> getMeasurementsOverview(
      @Parameter(description = "Id of the application", required = true)
          @PathVariable("applicationId")
          UUID applicationId) {
    List<MeasurementOverviewDto> result = measurementService.getMeasurementsOverview(applicationId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @Operation(
      summary = "Retrieve a measurement by its ID",
      description = "Fetches the details of a specific measurement using the provided ID.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the measurement."),
        @ApiResponse(responseCode = "400", description = "Invalid measurement ID provided."),
        @ApiResponse(responseCode = "404", description = "Measurement not found."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/{measurementId}")
  public ResponseEntity<MeasurementDto> getMeasurement(
      @Parameter(description = "Id of the measurement", required = true)
          @PathVariable("measurementId")
          UUID measurementId) {
    MeasurementDto result = measurementService.getMeasurement(measurementId);
    return ResponseEntity.status(HttpStatus.OK).body(result);
  }

  @Operation(
      summary = "Returns the details of the measurement that was last modified.",
      description = "Retrieves the details of a specific measurement that was last updated.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the measurement."),
        @ApiResponse(responseCode = "404", description = "No Measurement found."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/last")
  public ResponseEntity<MeasurementDto> getLastMeasurement() {
    MeasurementDto lastMeasurement = measurementService.getLastMeasurement();
    return ResponseEntity.status(HttpStatus.OK).body(lastMeasurement);
  }

  @Operation(
      summary = "Retrieve amounts for the application details overview.",
      description =
          "Fetches all amounts for the application overview. With Amounts of all measurement,"
              + " critical applications, disrupted applications, not started applications")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the measurement."),
        @ApiResponse(responseCode = "404", description = "No Measurement found."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping(path = "/counts/{applicationId}")
  public ResponseEntity<DashboardAmountsDto> getAllApplicationsAmounts(
      @PathVariable("applicationId") UUID applicationId) {
    DashboardAmountsDto dashboardAmountsDto = measurementService.getAmounts(applicationId);
    return ResponseEntity.status(HttpStatus.OK).body(dashboardAmountsDto);
  }

  @Operation(
      summary = "Retrieve all results of a measurement",
      description = "Fetches all total results as well as results per phase of a measurement.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the measurement."),
        @ApiResponse(responseCode = "404", description = "No Measurement found."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping(path = "/measurementResults/{measurementId}")
  public ResponseEntity<MeasurementResultDto> getMeasurementResultsFromArthur(
      @PathVariable("measurementId") UUID measurementId) {
    return ResponseEntity.status(HttpStatus.OK)
        .body(arthurService.getMeasurementResult(measurementId));
  }

  @Operation(summary = "Stopping a Measurement.", description = "Stop the running measurement")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully found measurement and triggered a stop."),
        @ApiResponse(responseCode = "404", description = "Measurement not found."),
        @ApiResponse(responseCode = "500", description = "Internal server error."),
        @ApiResponse(responseCode = "500", description = "Service not available.")
      })
  @PostMapping(path = "/stopMeasurement/{measurementId}")
  public ResponseEntity<Void> stopMeasurement(@PathVariable("measurementId") UUID measurementId) {
    measurementService.stopMeasurement(measurementId);
    return ResponseEntity.status(HttpStatus.OK).build();
  }

  @Operation(summary = "Get all measurements of a specific context by contextId")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully found measurement."),
        @ApiResponse(responseCode = "404", description = "Measurement not found."),
        @ApiResponse(responseCode = "500", description = "Internal server error."),
        @ApiResponse(responseCode = "500", description = "Service not available.")
      })
  @GetMapping(path = "/ofContext/{contextId}")
  public ResponseEntity<List<MeasurementContextDto>> getMeasurementsOfContext(
      @PathVariable("contextId") UUID contextId) {
    return ResponseEntity.status(HttpStatus.OK)
        .body(measurementService.getMeasurementsOfContext(contextId));
  }

  @Operation(summary = "Get all measurements of a specific artefact by artefactId")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully found measurement."),
        @ApiResponse(responseCode = "404", description = "Measurement not found."),
        @ApiResponse(responseCode = "500", description = "Internal server error."),
        @ApiResponse(responseCode = "500", description = "Service not available.")
      })
  @GetMapping(path = "/ofArtefact/{artefactId}")
  public ResponseEntity<List<MeasurementContextDto>> getMeasurementsOfArtefact(
      @PathVariable("artefactId") UUID artefactId) {
    return ResponseEntity.status(HttpStatus.OK)
        .body(measurementService.getMeasurementsOfArtefact(artefactId));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteMeasurement(@PathVariable UUID id) {
    measurementService.deleteMeasurement(id);
  }
}
