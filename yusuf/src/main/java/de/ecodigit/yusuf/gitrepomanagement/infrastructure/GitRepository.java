package de.ecodigit.yusuf.gitrepomanagement.infrastructure;

import java.util.ArrayList;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GitRepository extends JpaRepository<GitEntity, UUID> {
  ArrayList<GitEntity> findByContextId(UUID contextId);

  void deleteByContextId(UUID contextId);

  void deleteByContextApplicationId(UUID contextId);
}
