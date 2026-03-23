package de.ecodigit.yusuf.artefact.ui;

import de.ecodigit.yusuf.artefact.application.ArtefactService;
import de.ecodigit.yusuf.artefact.application.dtos.ArtefactWithLastMeasurementDto;
import de.ecodigit.yusuf.artefact.application.dtos.SaveFileMetadataDto;
import de.ecodigit.yusuf.artefact.domain.ArtefactDTO;
import de.ecodigit.yusuf.artefact.domain.ArtefactType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("artefacts")
@RequiredArgsConstructor
public class ArtefactController {

  private final ArtefactService artefactService;

  @Operation(
      summary = "Retrieves the information of all artefacts belonging to a context.",
      description = "The received information can be further filtered by filetypes.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "File and metadata retrieved successfully.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ArtefactDTO.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request."),
        @ApiResponse(responseCode = "404", description = "application not found or missing."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping()
  public ResponseEntity<List<ArtefactWithLastMeasurementDto>> getArtefactsInformation(
      @Parameter(description = "The ID of the context to retrieve artefacts for", required = true)
          @RequestParam
          @NotNull UUID contextId,
      @RequestParam(required = false) ArtefactType artefactType) {
    List<ArtefactWithLastMeasurementDto> files =
        artefactService.getArtefactsWithLastMeasurement(
            contextId, Optional.ofNullable(artefactType));
    return ResponseEntity.ok().body(files);
  }

  @Operation(
      summary = "Uploads an Artefacts packaged as a ZIP artefact.",
      description =
          "OpenAPI doesn't natively support multipart/form-data with both JSON and artefact parts."
              + " Proper API-Documentation would require workarounds that add unnecessary backend"
              + " complexity. Source:"
              + " https://medium.com/@qlqjs674/handling-multipart-form-data-and-json-body-simultaneously-in-a-single-api-request-with-swagger-5f106b7173bb")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Successfully created a new artefact resource."),
        @ApiResponse(
            responseCode = "400",
            description = "Bad request. The request was malformed or invalid."),
        @ApiResponse(
            responseCode = "404",
            description = "No application found with the specified id."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @PostMapping
  public ResponseEntity<Void> uploadZipFile(
      @Parameter(description = "MetaData to handle the artefact import correctly.", required = true)
          @RequestPart("meta")
          @NotNull SaveFileMetadataDto metaDataDTO,
      @Parameter(
              description = "The files to be uploaded should be of artefactType .zip.",
              required = true)
          @RequestPart("artefact")
          @NotNull MultipartFile file) {
    artefactService.saveFileZipFile(metaDataDTO, file);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @Operation(
      summary = "Retrieves a ZIP file containing all artefacts related to a specific measurement.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "ZIP file retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Bad Request."),
        @ApiResponse(responseCode = "404", description = "ZIP file not found or missing."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/resultsZip/{measurementId}")
  public ResponseEntity<byte[]> getResultZip(
      @Parameter(required = true) @PathVariable UUID measurementId) {
    HttpHeaders headers = new HttpHeaders();
    headers.add("Content-Disposition", "attachment; filename=\"results.zip\"");
    headers.add("Content-Type", "application/zip");
    return ResponseEntity.ok().headers(headers).body(artefactService.getResultsZip(measurementId));
  }

  @Operation(summary = "Retrieves a specific artefact by its ID.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Artefact retrieved successfully."),
        @ApiResponse(responseCode = "400", description = "Bad Request."),
        @ApiResponse(responseCode = "404", description = "Artefact not found or missing."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
      })
  @GetMapping("/{artefactId}")
  public ResponseEntity<ArtefactDTO> getArtefactById(
      @Parameter(required = true) @PathVariable UUID artefactId) {
    return ResponseEntity.ok().body(artefactService.getArtefact(artefactId));
  }
}
