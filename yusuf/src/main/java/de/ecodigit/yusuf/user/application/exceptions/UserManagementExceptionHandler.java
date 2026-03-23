package de.ecodigit.yusuf.user.application.exceptions;

import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class UserManagementExceptionHandler {

  @ExceptionHandler
  public ErrorResponse handleUserCouldNotCreatedException(UserCouldNotCreatedException ex) {
    return ErrorResponse.builder(ex, ex.getHttpStatus(), ex.getMessage()).build();
  }

  @ExceptionHandler
  public ErrorResponse handleUserCouldNotDeletedException(UserCouldNotDeletedException ex) {
    return ErrorResponse.builder(ex, ex.getHttpStatus(), ex.getMessage()).build();
  }

  @ExceptionHandler
  public ErrorResponse handleUserCouldNotUpdatedException(UserCouldNotUpdatedException ex) {
    return ErrorResponse.builder(ex, ex.getHttpStatus(), ex.getMessage()).build();
  }
}
