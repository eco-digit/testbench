package de.ecodigit.yusuf.notification.infrastructure;

import de.ecodigit.yusuf.notification.domain.NotificationEntity;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
  void deleteAllByCreatedAtBefore(Instant date);
}
