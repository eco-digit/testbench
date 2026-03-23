package de.ecodigit.yusuf.measurement.infrastructure;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.ecodigit.yusuf.measurement.application.MeasurementService;
import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.infrastructure.dto.ArthurStateUpdateDto;
import de.ecodigit.yusuf.notification.infrastructure.SseController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQMeasurementStatusListener {

  private final ArthurAdapter arthurAdapter;
  private final MeasurementService measurementService;
  private final ObjectMapper objectMapper;
  private final SseController sseController;

  @RabbitListener(queues = "measurementStatus")
  public void receiveMessage(String notification) {
    try {

      ArthurStateUpdateDto updateDto =
          objectMapper.readValue(notification, ArthurStateUpdateDto.class);
      measurementService.handleStateChanged(updateDto);

      if (updateDto.measurementState() == MeasurementState.COMPLETED) {
        measurementService.saveMeasurementResult(
            arthurAdapter.getMeasurementResult(updateDto.measurementId()));
      }
      log.info("Sending update to SSE clients: {}", updateDto);
      // Send the full DTO to frontend
      sseController.sendUpdateToClients(updateDto);
    } catch (JsonProcessingException e) {
      log.error(e.getMessage(), e);
    }
  }
}
