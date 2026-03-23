package de.ecodigit.yusuf.config;

import de.ecodigit.yusuf.application.application.exceptions.ApplicationNameException;
import de.ecodigit.yusuf.application.application.exceptions.ApplicationNotFoundException;
import de.ecodigit.yusuf.artefact.application.exceptions.ArtefactException;
import de.ecodigit.yusuf.artefact.application.exceptions.ArtefactReferencedException;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
@Order(0)
public class GlobalExceptionHandler {

  // Handle artefact validation errors (including unsupported artefact types)
  @ExceptionHandler(ArtefactException.class)
  public ResponseEntity<Map<String, String>> handleFileValidationException(ArtefactException ex) {
    log.atWarn().log(ex.getMessage());

    // Create a String response with the error message
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());

    // Return 415 Unsupported Media Type for artefact-related issues
    return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
  }

  @ExceptionHandler(ArtefactReferencedException.class)
  public ResponseEntity<String> handleFileReferencedException(ArtefactReferencedException ex) {
    log.atInfo().log(ex.getMessage());

    // Create a String response with the error message
    String response = ex.getMessage();

    // Return a 409 conflict for artefact referenced issues
    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
  }

  @ExceptionHandler(ApplicationNameException.class)
  public ResponseEntity<String> handleApplicationNameException(ApplicationNameException ex) {
    log.atInfo().log(ex.getMessage());

    // Create a String response with the error message
    String response = ex.getMessage();

    // Return a 409 conflict for a application name conflict
    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
  }

  @ExceptionHandler(ApplicationNotFoundException.class)
  public ResponseEntity<String> handleApplicationNotFoundException(
      ApplicationNotFoundException ex) {
    log.atInfo().log(ex.getMessage());

    // Create a String response with the error message
    String response = ex.getMessage();

    // Return a 404 Not Found for
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
  }
}
