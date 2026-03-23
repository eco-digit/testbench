package de.ecodigit.yusuf.context.infrastructure;

import de.ecodigit.yusuf.application.infrastructure.ApplicationEntity;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ContextEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  private String name;

  private String description;

  @ManyToOne
  @JoinColumn(name = "application_id", referencedColumnName = "id", nullable = false)
  private ApplicationEntity application;
}
