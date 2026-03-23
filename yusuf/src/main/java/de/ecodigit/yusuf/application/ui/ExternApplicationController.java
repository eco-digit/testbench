package de.ecodigit.yusuf.application.ui;

import de.ecodigit.yusuf.application.application.ExternApplicationService;
import de.ecodigit.yusuf.measurement.application.dtos.allavailablemeasurementresults.AllAvailableMeasurementResultsDto;
import de.ecodigit.yusuf.measurement.infrastructure.ArthurAdapter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("extern")
@RequiredArgsConstructor
public class ExternApplicationController {
  private final ExternApplicationService externApplicationService;
  private final ArthurAdapter arthurService;

  @PostMapping("/git/{gitId}")
  public ResponseEntity<String> startMeasurementWithGit(@PathVariable("gitId") UUID gitId) {
    externApplicationService.startMeasurementWithGit(gitId);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Successfully uploaded artefact and triggered measurement."),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request. The request was malformed or invalid."),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(
            responseCode = "404",
            description = "No application found with the specified id."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @PostMapping("/directUpload/{applicationId}")
  public ResponseEntity<String> startMeasurementWithArtifacts(
      @PathVariable("applicationId") UUID applicationId, MultipartFile file) {
    externApplicationService.uploadAndStartMeasurement(applicationId, file);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @Operation(
      summary = "Retrieve all Available Measurement Results.",
      description =
          "Fetches all all Available Measurement Results. With Amounts of all measurement,"
              + " critical applications, disrupted applications, not started applications")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the measurement."),
        @ApiResponse(responseCode = "404", description = "No Measurement found."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping(path = "/getAllAvailableMeasurementResults/{measurementId}")
  public ResponseEntity<AllAvailableMeasurementResultsDto>
      getAllAvailableMeasurementResultsFromArthur(
          @PathVariable("measurementId") UUID measurementId) {
    return ResponseEntity.status(HttpStatus.OK)
        .body(arthurService.getAllAvailableMeasurementResultsFromArthur(measurementId));
  }
}
