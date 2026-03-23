package de.ecodigit.yusuf.gitrepomanagement.application;

import de.ecodigit.yusuf.artefact.domain.ArtefactType;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactEntity;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactRepository;
import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.context.infrastructure.ContextRepository;
import de.ecodigit.yusuf.gitrepomanagement.application.dtos.GitDto;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitEntity;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitEntityMapper;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitRepository;
import de.ecodigit.yusuf.measurement.application.MeasurementService;
import de.ecodigit.yusuf.measurement.application.dtos.CreateMeasurementDto;
import de.ecodigit.yusuf.measurement.domain.DataSource;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class GitService {

  static final String FILE_FROM_GIT = "Files from Git";

  private final GitRepository gitRepository;
  private final ContextRepository contextRepository;
  private final ArtefactRepository artefactRepository;
  private final GitEntityMapper gitEntityMapper;
  private final MeasurementService measurementService;

  @Transactional
  public UUID saveGit(GitDto gitDto) {
    return gitRepository.save(gitEntityMapper.toGitEntity(gitDto)).getId();
  }

  @Transactional
  public UUID startMeasurementWithGitRepo(UUID gitId) {
    // Git raussuchen
    GitEntity gitEntity = gitRepository.findById(gitId).orElseThrow();

    // Applikation Variant erstellen

    UUID applicationVariantId = createGitApplicationVariant(gitEntity.getId());

    // Measurement erstellen&starten
    measurementService.createAndStartMeasurement(
        CreateMeasurementDto.builder()
            .applicationVariantId(applicationVariantId)
            .name("Measurement of Git Repository " + gitEntity.getRepositoryName() + " Id:" + gitId)
            .build());

    return null;
  }

  public List<GitDto> getAllGitReposPerContext(UUID contextId) {
    ArrayList<GitEntity> gitEntities = gitRepository.findByContextId(contextId);
    ArrayList<GitDto> gitDtos = new ArrayList<>();
    for (GitEntity gitEntity : gitEntities) {
      gitDtos.add(gitEntityMapper.toGitDto(gitEntity));
    }
    return gitDtos;
  }

  public void deleteGit(UUID gitId) {
    gitRepository.deleteById(gitId);
  }

  private UUID createGitApplicationVariant(UUID gitId) {
    GitEntity gitEntity = gitRepository.findById(gitId).orElseThrow();
    ContextEntity context =
        contextRepository.findById(gitEntity.getContext().getId()).orElseThrow();
    return artefactRepository
        .save(
            ArtefactEntity.builder()
                .originalFileName(gitEntity.getRepositoryName() + "-Git Repository")
                .customFileName(FILE_FROM_GIT)
                .mimeType(FILE_FROM_GIT)
                .dataSource(DataSource.GIT)
                .artefactType(ArtefactType.APPLICATION_VARIANT)
                .description(FILE_FROM_GIT)
                .creationTime(Instant.now())
                .defaultFile(false)
                .git(gitEntity)
                .context(context)
                .build())
        .getId();
  }
}
