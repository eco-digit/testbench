package de.ecodigit.yusuf.context.ui;

import de.ecodigit.yusuf.application.domain.ApplicationDto;
import de.ecodigit.yusuf.context.application.ContextService;
import de.ecodigit.yusuf.context.application.dtos.ContextOverviewDto;
import de.ecodigit.yusuf.context.application.dtos.CreateContextDto;
import de.ecodigit.yusuf.context.application.dtos.UpdateContextDto;
import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.measurement.application.MeasurementService;
import de.ecodigit.yusuf.measurement.application.dtos.MeasurementOverviewDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("context")
@Controller
public class ContextController {
  private final ContextService contextService;
  private final MeasurementService measurementService;

  @Operation(summary = "Create Context")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Context created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ApplicationDto.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping("/create")
  public ResponseEntity<UUID> createContext(@RequestBody @Valid CreateContextDto createContextDto) {
    return ResponseEntity.ok(contextService.createContext(createContextDto));
  }

  @Operation(summary = "Get a Context by Id")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Context retrieved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ApplicationDto.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/{contextId}")
  public ResponseEntity<ContextEntity> getContextById(@PathVariable("contextId") UUID contextId) {
    return ResponseEntity.ok(contextService.getContextById(contextId));
  }

  @Operation(summary = "Get all contexts per application")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of all contexts per application retrieved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ApplicationDto.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "404", description = "Application not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/getAllContextsPerApplication/{applicationId}")
  public ResponseEntity<List<ContextOverviewDto>> getAllContextsPerApplication(
      @PathVariable("applicationId") UUID applicationId) {
    return ResponseEntity.ok(contextService.getAllContextsPerApplication(applicationId));
  }

  @Operation(summary = "Get all measurements per context")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of all measurements per contexts retrieved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ApplicationDto.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "404", description = "Application not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/getAllMeasurements/{contextId}")
  public ResponseEntity<List<MeasurementOverviewDto>> getAllMeasurementsByContext(
      @PathVariable("contextId") UUID contextId) {
    return ResponseEntity.ok(measurementService.getMeasurementsByContext(contextId));
  }

  @PutMapping("/{contextId}")
  public ResponseEntity<ContextEntity> updateContext(
      @PathVariable("contextId") UUID contextId, @RequestBody UpdateContextDto updateContextDto) {

    return ResponseEntity.ok(contextService.updateContext(contextId, updateContextDto));
  }

  @Operation(summary = "Delete a context by Id and all associated data")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Context deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "404", description = "Application not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/{contextId}")
  public ResponseEntity<Void> deleteContext(@PathVariable("contextId") UUID contextId) {
    contextService.deleteContextById(contextId);
    return ResponseEntity.ok().build();
  }
}
