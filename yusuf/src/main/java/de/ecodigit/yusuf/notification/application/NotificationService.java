package de.ecodigit.yusuf.notification.application;

import de.ecodigit.yusuf.measurement.application.exceptions.MeasurementNotFoundException;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementRepository;
import de.ecodigit.yusuf.notification.domain.NotificationEntity;
import de.ecodigit.yusuf.notification.infrastructure.NotificationRepository;
import de.ecodigit.yusuf.notification.ui.NotificationDto;
import jakarta.transaction.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final MeasurementRepository measurementRepository;
  private final NotificationEntityMapper notificationEntityMapper;

  @Value("${ecodigit.notification.retention.period.in.days}")
  int notificationRetentionPeriod;

  public void notificationArrival(NotificationDto notificationDto) {
    NotificationEntity notificationEntity = notificationEntityMapper.toEntity(notificationDto);
    notificationEntity.setMeasurement(
        measurementRepository
            .findById(notificationDto.measurementId())
            .orElseThrow(() -> new MeasurementNotFoundException(notificationDto.measurementId())));
    notificationRepository.save(notificationEntityMapper.toEntity(notificationDto));
    // TODO SSE an Cobb einbauen
  }

  public List<NotificationDto> getAllNotification() {
    return notificationRepository.findAll().stream().map(notificationEntityMapper::toDto).toList();
  }

  public void deleteNotification(UUID notificationId) {
    notificationRepository.deleteById(notificationId);
  }

  public void deleteAllNotifications() {
    notificationRepository.deleteAll();
  }

  @Scheduled(cron = "0 0 * * * ?")
  public void checkIfNotificationIsOlderThanRetentionPeriodDays() {
    Instant cutoffInstant = Instant.now().minus(Duration.ofDays(notificationRetentionPeriod));
    notificationRepository.deleteAllByCreatedAtBefore(cutoffInstant);
  }
}
