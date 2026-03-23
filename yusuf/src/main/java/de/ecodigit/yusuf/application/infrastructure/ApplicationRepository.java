package de.ecodigit.yusuf.application.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, UUID> {
  long count();

  List<ApplicationEntity> findAllByOrderByIdDesc(Pageable pageable);

  Optional<ApplicationEntity> findByName(String applicationName);

  @Query(
      value =
          "SELECT a "
              + "FROM ApplicationEntity a "
              + "WHERE a NOT IN :applications ORDER BY a.name ASC")
  List<ApplicationEntity> findAllExcluding(
      @Param("applications") List<ApplicationEntity> applications, Pageable pageable);
}
