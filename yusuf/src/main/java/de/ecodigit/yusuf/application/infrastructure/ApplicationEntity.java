package de.ecodigit.yusuf.application.infrastructure;

import de.ecodigit.yusuf.organization.infrastructure.OrganizationEntity;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(unique = true)
  private String name;

  @Column(length = 4096)
  private String description;

  @ManyToOne
  @JoinColumn(name = "organization_id", nullable = false)
  private OrganizationEntity organization;
}
