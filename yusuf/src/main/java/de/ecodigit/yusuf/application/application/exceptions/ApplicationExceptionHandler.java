package de.ecodigit.yusuf.application.application.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class ApplicationExceptionHandler {

  @ExceptionHandler(ApplicationException.class)
  public ErrorResponse handleApplicationException(
      ApplicationException applicationException, WebRequest request) {
    return ErrorResponse.builder(
            applicationException,
            HttpStatus.BAD_REQUEST,
            applicationException.getLocalizedMessage())
        .build();
  }

  @ExceptionHandler(ApplicationNotFoundException.class)
  public ErrorResponse handleApplicationNotFoundException(
      ApplicationNotFoundException ex, WebRequest request) {
    var builder = ErrorResponse.builder(ex, HttpStatus.NOT_FOUND, ex.getLocalizedMessage());
    return builder.build();
  }
}
