package de.ecodigit.yusuf.notification.infrastructure;

import de.ecodigit.yusuf.measurement.infrastructure.dto.ArthurStateUpdateDto;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Controller
@RequestMapping("/measurementStatus")
@Slf4j
public class SseController {

  // List to hold active SSE connections
  private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

  // Endpoint to stream measurement status updates
  @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  @ResponseBody
  public SseEmitter streamMeasurementStatusUpdates() {
    SseEmitter emitter = new SseEmitter(3600000L);
    emitters.add(emitter);

    // Remove the emitter when the connection is closed or timed out
    emitter.onCompletion(() -> emitters.remove(emitter));
    emitter.onTimeout(() -> emitters.remove(emitter));

    return emitter;
  }

  // Method to send updates to all connected clients
  public void sendUpdateToClients(ArthurStateUpdateDto updateData) {
    log.info("SENDING SSE update to clients: {} ", updateData);
    for (SseEmitter emitter : emitters) {
      try {
        emitter.send(SseEmitter.event().name("measurement-status-update").data(updateData));
      } catch (IOException e) {
        emitters.remove(emitter);
      }
    }
  }

  @Scheduled(fixedRate = 60000)
  public void sendKeepAlive() {
    log.info("Sending keep-alive to SSE Clients");
    for (SseEmitter emitter : emitters) {
      try {
        emitter.send(SseEmitter.event().comment("keep-alive"));
      } catch (IOException e) {
        emitters.remove(emitter);
      }
    }
  }
}
