package de.ecodigit.yusuf.notification.ui;

import de.ecodigit.yusuf.notification.application.NotificationService;
import de.ecodigit.yusuf.notification.domain.NotificationEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("notifications")
public class NotificationController {
  private final NotificationService notificationService;

  @Operation(summary = "Post Notifications", description = "Post notifications for a user")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Notifications post successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = NotificationEntity.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Bad Request",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class))),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class)))
      })
  @PostMapping
  public ResponseEntity<String> postNotification(@RequestBody NotificationDto notification) {
    try {
      notificationService.notificationArrival(notification);
      return ResponseEntity.status(HttpStatus.ACCEPTED).body("Notification accepted");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
  }

  @Operation(
      summary = "Get all notifications for a user",
      description = "Get all notifications for a user")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Notifications retrieved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = NotificationDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Bad Request",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class))),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class)))
      })
  @GetMapping("/all")
  public ResponseEntity<Object> getAllNotification() {
    try {
      return ResponseEntity.status(HttpStatus.OK).body(notificationService.getAllNotification());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
  }

  @Operation(summary = "Delete a notification", description = "Delete a notification")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "204",
            description = "Notification deleted successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Bad Request",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class))),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class)))
      })
  @DeleteMapping("/{notificationId}")
  public ResponseEntity<String> deleteSingleNotification(@PathVariable UUID notificationId) {
    try {
      notificationService.deleteNotification(notificationId);
      return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Notification deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
  }

  @Operation(
      summary = "Delete all notifications for a User",
      description = "Delete all notifications for a User")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "204",
            description = "Notifications deleted successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Bad Request",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class))),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = String.class)))
      })
  @DeleteMapping("/deleteAll")
  public ResponseEntity<String> deleteAllNotifications() {
    try {
      notificationService.deleteAllNotifications();
      return ResponseEntity.status(HttpStatus.NO_CONTENT)
          .body("Notifications deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
  }
}
