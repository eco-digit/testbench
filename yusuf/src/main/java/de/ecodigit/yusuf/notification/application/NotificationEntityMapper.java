package de.ecodigit.yusuf.notification.application;

import de.ecodigit.yusuf.notification.domain.NotificationEntity;
import de.ecodigit.yusuf.notification.ui.NotificationDto;
import org.springframework.stereotype.Service;

@Service
public class NotificationEntityMapper {
  public NotificationEntity toEntity(NotificationDto notificationDto) {
    return NotificationEntity.builder().createdAt(notificationDto.createdAt()).build();
  }

  public NotificationDto toDto(NotificationEntity notificationEntity) {
    return new NotificationDto(
        notificationEntity.getId(),
        notificationEntity.getMeasurement().getId(),
        notificationEntity.getMeasurementState(),
        notificationEntity.getCreatedAt());
  }
}
