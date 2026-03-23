package de.ecodigit.yusuf.application.application;

import de.ecodigit.yusuf.application.application.dtos.*;
import de.ecodigit.yusuf.application.application.exceptions.ApplicationNameException;
import de.ecodigit.yusuf.application.application.exceptions.ApplicationNotFoundException;
import de.ecodigit.yusuf.application.domain.ApplicationDto;
import de.ecodigit.yusuf.application.domain.HealthStatus;
import de.ecodigit.yusuf.application.infrastructure.ApplicationEntity;
import de.ecodigit.yusuf.application.infrastructure.ApplicationEntityMapper;
import de.ecodigit.yusuf.application.infrastructure.ApplicationRepository;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactRepository;
import de.ecodigit.yusuf.context.infrastructure.ContextRepository;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitRepository;
import de.ecodigit.yusuf.measurement.application.dtos.MeasurementSumsDto;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntity;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntityMapper;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementRepository;
import de.ecodigit.yusuf.organization.application.exceptions.OrganizationNotFoundException;
import de.ecodigit.yusuf.organization.infrastructure.OrganizationEntity;
import de.ecodigit.yusuf.organization.infrastructure.OrganizationRepository;
import de.ecodigit.yusuf.organization.ui.OrganizationController;
import java.time.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApplicationService {

  private final ApplicationRepository applicationRepository;
  private final OrganizationRepository organizationRepository;
  private final MeasurementRepository measurementRepository;
  private final ArtefactRepository artefactRepository;
  private final GitRepository gitRepository;
  private final ContextRepository contextRepository;
  private final MeasurementEntityMapper measurementEntityMapper;
  private final ApplicationEntityMapper applicationEntityMapper;

  @Transactional(readOnly = true)
  public ApplicationDto getApplication(UUID applicationId) {
    return applicationRepository
        .findById(applicationId)
        .map(applicationEntityMapper::applicationToApplicationDTO)
        .orElseThrow(() -> new ApplicationNotFoundException(applicationId));
  }

  private static final List<MeasurementState> CRITICAL_STATES =
      List.of(
          MeasurementState.FAILED_ARTHUR, MeasurementState.FAILED_SUT, MeasurementState.ABORTED);

  @Transactional(readOnly = true)
  public DashboardTotalValuesDto getDashboardTotals() {
    long totalMeasurements = measurementRepository.count();
    long totalApplications = applicationRepository.count();
    long totalCriticalMeasurements =
        measurementRepository.countByMeasurementStateIn(CRITICAL_STATES);

    return new DashboardTotalValuesDto(
        totalMeasurements, totalApplications, totalCriticalMeasurements);
  }

  @Transactional(readOnly = true)
  public List<ApplicationDto> getApplications() {
    return applicationRepository.findAll().stream()
        .map(applicationEntityMapper::applicationToApplicationDTO)
        .toList();
  }

  @Transactional
  public UUID createApplication(CreateApplicationDto createAppDto) {
    // Check if application name already exist
    applicationRepository
        .findByName(createAppDto.applicationName())
        .ifPresent(
            app -> {
              throw new ApplicationNameException("Application name already exists.");
            });

    OrganizationEntity orgEntity =
        organizationRepository
            .findById(OrganizationController.TEMPORARY_GLOBAL_ORG_ID)
            .orElseThrow(() -> new OrganizationNotFoundException("Organization not found."));

    ApplicationEntity appEntity =
        ApplicationEntity.builder()
            .name(createAppDto.applicationName())
            .description(createAppDto.description())
            .organization(orgEntity)
            .build();

    return applicationRepository.save(appEntity).getId();
  }

  @Transactional
  public ApplicationDto updateApplication(UUID applicationId, UpdateApplicationDto dto) {
    ApplicationEntity entity =
        applicationRepository
            .findById(applicationId)
            .orElseThrow(() -> new ApplicationNotFoundException(applicationId));

    String newName = dto.applicationName();

    if (!newName.equals(entity.getName())) {
      applicationRepository
          .findByName(newName)
          .ifPresent(
              existing -> {
                if (!existing.getId().equals(entity.getId())) {
                  throw new ApplicationNameException("Application name already exists.");
                }
              });
    }

    entity.setName(dto.applicationName());
    entity.setDescription(dto.description());

    return applicationEntityMapper.applicationToApplicationDTO(applicationRepository.save(entity));
  }

  @Transactional(readOnly = true)
  public List<ApplicationOverviewDto> applicationList() {
    List<ApplicationEntity> applications = applicationRepository.findAll();
    return applications.stream().map(this::buildApplicationOverviewDto).toList();
  }

  public List<ApplicationDashboardDto> getDashBoardApplicationList() {
    List<MeasurementEntity> measuredApps =
        measurementRepository
            .findMostRecentGroupedByArtefactContextApplicationIdOrderByLastUpdatedDesc(
                Pageable.ofSize(5));
    List<ApplicationDashboardDto> results =
        new ArrayList<>(
            measuredApps.stream()
                .map(
                    measurement ->
                        ApplicationDashboardDto.builder()
                            .id(measurement.getArtefact().getContext().getApplication().getId())
                            .lastMeasurementScore(measurement.getEcodigitScore())
                            .name(measurement.getArtefact().getContext().getApplication().getName())
                            .build())
                .toList());

    // Adds applications, ordered by name, if there are not 5 applications with measurements
    if (measuredApps.size() < 5) {
      int gapToFive = 5 - measuredApps.size();
      List<ApplicationEntity> notMeasuredApps =
          applicationRepository.findAllExcluding(
              measuredApps.stream()
                  .map(
                      measurementEntity ->
                          measurementEntity.getArtefact().getContext().getApplication())
                  .toList(),
              Pageable.ofSize(gapToFive));
      results.addAll(
          notMeasuredApps.stream()
              .map(
                  applicationEntity ->
                      ApplicationDashboardDto.builder()
                          .name(applicationEntity.getName())
                          .id(applicationEntity.getId())
                          .lastMeasurementScore(0.0)
                          .build())
              .toList());
    }
    return results;
  }

  public MeasurementSumsDto getLatestMeasurementSumsLast30Days() {
    Instant cutoff = Instant.now().minus(Duration.ofDays(30));
    List<MeasurementEntity> measurements = measurementRepository.findByLastUpdatedAfter(cutoff);
    Map<UUID, MeasurementEntity> latestByApp =
        measurements.stream()
            .collect(
                Collectors.toMap(
                    measurement -> measurement.getArtefact().getContext().getApplication().getId(),
                    measurement -> measurement,
                    (existingMeasurement, newMeasurement) ->
                        existingMeasurement
                                .getLastUpdated()
                                .isAfter(existingMeasurement.getLastUpdated())
                            ? newMeasurement
                            : existingMeasurement));
    List<MeasurementEntity> latestMeasurements = new ArrayList<>(latestByApp.values());

    double totalGlobalWarmingPotential =
        latestMeasurements.stream().mapToDouble(m -> m.getGwp() != null ? m.getGwp() : 0.0).sum();

    double totalWasteElectricalAndElectronicEquipment =
        latestMeasurements.stream().mapToDouble(m -> m.getWeee() != null ? m.getWeee() : 0.0).sum();

    double totalCumulativeEnergyDemand =
        latestMeasurements.stream().mapToDouble(m -> m.getCed() != null ? m.getCed() : 0.0).sum();

    double totalWaterConsumption =
        latestMeasurements.stream()
            .mapToDouble(m -> m.getWater() != null ? m.getWater() : 0.0)
            .sum();

    double totalAbioticDepletionPotential =
        latestMeasurements.stream().mapToDouble(m -> m.getAdp() != null ? m.getAdp() : 0.0).sum();

    double totalEcoToxity =
        latestMeasurements.stream().mapToDouble(m -> m.getTox() != null ? m.getTox() : 0.0).sum();

    return new MeasurementSumsDto(
        totalGlobalWarmingPotential,
        totalWasteElectricalAndElectronicEquipment,
        totalCumulativeEnergyDemand,
        totalWaterConsumption,
        totalAbioticDepletionPotential,
        totalEcoToxity);
  }

  @Transactional
  public void deleteApplication(UUID applicationId) {
    measurementRepository.deleteByArtefactContextApplicationId(applicationId);
    // Delete all artefacts associated with the context
    artefactRepository.deleteAllByContextApplicationId(applicationId);
    // Delete all git repositories associated with the context
    gitRepository.deleteByContextApplicationId(applicationId);
    // Finally, delete the context itself
    contextRepository.deleteByApplicationId(applicationId);

    applicationRepository.deleteById(applicationId);
  }

  private ApplicationOverviewDto buildApplicationOverviewDto(ApplicationEntity application) {
    // Get last measurement for the application
    MeasurementDto lastMeasurement =
        measurementEntityMapper.entityToDomainDto(
            measurementRepository.findFirstByArtefactContextApplicationIdOrderByLastUpdatedDesc(
                application.getId()));
    // Get Amounts of measurement of the Last application
    Integer measurementAmount =
        measurementRepository.countByArtefactContextApplicationId(application.getId());

    // Check health status of the application
    Double ecodigitScore;
    HealthStatus healthStatus;

    if (lastMeasurement != null) {
      switch (lastMeasurement.measurementState()) {
        case FAILED_SUT -> healthStatus = HealthStatus.DISRUPTED;
        case FAILED_ARTHUR -> healthStatus = HealthStatus.CRITICAL;
        case CREATED -> healthStatus = HealthStatus.NOT_STARTED;
        default -> healthStatus = HealthStatus.HEALTHY;
      }
      ecodigitScore = lastMeasurement.ecodigitScore();
    } else {
      ecodigitScore = null;
      healthStatus = HealthStatus.NOT_STARTED;
    }

    // Build applicationOverviewDto
    return ApplicationOverviewDto.builder()
        .applicationId(application.getId())
        .applicationName(application.getName())
        .ecodigitScore(ecodigitScore)
        .healthStatus(healthStatus)
        .measurementAmount(measurementAmount)
        .lastMeasurement(lastMeasurement)
        .build();
  }

  @Transactional
  public List<EcoInsightsDto> getMonthlyEcoInsights() {
    YearMonth now = YearMonth.now();
    Instant cutoff = now.minusMonths(8).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

    List<MeasurementEntity> recentMeasurements =
        measurementRepository.findByLastUpdatedAfter(cutoff);

    Map<YearMonth, List<MeasurementEntity>> measurementsByMonth =
        recentMeasurements.stream()
            .collect(
                Collectors.groupingBy(
                    m -> YearMonth.from(m.getLastUpdated().atZone(ZoneOffset.UTC))));

    List<EcoInsightsDto> result = new ArrayList<>();

    for (int i = 7; i >= 0; i--) {
      YearMonth ym = now.minusMonths(i);
      List<MeasurementEntity> monthMeasurements = measurementsByMonth.getOrDefault(ym, List.of());
      result.add(calculateInsightForMonth(ym, monthMeasurements));
    }
    return result;
  }

  private EcoInsightsDto calculateInsightForMonth(
      YearMonth ym, List<MeasurementEntity> measurements) {
    long count = measurements.size();

    Map<UUID, MeasurementEntity> latestPerApp =
        measurements.stream()
            .collect(
                Collectors.toMap(
                    measurement -> measurement.getArtefact().getContext().getApplication().getId(),
                    measurement -> measurement,
                    (existingMeasurement, newMeasurement) ->
                        newMeasurement
                                .getLastUpdated()
                                .isAfter(existingMeasurement.getLastUpdated())
                            ? newMeasurement
                            : existingMeasurement));

    Collection<MeasurementEntity> latestMeasurements = latestPerApp.values();

    return new EcoInsightsDto(
        ym.toString(),
        count,
        sumValues(latestMeasurements, MeasurementEntity::getGwp),
        sumValues(latestMeasurements, MeasurementEntity::getWeee),
        sumValues(latestMeasurements, MeasurementEntity::getCed),
        sumValues(latestMeasurements, MeasurementEntity::getWater),
        sumValues(latestMeasurements, MeasurementEntity::getAdp),
        sumValues(latestMeasurements, MeasurementEntity::getTox));
  }

  private double sumValues(
      Collection<MeasurementEntity> list, Function<MeasurementEntity, Double> getter) {
    return list.stream()
        .map(getter)
        .filter(Objects::nonNull)
        .mapToDouble(Double::doubleValue)
        .sum();
  }

  @Transactional
  public List<ApplicationScoreDto> getDashboardApplicationScores(int limit) {
    List<YearMonth> months = new ArrayList<>();
    for (int i = 7; i >= 0; i--) {
      YearMonth month = YearMonth.now().minusMonths(i);
      months.add(month);
    }

    LocalDate firstDay = months.getFirst().atDay(1);
    Instant fromDate = firstDay.atStartOfDay(ZoneOffset.UTC).toInstant();

    List<ApplicationEntity> topApps =
        applicationRepository.findAllByOrderByIdDesc(PageRequest.of(0, limit));

    List<UUID> appIds = new ArrayList<>();
    for (ApplicationEntity app : topApps) {
      appIds.add(app.getId());
    }

    List<MeasurementEntity> measurements =
        measurementRepository.findByArtefactContextApplicationIdInAndLastUpdatedAfter(
            appIds, fromDate);

    Map<UUID, Map<YearMonth, MeasurementEntity>> grouped = new HashMap<>();

    for (MeasurementEntity m : measurements) {
      UUID appId = m.getArtefact().getContext().getApplication().getId();
      YearMonth ym = YearMonth.from(m.getLastUpdated().atZone(ZoneId.systemDefault()));

      Map<YearMonth, MeasurementEntity> monthMap = grouped.getOrDefault(appId, new HashMap<>());

      if (!monthMap.containsKey(ym)) {
        monthMap.put(ym, m);
      } else {
        MeasurementEntity existing = monthMap.get(ym);
        if (m.getLastUpdated().isAfter(existing.getLastUpdated())) {
          monthMap.put(ym, m);
        }
      }

      grouped.put(appId, monthMap);
    }

    List<ApplicationScoreDto> result = new ArrayList<>();

    for (ApplicationEntity app : topApps) {
      UUID appId = app.getId();
      Map<YearMonth, MeasurementEntity> monthMap = grouped.getOrDefault(appId, new HashMap<>());

      List<MonthlyScoreDto> monthlyScores = new ArrayList<>();

      for (YearMonth month : months) {
        MeasurementEntity m = monthMap.get(month);
        Double score = (m != null) ? m.getEcodigitScore() : null;

        MonthlyScoreDto dto = new MonthlyScoreDto(month.toString(), score);
        monthlyScores.add(dto);
      }

      ApplicationScoreDto appDto = new ApplicationScoreDto(app.getName(), monthlyScores);
      result.add(appDto);
    }

    return result;
  }
}
