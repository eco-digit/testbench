package de.ecodigit.yusuf.measurement.application.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class MeasurementExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(MeasurementAlreadyStartedException.class)
  public ErrorResponse handleMeasurementAlreadyStartedException(
      MeasurementAlreadyStartedException ex) {
    return ErrorResponse.builder(ex, HttpStatus.BAD_REQUEST, ex.getLocalizedMessage()).build();
  }

  @ExceptionHandler(NoLogsPresentException.class)
  public ErrorResponse handleNoLogsPresentException(NoLogsPresentException ex) {
    return ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, ex.getLocalizedMessage()).build();
  }

  @ExceptionHandler(MeasurementNotFoundException.class)
  public ErrorResponse handleMeasurementNotFoundException(MeasurementNotFoundException ex) {
    return ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, ex.getLocalizedMessage()).build();
  }

  @ExceptionHandler(ResourceAccessException.class)
  public ResponseEntity<String> serviceUnavailable(ResourceAccessException ex) {
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(ex.getMessage());
  }
}
