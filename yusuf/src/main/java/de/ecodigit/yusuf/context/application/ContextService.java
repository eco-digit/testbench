package de.ecodigit.yusuf.context.application;

import de.ecodigit.yusuf.application.domain.HealthStatus;
import de.ecodigit.yusuf.application.infrastructure.ApplicationEntity;
import de.ecodigit.yusuf.application.infrastructure.ApplicationRepository;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactRepository;
import de.ecodigit.yusuf.context.application.dtos.ContextOverviewDto;
import de.ecodigit.yusuf.context.application.dtos.CreateContextDto;
import de.ecodigit.yusuf.context.application.dtos.UpdateContextDto;
import de.ecodigit.yusuf.context.application.exceptions.ContextNotFoundException;
import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.context.infrastructure.ContextRepository;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitRepository;
import de.ecodigit.yusuf.measurement.application.dtos.MeasurementOverviewDto;
import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntity;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContextService {
  private final ApplicationRepository applicationRepository;
  private final ContextRepository contextRepository;
  private final MeasurementRepository measurementRepository;
  private final ArtefactRepository artefactRepository;
  private final GitRepository gitRepository;

  public UUID createContext(CreateContextDto createContextDto) {
    ApplicationEntity applicationEntity =
        applicationRepository.findById(createContextDto.applicationId()).orElseThrow();
    return contextRepository
        .save(
            ContextEntity.builder()
                .name(createContextDto.name())
                .description(createContextDto.description())
                .application(applicationEntity)
                .build())
        .getId();
  }

  public ContextEntity getContextById(UUID contextId) {
    return contextRepository.findById(contextId).orElseThrow();
  }

  @Transactional
  public List<ContextOverviewDto> getAllContextsPerApplication(UUID applicationId) {
    List<ContextEntity> contexts = contextRepository.findAllByApplicationId(applicationId);

    return contexts.stream().map(this::mapContextWithLastMeasurement).toList();
  }

  public ContextEntity updateContext(UUID contextId, UpdateContextDto updateContextDto) {
    ContextEntity context =
        contextRepository
            .findById(contextId)
            .orElseThrow(() -> new ContextNotFoundException(contextId));
    return contextRepository.save(
        ContextEntity.builder()
            .id(contextId)
            .name(updateContextDto.contextName())
            .description(updateContextDto.description())
            .application(context.getApplication())
            .build());
  }

  @Transactional
  public void deleteContextById(UUID contextId) {
    // First, delete all measurements associated with the context
    measurementRepository.deleteByArtefactContextId(contextId);
    // Delete all artefacts associated with the context
    artefactRepository.deleteAllByContextId(contextId);
    // Delete all git repositories associated with the context
    gitRepository.deleteByContextId(contextId);
    // Finally, delete the context itself
    contextRepository.deleteById(contextId);
  }

  private ContextOverviewDto mapContextWithLastMeasurement(ContextEntity context) {
    Optional<MeasurementEntity> lastMeasurementOptional =
        measurementRepository.findFirstByArtefactContextIdOrderByLastUpdatedDesc(context.getId());

    MeasurementOverviewDto lastMeasurementOverviewDto =
        lastMeasurementOptional.map(this::toMeasurementOverviewDto).orElse(null);

    Double ecodigitScore =
        (lastMeasurementOverviewDto != null) ? lastMeasurementOverviewDto.ecodigitScore() : null;
    HealthStatus healthStatus = mapToHealthStatus(lastMeasurementOptional.orElse(null));

    return new ContextOverviewDto(
        context.getId(),
        context.getName(),
        ecodigitScore,
        healthStatus,
        lastMeasurementOverviewDto);
  }

  private MeasurementOverviewDto toMeasurementOverviewDto(MeasurementEntity m) {
    return new MeasurementOverviewDto(
        m.getId(),
        m.getName(),
        m.getArtefact().getCustomFileName(),
        m.getDescription(),
        m.getEcodigitScore(),
        m.getLastUpdated(),
        m.getSimulationDuration(),
        m.getTrigger(),
        m.getMeasurementState(),
        m.getAdp(),
        m.getCed(),
        m.getGwp(),
        m.getWater(),
        m.getWeee(),
        m.getTox());
  }

  private HealthStatus mapToHealthStatus(MeasurementEntity measurement) {
    if (measurement == null) {
      return HealthStatus.NOT_STARTED;
    }

    MeasurementState state = measurement.getMeasurementState();
    return switch (state) {
      case FAILED_SUT -> HealthStatus.DISRUPTED;
      case FAILED_ARTHUR -> HealthStatus.CRITICAL;
      case CREATED -> HealthStatus.NOT_STARTED;
      default -> HealthStatus.HEALTHY;
    };
  }
}
