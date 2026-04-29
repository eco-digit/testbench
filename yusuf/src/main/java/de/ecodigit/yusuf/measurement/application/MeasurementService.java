package de.ecodigit.yusuf.measurement.application;

import de.ecodigit.yusuf.application.application.exceptions.ApplicationException;
import de.ecodigit.yusuf.application.application.exceptions.ApplicationNotFoundException;
import de.ecodigit.yusuf.application.infrastructure.ApplicationRepository;
import de.ecodigit.yusuf.artefact.application.exceptions.ArtefactNotFoundException;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactEntity;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactRepository;
import de.ecodigit.yusuf.artefact.infrastructure.MinioRepository;
import de.ecodigit.yusuf.config.MinioInitializer;
import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.context.infrastructure.ContextRepository;
import de.ecodigit.yusuf.gitrepomanagement.application.dtos.GitDto;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitEntityMapper;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitRepository;
import de.ecodigit.yusuf.measurement.application.dtos.*;
import de.ecodigit.yusuf.measurement.application.dtos.measurementresults.MeasurementResultDto;
import de.ecodigit.yusuf.measurement.application.exceptions.MeasurementAlreadyAbortedException;
import de.ecodigit.yusuf.measurement.application.exceptions.MeasurementNotFoundException;
import de.ecodigit.yusuf.measurement.domain.DataSource;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.domain.Trigger;
import de.ecodigit.yusuf.measurement.infrastructure.ArthurAdapter;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntity;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntityMapper;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementRepository;
import de.ecodigit.yusuf.measurement.infrastructure.dto.ArthurStateUpdateDto;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;

@Service
@RequiredArgsConstructor
public class MeasurementService {

  private final MeasurementRepository measurementRepository;
  private final ApplicationRepository applicationRepository;
  private final ArtefactRepository artefactRepository;
  private final GitRepository gitRepository;
  private final ArthurAdapter arthurAdapter;
  private final GitEntityMapper gitEntityMapper;
  private final MeasurementEntityMapper measurementEntityMapper;
  private final ContextRepository contextRepository;
  private final MinioRepository minioRepository;

  @Transactional
  public void createAndStartMeasurement(CreateMeasurementDto createMeasurementDto) {
    ArtefactEntity artefactEntity =
        artefactRepository
            .findById(createMeasurementDto.applicationVariantId())
            .orElseThrow(() -> new ApplicationException("ArtefactEntity not found."));
    MeasurementDto measurementDto = createMeasurement(createMeasurementDto, artefactEntity);
    if (artefactEntity.getDataSource() == DataSource.GIT) {
      startMeasurementGit(
          measurementDto.id(),
          artefactEntity.getContext().getApplication().getId(),
          artefactEntity.getGit().getId());
    } else if (artefactEntity.getDataSource() == DataSource.DIRECTUPLOAD) {
      startMeasurement(measurementDto.id());
    }
  }

  private MeasurementDto createMeasurement(
      CreateMeasurementDto createMeasurementDto, ArtefactEntity artefactEntity) {

    ArtefactEntity applicationVariant =
        artefactRepository
            .findById(createMeasurementDto.applicationVariantId())
            .orElseThrow(
                () -> new ArtefactNotFoundException(createMeasurementDto.applicationVariantId()));

    MeasurementEntity measurementEntity =
        new MeasurementEntity(
            null,
            createMeasurementDto.name(),
            artefactEntity.getDataSource(),
            Instant.now(),
            Instant.now(),
            createMeasurementDto.description(),
            MeasurementState.CREATED,
            Trigger.USER,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            applicationVariant);
    measurementEntity = measurementRepository.save(measurementEntity);
    return measurementEntityMapper.entityToDomainDto(measurementEntity);
  }

  private void startMeasurement(UUID measurementId) {
    measurementRepository
        .findById(measurementId)
        .ifPresentOrElse(
            entity -> arthurAdapter.startMeasurement(measurementId, entity.getArtefact().getId()),
            () -> {
              throw new MeasurementNotFoundException(measurementId);
            });
  }

  private void startMeasurementGit(UUID measurementId, UUID applicationId, UUID gitId) {

    GitDto gitDto =
        gitEntityMapper.toGitDto(
            gitRepository
                .findById(gitId)
                .orElseThrow(() -> new EntityNotFoundException(gitId.toString())));

    applicationRepository
        .findById(applicationId)
        .ifPresentOrElse(
            applicationEntity ->
                measurementRepository
                    .findById(measurementId)
                    .ifPresentOrElse(
                        entity ->
                            arthurAdapter.startMeasurementWithGit(
                                measurementId, entity.getArtefact().getId(), gitDto),
                        () -> {
                          throw new MeasurementNotFoundException(measurementId);
                        }),
            () -> {
              throw new ApplicationNotFoundException(applicationId);
            });
  }

