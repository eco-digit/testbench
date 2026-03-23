package de.ecodigit.yusuf.artefact.infrastructure;

import de.ecodigit.yusuf.artefact.domain.ArtefactType;
import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitEntity;
import de.ecodigit.yusuf.measurement.domain.DataSource;
import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ArtefactEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Original name of the uploaded artefact
  private String originalFileName;

  // Optional custom name a user can add to easier distinguish the uploaded files from each other
  private String customFileName;

  private String mimeType;

  private DataSource dataSource;

  @Enumerated(EnumType.STRING)
  private ArtefactType artefactType;

  private String description;

  private Instant creationTime;

  private boolean defaultFile;

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JoinColumn(name = "context_id", referencedColumnName = "id", nullable = false)
  private ContextEntity context;

  @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JoinColumn(name = "git_id", referencedColumnName = "id")
  private GitEntity git;
}
