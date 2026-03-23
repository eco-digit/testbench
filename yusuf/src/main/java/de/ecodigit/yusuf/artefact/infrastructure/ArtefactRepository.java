package de.ecodigit.yusuf.artefact.infrastructure;

import de.ecodigit.yusuf.artefact.domain.ArtefactType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtefactRepository extends JpaRepository<ArtefactEntity, UUID> {

  List<ArtefactEntity> findByContextApplicationIdAndDefaultFile(
      UUID applicationId, boolean defaultFile);

  List<ArtefactEntity> findAllByContextIdIn(List<UUID> contextIds);

  List<ArtefactEntity> findByContextId(UUID contextId);

  List<ArtefactEntity> findByContextIdAndArtefactType(UUID contextId, ArtefactType type);

  void deleteAllByContextId(UUID contextId);

  void deleteAllByContextApplicationId(UUID contextId);
}
