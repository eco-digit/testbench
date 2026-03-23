package de.ecodigit.yusuf.measurement.infrastructure;

import de.ecodigit.yusuf.artefact.infrastructure.ArtefactEntity;
import de.ecodigit.yusuf.measurement.domain.DataSource;
import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.domain.Trigger;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Builder
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeasurementEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  private String name;

  private DataSource dataSource;

  @Column(name = "last_updated")
  private Instant lastUpdated;

  @Column(name = "creation_date", updatable = false)
  private Instant creationDate;

  @Column(length = 4096)
  private String description;

  @Enumerated(EnumType.STRING)
  private MeasurementState measurementState;

  @Enumerated(EnumType.STRING)
  private Trigger trigger;

  @Column(name = "result_ecodigit_score")
  private Double ecodigitScore;

  @Column(name = "result_adp")
  private Double adp;

  @Column(name = "result_ced")
  private Double ced;

  @Column(name = "result_gwp")
  private Double gwp;

  @Column(name = "result_tox")
  private Double tox;

  @Column(name = "result_water")
  private Double water;

  @Column(name = "result_weee")
  private Double weee;

  @Column(name = "simulation_duration")
  private Double simulationDuration;

  @ManyToOne
  @JoinColumn(name = "artefact_id", referencedColumnName = "id", nullable = false)
  private ArtefactEntity artefact;
}
