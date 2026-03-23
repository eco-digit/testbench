package de.ecodigit.yusuf.application.ui;

import de.ecodigit.yusuf.application.application.ApplicationService;
import de.ecodigit.yusuf.application.application.dtos.*;
import de.ecodigit.yusuf.application.domain.ApplicationDto;
import de.ecodigit.yusuf.measurement.application.dtos.MeasurementSumsDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("applications")
@RequiredArgsConstructor
public class ApplicationController {

  private final ApplicationService applicationService;

  @Operation(summary = "Get Applications", description = "Get all Applications")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of all applications retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping
  public ResponseEntity<List<ApplicationDto>> getApplications() {
    return ResponseEntity.ok(applicationService.getApplications());
  }

  @Operation(summary = "Get application")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Application retrieved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ApplicationDto.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "404", description = "Application not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/{applicationId}")
  public ResponseEntity<ApplicationDto> getApplication(
      @Parameter(description = "ID of the application to be retrieved", required = true)
          @PathVariable("applicationId")
          @NotNull UUID applicationId) {
    return ResponseEntity.ok(applicationService.getApplication(applicationId));
  }

  @Operation(
      summary = "Create Application",
      description =
          "Create one Application and returns the applicationId for route navigation in frontend")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "201", description = "Application created successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping
  public ResponseEntity<UUID> createApplication(
      @Parameter(
              description = "Payload containing details to create a new application",
              required = true)
          @Valid
          @RequestBody
          CreateApplicationDto createAppDto) {
    UUID applicationId = applicationService.createApplication(createAppDto);
    return ResponseEntity.status(HttpStatus.CREATED).body(applicationId);
  }

  @Operation(
      summary =
          "Retrieves a list of various details for each application. Used in the All applications"
              + " screen.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "application successfully fetched."),
        @ApiResponse(responseCode = "400", description = "Bad Request."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/allApplicationsList")
  public ResponseEntity<List<ApplicationOverviewDto>> applicationList() {
    return ResponseEntity.ok(applicationService.applicationList());
  }

  @Operation(summary = "Retrieves the values of the environmental indicators for the dashboard.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "application number successfully fetched."),
        @ApiResponse(responseCode = "400", description = "Bad Request."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/dashboardEnvironmentAmounts")
  public ResponseEntity<MeasurementSumsDto> dashboardEnvironmentAmounts() {
    return ResponseEntity.ok(applicationService.getLatestMeasurementSumsLast30Days());
  }

  @Operation(summary = "Retrieves EcodigitScore of applications for dashboard chart")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of all applications retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/dashboardChart")
  public ResponseEntity<List<ApplicationScoreDto>> getScores(
      @RequestParam(defaultValue = "5") int limit) {
    return ResponseEntity.ok(applicationService.getDashboardApplicationScores(limit));
  }

  @Operation(
      summary = "Gets five applications for the dashboard",
      description =
          "Gets the five applications with most recent measurements changes. If there are less than"
              + " 5 with measurements, it adds up with other applications ordered by name.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of applications for dashboard retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/dashboardApplicationList")
  public ResponseEntity<List<ApplicationDashboardDto>> dashBoardApplicationList() {
    return ResponseEntity.ok(applicationService.getDashBoardApplicationList());
  }

  @Operation(summary = "Retrieves EcodigitScore of applications for dashboard chart")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of all applications retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/ecoInsights")
  public ResponseEntity<List<EcoInsightsDto>> getEcoInsightsValues() {
    return ResponseEntity.ok(applicationService.getMonthlyEcoInsights());
  }

  @Operation(summary = "Edit Application")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Edit Application successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PutMapping("/{applicationId}")
  public ApplicationDto updateApplication(
      @PathVariable UUID applicationId, @RequestBody UpdateApplicationDto updateAppDto) {
    return applicationService.updateApplication(applicationId, updateAppDto);
  }

  @Operation(summary = "Delete Application")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Delete Application successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/{applicationId}")
  public ResponseEntity<Void> deleteApplication(@PathVariable UUID applicationId) {
    applicationService.deleteApplication(applicationId);
    return ResponseEntity.ok().build();
  }

  @Operation(summary = "Retrieves overall values")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Total values retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/totalDashboardValues")
  public DashboardTotalValuesDto getOverallApplicationValues() {
    return applicationService.getDashboardTotals();
  }
}