  /**
   * Get an overview over all measurements from an Application.
   *
   * @param applicationId id of the chosen application.
   * @return List<MeasurementOverviewDto> A list of all measurements in the application.
   */
  @Transactional(readOnly = true)
  public List<MeasurementOverviewDto> getMeasurementsOverview(UUID applicationId) {
    List<MeasurementEntity> result =
        measurementRepository.findAllByArtefactContextApplicationId(applicationId);

    return result.stream()
        .map(measurementEntityMapper::entityToOverviewDto)
        .sorted(Comparator.comparing(MeasurementOverviewDto::lastUpdated))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<MeasurementOverviewDto> getMeasurementsByContext(UUID contextId) {
    List<MeasurementEntity> measurements =
        measurementRepository.findAllByArtefactContextId(contextId);

    return measurements.stream()
        .map(measurementEntityMapper::entityToOverviewDto)
        .sorted(Comparator.comparing(MeasurementOverviewDto::lastUpdated))
        .toList();
  }

  @Transactional(readOnly = true)
  public MeasurementDto getMeasurement(UUID measurementId) {
    MeasurementEntity result =
        measurementRepository
            .findById(measurementId)
            .orElseThrow(() -> new MeasurementNotFoundException(measurementId));

    return measurementEntityMapper.entityToDomainDto(result);
  }

  @Transactional(readOnly = true)
  public MeasurementDto getLastMeasurement() {
    MeasurementEntity entity = measurementRepository.findFirstByOrderByLastUpdatedDesc();
    return measurementEntityMapper.entityToDomainDto(entity);
  }

  @Transactional(readOnly = true)
  public DashboardAmountsDto getAmounts(UUID applicationId) {
    List<ContextEntity> contexts = contextRepository.findAllByApplicationId(applicationId);
    List<UUID> contextIds = contexts.stream().map(ContextEntity::getId).toList();

    List<ArtefactEntity> artefacts = artefactRepository.findAllByContextIdIn(contextIds);
    List<UUID> artefactIds = artefacts.stream().map(ArtefactEntity::getId).toList();

    int totalMeasurements = measurementRepository.countByArtefactIdIn(artefactIds);
    int critical =
        measurementRepository.countByArtefactIdInAndMeasurementState(
            artefactIds, MeasurementState.FAILED_ARTHUR);
    int disrupted =
        measurementRepository.countByArtefactIdInAndMeasurementState(
            artefactIds, MeasurementState.FAILED_SUT);

    return DashboardAmountsDto.builder()
        .applications(contexts.size())
        .measurements(totalMeasurements)
        .criticalApplications(critical)
        .disruptedApplications(disrupted)
        .build();
  }

  public List<MeasurementContextDto> getMeasurementsOfContext(UUID contextId) {
    return measurementRepository.findAllByArtefactContextId(contextId).stream()
        .map(measurementEntityMapper::entityToContextDto)
        .toList();
  }

  public List<MeasurementContextDto> getMeasurementsOfArtefact(UUID artefactId) {
    return measurementRepository.findAllByArtefactId(artefactId).stream()
        .map(measurementEntityMapper::entityToContextDto)
        .toList();
  }

  @Transactional
  public void handleStateChanged(ArthurStateUpdateDto updateDto) {
    measurementRepository
        .findById(updateDto.measurementId())
        .ifPresentOrElse(
            measurementEntity -> {
              measurementEntity.setMeasurementState(updateDto.measurementState());
              measurementEntity.setLastUpdated(Instant.now());
              measurementRepository.save(measurementEntity);
            },
            () -> {
              throw new MeasurementNotFoundException(updateDto.measurementId());
            });
  }

  @Transactional
  public void saveMeasurementResult(MeasurementResultDto resultDto) {
    measurementRepository
        .findById(resultDto.measurementId())
        .ifPresentOrElse(
            measurementEntity -> {
              measurementEntity.setSimulationDuration(resultDto.simulationDurationInSeconds());
              measurementEntity.setEcodigitScore(resultDto.totalEcoDigitScore());
              measurementEntity.setAdp(resultDto.totalAdp());
              measurementEntity.setCed(resultDto.totalCed());
              measurementEntity.setGwp(resultDto.totalGwp());
              measurementEntity.setTox(resultDto.totalTox());
              measurementEntity.setWater(resultDto.totalWater());
              measurementEntity.setWeee(resultDto.totalWeee());
              measurementRepository.save(measurementEntity);
            },
            () -> {
              throw new MeasurementNotFoundException(resultDto.measurementId());
            });
  }

  @Transactional
  public void stopMeasurement(UUID measurementId) {
    MeasurementEntity measurementEntity =
        measurementRepository
            .findById(measurementId)
            .orElseThrow(() -> new MeasurementNotFoundException(measurementId));
    if (measurementEntity.getMeasurementState() == MeasurementState.FAILED_ARTHUR
        || measurementEntity.getMeasurementState() == MeasurementState.FAILED_SUT
        || measurementEntity.getMeasurementState() == MeasurementState.ABORTED
        || measurementEntity.getMeasurementState() == MeasurementState.COMPLETED) {
      throw new MeasurementAlreadyAbortedException(measurementId);
    }
    try {
      arthurAdapter.stopMeasurement(measurementId);
    } catch (ResourceAccessException e) {
      measurementEntity.setMeasurementState(MeasurementState.FAILED_ARTHUR);
      measurementRepository.save(measurementEntity);
      throw e;
    }
  }

  @Transactional
  public void deleteMeasurement(UUID measurementId) {
    MeasurementEntity measurement =
        measurementRepository
            .findById(measurementId)
            .orElseThrow(() -> new MeasurementNotFoundException(measurementId));

    String folderToDelete =
        "applicationvariant-"
            + measurement.getArtefact().getId()
            + "/"
            + "measurement-"
            + measurement.getId()
            + "/"
            + "results/";

    minioRepository.deleteFolder(MinioInitializer.APPLICATION_VARIANTS_BUCKET, folderToDelete);

    measurementRepository.delete(measurement);
  }
}
