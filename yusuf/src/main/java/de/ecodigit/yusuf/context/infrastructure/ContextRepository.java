package de.ecodigit.yusuf.context.infrastructure;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContextRepository extends JpaRepository<ContextEntity, UUID> {
  List<ContextEntity> findAllByApplicationId(UUID applicationId);

  void deleteByApplicationId(UUID applicationId);
}
