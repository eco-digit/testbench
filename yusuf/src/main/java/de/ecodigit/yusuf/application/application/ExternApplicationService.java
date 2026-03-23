package de.ecodigit.yusuf.application.application;

import static de.ecodigit.yusuf.artefact.domain.ArtefactType.APPLICATION_VARIANT;

import de.ecodigit.yusuf.artefact.application.ArtefactService;
import de.ecodigit.yusuf.artefact.application.dtos.SaveFileMetadataDto;
import de.ecodigit.yusuf.gitrepomanagement.application.GitService;
import de.ecodigit.yusuf.measurement.application.MeasurementService;
import de.ecodigit.yusuf.measurement.application.dtos.CreateMeasurementDto;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExternApplicationService {
  private final ArtefactService artefactService;
  private final MeasurementService measurementService;
  private final GitService gitService;

  public void uploadAndStartMeasurement(UUID contextId, MultipartFile file) {
    LocalDateTime now = LocalDateTime.now();
    // File Upload
    UUID fileId =
        artefactService.saveFileZipFile(
            SaveFileMetadataDto.builder()
                .contextId(contextId)
                .artefactType(APPLICATION_VARIANT)
                .defaultFile(false)
                .customFileName("ExternUploadedFile" + now)
                .description("Extern Triggered Measurement and Uploaded File at " + now)
                .build(),
            file);
    // start Measurement
    measurementService.createAndStartMeasurement(
        CreateMeasurementDto.builder()
            .applicationVariantId(fileId)
            .name("Extern Triggered Measurement " + now)
            .build());
  }

  public void startMeasurementWithGit(UUID gitId) {
    // start Measurement
    gitService.startMeasurementWithGitRepo(gitId);
  }
}
