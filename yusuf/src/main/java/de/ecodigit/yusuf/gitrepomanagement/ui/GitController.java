package de.ecodigit.yusuf.gitrepomanagement.ui;

import de.ecodigit.yusuf.gitrepomanagement.application.GitService;
import de.ecodigit.yusuf.gitrepomanagement.application.dtos.GitDto;
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
@RequestMapping("git")
@RequiredArgsConstructor
public class GitController {

  private final GitService gitService;

  @Operation(
      summary = "Add Git Repository",
      description = "Add a new Git repository to be used for measurements")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Git repository added successfully"),
        @ApiResponse(responseCode = "400", description = "Git repository information not complete"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping("/addGit")
  public ResponseEntity<UUID> provideGit(@RequestBody @Valid GitDto gitDto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(gitService.saveGit(gitDto));
  }

  @Operation(
      summary = "Start Measurement with Git Repository",
      description = "Start a new measurement using the specified Git repository")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Measurement started successfully"),
        @ApiResponse(responseCode = "400", description = "Git ID not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping("/startMeasurementWithGit/{gitId}")
  public ResponseEntity<UUID> startMeasurementWithGitRepo(
      @Parameter(
              description = "Payload containing details to create a new application",
              required = true)
          @PathVariable("gitId")
          UUID gitId) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(gitService.startMeasurementWithGitRepo(gitId));
  }

  @Operation(
      summary = "Retrieve all Git Repositories for a Context",
      description = "Retrieve all Git repositories associated with the specified context ID")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Git repositories retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Git ID not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/getAllGitReposPerContext/{contextId}")
  public ResponseEntity<List<GitDto>> getAllGitReposPerContext(
      @Parameter(
              description = "Payload containing details to create a new application",
              required = true)
          @PathVariable("contextId")
          UUID contextId) {
    return ResponseEntity.status(HttpStatus.OK)
        .body(gitService.getAllGitReposPerContext(contextId));
  }

  @Operation(summary = "Delete Git Repository", description = "Delete a Git repository")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Git Repository deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Git ID not found or missing"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/{gitRepoId}")
  public ResponseEntity<Void> deleteGitRepo(
      @Parameter(
              description = "Payload containing UUID of the Git Repository to be deleted",
              required = true)
          @PathVariable("gitRepoId")
          UUID contextId) {
    gitService.deleteGit(contextId);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }
}
