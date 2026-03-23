package de.ecodigit.yusuf.gitrepomanagement.infrastructure;

import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.gitrepomanagement.domain.AccessType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GitEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  private String repositoryName;

  private String repositoryLink;

  private AccessType accessType;

  private String accessToken;

  private LocalDateTime creationDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "context_id", referencedColumnName = "id", nullable = false)
  private ContextEntity context;
}
