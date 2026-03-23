package de.ecodigit.yusuf.artefact.application.exceptions;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class ArtefactExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(ArtefactException.class)
  public ResponseEntity<Object> handleArtefactException(
      ArtefactException exception, WebRequest request) {
    return handleExceptionInternal(
        exception, exception.getMessage(), new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
  }

  @ExceptionHandler(ArtefactNotFoundException.class)
  public ResponseEntity<Object> handleArtefactNotFoundException(
      ArtefactNotFoundException exception, WebRequest request) {
    return handleExceptionInternal(
        exception, exception.getMessage(), new HttpHeaders(), HttpStatus.NOT_FOUND, request);
  }
}
