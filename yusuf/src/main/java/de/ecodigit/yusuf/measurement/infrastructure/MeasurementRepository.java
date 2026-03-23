package de.ecodigit.yusuf.measurement.infrastructure;

import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MeasurementRepository extends JpaRepository<MeasurementEntity, UUID> {
  List<MeasurementEntity> findAllByArtefactContextApplicationId(UUID applicationId);

  List<MeasurementEntity> findByArtefactContextApplicationIdInAndLastUpdatedAfter(
      List<UUID> appIds, Instant fromDate);

  List<MeasurementEntity> findByLastUpdatedAfter(Instant cutoff);

  List<MeasurementEntity> findAllByArtefactContextId(UUID contextId);

  List<MeasurementEntity> findAllByArtefactId(UUID artefactId);

  MeasurementEntity findFirstByOrderByLastUpdatedDesc();

  MeasurementEntity findFirstByArtefactContextApplicationIdOrderByLastUpdatedDesc(
      UUID applicationId);

  Optional<MeasurementEntity> findFirstByArtefactContextIdOrderByLastUpdatedDesc(UUID contextId);

  Optional<MeasurementEntity> findFirstByArtefactIdOrderByLastUpdatedDesc(UUID id);

  int countByArtefactContextApplicationId(UUID applicationId);

  int countByArtefactIdIn(List<UUID> artefactIds);

  int countByArtefactIdInAndMeasurementState(List<UUID> artefactIds, MeasurementState state);

  @Query(
      value =
          "SELECT m FROM MeasurementEntity m WHERE m.lastUpdated IN (SELECT MAX(m2.lastUpdated)"
              + " FROM MeasurementEntity m2 GROUP BY m2.artefact.context.application.id) ORDER BY"
              + " m.lastUpdated DESC")
  List<MeasurementEntity> findMostRecentGroupedByArtefactContextApplicationIdOrderByLastUpdatedDesc(
      Pageable pageable);

  void deleteByArtefactContextId(UUID contextId);

  void deleteByArtefactContextApplicationId(UUID contextId);

  long countByMeasurementStateIn(Collection<MeasurementState> states);
}
