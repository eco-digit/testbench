package de.ecodigit.yusuf.user.application.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class UserCouldNotUpdatedException extends RuntimeException {
  private final HttpStatus httpStatus;

  public UserCouldNotUpdatedException(String message, HttpStatus httpStatus) {
    super(message);
    this.httpStatus = httpStatus;
  }
}
